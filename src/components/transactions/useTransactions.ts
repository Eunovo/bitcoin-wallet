import { useRef, useState, useEffect } from "react";
import { useGlobalState } from "../../global-state";
import { Transaction } from "../../models/Transaction";
import { useObservable } from "../../Observable";

export function useTransactions() {
    const { localStore } = useGlobalState();

    const event = useObservable(localStore.events);
    const hasTxLoaded = useRef(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (hasTxLoaded.current && event?.store !== 'transactions') return;
        (async () => {
            setTransactions(
                (await localStore.executeQuery<Transaction>('transactions', {})).slice(0, 6)
            );
            hasTxLoaded.current = true;
        })()
    }, [event, localStore, hasTxLoaded]);

    return transactions;
}
