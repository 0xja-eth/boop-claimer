import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { getConnection, getProvider } from "@/services/solana/index";
import { loadProgram } from "@/services/solana/index";
import { Boop } from "@/constants/contracts/idls/boop";
import { MerkleDistributor } from "@/constants/contracts/idls/merkle_distributor";
import { CPSwap } from "@/constants/contracts/idls/cp_swap";

export const Connection = getConnection()

export const SecretKey = process.env.SECRET_KEY
export const BotKeyPair = Keypair.fromSecretKey(bs58.decode(SecretKey || ""))

export const Provider  = getProvider(BotKeyPair, Connection);

// @ts-ignore
export const BoopProgram = loadProgram<typeof Boop>("boop", Provider)
// @ts-ignore
export const MerkleDistributorProgram = loadProgram<typeof MerkleDistributor>("merkle_distributor", Provider)
// @ts-ignore
export const CPSwapProgram = loadProgram<typeof CPSwap>("cp_swap", Provider)