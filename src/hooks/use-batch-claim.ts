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
import { toast } from 'sonner';
import { ClaimingState } from "@/components/token-table";

export const BundleTxCount = 4;

export function useBatchClaim() {
  const [loading, setLoading] = useState(false);
  const [claimingStates, setClaimingStates] = useState<Record<string, ClaimingState>>({});

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

      if (!wallet || !connection)
        throw new Error("Wallet not connected");

      if (!merkleDistributorProgram || !cpSwapProgram)
        throw new Error("Program not loaded");

      setLoading(true);
      // Initialize all distributions as pending
      setClaimingStates(
        distributions.reduce((acc, dist) => ({
          ...acc,
          [dist.id]: { status: 'pending', distribution: dist }
        }), {})
      );

      try {
        let recentBlockhash = await connection.getLatestBlockhash()
        const claimant = wallet.publicKey

        const distributionTxs: VersionedTransaction[][] = []
        let bundleTxs: VersionedTransaction[] = []

        for (const distribution of distributions) {
          // Update status to claiming
          setClaimingStates(prev => ({
            ...prev,
            [distribution.id]: { ...prev[distribution.id], status: 'claiming' }
          }));

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
            await sendBundleTxs(recentBlockhash, distributions, distributionTxs, bundleTxs, sell);

            // const tipTx = await buildTx(
            //   bundleTipIx(wallet.publicKey, DefaultTipLamports * 3),
            //   { recentBlockhash, payer: wallet.publicKey, units: 30000 }
            // )
            //
            // await sendBundle(connection, wallet, [tipTx, ...bundleTxs], [], false);
            // // Update status to claimed for the processed distributions
            // const processedDistIds = distributionTxs
            //   .slice(-Math.floor(bundleTxs.length / (sell ? 2 : 1)))
            //   .map(txs => distributions[distributionTxs.indexOf(txs)].id);
            //
            // setClaimingStates(prev => {
            //   const newStates = { ...prev };
            //   processedDistIds.forEach(id => {
            //     if (newStates[id]) {
            //       newStates[id] = { ...newStates[id], status: 'claimed' };
            //       toast.success(`Successfully claimed ${newStates[id].distribution.token.symbol}`);
            //     }
            //   });
            //   return newStates;
            // });

            recentBlockhash = await connection.getLatestBlockhash()
            bundleTxs = []
          }
        }
        if (bundleTxs.length > 0) {
          await sendBundleTxs(recentBlockhash, distributions, distributionTxs, bundleTxs, sell);

          // const tipTx = await buildTx(
          //   bundleTipIx(wallet.publicKey, DefaultTipLamports * 3),
          //   { recentBlockhash, payer: wallet.publicKey, units: 30000 }
          // )
          //
          // await sendBundle(connection, wallet, [tipTx, ...bundleTxs], [], false);
          // // Update status to claimed for the remaining distributions
          // const remainingDistIds = distributionTxs
          //   .slice(-Math.floor(bundleTxs.length / (sell ? 2 : 1)))
          //   .map(txs => distributions[distributionTxs.indexOf(txs)].id);
          //
          // setClaimingStates(prev => {
          //   const newStates = { ...prev };
          //   remainingDistIds.forEach(id => {
          //     if (newStates[id]) {
          //       newStates[id] = { ...newStates[id], status: 'claimed' };
          //       toast.success(`Successfully claimed ${newStates[id].distribution.token.symbol}`);
          //     }
          //   });
          //   return newStates;
          // });
        }

        console.log("Claiming transactions:", distributionTxs);
      } catch (error) {
        console.error("Failed to claim:", error);
        toast.error('Failed to process claims');
        // Reset status for non-claimed distributions
        setClaimingStates(prev => {
          const newStates = { ...prev };
          Object.keys(newStates).forEach(id => {
            if (newStates[id].status !== 'claimed') delete newStates[id]
            // {
            //   newStates[id] = { ...newStates[id], status: 'unclaimed' };
            // }
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
      merkleDistributorProgram,
      cpSwapProgram
    ],
  );

  const sendBundleTxs = useCallback(
    async (recentBlockhash: BlockhashWithExpiryBlockHeight,
           distributions: Distribution[],
           distributionTxs: VersionedTransaction[][],
           bundleTxs: VersionedTransaction[],
           sell: boolean) => {

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
        .slice(-Math.floor(bundleTxs.length / (sell ? 2 : 1)))
        .map(txs => distributions[distributionTxs.indexOf(txs)].id);

      waitForTransactions(connection, transactions)
        .then(() => {
          setClaimingStates(prev => {
            const newStates = { ...prev };
            remainingDistIds.forEach(id => {
              if (newStates[id]) {
                newStates[id] = { ...newStates[id], status: 'claimed' };
                toast.success(`Successfully claimed ${newStates[id].distribution.token.symbol}`);
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

    return { claim, claimingStates, loading };
}