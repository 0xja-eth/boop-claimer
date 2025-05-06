
import { getPublicKey, loadProgram } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const BoopProgramId = getPublicKey("boop")
export const MerkleDistributorProgramId = getPublicKey("merkle_distributor")

export const BoopAdminPublicKey = getPublicKey("boop_admin")

export const bondingCurveAccount = (
    mint: PublicKey
) => {
  const seed1 = Buffer.from("bonding_curve");
  const seed2 = mint.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2],
    BoopProgramId
  );

  return {
    pda,
    bump
  };
};

export const tradingFeesVaultAccount = (
    mint: PublicKey
) => {
  const seed1 = Buffer.from("trading_fees_vault");
  const seed2 = mint.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2],
    BoopProgramId
  );

  return {
    pda,
    bump
  };
};

export const bondingCurveVaultAccount = (mint: PublicKey) => {
  const seed1 = Buffer.from("bonding_curve_vault");
  const seed2 = mint.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2],
      BoopProgramId
  );

  return { pda, bump };
};

export const bondingCurveSolVaultAccount = (mint: PublicKey) => {
  const seed1 = Buffer.from("bonding_curve_sol_vault");
  const seed2 = mint.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2],
    BoopProgramId
  );

  return { pda, bump };
};

export const configAccount = () => {
  const seed1 = Buffer.from("config");

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1],
    BoopProgramId
  );

  return { pda, bump };
};

export const vaultAuthorityAccount = () => {
  const seed1 = Buffer.from("vault_authority");

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1],
      BoopProgramId
  );

  return { pda, bump };
};

export const distributorAccount = (
    mint: PublicKey,
    base: PublicKey = BoopAdminPublicKey,
    version: BN = new BN(0) // u64 类型
) => {
  const seed1 = Buffer.from("MerkleDistributor");
  const seed2 = base.toBuffer();
  const seed3 = mint.toBuffer();
  const seed4 = Buffer.alloc(8);
  seed4.writeBigUInt64LE(BigInt(version.toString()));

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2, seed3, seed4],
      MerkleDistributorProgramId
  );

  return {
    pda,
    bump
  };
};

export const claimStatusAccount = (
    distributor: PublicKey, claimant: PublicKey
) => {
  const seed1 = Buffer.from("ClaimStatus");       // const seed
  const seed2 = claimant.toBuffer();              // claimant public key
  const seed3 = distributor.toBuffer();           // distributor public key

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2, seed3],
      MerkleDistributorProgramId
  );

  return {
    pda,
    bump
  };
};

// region CPMM

export const CPSwapProgramId = getPublicKey("cp_swap")
export const AMMConfig = getPublicKey("amm_config")

export const authorityAccount = () => {
  const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_and_lp_mint_auth_seed")],
      CPSwapProgramId
  );
  return { pda, bump };
};

export const poolStateAccount = (
    token0Mint: PublicKey,
    token1Mint: PublicKey
) => {
  const seed1 = Buffer.from("pool");
  const seed2 = AMMConfig.toBuffer();
  const seed3 = token0Mint.toBuffer();
  const seed4 = token1Mint.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2, seed3, seed4],
      CPSwapProgramId
  );

  return { pda, bump };
};

export const poolObservationAccount = (
    poolState: PublicKey
) => {
  const seed1 = Buffer.from("observation");
  const seed2 = poolState.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2],
      CPSwapProgramId
  );

  return { pda, bump };
};

export const lpMintAccount = (poolState: PublicKey) => {
  const seed1 = Buffer.from("pool_lp_mint");
  const seed2 = poolState.toBuffer();

  const [pda, bump] = PublicKey.findProgramAddressSync(
      [seed1, seed2],
      CPSwapProgramId
  );

  return { pda, bump };
};

export const tokenVaultAccount = (
    poolState: PublicKey,
    mint: PublicKey
) => {
  const [pda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool_vault"),
        poolState.toBuffer(),
        mint.toBuffer()
      ],
      CPSwapProgramId
  );

  return { pda, bump };
};

// endregion
