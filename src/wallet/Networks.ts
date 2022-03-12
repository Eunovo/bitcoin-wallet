import { Networks } from "bitcore-lib"
import { BitcoreConnection } from "../p2p/Bitcorep2p"
import { IPeers } from "../p2p/INetwork"

export interface WalletNetwork extends Networks.Network {
    addressVersion: number,
    color: string,
    connect: () => IPeers
}

export const NETWORKS: { [k: string]: WalletNetwork } = {
    regtest: {
        addressVersion: 0x6f,
        color: 'cyan',
        connect: () => new BitcoreConnection('regtest', 'localhost:4005'),
        name: 'regtest',
        alias: 'regtest'
    },
    testnet: {
        addressVersion: 0x6f,
        color: 'red',
        connect: () => new BitcoreConnection('testnet', ''),
        ...Networks.testnet
    }
}

export const DEFAULT_NETWORK = 'regtest';
