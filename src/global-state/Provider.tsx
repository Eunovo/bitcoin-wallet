import { AppContext, INITIAL_STATE } from "./context";

export const GlobalStateProvider: React.FC = ({ children }) => {
    return <AppContext.Provider value={INITIAL_STATE}>
        {children}
    </AppContext.Provider>
}
