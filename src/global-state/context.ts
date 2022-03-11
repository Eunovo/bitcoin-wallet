import { createContext } from "react";
import { IndexedDBStore } from "../storage/IndexedDBStore";
import { LocalStore } from "../storage/LocalStore";
import { IPeers } from "../p2p/INetwork";
import { BitcoreConnection } from "../p2p/Bitcorep2p";
import { Wallet } from "../wallet/Wallet";

export interface GlobalState {
    wallet?: Wallet

    /**
     * Indicates that the state
     * has been loaded from storage
     */
    ready: boolean,

    peers: IPeers,

    localStore: LocalStore
}

const localStore = new IndexedDBStore();
export const INITIAL_STATE: GlobalState = {
    ready: false,
    peers: new BitcoreConnection('regtest', 'localhost:4005'),
    localStore,
};

export const AppContext = createContext<GlobalState>(INITIAL_STATE);
