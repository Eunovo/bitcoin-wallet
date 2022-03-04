import { Account } from "../models/Account";
import { Block } from "../models/Block";
import { Metadata } from "../models/Metadata";
import { Observable } from "../Observable";
import { IPeers, MessageTypes } from "../p2p/INetwork";
import { LocalStore } from "../storage/LocalStore";

export class Wallet {

    private currentTip: Observable<Block | undefined> = new Observable();

    constructor(
        private account: Account,
        private peers: IPeers,
        private store: LocalStore
    ) {
        this.init();
    }

    async init() {
        const block = (await this.store.executeQuery<Metadata<Block>>(
            '_metadata', { key: 'current_height' }))[0]?.value;
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
        this.currentTip.push(block); // New Block... do what?
    }

    getAccount() {
        return this.account;
    }

    async getBalanceInBTC() {
        return 0;
    }

    async getReceiveAddr() {
        return this.account.addresses[0];
    }

    async gatherUTXOs(amount: number) {

    }

    async signTx() {

    }
}
