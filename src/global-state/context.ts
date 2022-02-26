import { createContext } from "react";
import { IndexedDBStore } from "../storage/IndexedDBStore";
import { LocalStore } from "../storage/LocalStore";
import { Account } from "../models/Account";

export interface GlobalState {
    /**
     * The logged in user
     */
    principal?: Account,

    /**
     * Indicates that the state
     * has been loaded from storage
     */
    ready: boolean,

    localStore: LocalStore
}

const localStore = new IndexedDBStore();
export const INITIAL_STATE: GlobalState = {
    ready: false,
    localStore,
};

export const AppContext = createContext<GlobalState>(INITIAL_STATE);
