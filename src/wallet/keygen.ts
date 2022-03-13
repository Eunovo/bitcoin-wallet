import hdkey from "hdkey";
import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import crypto, { createHash } from "crypto";
import bs58check from "bs58check";

export function createMnemonic() {
    const randomBytes = crypto.randomBytes(16);
    return entropyToMnemonic(randomBytes);
}

export async function createHDMasterFromMnemonic(mnemonic: string) {
    const seed = await mnemonicToSeed(mnemonic);
    const hdMaster = hdkey.fromMasterSeed(seed);
    return hdMaster.toJSON();
}

function createAddressFrom(pubKey: Buffer, version: number) {
    const sha256 = createHash('sha256').update(pubKey).digest();
    const rmd160 = createHash('ripemd160').update(sha256).digest();
    const versionByte = Buffer.allocUnsafe(21);
    versionByte.writeUInt8(version, 0);
    rmd160.copy(versionByte, 1);
    return bs58check.encode(versionByte);
}

export function generateAddress(masterJSON: any, version: number, path: string = 'm/0') {
    const hdMaster = hdkey.fromJSON(masterJSON);
    const child = hdMaster.derive(path);
    const privKey = child.privateKey;
    const pubKey = child.publicKey;

    return {
        privKey: privKey.toString('hex'),
        pubKey: pubKey.toString('hex'),
        path,
        address: createAddressFrom(pubKey, version)
    };
}