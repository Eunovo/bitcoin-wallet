import { Observable } from "../Observable";

export interface LocalStore {
    events: Observable<{
        action: 'save' | 'delete', store: STORENAMES, data: any
    }>

    save(storeName: STORENAMES, data: any): Promise<void>
    executeQuery<T = any>(storeName: STORENAMES, query?: Partial<T>): Promise<T[]>
    remove(storeName: STORENAMES, query?: any): Promise<number>
}

export type STORENAMES = '_metadata' | 'accounts' | 'coins' | 'transactions';
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
    coins: {
        keyPath: '_id'
    },
    transactions : {
        keyPath: 'txid'
    }
}
