import CryptoJS from "crypto-js";
import { Account } from "../models/Account";

export interface Cipher {
    encryptAccount(account: Account): Account
    decryptAccount(account: Account): Account
    encrypt(value: string): string
    decrypt(value: string): string
}

export class TripleDESCipher implements Cipher {

    constructor(private password: string) { }

    encrypt(value: string) {
        return CryptoJS.TripleDES.encrypt(value, this.password).toString();
    }

    decrypt(value: string) {
        return CryptoJS.TripleDES.decrypt(value, this.password)
            .toString(CryptoJS.enc.Utf8);
    }

    encryptAccount(account: Account): Account {
        return {
            ...account,
            master: {
                xpriv: this.encrypt(account.master.xpriv),
                xpub: this.encrypt(account.master.xpub)
            },
            addresses: account.addresses
                .map(({ privKey, pubKey, address }) => ({
                    privKey: this.encrypt(privKey), pubKey: this.encrypt(pubKey),
                    address
                }))
        };
    }

    decryptAccount(account: Account): Account {
        return {
            ...account,
            master: {
                xpriv: this.decrypt(account.master.xpriv),
                xpub: this.decrypt(account.master.xpub)
            },
            addresses: account.addresses
                .map(({ privKey, pubKey, address }) => ({
                    privKey: this.decrypt(privKey), pubKey: this.decrypt(pubKey),
                    address
                }))
        };
    }

}
