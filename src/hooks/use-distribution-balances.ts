import { useCallback, useEffect, useState } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, unpackAccount } from "@solana/spl-token";
import { Distribution } from "@/lib/solana/op/get-distributions";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

export function useDistributionBalances(distributions: Distribution[]) {
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const refetch = useCallback(async () => {
    if (!wallet || !connection) return;

    try {
      const mintPubkeys = distributions.map(d => new PublicKey(d.token.address));
      const ataPubkeys = mintPubkeys.map(mint =>
        getAssociatedTokenAddressSync(mint, wallet.publicKey)
      );

      const accountInfos = await connection.getMultipleAccountsInfo(ataPubkeys);

      const result: Record<string, bigint> = {};

      accountInfos.forEach((accInfo, idx) => {
        const distId = distributions[idx].id;

        if (!accInfo) {
          result[distId] = BigInt(0);
          return;
        }

        try {
          const tokenAccount = unpackAccount(accInfo.owner, accInfo);
          result[distId] = tokenAccount.amount;
        } catch (e) {
          console.warn(`Failed to unpack token account for mint ${mintPubkeys[idx].toBase58()}:`, e);
          result[distId] = BigInt(0); // 不是合法 SPL Token Account，视为 0
        }
      });

      setBalances(result);
    } catch (err) {
      console.error("Error fetching distribution balances:", err);

      const fallback: Record<string, bigint> = {};
      distributions.forEach(d => (fallback[d.id] = BigInt(0)));
      setBalances(fallback);
    }
  }, [wallet, connection, distributions]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { balances, refetch };
}
