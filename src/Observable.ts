import { useEffect, useState } from "react";

export class Observable<T> {
    public currentValue?: T;
    private subscribers: Array<(data: T) => void> = [];
    
    push(data: T) {
        this.currentValue = data;
        this.subscribers
            .forEach((listener) => listener(data));
    }

    subscribe(listener: (data: T) => void) {
        this.subscribers = [...this.subscribers, listener];
        return () => {
            this.subscribers = this.subscribers
                .filter((value) => value !== listener);
        }
    }
}


export const useObservable = <T>(observable: Observable<T>) => {
    const [data, setData] = useState<T | undefined>(observable.currentValue);

    useEffect(() => {
        return observable.subscribe(setData);
    }, [observable, setData]);

    return data;
}
