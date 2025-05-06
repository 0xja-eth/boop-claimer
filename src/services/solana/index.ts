import {
  Commitment,
  ConfirmOptions,
  Connection,
  ConnectionConfig,
  Keypair,
  PublicKey,
  Transaction
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Idl, Wallet } from "@coral-xyz/anchor";
import { getPublicKey, loadProgramIdl } from "@/lib/solana";

const MaxRetryCount = 5;

export const RPCUrl = process.env.RPC_URL || "http://localhost:8899";
export const RPCUrls = process.env.RPC_URLS?.split(",") || [RPCUrl];

const Functions = [
  "getBalanceAndContext",
  "getBalance",
  "getBlockTime",
  "getMinimumLedgerSlot",
  "getFirstAvailableBlock",
  "getSupply",
  "getTokenSupply",
  "getTokenAccountBalance",
  "getTokenAccountsByOwner",
  "getParsedTokenAccountsByOwner",
  "getLargestAccounts",
  "getTokenLargestAccounts",
  "getAccountInfoAndContext",
  "getParsedAccountInfo",
  "getAccountInfo",
  "getMultipleParsedAccounts",
  "getMultipleAccountsInfoAndContext",
  "getMultipleAccountsInfo",
  "getStakeActivation",
  "getProgramAccounts",
  "getParsedProgramAccounts",
  "confirmTransaction",
  "getClusterNodes",
  "getVoteAccounts",
  "getSlot",
  "getSlotLeader",
  "getSlotLeaders",
  "getSignatureStatus",
  "getSignatureStatuses",
  "getTransactionCount",
  "getTotalSupply",
  "getInflationGovernor",
  "getInflationReward",
  "getInflationRate",
  "getEpochInfo",
  "getEpochSchedule",
  "getLeaderSchedule",
  "getMinimumBalanceForRentExemption",
  "getRecentBlockhashAndContext",
  "getRecentPerformanceSamples",
  "getFeeCalculatorForBlockhash",
  "getFeeForMessage",
  "getRecentPrioritizationFees",
  "getRecentBlockhash",
  "getLatestBlockhash",
  "getLatestBlockhashAndContext",
  "isBlockhashValid",
  "getVersion",
  "getGenesisHash",
  "getBlock",
  "getParsedBlock",
  "getBlockHeight",
  "getBlockProduction",
  "getTransaction",
  "getParsedTransaction",
  "getParsedTransactions",
  "getTransactions",
  "getConfirmedBlock",
  "getBlocks",
  "getBlockSignatures",
  "getConfirmedBlockSignatures",
  "getConfirmedTransaction",
  "getParsedConfirmedTransaction",
  "getParsedConfirmedTransactions",
  "getConfirmedSignaturesForAddress",
  "getSignaturesForAddress",
  "getAddressLookupTable",
  "getNonceAndContext",
  "getNonce",
  "requestAirdrop",
  "getStakeMinimumDelegation",
  "simulateTransaction",
  "sendTransaction",
  "sendRawTransaction",
  "sendEncodedTransaction",
  // "onAccountChange",
  "removeAccountChangeListener",
  // "onProgramAccountChange",
  "removeProgramAccountChangeListener",
  // "onLogs",
  "removeOnLogsListener",
  // "onSlotChange",
  "removeSlotChangeListener",
  // "onSlotUpdate",
  "removeSlotUpdateListener",
  // "onSignature",
  // "onSignatureWithOptions",
  "removeSignatureListener",
  // "onRootChange",
  "removeRootChangeListener"
]

export class Connections {

  connections: Connection[] = [];
  index = 0;

  get connection() {
    return this.connections[this.index];
  }

  get commitment() {
    return this.connection.commitment;
  }
  get rpcEndpoint() {
    return this.connection.rpcEndpoint;
  }

  constructor(rpcUrls: string[], opt?: Commitment | ConnectionConfig) {
    this.connections = rpcUrls.map(url => new anchor.web3.Connection(url, opt));

    const methods = Object.getOwnPropertyNames(anchor.web3.Connection.prototype);
    console.log("methods", methods);

    Functions.forEach((method) => {
      // @ts-ignore
      this[method] = this.connectionsWrapper(method);
    })
  }

  private connectionsWrapper(method: string) {
    return async (...args: any[]) => {
      let error, i = MaxRetryCount;

      while (--i > 0) {
        try {
          // console.log(`[RPC ${method}] ${this.rpcEndpoint}`, args);
          // @ts-ignore
          return await this.connection[method](...args);
        } catch (e) {
          console.error(`[RPC Error ${method}] ${this.rpcEndpoint} (${MaxRetryCount - i}/${MaxRetryCount})`, e);
          error = e;
          this.index = (this.index + 1) % this.connections.length;
        }
      }
      console.error(`[RPC Fatal ${method}]`, args, error);
      throw error;
    };
  }
}

let _connection;
export function getConnection() {
  return (_connection ||= new Connections(RPCUrls, {
    commitment: "confirmed"
  })) as Connection;
}

export type KeyPairType = "ADMIN" | "PLATFORM" | "BOT" | string;

// KEYPAIR_ADMIN / KEYPAIR_PLATFORM
export function getKeypair(name: KeyPairType) {
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env[`KEYPAIR_${name.toUpperCase()}`] ?? "[]"))
  );
}
export function getKeypairs(name: KeyPairType) {
  const array: number[][] = JSON.parse(process.env[`KEYPAIRS_${name.toUpperCase()}`] ?? "[]") || [];
  return array.map((kp) => Keypair.fromSecretKey(new Uint8Array(kp)));
}

// Anchor Wallet
export interface AnchorWallet {
  payer: Keypair
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export function createAnchorWallet(keypair: Keypair): AnchorWallet {
  return {
    payer: keypair,
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs) => {
      return txs.map((tx) => {
        tx.partialSign(keypair);
        return tx;
      });
    },
  };
}

export function getProvider(
  nameOrKeyPair: KeyPairType | Keypair,
  connection = getConnection(),
  opts: ConfirmOptions = {}
): AnchorProvider {
  if (typeof nameOrKeyPair === "string")
    return getProvider(getKeypair(nameOrKeyPair), connection, opts);

  const wallet = createAnchorWallet(nameOrKeyPair);
  const res = new anchor.AnchorProvider(connection, wallet as any, opts);
  anchor.setProvider(res);

  return res;
}

export function loadProgram<T extends Idl = Idl>(
  name: string,
  provider?: anchor.Provider,
) {
  return new anchor.Program<T>(
    loadProgramIdl(name),
    getPublicKey(name),
    provider
  );
}
