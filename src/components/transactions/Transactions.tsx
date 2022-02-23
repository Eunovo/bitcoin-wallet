import { Box, Paper } from "@mui/material";
import { Transaction } from "../../models/Transaction";

export const TransactionList: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    return <Box>
        {
            transactions.map((transaction, i) => <TransactionItem key={i} transaction={transaction} />)
        }
    </Box>
}

export const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    return <Paper sx={{ display: 'flex', alignItems: 'center',  }}>

    </Paper>
}

