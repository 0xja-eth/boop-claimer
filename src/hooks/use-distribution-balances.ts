import { useCallback, useEffect, useState } from "react";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { Distribution } from "@/lib/solana/op/get-distributions";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getAccount, getAssociatedTokenAddressSync, getMultipleAccounts } from "@solana/spl-token";
import { wait } from "@/lib/promise";

export function useDistributionBalances(distributions: Distribution[]) {
  const [balances, setBalances] = useState<Record<string, bigint>>({})

  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  // const fetchAccountInfos = useCallback(async (mints: PublicKey[]) => {
  //   if (!wallet || !connection)
  //     throw new Error("Wallet not connected");
  //
  //   const tokenAccounts = mints.map(mint => getAssociatedTokenAddressSync(mint, wallet.publicKey))
  //   const res = await getMultipleAccounts(connection, tokenAccounts)
  //
  //   console.log("tokenAccountInfos", res)
  //
  //   return res
  // }, [connection])

  const fetchAccountInfo = useCallback(async (mint: PublicKey) => {
    if (!wallet || !connection)
      throw new Error("Wallet not connected");

    const tokenAccount = getAssociatedTokenAddressSync(mint, wallet.publicKey)
    return await getAccount(connection, tokenAccount)
  }, [wallet, connection])

  const refetch = async () => {
    distributions.map(async (d, i) => {
      await wait(250 * i);

      try {
        const mint = new PublicKey(d.token.address)
        const accountInfo = await fetchAccountInfo(mint)

        setBalances((prev) => ({
          ...prev, [d.id]: accountInfo.amount
        }))
      } catch (e) {
        console.error("Fetch balance failed:", e)
        setBalances((prev) => ({
          ...prev, [d.id]: BigInt(0)
        }))
      }
    })
  }

  useEffect(() => { refetch() }, [connection, wallet, distributions]);

  return { balances, refetch }
}