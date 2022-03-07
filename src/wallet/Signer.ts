import { Signer } from "bitcoinjs-lib";
import Secp256k1 from "@enumatech/secp256k1-js";

export class SecpSigner implements Signer {
    constructor(
        private privateKey: Buffer,
        public publicKey: Buffer,
        public network?: any
    ) {}

    sign(hash: Buffer, _lowR?: boolean): Buffer {
        return Secp256k1.ecsign(this.privateKey, hash);
    }
    
}
