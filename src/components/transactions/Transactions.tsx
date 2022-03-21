import { Box, Paper, Typography, useTheme } from "@mui/material";
import { Transaction } from "../../models/Transaction";
import { convertSatoshisToBTC, presentSummarisedDate } from "../../utils";

export const TransactionList: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    return <Box width='100%' maxWidth={'60rem'}>
        {
            transactions.map((transaction, i) => <TransactionItem key={i} transaction={transaction} />)
        }
        {
            transactions.length === 0 && <Typography align='center' color='textSecondary' sx={{ fontSize: '1.5rem' }}>
                You haven't made any transactions
            </Typography>
        }
    </Box>
}

export const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const theme = useTheme();
    const addresses = transaction.senders || transaction.targets || [];
    const isDebit = (transaction.targets?.length || 0) > 0;

    return <Paper variant="outlined"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, minHeight: '5rem' }}>
        <Typography noWrap sx={{ width: '40%', mr: 2 }}>
            {addresses[0]?.address ?? 'Coinbase'}
        </Typography>

        <Typography sx={{
            flexGrow: 1, color: isDebit ? 'red' : 'green',
            [theme.breakpoints.down('sm')]: { textAlign: 'right' } }}>
            {new Intl.NumberFormat('en-IN', { minimumFractionDigits: 8, maximumFractionDigits: 8 })
                .format(convertSatoshisToBTC(transaction.amount))} BTC
        </Typography>

        <Typography sx={{ flexGrow: 1, [theme.breakpoints.down('sm')]: { display: 'none' } }}>
            {
                transaction.blockTime
                    ? presentSummarisedDate(transaction.blockTime)
                    : <>Pending</>
            }
        </Typography>
    </Paper>
}

