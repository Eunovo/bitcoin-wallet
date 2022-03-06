export function convertSatoshisToBTC(amountInSatoshis: number) {
    return amountInSatoshis / 100000000;
}

export function convertBTCToSatoshis(amountInBTC: number) {
    return amountInBTC * 100000000;
}
