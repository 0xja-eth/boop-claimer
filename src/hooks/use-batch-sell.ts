"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bn.js";
import {
  BlockhashWithExpiryBlockHeight,
  // Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction, TransactionInstruction,
  // VersionedMessage,
  VersionedTransaction
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
import { bundleTipIx, DefaultTipLamports, sendBundle, waitForBundle, waitForTransactions } from "@/lib/solana/jito";
import { wait } from "@/lib/promise";
import { toast } from 'sonner';
import { ClaimingState } from "@/components/token-table";

export const BundleTxCount = 4;

export function useBatchSell() {
  const [loading, setLoading] = useState(false);
  const [sellingStates, setSellingStates] = useState<Record<string, ClaimingState>>({});

  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const cpSwapProgram = useMemo(() => {
    if (!connection || !wallet) return null;
    // @ts-ignore
    return loadProgram<typeof CPSwap>("cp_swap", connection, wallet);
  }, [connection, wallet]);

  const sell = useCallback(
    async (distributions: Distribution[], amounts: BN[]) => {
      console.log("Selling distributions:", distributions, amounts);

      if (loading) return;

      if (!wallet || !connection)
        throw new Error("Wallet not connected");

      if (!cpSwapProgram)
        throw new Error("Program not loaded");

      setLoading(true);
      // Initialize all distributions as pending
      setSellingStates(
        distributions.reduce((acc, dist) => ({
          ...acc,
          [dist.id]: { status: 'pending', distribution: dist }
        }), {})
      );

      try {
        let recentBlockhash = await connection.getLatestBlockhash()
        const seller = wallet.publicKey

        const distributionTxs: VersionedTransaction[][] = []
        let bundleTxs: VersionedTransaction[] = [], idx = 0;

        for (const distribution of distributions) {
          // Update status to claiming
          setSellingStates(prev => ({
            ...prev,
            [distribution.id]: { ...prev[distribution.id], status: 'selling' }
          }));

          const mint = new PublicKey(distribution.token.address)
          const amount = amounts[idx++]

          const sTx = await buildTx(sellIx({
            program: cpSwapProgram, mint, amountLamports: amount, seller,
          }), {
            payer: seller, recentBlockhash, microLamports: 3000, units: 150000
          })

          bundleTxs.push(sTx)
          distributionTxs.push([sTx])

          if (bundleTxs.length >= BundleTxCount) {
            await sendBundleTxs(recentBlockhash, distributions, distributionTxs, bundleTxs);

            recentBlockhash = await connection.getLatestBlockhash()
            bundleTxs = []
          }
        }
        if (bundleTxs.length > 0) {
          await sendBundleTxs(recentBlockhash, distributions, distributionTxs, bundleTxs);
        }

        console.log("Selling transactions:", distributionTxs);
      } catch (error) {
        console.error("Failed to sell:", error);
        toast.error('Failed to process sells');
        // Reset status for non-claimed distributions
        setSellingStates(prev => {
          const newStates = { ...prev };
          Object.keys(newStates).forEach(id => {
            if (newStates[id].status !== 'sold') delete newStates[id]
          });
          return newStates;
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      wallet,
      connection,
      cpSwapProgram
    ],
  );

  const sendBundleTxs = useCallback(
    async (recentBlockhash: BlockhashWithExpiryBlockHeight,
           distributions: Distribution[],
           distributionTxs: VersionedTransaction[][],
           bundleTxs: VersionedTransaction[]) => {

    if (!wallet || !connection)
      throw new Error("Wallet not connected");

    try {
      const tipTx = await buildTx(
        bundleTipIx(wallet.publicKey, DefaultTipLamports * 3),
        { recentBlockhash, payer: wallet.publicKey, units: 30000 }
      )

      const {transactions} = await sendBundle(connection, wallet, [tipTx, ...bundleTxs], [], false);

      // Update status to claimed for the remaining distributions
      const remainingDistIds = distributionTxs
        .slice(-Math.floor(bundleTxs.length))
        .map(txs => distributions[distributionTxs.indexOf(txs)].id);

      waitForTransactions(connection, transactions)
        .then(() => {
          setSellingStates(prev => {
            const newStates = { ...prev };
            remainingDistIds.forEach(id => {
              if (newStates[id]) {
                newStates[id] = { ...newStates[id], status: 'sold' };
                toast.success(`Successfully sold ${newStates[id].distribution.token.symbol}`);
              }
            });
            return newStates;
          });
        })
        .catch(e => console.error("Failed to wait for bundle:", e));
      } catch (error) {
        console.error("Failed to send bundle:", error);
        toast.error('Failed to send transactions');

        throw error
      }
    }, [connection, wallet])

    return { sell, sellingStates, loading };
}