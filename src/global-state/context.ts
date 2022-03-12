import { createContext } from "react";
import { IndexedDBStore } from "../storage/IndexedDBStore";
import { LocalStore } from "../storage/LocalStore";
import { IPeers } from "../p2p/INetwork";
import { BitcoreConnection } from "../p2p/Bitcorep2p";
import { Wallet } from "../wallet/Wallet";
import { DEFAULT_NETWORK, NETWORKS } from "../wallet/Networks";

export interface GlobalState {
    wallet: Wallet

    /**
     * Indicates that the state
     * has been loaded from storage
     */
    ready: boolean,

    peers: IPeers,

    localStore: LocalStore
}

const localStore = new IndexedDBStore();
const peers = NETWORKS[DEFAULT_NETWORK].connect();
export const INITIAL_STATE: GlobalState = {
    ready: false,
    peers,
    localStore,
    wallet: new Wallet(peers, localStore, null, DEFAULT_NETWORK)
};

export const AppContext = createContext<GlobalState>(INITIAL_STATE);
