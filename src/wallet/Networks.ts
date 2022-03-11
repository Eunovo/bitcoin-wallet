import { Networks } from "bitcore-lib"
import { BitcoreConnection } from "../p2p/Bitcorep2p"
import { IPeers } from "../p2p/INetwork"

export interface WalletNetwork extends Networks.Network {
    color: string,
    connect: () => IPeers
}

export const NETWORKS: { [k: string]: WalletNetwork } = {
    regtest: {
        color: 'cyan', connect: () => new BitcoreConnection('regtest', 'localhost:4005'),
        ...Networks.testnet
    },
    testnet: {
        color: '', connect: () => new BitcoreConnection('testnet', ''),
        ...Networks.testnet
    }
}
