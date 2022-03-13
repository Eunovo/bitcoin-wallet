import { createContext } from "react";
import { IndexedDBStore } from "../storage/IndexedDBStore";
import { LocalStore } from "../storage/LocalStore";
import { IPeers } from "../p2p/INetwork";
import { Wallet } from "../wallet/Wallet";
import { DEFAULT_NETWORK, NETWORKS } from "../wallet/Networks";

export interface GlobalState {
    wallet: Wallet

    /**
     * Indicates that the state
     * has been loaded from storage
     */
    ready: boolean,

    /**
     * Indicatest the stage of onboarding the user is at
     * A fresh user will be at level 0
     */
    quickstart: number

    peers: IPeers,

    localStore: LocalStore
}

const localStore = new IndexedDBStore();
const peers = NETWORKS[DEFAULT_NETWORK].connect();
export const INITIAL_STATE: GlobalState = {
    ready: false,
    quickstart: 0,
    peers,
    localStore,
    wallet: new Wallet(peers, localStore, null, DEFAULT_NETWORK)
};

export const AppContext = createContext<GlobalState>(INITIAL_STATE);
