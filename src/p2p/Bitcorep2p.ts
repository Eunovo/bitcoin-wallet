import io from "socket.io-client";
import axios from "axios";
import { IPeers, MessageTypes } from "./INetwork";

export class BitcoreConnection implements IPeers {

    private socket: any;

    constructor(
        private network: 'regtest' | 'testnet' | 'mainnet',
        private server: string
    ) {
        this.connect();
    }

    connect() {
        console.log('Trying to connect...');
        this.socket = io(
            `ws://${this.server}`, { transports: ['websocket'] }
        );
        this.socket.on("connect", () => {
            console.log(`Connected at ${new Date()}`);

            this.socket.on('tx', (sanitizedTx: any) => {
                console.log(sanitizedTx);
            });

            this.socket.on('coin', (sanitizedCoin: any) => {
                console.log(sanitizedCoin);
            });

            this.socket.emit('room', `/BTC/${this.network}/inv`);
            this.socket.emit('room', `/BTC/${this.network}/address`);
        });

        this.socket.on("disconnect", () => {
            console.log(`Disconnected at ${new Date()}`);
        });
    }

    send(type: MessageTypes, message: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    on(type: MessageTypes, listener: (message: any) => void): void {
        this.socket.on(type, listener);
    }

    destroy() {
        this.socket.close();
    }

    private async api(path: string, params: {
        method: 'get' | 'post',
        body?: any,
        query?: any
    }) {
        try {
            const response = await axios(
                {
                    method: params.method,
                    url: `http://${this.server}/api/BTC/${this.network}${path}`,
                    params: params.query,
                    data: params.body
                }
            );
            return response.data;
        } catch (e: any) {
            console.log(e);
            throw e;
        }
    }

    getCurrentTip() {
        return this.api('/block/tip', { method: 'get' });
    }

    async getFeeEstimateLastNBlocks(nBlocks: number) {
        const { feerate } = await this.api(`/fee/${nBlocks}`, { method: 'get' });
        return feerate;
    }

    getUTXOsFor(address: string) {
        return this.api(
            `/address/${address}`,
            { method: 'get', query: { unspent: true } }
        );
    }

    getTxsByBlockHeight(height: number) {
        return this.api(
            `/tx`,
            { method: 'get', query: { blockHeight: height } }
        );
    }

    getTxCoins(txid: string) {
        return this.api(
            `/tx/${txid}/coins`, { method: 'get' }
        );
    }

    sendRawTx(txHex: string) {
        return this.api(`/tx/send`, { method: 'post', body: { rawTx: txHex } });
    }

    watchAddr(address: string): void {
        console.log(`Watching ${address}`);
        this.socket.on(address, (sanitizedCoin: any) => {
            console.log(sanitizedCoin);
        });
    }

}
