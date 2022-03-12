import bs58check from "bs58check";
import bip21 from "bip21";
import coinselect from "coinselect";
import { Account } from "../models/Account";
import { Block } from "../models/Block";
import { Coin } from "../models/Coin";
import { Metadata } from "../models/Metadata";
import { Transaction as TxModel } from "../models/Transaction";
import { Observable } from "../Observable";
import { IPeers, MessageTypes } from "../p2p/INetwork";
import { LocalStore } from "../storage/LocalStore";
import { NETWORKS, WalletNetwork } from "./Networks";
import { PrivateKey, Transaction } from "bitcore-lib";
import { createHDMasterFromMnemonic, createMnemonic, generateAddress } from "./keygen";

export class Wallet {

    private _account: Observable<Account | null> = new Observable();
    private _balanceInSatoshis: Observable<number> = new Observable();
    private currentTip: Observable<Block | undefined> = new Observable();
    private signers: { [k: string]: PrivateKey } = {};
    private _network: WalletNetwork;
    private _unsubscribeList: (() => void)[] = [];

    constructor(
        private peers: IPeers,
        private store: LocalStore,
        account: Account | null | undefined,
        network: 'regtest' | 'mainnet' = 'regtest'
    ) {
        this._network = NETWORKS[network];
        this._unsubscribeList.push(
            this.currentTip.subscribe((newTip) => {
                this.store.save('_metadata', {
                    name: `current_tip_${this._network.name}`,
                    value: newTip
                });
            }));

        this._unsubscribeList.push(
            this._account.subscribe((account) => {
                if (account === null) return;

                // Initialize signers for each address
                this.signers = account.addresses.reduce((acc, addr) => ({
                    ...acc, [addr.address]: new PrivateKey(
                        bs58check.encode(Buffer.from(addr.privKey)), this._network),
                }), {});

                this.init(account);
            }));

        this.account.push(account || null);
    }

    get balanceInSatoshis() {
        return this._balanceInSatoshis;
    }

    get network() {
        return this._network;
    }

    get account() {
        return this._account;
    }

    async getOrCreateMnemonic() {
        const savedMnemonic = (await this.store.executeQuery<Metadata>(
            '_metadata', { name: 'mnemonic' }))[0]?.value;
        if (savedMnemonic) return savedMnemonic;

        const newMnemonic = createMnemonic();
        await this.store.save('_metadata', { name: 'mnemonic', value: newMnemonic });

        return newMnemonic;
    }

    getReceiveAddrFor(account: Account) {
        return account.addresses[0].address;
    }

    getURI() {
        const account = this._account.currentValue;
        if (!account) return;

        return bip21.encode(this.getReceiveAddrFor(account));
    }

    async setup(mnemonic: string) {
        const masterJSON = await createHDMasterFromMnemonic(mnemonic);
        const receiveAddr = generateAddress(masterJSON, this._network.addressVersion);
        this._account.push({
            master: masterJSON,
            addresses: [receiveAddr],
            network: this._network.name
        });
    }

    async init(account: Account) {
        this.initBalance();

        const block = (await this.store.executeQuery<Metadata<Block>>(
            '_metadata', { name: `current_tip_${this._network.name}` }))[0]?.value;
        this.handleNewTip(account, block);

        this.peers.on(MessageTypes.block, (block: Block) => {
            this.handleNewTip(account, block);
        });

        const networkTip = await this.peers.getCurrentTip();
        this.handleNewTip(account, networkTip);
    }

    private async handleNewTip(account: Account, block: Block) {
        if (this.currentTip.currentValue && this.currentTip.currentValue.height >= block.height)
            return;
        const lastTip = this.currentTip.currentValue;
        this.currentTip.push(block);
        // New Block... Check for new transactions in all blocks from last height
        if (!lastTip) {
            // No saved data... load all utxos
            const utxoPromises = account.addresses
                .map((addr) => this.peers.getUTXOsFor(addr.address));
            const utxos = await Promise.all(utxoPromises);
            utxos.forEach((coins) => coins.forEach(coin => this.store.save('coins', coin)));
            return;
        }

        // Else... check each block one by one
        for (let i = lastTip.height + 1; i < block.height + 1; i++) {
            await this.checkTxInBlock(account, i);
        }
    }

    private async checkTxInBlock(account: Account, height: number) {
        const txs = await this.peers.getTxsByBlockHeight(height);
        const addresses: any = account.addresses
            .reduce((addrs, addr) => ({ ...addrs, [addr.address]: true }), {});

        for (let i = 0; i < txs.length; i++) {
            const tx = txs[i];
            const existingTx = await this.store.executeQuery<TxModel>(
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
        const utxos = await this.store.executeQuery<Coin>(
            'coins', { network: this._network.name });
        const sum = utxos.reduce((sum, cur) => (sum + cur.value), 0);
        this._balanceInSatoshis.push(sum);

        this._unsubscribeList.push(
            this.store.events.subscribe((event) => {
                if (event.store !== 'coins') return;
                if (event.data.network !== this._network.name) return;

                const currentValue = this._balanceInSatoshis.currentValue ?? 0;
                const newValue = {
                    'save': () => currentValue + event.data.value,
                    'delete': () => currentValue - event.data.reduce(
                        (acc: number, cur: Coin) => (acc + cur.value), 0),
                }[event.action]();

                this._balanceInSatoshis.push(newValue);
            }));
    }

    public destroy() {
        this._unsubscribeList.forEach((v) => v());
    }

    async selectUTXOs(account: Account, targets: { address: string, value: number }[]) {
        const feeRate = 200; // await this.peers.getFeeEstimateLastNBlocks(22); //BTC per byte

        const utxos = (await this.store.executeQuery<Coin>('coins', { network: account.network }))
            .map((coin) => ({
                address: coin.address,
                txid: coin.mintTxid,
                vout: coin.mintIndex,
                value: coin.value,
                script: coin.script,
            }));

        let { inputs, outputs, fee } = coinselect(utxos, targets, feeRate);
        outputs = outputs?.map((output: any) => {
            if (output.address) return output;
            return {
                ...output,
                address: account.addresses[0].address,
                change: true, // Indicate change output
            }
        });
        return { inputs, outputs, fee };
    }

    async createTx(targets: { address: string, value: number }[]) {
        const account = this._account.currentValue;
        if (!account) throw new Error("Cannot create tx without an account");

        const { inputs, fee } = await this.selectUTXOs(account, targets);

        if (!inputs)
            throw new Error('Could not complete transaction');

        const utxos = inputs
            .map(({ address, txid, vout, value, script }: any) =>
                new Transaction.UnspentOutput({
                    address, txid, vout,
                    satoshis: value,
                    scriptPubKey: script
                }));
        let transaction = new Transaction()
            .from(utxos);
        transaction = targets.reduce(
            (tx, target) => tx.to(target.address, target.value),
            transaction
        );
        transaction = transaction.fee(fee)
            .change(account.addresses[0].address);

        transaction = Object.values(this.signers)
            .reduce((tx, pKey: PrivateKey) => tx.sign(pKey), transaction);

        return transaction;
    }

    async send(tx: Transaction) {
        const { txid } = await this.peers.sendRawTx(tx.toString());
        const targets = tx.outputs.filter((output: any) => output === tx.getChangeOutput());
        await this.store.save('transactions', {
            txid,
            targets,
            amount: targets.reduce((acc, output: any) => (acc + output.value), 0),
            fee: tx.getFee(),
            confirmations: 0
        });
    }
}
