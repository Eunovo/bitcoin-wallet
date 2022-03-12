import { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { ActionTypes, useGlobalDispatch, useGlobalState } from "../../global-state";
import { Password } from "./Password";
import { useSnackbar } from "notistack";
import { useObservable } from "../../Observable";

export const LoginOrOnboard: React.FC = () => {
    const { wallet } = useGlobalState();
    const { enqueueSnackbar } = useSnackbar();
    const authenticated = useObservable(wallet.authenticated);

    return authenticated ? <Onboard /> : <Password onSubmit={async (password) => {
        try {
            await wallet.login(password);
        } catch (e: any) {
            enqueueSnackbar(e.message, { variant: 'error' });
        }
    }} />
}

const Onboard: React.FC = () => {
    const { quickstart, wallet, localStore } = useGlobalState();
    const dispatch = useGlobalDispatch();
    const [loading, setLoading] = useState(false);
    const [mnemonic, setMnemonic] = useState<string>('');

    useEffect(() => {
        (async () => {
            const mnemonic = await wallet.getOrCreateMnemonic();
            if (quickstart >= 1) {
                await wallet.setup(mnemonic);
                return;
            }
            setMnemonic(mnemonic);
        })();
    }, [localStore, quickstart]);

    const completeWalletSetup = useCallback(async () => {
        setLoading(true);
        await wallet.setup(mnemonic);
        dispatch({ type: ActionTypes.quickstart, payload: 1 });
    }, [wallet, mnemonic, dispatch]);

    return <Box
        display='flex'
        flexDirection={'column'}
        alignItems={'center'}
        textAlign='center' pb={10}
        height='100%'
        width='100vw'
    >
        <Typography variant='h5' sx={{ mt: '10vh' }}>Write down this phrase somewhere safe</Typography>
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

