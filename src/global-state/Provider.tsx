import { Reducer, useEffect, useReducer, createContext, useContext } from "react";
import { Account } from "../models/Account";
import { Metadata } from "../models/Metadata";
import { AppContext, GlobalState, INITIAL_STATE } from "./context";

const DispatchContext = createContext<any>({});

export const GlobalStateProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<GlobalState, any>>(reducer, INITIAL_STATE);

    useEffect(() => {
        if (!state.localStore || state.ready) return;
        (async () => {
            const savedAccount = (await state.localStore.executeQuery<Account>(
                'accounts', { network: state.wallet.network.name }))[0];

            const quickstart = (await state.localStore.executeQuery<Metadata<number>>(
                '_metadata', { name: 'quickstart' }))[0]?.value;

            if (savedAccount) state.wallet.setEncryptedAccount(savedAccount);
            dispatch({ type: ActionTypes.init, payload: { quickstart } });
        })();
    }, [state.ready, state.localStore, state.wallet]);

    useEffect(() => {
        if (!state.wallet.account.currentValue || !state.ready) return;

        (async () => {
            try {
                // only save encrypted version
                state.localStore.save(
                    'accounts', await state.wallet.getEncryptedAccount());
            } catch (e) {
                // error should only be thrown if wallet is not authenticated
                // but this should not be possible

                console.log(e);
            }
        })();
    }, [state.wallet.account.currentValue, state.wallet, state.localStore, state.ready]);

    useEffect(() => {
        if (!state.ready) return;
        state.localStore.save('_metadata', { name: 'quickstart', value: state.quickstart });
    }, [state.quickstart, state.localStore, state.ready]);

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
