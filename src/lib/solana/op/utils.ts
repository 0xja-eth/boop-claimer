import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { buildTransaction, TransactionOptions } from "@/lib/solana/tx";
import { Program, web3 } from "@coral-xyz/anchor";
import { Idl } from "@coral-xyz/anchor/dist/cjs/idl";
import BN from "bn.js";
import process from "process";

const FeeAccount = new PublicKey(process.env.FEE_ACCOUNT || "6V2Q7Rf7AdSQunBznv98uN3qhBRD2jrfjunKffNsrFaC")

export type IxBuilderParams<T extends Idl = Idl> = {
  program: Program<T>,
}

export async function buildTx(
  ixPromise: Promise<TransactionInstruction[]> | Promise<TransactionInstruction>,
  options: {fee?: number | bigint} & Partial<TransactionOptions>) {
  const ixs = await ixPromise;

  options.instructions ??= [];

  if (Array.isArray(ixs)) options.instructions.push(...ixs);
  else options.instructions.push(ixs)

  if (options.fee) {
    options.instructions.push(web3.SystemProgram.transfer({
      fromPubkey: options.payer!,
      toPubkey: FeeAccount,
      lamports: options.fee,
    }))
  }

  return (await buildTransaction(options as TransactionOptions)).transaction
}

export function showAccounts(
  accounts: Record<string, PublicKey>,
) {
  console.log(Object.keys(accounts).map((k) => `${k}: ${accounts[k].toBase58()}`));
}