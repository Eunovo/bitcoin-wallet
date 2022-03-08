export function convertSatoshisToBTC(amountInSatoshis: number) {
    return amountInSatoshis / 100000000;
}

export function convertBTCToSatoshis(amountInBTC: number) {
    return amountInBTC * 100000000;
}

export function presentSummarisedDate(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const differenceInMS = now.valueOf() - date.valueOf();
    const aSecond = 1000;
    const aMinute = 60 * aSecond;
    const aHour = 60 * aMinute;

    if (differenceInMS < aSecond) return "now";
    if (differenceInMS < aMinute) return `${Math.trunc(differenceInMS / aSecond)} seconds ago`;
    if (differenceInMS < aHour) return `${Math.trunc(differenceInMS / aMinute)} minutes ago`;
    if (differenceInMS < (24 * aHour)) return `${Math.trunc(differenceInMS / aHour)} hours ago`;

    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).format(date);
}
