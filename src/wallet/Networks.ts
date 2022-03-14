import { Networks } from "bitcore-lib"
import { BitcoreConnection } from "../p2p/Bitcorep2p"
import { IPeers } from "../p2p/INetwork"

export interface WalletNetwork extends Networks.Network {
    addressVersion: number,
    color: string,
    connect: () => IPeers
}

export const NETWORKS: { [k: string]: WalletNetwork } = {
    testnet: {
        addressVersion: 0x6f,
        color: 'red',
        connect: () => new BitcoreConnection('testnet', 'https://api.bitcore.io', 'wss://api.bitcore.io'),
        ...Networks.testnet
    },
    regtest: {
        ...Networks.testnet,
        addressVersion: 0x6f,
        color: 'cyan',
        connect: () => new BitcoreConnection('regtest', 'http://localhost:4005', 'ws://localhost:4005'),
        name: 'regtest',
        alias: 'regtest'
    }
}

export const DEFAULT_NETWORK = 'testnet';
