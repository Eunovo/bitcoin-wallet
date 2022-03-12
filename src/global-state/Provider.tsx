import { Reducer, useEffect, useReducer, createContext, useContext } from "react";
import { Account } from "../models/Account";
import { Metadata } from "../models/Metadata";
import { useObservable } from "../Observable";
import { AppContext, GlobalState, INITIAL_STATE } from "./context";

const DispatchContext = createContext<any>({});

export const GlobalStateProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<GlobalState, any>>(reducer, INITIAL_STATE);
    const account = useObservable(state.wallet.account);

    useEffect(() => {
        if (!state.localStore || state.ready) return;
        (async () => {
            const savedAccount = (await state.localStore.executeQuery<Account>(
                'accounts', { network: state.wallet.network.name }))[0];

            const quickstart = (await state.localStore.executeQuery<Metadata<number>>(
                '_metadata', { name: 'quickstart' }))[0]?.value;

            state.wallet.account.push(savedAccount);
            dispatch({ type: ActionTypes.init, payload: { quickstart } });
        })();
    }, [state.ready, state.localStore, state.wallet]);

    useEffect(() => {
        if (!account) return;
        state.localStore.save('accounts', account);
    }, [account]);

    return <AppContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
            {children}
        </DispatchContext.Provider>
    </AppContext.Provider>
}

export const useGlobalDispatch = () => useContext(DispatchContext);

export enum ActionTypes {
    init, change_network, quickstart
}

export interface Action {
    type: ActionTypes
    payload: any
}

function reducer(state: GlobalState, action: any) {
    const { type, payload } = action;

    switch (type) {
        case ActionTypes.init:
            return { ...state, ...action.payload, ready: true };

        case ActionTypes.change_network:
            state.peers.destroy();
            state.wallet.destroy();
            return {
                ...state,
                wallet: payload.wallet,
                peers: payload.peers
            };

        case ActionTypes.quickstart:
            return { ...state, quickstart: action.payload };

        default:
            return state;
    }
}
