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

export async function claimIx({ program, mint, amountUnlocked, proofs, claimant }: ClaimIxParams) {
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

  return [ix1, ix2]
}
