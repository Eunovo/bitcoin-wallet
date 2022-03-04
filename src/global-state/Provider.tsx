import { Reducer, useEffect, useReducer, createContext, useContext } from "react";
import { Wallet } from "../wallet/Wallet";
import { AppContext, GlobalState, INITIAL_STATE } from "./context";

const DispatchContext = createContext<any>({});

export const GlobalStateProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<GlobalState, any>>(reducer, INITIAL_STATE);

    useEffect(() => {
        if (!state.localStore || state.ready) return;
        (async () => {
            const savedAccount = (await state.localStore.executeQuery('accounts'))[0];
            dispatch({ type: ActionTypes.init, payload: savedAccount });
        })();
    }, [state.ready, state.localStore]);

    useEffect(() => {
        if (!state.wallet) return;
        state.localStore.save('accounts', state.wallet.getAccount());
    }, [state.wallet]);

    return <AppContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
            {children}
        </DispatchContext.Provider>
    </AppContext.Provider>
}

export const useGlobalDispatch = () => useContext(DispatchContext);

export enum ActionTypes {
    init, setup
}

export interface Action {
    type: ActionTypes
    payload: any
}

function reducer(state: GlobalState, action: any) {
    const { type, payload } = action;

    switch (type) {
        case ActionTypes.init:
            const newState = { ...state, ready: true };
            if (payload) {
                newState.wallet = new Wallet(payload, state.peers, state.localStore);
            }
            return newState;

        case ActionTypes.setup:
            return { ...state, wallet: new Wallet(payload, state.peers, state.localStore), }

        default:
            return state;
    }
}
