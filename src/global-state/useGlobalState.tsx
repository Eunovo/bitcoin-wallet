import { useContext } from "react"
import { AppContext } from "./context"

export const useGlobalState = () => {
    return useContext(AppContext);
}
