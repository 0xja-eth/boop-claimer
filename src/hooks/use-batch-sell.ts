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
import { loadProgram } from "@/lib/solana";
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
import { signAndSendTx, signAndSendTxs, signTx, signTxs } from "@/lib/solana/tx";
import { splitArray } from "@/lib/array";
import { GenTxs, SendTxs } from "@/constants/api";
import bs58 from "bs58";

const BatchTxCount = 4;

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
        const batches = splitArray(distributions,  BatchTxCount)

        for (const batch of batches) {
          try {
            // Update status to claiming
            setSellingStates(prev => {
              const newStates = { ...prev }
              batch.forEach(d => newStates[d.id] = { ...newStates[d.id], status: 'selling' })
              return newStates
            });

            const {txsGroup: serializedTxsGroup} = await GenTxs({
              op: "sell", ids: JSON.stringify(batch.map(d => d.id))
            })
            const serializedTxs = serializedTxsGroup.flat()
            const txs = serializedTxs.map(sTx => VersionedTransaction.deserialize(bs58.decode(sTx)))

            const tipTx = await buildTx(
              bundleTipIx(wallet.publicKey), { recentBlockhash: txs[0].message.recentBlockhash, payer: wallet.publicKey, units: 30000 }
            )

            const [signedTipTx, ...signedTxs] = await wallet.signAllTransactions([tipTx, ...txs])

            const serializedSignedTxs = signedTxs.map(sTx => bs58.encode(sTx.serialize()))
            const serializedSignedTxsGroup = splitArray(serializedSignedTxs, 1)
            const serializedSignedTipTx = bs58.encode(signedTipTx.serialize())

            const { transactions } = await SendTxs({
              op: "sell", ids: batch.map(d => d.id),
              txsGroup: serializedSignedTxsGroup, tipTx: serializedSignedTipTx
            })

            // Update status to sold for the distributions in this batch
            waitForTransactions(connection, transactions)
              .then(() => {
                setSellingStates(prev => {
                  const newStates = { ...prev };
                  batch.forEach(distribution => {
                    const id = distribution.id;
                    if (newStates[id]) {
                      newStates[id] = { ...newStates[id], status: 'sold' };
                      toast.success(`Successfully sold ${newStates[id].distribution.token.symbol}`);
                    }
                  });
                  return newStates;
                });
              })
              .catch(e => {
                console.error("Failed to wait for bundle:", e)
                toast.error("Sell failed! Please try again later.");

                setSellingStates(prev => {
                  const newStates = { ...prev };
                  batch.forEach(distribution => {
                    if (newStates[distribution.id]) delete newStates[distribution.id]
                  });
                  return newStates;
                });
              });

            console.log("Claiming transactions:", transactions);
          } catch (error) {
            console.error("Failed to send bundle:", error);
            toast.error('Failed to send transactions');

            throw error
          }
        }
      }
        // try {
      //   let recentBlockhash = await connection.getLatestBlockhash()
      //   const seller = wallet.publicKey
      //
      //   const distributionTxs: VersionedTransaction[][] = []
      //   let bundleTxs: VersionedTransaction[] = [], idx = 0;
      //
      //   for (const distribution of distributions) {
      //     // Update status to claiming
      //     setSellingStates(prev => ({
      //       ...prev,
      //       [distribution.id]: { ...prev[distribution.id], status: 'selling' }
      //     }));
      //
      //     const mint = new PublicKey(distribution.token.address)
      //     const amount = amounts[idx++]
      //
      //     const sTx = await buildTx(sellIx({
      //       program: cpSwapProgram, mint, amountLamports: amount, seller,
      //     }), {
      //       payer: seller, recentBlockhash, microLamports: 3000, units: 150000
      //     })
      //
      //     bundleTxs.push(sTx)
      //     distributionTxs.push([sTx])
      //
      //     if (bundleTxs.length >= BundleTxCount) {
      //       await sendBundleTxs(recentBlockhash, distributions, distributionTxs, bundleTxs);
      //
      //       recentBlockhash = await connection.getLatestBlockhash()
      //       bundleTxs = []
      //     }
      //   }
      //   if (bundleTxs.length > 0) {
      //     await sendBundleTxs(recentBlockhash, distributions, distributionTxs, bundleTxs);
      //   }
      //
      //   console.log("Selling transactions:", distributionTxs);
      // }
      catch (error) {
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

  return { sell, sellingStates, loading };
}