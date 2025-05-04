import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";

export function lamport2Sol(lamport: BN | number): string {
  const lamportBN = new BN(lamport);

  return String(lamportBN.toNumber() / LAMPORTS_PER_SOL);
}

export function sol2Lamport(sol: string | number): BN {
  const solBigInt = new BN(sol.toString().replace(".", ""));
  const decimals = sol.toString().includes(".")
    ? sol.toString().split(".")[1].length
    : 0;
  return solBigInt.mul(new BN(LAMPORTS_PER_SOL).div(new BN(10 ** decimals)));
}

export function sol2LamportStr(sol: string | number): string {
  return sol2Lamport(sol).toString();
}

// const confirmOptions = {
//   skipPreflight: true,
// };
//
// export async function buildOptimalTransaction({
//   connection,
//   instructions,
//   payer,
//   lookupTables,
// }: {
//   connection: Connection;
//   instructions: Array<TransactionInstruction>;
//   payer: PublicKey;
//   lookupTables: Array<AddressLookupTableAccount>;
// }) {
//   const [microLamports, units, recentBlockhash] = (await Promise.all([
//     100,
//     await getSimulationComputeUnits(
//       // @ts-ignore
//       connection,
//       instructions,
//       payer,
//       lookupTables
//     ).then((units) => {
//       if (units) {
//         return units + 1000;
//       } else {
//         return 20000;
//       }
//     }),
//     await connection.getLatestBlockhash(),
//   ])) as [number, number, { blockhash: string; lastValidBlockHeight: number }];
//
//   instructions.unshift(
//     ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
//   );
//   if (units) {
//     instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
//   }
//   return {
//     transaction: new VersionedTransaction(
//       new TransactionMessage({
//         instructions,
//         recentBlockhash: recentBlockhash.blockhash,
//         payerKey: payer,
//       }).compileToV0Message(lookupTables)
//     ),
//     recentBlockhash,
//   };
// }
//
// export async function sendAndConfirmOptimalTransaction({
//   connection,
//   ixs,
//   payer,
//   otherSigners = [],
// }: {
//   connection: Connection;
//   ixs: TransactionInstruction[];
//   payer: Keypair;
//   otherSigners?: Keypair[];
// }): Promise<string> {
//   let txResult = await buildOptimalTransaction({
//     connection,
//     instructions: ixs,
//     payer: payer.publicKey,
//     lookupTables: [],
//   });
//
//   txResult.transaction.sign([payer]);
//
//   if (otherSigners) {
//     txResult.transaction.sign(otherSigners);
//   }
//
//   let txsig = await connection.sendTransaction(
//     txResult.transaction,
//     confirmOptions
//   );
//
//   await connection.confirmTransaction(
//     {
//       blockhash: txResult.recentBlockhash.blockhash,
//       lastValidBlockHeight: txResult.recentBlockhash.lastValidBlockHeight,
//       signature: txsig,
//     },
//     "confirmed"
//   );
//
//   return txsig;
// }
//
// export async function sendTransactionWithoutConfirm({
//   connection,
//   ixs,
//   payer,
//   otherSigners = [],
// }: {
//   connection: Connection;
//   ixs: TransactionInstruction[];
//   payer: Keypair;
//   otherSigners?: Keypair[];
// }): Promise<string> {
//   const tx = new VersionedTransaction(
//     new TransactionMessage({
//       recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
//       instructions: ixs,
//       payerKey: payer.publicKey,
//     }).compileToV0Message()
//   );
//
//   tx.sign([payer]);
//
//   if (otherSigners) {
//     tx.sign(otherSigners);
//   }
//
//   let txsig = await connection.sendTransaction(tx, confirmOptions);
//
//   return txsig;
// }
