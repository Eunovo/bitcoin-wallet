export interface Coin {
    _id: string
    address: string
    script: string
    value: number
    confirmations: number
    mintTxid: string
    mintIndex: number
    network: string
}
