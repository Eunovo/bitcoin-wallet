import { Block } from "../models/Block";
import { Coin } from "../models/Coin";

export interface IPeers {
    getCurrentTip(): Promise<Block>;
    getUTXOsFor(address: string): Promise<Coin[]>;
    getTxsByBlockHeight(height: number): Promise<any[]>;
    getTxCoins(txid: string): Promise<{ inputs: Coin[], outputs: Coin[] }>;
    send(type: MessageTypes, message: any): Promise<void>
    on(type: MessageTypes, listener: (message: any) => void): void
    watchAddr(address: string): void
}

export enum MessageTypes {
    block = 'block',
    tx = 'tx'
}

export interface IConnectionConfig { 
    network?: 'regtest' | 'testnet' | 'mainnet'
    address: string 
}
