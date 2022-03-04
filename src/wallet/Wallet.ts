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
    }

    async init() {
        this.initBalance();

        const block = (await this.store.executeQuery<Metadata<Block>>(
            '_metadata', { name: 'current_height' }))[0]?.value;
        this.handleNewTip(block);

        this.peers.on(MessageTypes.block, (block: Block) => {
            console.log(block);
            this.handleNewTip(block);
        });

        const networkTip = await this.peers.getCurrentTip();
        this.handleNewTip(networkTip); 
    }

    private handleNewTip(block: Block) {
        if (this.currentTip.currentValue && this.currentTip.currentValue.height >= block.height)
            return;
        const lastTip = this.currentTip.currentValue;
        this.currentTip.push(block);
        console.log(lastTip, block);
        // New Block... Check for new transactions in all blocks from last height
    }

    private async initBalance() {
        const utxos = await this.store.executeQuery<Coin>('coins', {});
        const sum = utxos.reduce((sum, cur) => (sum + cur.value), 0);
        this._balanceInSatoshis.push(sum);

        this.store.events.subscribe((event) => {
            if (event.store !== 'coins') return;
            const currentValue = this._balanceInSatoshis.currentValue ?? 0;
            const newValue = {
                'save': currentValue + event.data.value,
                'delete': currentValue - event.data.value,
            }[event.action];

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

    async gatherUTXOs(amount: number) {

    }

    async signTx() {

    }
}
