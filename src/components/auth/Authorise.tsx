import { Box, CircularProgress, Slide } from "@mui/material";
import { useGlobalState } from "../../global-state";
import { LoginOrOnboard } from "./Onbooard";

export const Authorise: React.FC = ({ children }) => {
    const { principal, ready } = useGlobalState();

    if (!ready) return <Box
        width='100vw'
        height='100vh'
        display='flex'
        alignItems='center'
        justifyContent='center'
    >
        <CircularProgress />
    </Box>

    const failed = !principal;
    return <>
        <Slide in={failed} direction='down'>
            <div style={{ position: 'absolute' }}><LoginOrOnboard /></div>
        </Slide>
        {!failed && children}
    </>
}
