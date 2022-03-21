import hdkey from "hdkey";
import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import crypto, { createHash } from "crypto";
import bs58 from "bs58";
import { toBase58Check } from "bitcoinjs-lib/src/address";
import { PrivateKey } from "bitcore-lib";

export function createMnemonic() {
    const randomBytes = crypto.randomBytes(16);
    return entropyToMnemonic(randomBytes);
}

export async function createHDMasterFromMnemonic(mnemonic: string) {
    const seed = await mnemonicToSeed(mnemonic);
    const hdMaster = hdkey.fromMasterSeed(seed);
    return hdMaster.toJSON();
}


export function generateAddress(
    masterJSON: any,
    versions: { wif: number, address: number },
    path: string = 'm/0'
) {
    const hdMaster = hdkey.fromJSON(masterJSON);
    const child = hdMaster.derive(path);
    const privKey = convertToWIF(child.privateKey, versions.wif);
    const pubKey = convertToWIF(child.publicKey, versions.wif);
    const addrBuffer = (new PrivateKey(privKey)).toAddress().hashBuffer;

    return {
        privKey, pubKey, path,
        address: toBase58Check(addrBuffer, versions.address)
    };
}

function convertToWIF(key: Buffer, version: number) {
    const versionByte = Buffer.allocUnsafe(key.length + 1);
    versionByte.writeUInt8(version, 0);
    key.copy(versionByte, 1);

    let digest = createHash('sha256').update(versionByte).digest();
    digest = createHash('sha256').update(digest).digest();

    const final = Buffer.allocUnsafe(versionByte.length + 4);
    versionByte.copy(final);
    digest.copy(final, final.length - 4, 0, 4);

    return bs58.encode(final);
}
