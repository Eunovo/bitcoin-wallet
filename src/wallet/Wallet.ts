import { Network, Psbt, Signer } from "bitcoinjs-lib";
import bip21 from "bip21";
import coinselect from "coinselect";
import { Account } from "../models/Account";
import { Block } from "../models/Block";
import { Coin } from "../models/Coin";
import { Metadata } from "../models/Metadata";
import { Transaction } from "../models/Transaction";
import { Observable } from "../Observable";
import { IPeers, MessageTypes } from "../p2p/INetwork";
import { LocalStore } from "../storage/LocalStore";
import { NETWORKS } from "./Networks";
import { SecpSigner } from "./Signer";

export class Wallet {

    private _balanceInSatoshis: Observable<number> = new Observable();
    private currentTip: Observable<Block | undefined> = new Observable();
    private signers: { [k: string]: Signer } = {};
    private network: Network;

    constructor(
        private account: Account,
        private peers: IPeers,
        private store: LocalStore,
        network: 'regtest' | 'mainnet' = 'regtest'
    ) {
        this.network = NETWORKS[network]

        // Initialize signers for each address
        this.signers = account.addresses.reduce((acc, addr) => ({
            ...acc, [addr.address]: new SecpSigner(
                Buffer.from(addr.privKey), Buffer.from(addr.pubKey), this.network
            ),
        }), {});

        this.init();

        this.currentTip.subscribe((newTip) => {
            this.store.save('_metadata', { name: 'current_tip', value: newTip });
        });
    }

    async init() {
        this.initBalance();

        const block = (await this.store.executeQuery<Metadata<Block>>(
            '_metadata', { name: 'current_tip' }))[0]?.value;
        this.handleNewTip(block);

        this.peers.on(MessageTypes.block, (block: Block) => {
            this.handleNewTip(block);
        });

        const networkTip = await this.peers.getCurrentTip();
        this.handleNewTip(networkTip);
    }

    private async handleNewTip(block: Block) {
        if (this.currentTip.currentValue && this.currentTip.currentValue.height >= block.height)
            return;
        const lastTip = this.currentTip.currentValue;
        this.currentTip.push(block);
        // New Block... Check for new transactions in all blocks from last height
        if (!lastTip) {
            // No saved data... load all utxos
            const utxoPromises = this.account.addresses
                .map((addr) => this.peers.getUTXOsFor(addr.address));
            const utxos = await Promise.all(utxoPromises);
            utxos.forEach((coins) => coins.forEach(coin => this.store.save('coins', coin)));
            return;
        }

        // Else... check each block one by one
        for (let i = lastTip.height + 1; i < block.height + 1; i++) {
            await this.checkTxInBlock(i);
        }
    }

    private async checkTxInBlock(height: number) {
        const txs = await this.peers.getTxsByBlockHeight(height);
        const addresses: any = this.account.addresses
            .reduce((addrs, addr) => ({ ...addrs, [addr.address]: true }), {});

        for (let i = 0; i < txs.length; i++) {
            const tx = txs[i];
            const existingTx = await this.store.executeQuery<Transaction>(
                'transactions', { txid: tx.txid });

            if (existingTx[0]) {
                // Update existing transaction
                this.store.save(
                    'transactions',
                    {
                        ...existingTx[0],
                        confirmations: tx.confirmations,
                        blockTime: tx.blockTime
                    }
                );
            }

            const { inputs, outputs } = await this.peers.getTxCoins(tx.txid);
            const spentCoins = inputs.filter((coin: Coin) => addresses[coin.address]);
            const newCoins = outputs.filter((coin: Coin) => addresses[coin.address]);

            spentCoins
                .forEach((coin: Coin) => this.store.remove('coins', { _id: coin._id }));
            newCoins
                .forEach((coin: Coin) => this.store.save('coins', coin));

            if (newCoins.length === 0 || existingTx[0]) return; // Only create new credit transactions

            this.store.save(
                'transactions',
                {
                    txid: tx.txid,
                    senders: inputs.map((input) => ({ address: input.address, value: input.value })),
                    amount: newCoins.reduce((acc, coin) => (acc + coin.value), 0),
                    fee: tx.fee, confirmations: tx.confirmations,
                    blockTime: tx.blockTime
                }
            );
        }
    }

    private async initBalance() {
        const utxos = await this.store.executeQuery<Coin>('coins', {});
        const sum = utxos.reduce((sum, cur) => (sum + cur.value), 0);
        this._balanceInSatoshis.push(sum);

        this.store.events.subscribe((event) => {
            if (event.store !== 'coins') return;
            const currentValue = this._balanceInSatoshis.currentValue ?? 0;
            const newValue = {
                'save': () => currentValue + event.data.value,
                'delete': () => currentValue - event.data.reduce(
                    (acc: number, cur: Coin) => (acc + cur.value), 0),
            }[event.action]();

            this._balanceInSatoshis.push(newValue);
        });
    }

    get balanceInSatoshis() {
        return this._balanceInSatoshis;
    }

    getAccount() {
        return this.account;
    }

    getReceiveAddr() {
        return this.account.addresses[0].address;
    }

    getURI() {
        return bip21.encode(this.getReceiveAddr());
    }

    async selectUTXOs(targets: { address: string, value: number }[]) {
        const feeRate = 200; // await this.peers.getFeeEstimateLastNBlocks(22); //BTC per byte

        const utxos = (await this.store.executeQuery<Coin>('coins', {}))
            .map((coin) => ({
                address: coin.address,
                txid: coin.mintTxid,
                vout: coin.mintIndex,
                value: coin.value
            }));

        let { inputs, outputs, fee } = coinselect(utxos, targets, feeRate);
        outputs = outputs?.map((output: any) => {
            if (output.address) return output;
            return {
                ...output,
                address: this.account.addresses[0].address,
                change: true, // Indicate change output
            }
        });
        return { inputs, outputs, fee };
    }

    createTx(
        inputs: { txid: string, vout: number, address: string }[],
        outputs: { address: string, value: number }[]
    ): Psbt {
        let psbt = new Psbt({ network: this.network });

        psbt = inputs.reduce((psbt, input) => {
            const { txid, vout } = input;
            return psbt.addInput({ hash: txid, index: vout });
        }, psbt);
        psbt = psbt.addOutputs(outputs);
        console.log(psbt.txInputs, inputs);
        // psbt = inputs.reduce((psbt, input, index) => {
        //     const { address } = input;
        //     return psbt.signInput(index, this.signers[address]);
        // }, psbt);

        return psbt;
    }

    async send(tx: Psbt) {
        const { txid } = await this.peers.sendRawTx(tx.toHex());
        const targets = tx.data.outputs.filter((output: any) => !output.change);
        await this.store.save('transactions', {
            txid,
            targets,
            amount: targets.reduce((acc, output: any) => (acc + output.value), 0),
            fee: tx.getFee(),
            confirmations: 0
        });
    }
}
