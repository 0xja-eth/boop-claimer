import BN from "bn.js";
import {Connection, PublicKey, SystemProgram} from "@solana/web3.js";
import {
  bondingCurveVaultAccount,
  bondingCurveAccount,
  tradingFeesVaultAccount, bondingCurveSolVaultAccount, configAccount, vaultAuthorityAccount
} from "@/constants/contracts/accounts";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { IxBuilderParams, showAccounts } from "./utils";
import { CPSwap } from "@/constants/contracts/idls/cp_swap";
import { Boop } from "@/constants/contracts/idls/boop";
import { createMemoInstruction } from "@solana/spl-memo";

// @ts-ignore
export type BuyIxParams = IxBuilderParams<typeof Boop> & {
  mint: PublicKey;
  amountLamports: BN;
  buyer: PublicKey;
}

export async function buyIx({ program, mint, amountLamports, buyer }: BuyIxParams) {
  const bondingCurve = bondingCurveAccount(mint).pda;
  const tradingFeesVault = tradingFeesVaultAccount(mint).pda;
  const bondingCurveVault = bondingCurveVaultAccount(mint).pda;
  const bondingCurveSolVault = bondingCurveSolVaultAccount(mint).pda;
  const recipientTokenAccount = getAssociatedTokenAddressSync(mint, buyer)
  const config = configAccount().pda
  const vaultAuthority = vaultAuthorityAccount().pda

  const accounts = {
    mint,
    bonding_curve: bondingCurve,
    trading_fees_vault: tradingFeesVault,
    bonding_curve_vault: bondingCurveVault,
    bonding_curve_sol_vault: bondingCurveSolVault,
    recipient_token_account: recipientTokenAccount,
    buyer,
    config: config,
    vault_authority: vaultAuthority,
    wsol: NATIVE_MINT,
    system_program: SystemProgram.programId,
    token_program: TOKEN_PROGRAM_ID,
    associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
  }
  showAccounts(accounts)

  const ix1 = await program.methods
      .buyToken(amountLamports, amountLamports)
      .accountsStrict(accounts)
      .instruction();

  const ix2 = createMemoInstruction(`Buy ${mint.toString()} at ${Date.now()}`, [buyer]);

  return [ix1, ix2]
}
