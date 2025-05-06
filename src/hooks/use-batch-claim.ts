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
import { toast } from 'sonner';
import { ClaimingState } from "@/components/token-table";
import { signAndSendTx, signAndSendTxs, signTx, signTxs } from "@/lib/solana/tx";
import { GenTxs, SendTxs } from "@/constants/api";
import { splitArray } from "@/lib/array";
import bs58 from "bs58";

const BatchTxCount = 4;

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
        const batches = splitArray(distributions, sell ? BatchTxCount / 2 : BatchTxCount)

        for (const batch of batches) {
          try {
            // Update status to claiming
            setClaimingStates(prev => {
              const newStates = { ...prev }
              batch.forEach(d => newStates[d.id] = { ...newStates[d.id], status: 'claiming' })
              return newStates
            });

            const {txsGroup: serializedTxsGroup} = await GenTxs({
              op: sell ? "claim-sell" : "claim", ids: JSON.stringify(batch.map(d => d.id))
            })
            const serializedTxs = serializedTxsGroup.flat()
            const txs = serializedTxs.map(sTx => VersionedTransaction.deserialize(bs58.decode(sTx)))

            const tipTx = await buildTx(
              bundleTipIx(wallet.publicKey), { recentBlockhash: txs[0].message.recentBlockhash, payer: wallet.publicKey, units: 30000 }
            )

            const [signedTipTx, ...signedTxs] = await wallet.signAllTransactions([tipTx, ...txs])

            const serializedSignedTxs = signedTxs.map(sTx => bs58.encode(sTx.serialize()))
            const serializedSignedTxsGroup = splitArray(serializedSignedTxs, sell ? 2 : 1)
            const serializedSignedTipTx = bs58.encode(signedTipTx.serialize())

            const { transactions } = await SendTxs({
              op: sell ? "claim-sell" : "claim", ids: batch.map(d => d.id),
              txsGroup: serializedSignedTxsGroup, tipTx: serializedSignedTipTx
            })

            // Update status to claimed for the distributions in this batch
            waitForTransactions(connection, transactions)
              .then(() => {
                setClaimingStates(prev => {
                  const newStates = { ...prev };
                  batch.forEach(distribution => {
                    const id = distribution.id;
                    if (newStates[id]) {
                      newStates[id] = { ...newStates[id], status: sell ? 'sold' : 'claimed' };
                      toast.success(`Successfully claimed ${newStates[id].distribution.token.symbol}`);
                    }
                  });
                  return newStates;
                });
              })
              .catch(e => {
                console.error("Failed to wait for bundle:", e)
                toast.error("Claim failed! Please try again later.");

                setClaimingStates(prev => {
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
      } catch (error) {
        console.error("Failed to claim:", error);
        toast.error('Failed to process claims');
        // Reset status for non-claimed distributions
        setClaimingStates(prev => {
          const newStates = { ...prev };
          Object.keys(newStates).forEach(id => {
            if (newStates[id].status !== 'claimed' && newStates[id].status !== 'sold') delete newStates[id]
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

    return { claim, claimingStates, loading };
}