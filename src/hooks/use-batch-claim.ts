"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bn.js";
import {
  // Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  // VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { loadProgram, signAndSendTx, signAndSendTxs, signTx, signTxs } from "@/lib/solana/solana";
import {
  // AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Distribution } from "@/lib/solana/op/get-distributions";
import { claimIx } from "@/lib/solana/op/claim";
import { sellIx } from "@/lib/solana/op/sell";
import { buildTx } from "@/lib/solana/op/utils";
import { MerkleDistributor } from "@/constants/contracts/idls/merkle_distributor";
import { CPSwap } from "@/constants/contracts/idls/cp_swap";
import { bundleTipIx, DefaultTipLamports, sendBundle } from "@/lib/solana/jito";
import { wait } from "@/lib/promise";

export const BundleTxCount = 4;

export function useBatchClaim() {
  const [loading, setLoading] = useState(false);
  const [claimingDistributions, setClaimingDistributions] = useState<Distribution[]>([]);
  const [claimedIndex, setClaimedIndex] = useState(0);

  const { publicKey } = useWallet();

  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const merkleDistributorProgram = useMemo(() => {
    if (!connection || !wallet) return null;
    // @ts-ignore
    return loadProgram<typeof MerkleDistributor>("merkle_distributor", connection, wallet);
  }, [connection, wallet]);
  const cpSwapProgram = useMemo(() => {
    if (!connection || !wallet) return null;
    // @ts-ignore
    return loadProgram<typeof CPSwap>("cp_swap", connection, wallet);
  }, [connection, wallet]);

  const claim = useCallback(
    async (distributions: Distribution[], sell: boolean) => {
      console.log("Claiming distributions:", distributions);

      if (loading) return;

      if (!wallet || !connection || !publicKey)
        throw new Error("Wallet not connected");

      if (!merkleDistributorProgram || !cpSwapProgram)
        throw new Error("Program not loaded");

      setLoading(true);
      setClaimingDistributions(distributions);
      setClaimedIndex(-1)

      try {
        let recentBlockhash = await connection.getLatestBlockhash()
        const claimant = wallet.publicKey

        const distributionTxs: VersionedTransaction[][] = []
        let bundleTxs: VersionedTransaction[] = []

        for (const distribution of distributions) {
          const mint = new PublicKey(distribution.token.address)
          const amount = new BN(distribution.amountLpt)
          const proofs = distribution.proofs

          const proofsBN = proofs.map(p => p.map(b => new BN(b)))

          const cTx = await buildTx(claimIx({
            program: merkleDistributorProgram, mint, amountUnlocked: amount, proofs: proofsBN, claimant,
            useMemo: bundleTxs.length >= BundleTxCount / 2
          }), {
            payer: claimant, recentBlockhash, microLamports: 1000, units: 150000
          })

          let newTxs = [cTx]
          if (sell) {
            const sTx = await buildTx(sellIx({
              program: cpSwapProgram, mint, amountLamports: amount, seller: claimant,
              useMemo: bundleTxs.length >= BundleTxCount / 2
            }), {
              payer: claimant, recentBlockhash, microLamports: 3000, units: 150000
            })
            newTxs.push(sTx)
          }

          bundleTxs.push(...newTxs)
          distributionTxs.push(newTxs)

          if (bundleTxs.length >= BundleTxCount) {
            // await signAndSendTxs(connection, bundleTxs, wallet)

            const tipTx = await buildTx(
              bundleTipIx(wallet.publicKey, DefaultTipLamports * 3),
              { recentBlockhash, payer: wallet.publicKey, units: 30000 }
            )
            await sendBundle(connection, wallet, [tipTx, ...bundleTxs], [], false)
              // .then(() =>
              //   setClaimedIndex(prev => prev + (sell ? bundleTxs.length / 2 : bundleTxs.length))
              // )
              // .catch(error => {
              //   console.error("Failed to send bundle:", error);
              // })

            await wait(5000)

            recentBlockhash = await connection.getLatestBlockhash()
            bundleTxs = []
          }
        }
        if (bundleTxs.length > 0) {
          // await signAndSendTxs(connection, bundleTxs, wallet)

          const tipTx = await buildTx(
            bundleTipIx(wallet.publicKey, DefaultTipLamports * 3),
            { recentBlockhash, payer: wallet.publicKey, units: 30000 }
          )
          await sendBundle(connection, wallet, [tipTx, ...bundleTxs], [], false)
          // sendBundle(connection, wallet, [tipTx, ...bundleTxs])
          //   .then(() =>
          //     setClaimedIndex(prev => prev + (sell ? bundleTxs.length / 2 : bundleTxs.length))
          //   )
          //   .catch(error => {
          //     console.error("Failed to send bundle:", error);
          //   })
        }

        console.log("Claiming transactions:", distributionTxs);
      } catch (error) {
        console.error("Failed to claim:", error);
        throw error; // TODO: Handle error
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      wallet,
      connection,
      publicKey,
      merkleDistributorProgram,
      cpSwapProgram
    ],
  );

  return { claim, claimingDistributions, claimedIndex, loading };
}