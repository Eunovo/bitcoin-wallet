export interface Account {
    master: { xpriv: string, xpub: string }
    addresses: { privKey: string, pubKey: string, address: string }[]
}
