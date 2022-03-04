export interface Block {
    _id: string
    chain: "BTC"
    network: string
    hash: string
    height: number
    version: number
    size: number
    merkleRoot: string
    time: string
    timeNormalized: string
    nonce: number
    bits: number
    previousBlockHash: string
    nextBlockHash: string,
    reward: number,
    transactionCount: number
    confirmations: number
}
