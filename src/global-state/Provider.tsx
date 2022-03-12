import { Reducer, useEffect, useReducer, createContext, useContext } from "react";
import { useObservable } from "../Observable";
import { AppContext, GlobalState, INITIAL_STATE } from "./context";

const DispatchContext = createContext<any>({});

export const GlobalStateProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<GlobalState, any>>(reducer, INITIAL_STATE);
    const account = useObservable(state.wallet.account);

    useEffect(() => {
        if (!state.localStore || state.ready) return;
        (async () => {
            const savedAccount = (await state.localStore.executeQuery('accounts'))[0];
            dispatch({ type: ActionTypes.init, payload: savedAccount });
        })();
    }, [state.ready, state.localStore]);

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
    init, change_network
}

export interface Action {
    type: ActionTypes
    payload: any
}

function reducer(state: GlobalState, action: any) {
    const { type, payload } = action;

    switch (type) {
        case ActionTypes.init:
            return { ...state, ready: true };

        case ActionTypes.change_network:
            state.peers.destroy();
            state.wallet.destroy();
            return {
                ...state,
                wallet: payload.wallet,
                peers: payload.peers
            };

        default:
            return state;
    }
}
