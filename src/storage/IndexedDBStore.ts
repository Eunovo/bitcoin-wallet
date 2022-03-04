import { IDBPDatabase, openDB } from "idb";
import { Observable } from "../Observable";
import { LocalStore, STORENAMES, STORES } from "./LocalStore";

export class IndexedDBStore implements LocalStore {
    public events: Observable<{
        action: 'save' | 'delete', store: STORENAMES, data: any
    }> = new Observable();

    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = this.init();
    }

    init() {
        return openDB('LocalStore', 1, {
            upgrade: (db) => {
                Object.keys(STORES).forEach((key) => {
                    try {
                        db.createObjectStore(key, STORES[key as STORENAMES]);
                    } catch (e: any) { console.log(e); }
                });
            }
        });
    }

    async save(storeName: STORENAMES, data: any) {
        const db = await this.db;
        db.put(storeName, data);
        this.events.push({
            action: 'save',
            store: storeName,
            data
        });
    }

    async executeQuery<T = any>(storeName: STORENAMES, query?: Partial<T>) {
        const db = await this.db;
        if (!query) {
            return db.getAll(storeName);
        }

        const key = (query as any)[STORES[storeName].keyPath];
        const allData = await db.getAll(storeName, key);
        const result = allData.filter((value) => (
            Object.keys(query as any).reduce((accumulated: boolean, currentKey: string) => {
                return accumulated && (<any>query)[currentKey] === value[currentKey];
            }, true)
        ));

        return result;
    }

    async remove(storeName: STORENAMES, query?: any) {
        return 0;
    }
}
