import { Reducer, useEffect, useReducer, createContext, useContext } from "react";
import { AppContext, GlobalState, INITIAL_STATE } from "./context";

const DispatchContext = createContext<any>({});

export const GlobalStateProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<GlobalState, any>>(reducer, INITIAL_STATE);

    useEffect(() => {
        if (!state.localStore || state.ready) return;
        (async () => {
            const savedPrincipal = (await state.localStore.executeQuery('accounts'))[0];
            dispatch({ type: ActionTypes.init, payload: savedPrincipal });
        })();
    }, [state.ready, state.localStore]);

    useEffect(() => {
        console.log(state.principal);
        if (!state.principal) return;
        state.localStore.save('accounts', state.principal);
    }, [state.principal]);

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
            return { ...state, principal: payload, ready: true };

        case ActionTypes.setup:
            return { ...state, principal: payload }

        default:
            return state;
    }
}
