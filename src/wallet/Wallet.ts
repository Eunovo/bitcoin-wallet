import coinselect from "coinselect";
import { Account } from "../models/Account";
import { Block } from "../models/Block";
import { Coin } from "../models/Coin";
import { Metadata } from "../models/Metadata";
import { Observable } from "../Observable";
import { IPeers, MessageTypes } from "../p2p/INetwork";
import { LocalStore } from "../storage/LocalStore";

export class Wallet {

    private _balanceInSatoshis: Observable<number> = new Observable();
    private currentTip: Observable<Block | undefined> = new Observable();

    constructor(
        private account: Account,
        private peers: IPeers,
        private store: LocalStore
    ) {
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
                .map((addr) => this.peers.getUTXOsFor(addr));
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
            .reduce((addrs, addr) => ({ ...addrs, [addr]: true }), {});

        for (let i = 0; i < txs.length; i++) {
            const tx = txs[i];
            const { inputs, outputs } = await this.peers.getTxCoins(tx.txid);
            const spentCoins = inputs.filter((coin: Coin) => addresses[coin.address]);
            const newCoins = outputs.filter((coin: Coin) => addresses[coin.address]);

            spentCoins
                .forEach((coin: Coin) => this.store.remove('coins', { _id: coin._id }));
            newCoins
                .forEach((coin: Coin) => this.store.save('coins', coin));
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
        return this.account.addresses[0];
    }

    async selectUTXOs(targets: { address: string, value: number }[]) {
        const feeRate = await this.peers.getFeeEstimateLastNBlocks(22); //BTC per byte

        const utxos = (await this.store.executeQuery<Coin>('coins', {}))
            .map((coin) => ({
                txid: coin.mintTxid,
                vout: coin.mintIndex,
                value: coin.value
            }));

        let { inputs, outputs, fee } = coinselect(utxos, targets, feeRate);
        outputs = outputs?.map((output: any) => {
            if (output.address) return output;
            return {
                address: this.account.addresses[0],
                ...output
            }
        });
        return { inputs, outputs, fee };
    }

    async signTx() {

    }
}
