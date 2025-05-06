import { get } from "@/lib/api";
import { Distribution } from "@/lib/solana/op/get-distributions";
import { authGet, authPost } from "@/lib/auth";

export const GetDistributions = authGet<{
  includeClaimed?: boolean
}, Distribution[]>("/", "api/distributions")

export type OpType = "claim" | "sell" | "claim-sell"
export const GenTxs = authGet<{
  op: OpType, ids: string
}, { txsGroup: string[][] }>("/", "api/gen-txs")

export const SendTxs = authPost<{
  op: OpType, ids: string[], txsGroup: string[][], tipTx: string
}, { bundle_id: string, transactions: string[] }>("/", "api/send-txs")