import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Idl } from "@coral-xyz/anchor/dist/cjs/idl";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import ContractData from "@/constants/contracts/contracts.json";

// idls
import boop from "@/constants/contracts/idls/boop.json";
import merkle_distributor from "@/constants/contracts/idls/merkle_distributor.json";
import cp_swap from "@/constants/contracts/idls/cp_swap.json";

import { AnchorWallet } from "@solana/wallet-adapter-react";

const IDLs = { boop, merkle_distributor, cp_swap } as Record<
  string,
  any
> as Record<string, Idl>;

export const Network = (process.env.NEXT_PUBLIC_NETWORK ||
  WalletAdapterNetwork.Mainnet) as WalletAdapterNetwork;
// export const RPCUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8899";

export type Contracts = {
  [Network in string]: { [Name: string]: string | string[] };
};

export function getContractCache() {
  return ContractData as Contracts;
}

export function getAddress(name: string, index: number = 0) {
  const res = getContractCache()[Network]?.[name];
  return res instanceof Array ? res[index] : res;
}
export function getAddresses(name: string) {
  const res = getContractCache()[Network]?.[name];
  return res instanceof Array ? res : [res];
}

export function getPublicKey(name: string, index: number = 0) {
  return new PublicKey(getAddress(name, index) as string);
}

export function loadProgramIdl<T extends Idl = Idl>(name: string) {
  return IDLs[name] as T;
}

export function loadProgram<T extends Idl = Idl>(
  name: string,
  connection: Connection,
  wallet: AnchorWallet,
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  return new anchor.Program<T>(
    loadProgramIdl<T>(name),
    getPublicKey(name),
    provider,
  );
}
