import { useEffect } from "react";
import { Container, Box, Button, Typography } from "@mui/material";
import { Send as SendIcon, CallReceived as ReceiveIcon } from "@mui/icons-material";
import BitcoinLogo from "../assets/bitcoin-btc-logo.svg";
import { CopyableContent } from "../components/CopyUtils";
import { TransactionList } from "../components/transactions/Transactions";
import { Transaction } from "../models/Transaction";
import { useGlobalState } from "../global-state";

export const Main: React.FC = () => {
    const { wallet } = useGlobalState();
    const transactions: Transaction[] = [];

    return <Box py={10}>
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <Box>
                <Typography color='textSecondary' variant='body2' sx={{ px: 1 }}>Tap to Copy</Typography>
                <CopyableContent sx={{ fontSize: '24px', px: 1, py: 0.5 }}>{wallet?.getReceiveAddr()}</CopyableContent>
            </Box>

            <Box display='flex' alignItems='center' width='30rem' mt={4}>
                <img src={BitcoinLogo} alt="Bitcoin" style={{
                    objectFit: 'cover',
                    width: '70px', height: '70px'
                }} />
                <Typography sx={{ ml: 'auto', fontSize: '68px' }}>101.2457909</Typography>
            </Box>

            <Box display='flex' alignItems='center' justifyContent='center' mt={2} mb={8}>

                <Button color='primary' variant='contained' endIcon={<ReceiveIcon />} sx={{ width: '7.5rem' }}>Receive</Button>

                <Button color='primary' variant='contained' endIcon={<SendIcon />} sx={{ ml: 10, width: '7.5rem' }}>Send</Button>

            </Box>

            <Typography variant='h3' sx={{ position: 'relative' }}>
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
    </Box>
}
