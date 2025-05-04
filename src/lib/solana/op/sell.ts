import BN from 'bn.js'
import {
  createAssociatedTokenAccountInstruction, createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  AMMConfig,
  authorityAccount,
  poolObservationAccount,
  poolStateAccount,
  tokenVaultAccount
} from "@/constants/contracts/accounts";

import { IxBuilderParams, showAccounts } from "./utils";
import { CPSwap } from "@/constants/contracts/idls/cp_swap";
import { createMemoInstruction } from "@solana/spl-memo";

// @ts-ignore
export type SellIxParams = IxBuilderParams<typeof CPSwap> & {
  mint: PublicKey;
  amountLamports: BN;
  seller: PublicKey;
}

export async function sellIx({ program, mint, amountLamports, seller, useMemo }: SellIxParams) {
  const authority = authorityAccount().pda
  const token0 = mint.toBase58() < NATIVE_MINT.toBase58() ? mint : NATIVE_MINT
  const token1 = mint.toBase58() < NATIVE_MINT.toBase58() ? NATIVE_MINT : mint

  const poolState = poolStateAccount(token0, token1).pda
  const inputTokenAccount = getAssociatedTokenAddressSync(mint, seller)
  const outputTokenAccount = getAssociatedTokenAddressSync(NATIVE_MINT, seller)

  const ix1 = createAssociatedTokenAccountInstruction(seller, outputTokenAccount, seller, NATIVE_MINT);

  const inputVault = tokenVaultAccount(poolState, mint).pda
  const outputVault = tokenVaultAccount(poolState, NATIVE_MINT).pda

  const inputTokenProgram = TOKEN_PROGRAM_ID
  const outputTokenProgram = TOKEN_PROGRAM_ID

  const inputTokenMint = mint, outputTokenMint = NATIVE_MINT
  const observationState = poolObservationAccount(poolState).pda

  const accounts = {
    payer: seller, authority, ammConfig: AMMConfig,
    poolState,
    inputTokenAccount, outputTokenAccount,
    inputVault, outputVault,
    inputTokenProgram, outputTokenProgram,
    inputTokenMint, outputTokenMint,
    observationState
  }
  showAccounts(accounts)

  const ix2 = await program.methods
      .swapBaseInput(amountLamports, new BN(0))
      .accountsStrict(accounts)
      .instruction()

  const ix3 = createCloseAccountInstruction(outputTokenAccount, seller, seller)

  const ix4 = createMemoInstruction(`Sell ${mint.toString()} at ${Date.now()}`, [seller]);

  // const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  //
  // const ix4 = new TransactionInstruction({
  //   keys: [],
  //   programId: MEMO_PROGRAM_ID,
  //   data: Buffer.from(`memo-${Date.now()}-${Math.random()}`)
  // });

  return useMemo ? [ix4, ix1, ix2, ix3] : [ix1, ix2, ix3]
}
