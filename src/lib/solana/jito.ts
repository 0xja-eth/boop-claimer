import {post} from "../api";
import {Connection, Keypair, PublicKey, Transaction, VersionedTransaction} from "@solana/web3.js";
import {web3} from "@coral-xyz/anchor";
import bs58 from "bs58";
import {waitFor} from "../promise";
import {waitForSignatureConfirmation} from "./tx";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { buildTx } from "@/lib/solana/op/utils";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const Host: string = process.env.JITO_HOST_URL ?? (process.env.NEXT_PUBLIC_NETWORK == WalletAdapterNetwork.Mainnet ? "https://mainnet.block-engine.jito.wtf" : "")

const BundleRPC = <P = any[], R = any>(method: string) => (d: P = [] as P, h?: any) => post<{
  "jsonrpc": "2.0", "id": number, "method": string, "params": P
}, {
  "jsonrpc": "2.0", "id": number, "result": R
}>(Host, "/api/v1/bundles")({
  "jsonrpc": "2.0", "id": Date.now(), "method": method, "params": d
}, h).then((res: any) => res.result)

const isJITOEnabled = Host != null

export const GetTipAccounts = BundleRPC<[], string[]>("getTipAccounts")

export const SendBundle = BundleRPC<string[][], string>("sendBundle")

export type GetInflightBundleStatusesResponse = {
  "context": {
    "slot": number
  },
  "value": {
    "bundle_id": string,
    "status": "Invalid" | "Pending" | "Failed" | "Landed",
    "landed_slot": number
  }[]
}
export const GetInflightBundleStatuses = BundleRPC<string[][], GetInflightBundleStatusesResponse>("getInflightBundleStatuses")

export type GetBundleStatusesResponse = {
  "context": {
    "slot": number
  },
  "value": {
    "bundle_id": string,
    "transactions": string[],
    "slot": number,
    "confirmation_status": "processed" | "confirmed" | "finalized",
    "err": Record<string, any>
  }[]
}
export const GetBundleStatuses = BundleRPC<string[][], GetBundleStatusesResponse>("getBundleStatuses")

export const DefaultTipLamports = Number(process.env.DEFAULT_TIP_LAMPORTS || 0.0005 * 1e9)

export class BundleNotLandedError extends Error {
  constructor(public bundleId: string) {
    super(`Bundle ${bundleId} not landed`)
  }
}

export async function bundleTipIx(
  sender: PublicKey,
  tipLamports = DefaultTipLamports, tipAccountIdx?: number
) {

  const tipAccounts = await GetTipAccounts()
  tipAccountIdx ||= Math.floor(Math.random() * tipAccounts.length)
  const tipAccountPublicKey = new PublicKey(tipAccounts[tipAccountIdx])
  console.log("[Send Bundle] Tip accounts", tipAccounts, tipAccountIdx)

  return web3.SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: tipAccountPublicKey,
    lamports: tipLamports,
  })
  // const ix2 = web3.SystemProgram.transfer({
  //   fromPubkey: sender,
  //   toPubkey: FeeAccount,
  //   lamports: tipLamports * 5,
  // })

  // return [ix1, ix2]
}

