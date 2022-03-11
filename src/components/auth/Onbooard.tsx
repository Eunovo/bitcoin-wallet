import { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import {
    createHDMasterFromMnemonic, createMnemonic,
    generateAddress
} from "../../keygen/createMnemonicKeys";
import { ActionTypes, useGlobalDispatch, useGlobalState } from "../../global-state";
import { Metadata } from "../../models/Metadata";
import { Account } from "../../models/Account";
import { LocalStore } from "../../storage/LocalStore";

export const LoginOrOnboard: React.FC = () => {
    return <Onboard />
}

async function setup(localStore: LocalStore, mnemonic: string): Promise<Account> {
    await localStore.save('_metadata', { name: 'mnemonic', mnemonic });
    const masterJSON = await createHDMasterFromMnemonic(mnemonic);
    const receiveAddr = generateAddress(masterJSON);
    return {
        master: masterJSON,
        addresses: [receiveAddr]
    } as any;
}

const Onboard: React.FC = () => {
    const { localStore } = useGlobalState();
    const dispatch = useGlobalDispatch();
    const [loading, setLoading] = useState(false);
    const [mnemonic, setMnemonic] = useState<string>('');

    useEffect(() => {
        (async () => {
            const savedMnemonic = (await localStore.executeQuery<Metadata>(
                '_metadata', { name: 'mnemonic' }))[0]?.value;

            if (savedMnemonic) {
                const principal = await setup(localStore, savedMnemonic);
                dispatch({ type: ActionTypes.setup, payload: principal });
                return;
            }

            setMnemonic(createMnemonic());
        })();
    }, [localStore, dispatch]);

    const completeWalletSetup = useCallback(async () => {
        setLoading(true);
        const principal = await setup(localStore, mnemonic);
        dispatch({ type: ActionTypes.setup, payload: principal });
    }, [mnemonic, dispatch]);

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

