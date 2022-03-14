import { IDBPDatabase, openDB } from "idb";
import { Subject } from "../Observable";
import { LocalStore, STORENAMES, STORES } from "./LocalStore";

export class IndexedDBStore implements LocalStore {
    private _events: Subject<{
        action: 'save' | 'delete', store: STORENAMES, data: any
    }> = new Subject();

    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = this.init();
    }

    get events() {
        return this._events.getObservable();
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

    async save(storeName: STORENAMES, data: any, overwrite = true) {
        const db = await this.db;

        if (!overwrite) {
            const existing = await this.executeQuery(storeName, data);
            if (existing.length > 0) return;
        }

        db.put(storeName, data);
        this._events.push({
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
        const data = await this.executeQuery(storeName, query);
        const db = await this.db;
        await Promise.all(data.map(
            doc => db.delete(storeName, doc[STORES[storeName].keyPath])
        ));

        this._events.push({
            action: 'delete',
            store: storeName,
            data
        });
        return data.length;
    }
}
