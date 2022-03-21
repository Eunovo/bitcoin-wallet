import { Signer } from "bitcoinjs-lib";
import Secp256k1 from "@enumatech/secp256k1-js";
import { PrivateKey, Transaction } from "bitcore-lib";
import Sighash from "bitcore-lib/lib/transaction/sighash";

export class SecpSigner implements Signer {
    constructor(
        private privateKey: Buffer,
        public publicKey: Buffer,
        public network?: any
    ) { }

    sign(hash: Buffer, _lowR?: boolean): Buffer {
        return Secp256k1.ecsign(this.privateKey, hash);
    }

}


export function sign(transaction: Transaction, index: number, privateKey: PrivateKey, sigtype: any) {
    const input: any = transaction.inputs[index];
    return Sighash.sign(transaction, privateKey, sigtype,
        index, input.output.script, 'ecdsa');
}

export function sigToDER(signature: any) {
    // console.log(signature.r.toBuffer());
    const toBuffer = (bn: any) => {
        return function () {
            const hex = bn.toString(16, 2);
            const buf = Buffer.from(hex, 'hex');
            return buf;
        }
    }
    signature.r.toBuffer = toBuffer(signature.r);
    signature.s.toBuffer = toBuffer(signature.s);

    return signature.toDER();
}
