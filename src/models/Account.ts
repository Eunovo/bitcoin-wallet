export interface Account {
    network: string
    master: { xpriv: string, xpub: string }
    addresses: { privKey: Buffer, pubKey: Buffer, address: string }[]
}
