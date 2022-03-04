import io from "socket.io-client";
import axios from "axios";
import { IPeers, MessageTypes } from "./INetwork";

export class SocketIOConnection implements IPeers {

    private socket: any;

    constructor(
        private network: 'regtest' | 'testnet' | 'mainnet'
    ) {
        this.connect();
    }

    connect() {
        console.log('Trying to connect...');
        this.socket = io("ws://localhost:4005");
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

    private async api(path: string, params: {
        method: 'get' | 'post',
        body?: any,
        query?: any
    }) {
        try {
            const response = await axios[params.method](
                `http://localhost:4005/api/BTC/${this.network}/${path}`,
                { params: params.query, body: params.body }
            );
            return response.data;
        } catch (e: any) {
            console.log(e);
        }
    }

    getCurrentTip() {
        return this.api('/block/tip', { method: 'get' });
    }

    watchAddr(address: string): void {
        console.log(`Watching ${address}`);
        this.socket.on(address, (sanitizedCoin: any) => {
            console.log(sanitizedCoin);
        });
    }

}
