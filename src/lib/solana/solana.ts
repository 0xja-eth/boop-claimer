import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Idl } from "@coral-xyz/anchor/dist/cjs/idl";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import ContractData from "@/constants/contracts/contracts.json";

// idls
import boop from "@/constants/contracts/idls/boop.json";
import merkle_distributor from "@/constants/contracts/idls/merkle_distributor.json";
import cp_swap from "@/constants/contracts/idls/cp_swap.json";

import { AnchorWallet } from "@solana/wallet-adapter-react";

const IDLs = { boop, merkle_distributor, cp_swap } as Record<string, any> as Record<string, Idl>

export const Network = (process.env.NEXT_PUBLIC_NETWORK || WalletAdapterNetwork.Mainnet) as WalletAdapterNetwork;
// export const RPCUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8899";

export type Contracts = {
  [Network in string]: { [Name: string]: string | string[] };
};

export function getContractCache() {
  return ContractData as Contracts;
}

export function getAddress(name: string, index: number = 0) {
  const res = getContractCache()[Network]?.[name];
  return res instanceof Array ? res[index] : res;
}
export function getAddresses(name: string) {
  const res = getContractCache()[Network]?.[name];
  return res instanceof Array ? res : [res];
}

export function getPublicKey(name: string, index: number = 0) {
  return new PublicKey(getAddress(name, index) as string);
}

export function loadProgramIdl<T extends Idl = Idl>(name: string) {
  return IDLs[name] as T;
}

export function loadProgram<T extends Idl = Idl>(
  name: string,
  connection: Connection,
  wallet: AnchorWallet,
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  return new anchor.Program<T>(
    loadProgramIdl<T>(name),
    getPublicKey(name),
    provider
  );
}

export async function signTx(
  connection: Connection,
  tx: Transaction | VersionedTransaction,
  wallet: AnchorWallet,
  otherSigners: Keypair[] = []
) {
  if (tx instanceof Transaction) {
    tx.recentBlockhash = (
      await connection.getLatestBlockhash("singleGossip")
    ).blockhash
    tx.feePayer = wallet.publicKey

    if (otherSigners.length > 0)
      tx.sign(...otherSigners)
  } else {
    if (otherSigners.length > 0)
      tx.sign(otherSigners)
  }

  console.log("Signing Transaction:", tx)
  return await wallet.signTransaction(tx)
}

export async function signAndSendTx(
  connection: Connection,
  tx: Transaction | VersionedTransaction,
  wallet: AnchorWallet,
  otherSigners: Keypair[] = []
) {
  const signedTx = await signTx(connection, tx, wallet, otherSigners)

  const rawTransaction = signedTx.serialize()

  console.log("Sending Transaction:", signedTx)
  const txSig = await connection.sendRawTransaction(rawTransaction)

  console.log("Transaction Signature:", txSig)
  const latestBlockHash = await connection.getLatestBlockhash()

  const res = await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txSig,
  })
  console.log("Confirmed Transaction:", res)

  return txSig
}

export async function signTxs(
  connection: Connection,
  txs: (Transaction | VersionedTransaction)[],
  wallet: AnchorWallet,
  otherSigners: Keypair[] = []
) {
  for (const tx of txs) {
    if (tx instanceof Transaction) {
      tx.recentBlockhash = (
        await connection.getLatestBlockhash("singleGossip")
      ).blockhash
      tx.feePayer = wallet.publicKey

      if (otherSigners.length > 0)
        tx.sign(...otherSigners)
    } else {
      if (otherSigners.length > 0)
        tx.sign(otherSigners)
    }
  }

  console.log("Signing Transactions:", txs)
  return await wallet.signAllTransactions(txs)
}

export async function signAndSendTxs(
  connection: Connection,
  txs: (Transaction | VersionedTransaction)[],
  wallet: AnchorWallet,
  otherSigners: Keypair[] = []
) {
  const signedTxs = await signTxs(connection, txs, wallet, otherSigners)

  const rawTransactions = signedTxs.map(tx => tx.serialize())

  console.log("Sending Transaction:", signedTxs)
  const txSigs = await Promise.allSettled(
    rawTransactions.map(rtx => connection.sendRawTransaction(rtx))
  )

  console.log("Transaction Signature:", txSigs)
  const latestBlockHash = await connection.getLatestBlockhash()

  const res = await Promise.allSettled(
    txSigs.map(txSig => connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    // @ts-ignore
    signature: txSig!.value!,
  })))
  console.log("Confirmed Transaction:", res)

  return txSigs
}
