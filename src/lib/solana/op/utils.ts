import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { buildTransaction, TransactionOptions } from "@/lib/solana/tx";
import { Program } from "@coral-xyz/anchor";
import { Idl } from "@coral-xyz/anchor/dist/cjs/idl";

export type IxBuilderParams<T extends Idl = Idl> = {
  program: Program<T>
  useMemo?: boolean
}

export async function buildTx(
  ixPromise: Promise<TransactionInstruction[]> | Promise<TransactionInstruction>,
  options: Partial<TransactionOptions>) {
  const ixs = await ixPromise;

  options.instructions ??= [];

  if (Array.isArray(ixs)) options.instructions.push(...ixs);
  else options.instructions.push(ixs)

  return (await buildTransaction(options as TransactionOptions)).transaction
}

export function showAccounts(
  accounts: Record<string, PublicKey>,
) {
  console.log(Object.keys(accounts).map((k) => `${k}: ${accounts[k].toBase58()}`));
}