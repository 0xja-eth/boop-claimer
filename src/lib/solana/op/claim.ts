import BN from "bn.js";
import { Connection, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import {
  distributorAccount,
  claimStatusAccount
} from "@/constants/contracts/accounts";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { IxBuilderParams, showAccounts } from "./utils";
import { MerkleDistributor } from "@/constants/contracts/idls/merkle_distributor";
import { createMemoInstruction } from '@solana/spl-memo';

// @ts-ignore
export interface ClaimIxParams extends IxBuilderParams<typeof MerkleDistributor> {
  mint: PublicKey;
  amountUnlocked: BN;
  proofs: BN[][];
  claimant: PublicKey;
}

export async function claimIx({ program, mint, amountUnlocked, proofs, claimant, useMemo }: ClaimIxParams) {
  const distributor = distributorAccount(mint).pda
  const claimStatus = claimStatusAccount(distributor, claimant).pda

  const from = getAssociatedTokenAddressSync(mint, distributor, true)
  const to = getAssociatedTokenAddressSync(mint, claimant)

  const ix1 = createAssociatedTokenAccountInstruction(claimant, to, claimant, mint);

  const accounts = {
    distributor, claimStatus,
    from, to, claimant,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId
  }
  showAccounts(accounts)

  const ix2 = await program.methods.newClaim(amountUnlocked, new BN(0), proofs)
      .accountsStrict(accounts)
      .instruction();

  const ix3 = createMemoInstruction(`Claim ${mint.toString()} at ${Date.now()}`, [claimant]);

  // const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  //
  // const ix3 = new TransactionInstruction({
  //   keys: [],
  //   programId: MEMO_PROGRAM_ID,
  //   data: Buffer.from(`memo-${Date.now()}-${Math.random()}`)
  // });

  return useMemo ? [ix3, ix1, ix2] : [ix1, ix2]
}
