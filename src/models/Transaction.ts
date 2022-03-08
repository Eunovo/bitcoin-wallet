export interface Transaction {
    txid: string

    /**
     * Input addresses and amount
     */
    senders?: { address: string, value: number }[]

    /**
     * Output addresses and amount
     */
    targets?: { address: string, value: number }[]

    /**
     * Total received or sent in satoshis
     * excluding transaction fees
     */
    amount: number

    fee: number

    /**
     * Number of confirmations
     */
    confirmations: number

    blockTime?: string
}
