import { Distribution } from "@/lib/solana/op/get-distributions";
import { Connection, CPSwapProgram, MerkleDistributorProgram } from "@/services/solana/common";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import BN from "bn.js";
import { buildTx } from "@/lib/solana/op/utils";
import { claimIx } from "@/lib/solana/op/claim";
import { sellIx } from "@/lib/solana/op/sell";
import { FeeRateBPS } from "@/app/api/gen-txs/route";

export async function genClaimTxs(address: string, distributions: Distribution[], sell?: boolean) {

  let recentBlockhash = await Connection.getLatestBlockhash()
  const payer = new PublicKey(address)

  const res: VersionedTransaction[][] = []

  for (const distribution of distributions) {

    const mint = new PublicKey(distribution.token.address)
    const amount = new BN(distribution.amountLpt)
    const proofs = distribution.proofs

    const solAmount = new BN(distribution.amountSolLpt)
    const solFeeAmount = solAmount.mul(new BN(FeeRateBPS)).div(new BN(10000))

    const proofsBN = proofs.map(p => p.map(b => new BN(b)))

    const cTx = await buildTx(claimIx({
      program: MerkleDistributorProgram, mint, amountUnlocked: amount, proofs: proofsBN, claimant: payer,
    }), {
      payer, recentBlockhash, microLamports: 1000, units: 150000, fee: BigInt(solFeeAmount.toString())
    })

    let newTxs = [cTx]
    if (sell) {
      const sTx = await buildTx(sellIx({
        program: CPSwapProgram, mint, amountLamports: amount, seller: payer
      }), {
        payer, recentBlockhash, microLamports: 3000, units: 150000, fee: BigInt(solFeeAmount.toString())
      })
      newTxs.push(sTx)
    }

    res.push(newTxs)
  }

  return res
}

export async function genSellTxs(address: string, distributions: Distribution[]) {

  let recentBlockhash = await Connection.getLatestBlockhash()
  const payer = new PublicKey(address)

  const res: VersionedTransaction[][] = []

  for (const distribution of distributions) {

    const mint = new PublicKey(distribution.token.address)
    const amount = new BN(distribution.amountLpt)

    const solAmount = new BN(distribution.amountSolLpt)
    const solFeeAmount = solAmount.mul(new BN(FeeRateBPS)).div(new BN(10000))

    const sTx = await buildTx(sellIx({
      program: CPSwapProgram, mint, amountLamports: amount, seller: payer
    }), {
      payer, recentBlockhash, microLamports: 3000, units: 150000, fee: BigInt(solFeeAmount.toString())
    })

    res.push([sTx])
  }

  return res
}