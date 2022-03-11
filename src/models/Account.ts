export interface Account {
    network: 'regtest' | 'testnet' | 'mainnet'
    master: { xpriv: string, xpub: string }
    addresses: { privKey: string, pubKey: string, address: string }[]
}
