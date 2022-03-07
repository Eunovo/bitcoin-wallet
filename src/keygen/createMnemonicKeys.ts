import hdkey from "hdkey";
import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import crypto, { createHash } from "crypto";
import bs58check from "bs58check";

const _BITCOIN_MAINNNET = 0x00;
const _BITCOIN_TESTNET = 0x6f;
const BITCOIN_REGTEST = 0x6f;


export function createMnemonic() {
    const randomBytes = crypto.randomBytes(16);
    return entropyToMnemonic(randomBytes);
}

export async function createHDMasterFromMnemonic(mnemonic: string) {
    const seed = await mnemonicToSeed(mnemonic);
    const hdMaster = hdkey.fromMasterSeed(seed);
    return hdMaster.toJSON();
}

function createAddressFrom(pubKey: Buffer) {
    const sha256 = createHash('sha256').update(pubKey).digest();
    const rmd160 = createHash('ripemd160').update(sha256).digest();
    const versionByte = Buffer.allocUnsafe(21);
    versionByte.writeUInt8(BITCOIN_REGTEST, 0);
    rmd160.copy(versionByte, 1);
    return bs58check.encode(versionByte);
}

export function generateAddress(masterJSON: any) {
    const hdMaster = hdkey.fromJSON(masterJSON);
    const path = 'm/0';
    const child = hdMaster.derive(path);
    const privKey = child.privateKey;
    const pubKey = child.publicKey;

    return { privKey, pubKey, address: createAddressFrom(pubKey), path };
}