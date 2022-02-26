import { useCallback, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import {
    createHDMasterFromMnemonic, createMnemonic,
    generateReceiveAddress, generateSendAddress
} from "../../keygen/createMnemonicKeys";
import { ActionTypes, useGlobalDispatch } from "../../global-state";

export const LoginOrOnboard: React.FC = () => {
    return <Onboard />
}

const Onboard: React.FC = () => {
    const dispatch = useGlobalDispatch();
    const [loading, setLoading] = useState(false);
    const mnemonic = createMnemonic();

    const completeWalletSetup = useCallback(async () => {
        setLoading(true);
        const masterJSON = await createHDMasterFromMnemonic(mnemonic);
        const receiveAddr = generateReceiveAddress(masterJSON);
        const sendAddr = generateSendAddress(masterJSON);
        const principal = {
            master: masterJSON,
            receiveAddr,
            sendAddr
        };
        dispatch({ type: ActionTypes.setup, payload: principal });
    }, [mnemonic]);

    return <Box
        display='flex'
        flexDirection={'column'}
        alignItems={'center'}
        textAlign='center' pb={10}
        height='100%'
        width='100vw'
    >
        <Typography variant='h5' sx={{ mt: '30vh' }}>Write down this phrase somewhere safe</Typography>
        <Typography color='textSecondary'>You can use this phrase to recover your wallet</Typography>

        <Typography sx={{ fontSize: '48px', maxWidth: '30rem', mt: 8 }}>
            {mnemonic}
        </Typography>

        <Button
            onClick={() => completeWalletSetup()}
            disabled={loading}
            size='small' sx={{ mt: 10 }}
            endIcon={loading && <CircularProgress size={20} color='inherit' />}
            variant='contained'
        >
            I'm done... Complete wallet setup
        </Button>
    </Box>
}

