export interface Account {
    network: string
    master: { xpriv: string, xpub: string }
    addresses: { privKey: string, pubKey: string, address: string }[]
}
