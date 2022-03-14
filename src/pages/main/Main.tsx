import { useState } from "react";
import {
    Container, Backdrop, Box, Button,
    Slide, Typography,
    useMediaQuery, useTheme
} from "@mui/material";
import { Send as SendIcon, CallReceived as ReceiveIcon } from "@mui/icons-material";
import BitcoinLogo from "../../assets/bitcoin-btc-logo.svg";
import { CopyableContent } from "../../components/CopyUtils";
import { SendCoins } from "../../components/sendcoins/SendCoins";
import { QRCodeGenerator } from "../../components/QRCodeGenerator";
import { TransactionList } from "../../components/transactions/Transactions";
import { useTransactions } from "../../components/transactions/useTransactions";
import { useGlobalState } from "../../global-state";
import { SelectNetwork } from "./SelectNetwork";
import { Balance } from "./Balance";
import { useObservable } from "../../Observable";

export const Main: React.FC = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { wallet } = useGlobalState();
    const account = useObservable(wallet.account);
    const transactions = useTransactions();

    const [state, setState] = useState({ send: false, receive: false });
    const toggle = (field: string) => setState((s: any) => ({ ...s, [field]: !s[field] }));

    return <Box py={10}>
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>

            <SelectNetwork wallet={wallet} />

            <Box mt={4}>
                <Typography color='textSecondary' variant='body2' sx={{ px: 1 }}>Tap to Copy</Typography>
                <CopyableContent sx={{ fontSize: 'clamp(16px, 4vw, 24px)', px: 1, py: 0.5 }}>
                    {account ? wallet.getReceiveAddrFor(account) : ""}
                </CopyableContent>
            </Box>

            <Box display='flex' alignItems='center' justifyContent='center' mt={4}>
                <img src={BitcoinLogo} alt="Bitcoin" style={{
                    objectFit: 'cover',
                    width: '70px', height: '70px'
                }} />
                <Typography sx={{ ml: 2, fontSize: 'clamp(48px, 10vw, 68px)' }}>
                    {wallet && <Balance wallet={wallet} />}
                </Typography>
            </Box>

            <Box display='flex' alignItems='center' justifyContent='center' mt={2} mb={8}>

                <Button
                    color='primary'
                    variant='contained'
                    endIcon={<ReceiveIcon />}
                    onClick={() => wallet && toggle('receive')}
                    sx={{ width: '7.5rem' }}
                >
                    Receive
                </Button>

                <Button
                    color='primary'
                    variant='contained'
                    endIcon={<SendIcon />}
                    onClick={() => wallet && toggle('send')}
                    sx={{ ml: 10, width: '7.5rem' }}
                >
                    Send
                </Button>

            </Box>

            <Typography variant={isSmallScreen ? 'h5' : 'h3'} sx={{ position: 'relative', mb: 6 }}>
                Transaction History

                <Box
                    position='absolute'
                    top={0} bottom={0}
                    left={'25%'} right={'25%'}
                    borderBottom='3px solid'
                    borderColor='secondary.main'
                ></Box>
            </Typography>

            <TransactionList transactions={transactions} />

        </Container>

        <Backdrop open={state.send || state.receive}
            onClick={() => setState({ send: false, receive: false })}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Slide in={state.send} direction='up'>
                <Box bgcolor='white' borderRadius={'5% 5% 0% 0%'} onClick={(e) => { e.stopPropagation(); }}
                    position='absolute' pt={10} px={2} top={'30%'} left={0} right={0} bottom={0}>
                    <Box mx='auto' width='100%' maxWidth={'40rem'}>
                        <Typography variant={isSmallScreen ? 'h5' : 'h3'}>Send Coins</Typography>

                        <Box mt={4}>
                            <SendCoins wallet={wallet!} handleBack={() => toggle('send')} />
                        </Box>
                    </Box>
                </Box>
            </Slide>

            <Slide in={state.receive} direction='up'>
                <Box bgcolor='white' borderRadius={'5% 5% 0% 0%'} onClick={(e) => { e.stopPropagation(); }}
                    position='absolute' pt={10} px={2} top={'30%'} left={0} right={0} bottom={0}
                    sx={{ [theme.breakpoints.down('md')]: { top: '20%', textAlign: 'center' } }}
                >
                    <Box mx='auto' width='100%' maxWidth={'50rem'}>
                        <Typography variant={'h3'}>Receive Coins</Typography>

                        <Box display='flex' alignItems={'center'} flexWrap='wrap' mt={4}>
                            <Box display='flex' alignItems='center' justifyContent='center'
                                height='15rem' width='20rem' mx='auto'
                            >
                                <QRCodeGenerator data={wallet?.getURI()} />    
                            </Box>

                            <Box mx='auto'>
                                <Typography align='left' color='textSecondary' variant='body2' sx={{ px: 1 }}>Tap to Copy</Typography>
                                <CopyableContent sx={{ fontSize: '16px', px: 1, py: 0.5 }}>
                                    {account ? wallet.getReceiveAddrFor(account) : ""}
                                </CopyableContent>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Slide>
        </Backdrop>
    </Box>
}
