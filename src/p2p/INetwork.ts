import { Block } from "../models/Block";

export interface IPeers {
    getCurrentTip(): Promise<Block>;
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
