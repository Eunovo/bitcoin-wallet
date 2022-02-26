// import { Observable } from "../Observable";

export interface LocalStore {
    // events: Observable<{
    //     action: 'save', store: STORENAMES, data: any
    // }>

    save(storeName: STORENAMES, data: any): Promise<void>
    executeQuery<T = any>(storeName: STORENAMES, query?: Partial<T>): Promise<T[]>
}

export type STORENAMES = '_metadata' | 'accounts' | 'block_headers' | 'transactions';
export type STOREOPTIONS = {
    keyPath: string
}

export const STORES: { [T in STORENAMES]: STOREOPTIONS } = {
    _metadata: {
        keyPath: 'name'
    },
    accounts: {
        keyPath: 'master.xpriv'
    },
    block_headers: {
        keyPath: 'id'
    },
    transactions : {
        keyPath: 'id'
    }
}