export async function sendBundle(
  connection: Connection,
  wallet: AnchorWallet,
  txs: (VersionedTransaction | string)[],
  otherSigners: Keypair[] = [],
  isWaitForBundle = true,
  tipLamports = 0, tipAccountIdx?: number
): Promise<{
  bundle_id: string | null,
  transactions: string[]
}> {
  console.log(`[Send Bundle] Sending ${txs.length} transactions`, txs)

  if (txs.length === 0) return {
    bundle_id: null,
    transactions: [] as string[]
  }

  if (!isJITOEnabled) { // Fallback to normal send
    const transactions = []

    for (const tx of txs) transactions.push(await sendTx(connection, wallet, tx, otherSigners))

    return { bundle_id: null, transactions }
  }

  if (txs.length === 1)
    return { bundle_id: null, transactions: [await sendTx(connection, wallet, txs[0], otherSigners)] }

  if (tipLamports > 0) {
    const tipTx = await buildTx(
      bundleTipIx(wallet.publicKey, tipLamports, tipAccountIdx),
      { connection, payer: wallet.publicKey, units: 30000 }
    )
    txs = [tipTx, ...txs]
  }
  // const tipAccounts = await GetTipAccounts()
  // tipAccountIdx ||= Math.floor(Math.random() * tipAccounts.length)
  // const tipAccountPublicKey = new PublicKey(tipAccounts[tipAccountIdx])
  // console.log("[Send Bundle] Tip accounts", tipAccounts, tipAccountIdx)
  //
  // const tipIx = web3.SystemProgram.transfer({
  //   fromPubkey: signers[0].publicKey,     // 发起交易的钱包地址
  //   toPubkey: tipAccountPublicKey,   // Tip Account 地址
  //   lamports: tipLamports,                 // 小费金额，以 lamports 为单位
  // })
  // const tipTx = await buildOptimalTransaction({
  //   connection,
  //   instructions: [tipIx],
  //   payer: signers[0].publicKey,
  // })
  //
  // txs = [tipTx.transaction, ...txs]
  //
  // txs.forEach(tx => typeof tx != "string" && tx.sign(signers))

  const rawTxs = txs.filter(tx => typeof tx != "string")
  rawTxs.forEach(tx => tx.sign(otherSigners))

  const signedTxs = await wallet.signAllTransactions(rawTxs)

  let rawIdx = 0;
  const serializedTxs = txs.map(tx =>
    typeof tx == "string" ? tx : bs58.encode(signedTxs[rawIdx++].serialize() as Buffer) // is raw tx, find the signed one
  )
  console.log("[Send Bundle] Sending bundle", serializedTxs)

  const bundleId = await SendBundle([serializedTxs])

  const txHashes = serializedTxs.map(stx => bs58.encode(
    VersionedTransaction.deserialize(bs58.decode(stx)).signatures[0]
  ))

  console.log("[Send Bundle] Bundle ID", bundleId, txHashes)

  if (!isWaitForBundle)
    return {
      bundle_id: bundleId,
      transactions: txHashes
    }

  return waitForBundle(bundleId)

}

export async function sendBundleDirectly(txs: string[], isWaitForBundle = true) {
  if (txs.length === 0) return {
    bundle_id: null, transactions: [] as string[]
  }

  const bundleId = await SendBundle([txs])
  const txHashes = txs.map(stx => bs58.encode(
    VersionedTransaction.deserialize(bs58.decode(stx)).signatures[0]
  ))

  console.log("[Send Bundle] Bundle ID", bundleId, txHashes)

  if (!isWaitForBundle)
    return { bundle_id: bundleId, transactions: txHashes }

  return waitForBundle(bundleId)
}

export async function waitForBundle(bundleId: string, waitingLevel: "Pending" | "Landed" = "Landed") {
  const waitRes = await waitFor(async () => {
    const statuses = await GetInflightBundleStatuses([[bundleId]]);
    const status = statuses.value[0]?.status

    console.log("[Send Bundle] Checking bundle", status)
    switch (status) {
      case "Failed": return { isLanded: false }
      case waitingLevel: return { isLanded: true }
    }
  }, 2000, 20) // wait for 40 seconds
  const isLanded = waitRes?.isLanded

  if (!isLanded) {
    console.log("[Send Bundle] Bundle failed to land")
    throw new BundleNotLandedError(bundleId)
  }

  const statuses = await waitFor(async () => {
    const res = await GetBundleStatuses([[bundleId]]);
    const status = res.value[0]?.confirmation_status
    const err = res.value[0]?.err

    console.log("[Send Bundle] Checking bundle", status, err)
    return status === "confirmed" ? res : null
  }, 2000, 10) // wait for 20 seconds

  if (!statuses) {
    console.log("[Send Bundle] Bundle failed to confirm")
    throw new Error("Bundle not confirmed")
  }

  console.log("[Send Bundle] Bundle confirmed", statuses)

  return statuses.value[0]
}

export async function waitForTransactions(connection: Connection, transactions: string[]) {
  return waitForSignatureConfirmation(connection, transactions[0])
}

export async function sendTx(
  connection: Connection,
  wallet: AnchorWallet,
  tx: VersionedTransaction | string,
  otherSigners: Keypair[] = [],
) {
  let txHash
  if (typeof tx == "string") {
    txHash = await connection.sendRawTransaction(
      Buffer.from(bs58.decode(tx))
    )
    console.log("[Send Bundle] Single signed transaction sent", txHash)
  } else {
    tx.sign(otherSigners)
    await wallet.signTransaction(tx)

    txHash = await connection.sendTransaction(
      tx, { skipPreflight: true }
    );
    console.log("[Send Bundle] Single transaction sent", txHash)
  }

  const res = await waitForSignatureConfirmation(
    connection, txHash
  )
  console.log("[Send Bundle] Single transaction confirmed", res)

  return txHash
}
