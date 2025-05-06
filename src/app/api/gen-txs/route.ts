import { NextRequest, NextResponse } from "next/server"
import { getWalletAddressFromToken } from "@/lib/solana/op/get-distributions";
import { getDistributions } from "@/services/distributions";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { genClaimTxs, genSellTxs } from "@/services/gentxs";
import bs58 from "bs58";
import { connect } from "@/lib/db/redis";

export const FeeRateBPS = 200 // 2%
export type OpType = "claim" | "sell" | "claim-sell"

export async function GET(request: NextRequest) {
  await connect()

  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]
  const walletAddress = getWalletAddressFromToken(token)

  const op = request.nextUrl.searchParams.get('op') as OpType
  const ids = JSON.parse(request.nextUrl.searchParams.get('ids') ?? "[]") as string[]

  const distributions = await getDistributions(walletAddress, ids)

  let txsGroup: VersionedTransaction[][] = [];
  switch (op) {
    case "claim": txsGroup = await genClaimTxs(walletAddress, distributions); break;
    case "sell": txsGroup = await genSellTxs(walletAddress, distributions); break;
    case "claim-sell": txsGroup = await genClaimTxs(walletAddress, distributions, true); break;
  }

  const serializedTxsGroup = txsGroup.map(txs =>
    txs.map(tx => bs58.encode(tx.serialize()))
  )

  return NextResponse.json({ txsGroup: serializedTxsGroup })
}
