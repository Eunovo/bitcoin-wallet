import { useObservable } from "../../Observable";
import { convertSatoshisToBTC } from "../../utils";
import { Wallet } from "../../wallet/Wallet";

export const Balance: React.FC<{ wallet: Wallet }> = ({ wallet }) => {
    const balance = useObservable<number>(wallet.balanceInSatoshis);
    if (balance === undefined) return <></>

    const balInBTC = convertSatoshisToBTC(balance);
    return <>{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 8 })
        .format(balInBTC)}</>
}
