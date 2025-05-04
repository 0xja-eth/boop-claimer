// import { getSimulationComputeUnits } from "@solana-developers/helpers";
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  BlockhashWithExpiryBlockHeight,
} from "@solana/web3.js";

const confirmOptions = {
  skipPreflight: true,
};

export type TransactionOptions = {
  instructions: Array<TransactionInstruction>;
  payer: PublicKey;
  connection?: Connection;
  recentBlockhash?: BlockhashWithExpiryBlockHeight;
  lookupTables?: Array<AddressLookupTableAccount>;
  microLamports?: number;
  units?: number;
}
export async function buildTransaction({
                                         instructions,
                                         payer,
                                         connection,
                                         recentBlockhash,
                                         lookupTables = [],
                                         microLamports = 5000, // 设置默认优先费用
                                         units = 100000, // 设置是否忽略模拟计算错误
                                       }: TransactionOptions) {
  recentBlockhash ||= await connection?.getLatestBlockhash()
  if (!recentBlockhash) throw new Error("RecentBlockhash is not provided!")

  // 插入设置计算单位价格的指令，应用优先费用
  instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
  );

  // 设置计算单位限制
  if (units) {
    instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
  }

  // 构建交易
  return {
    transaction: new VersionedTransaction(
        new TransactionMessage({
          instructions,
          recentBlockhash: recentBlockhash.blockhash,
          payerKey: payer,
        }).compileToV0Message(lookupTables)
    ),
    recentBlockhash,
  };
}


// export type OptimalTransactionOptions = {
//   instructions: Array<TransactionInstruction>;
//   payer: PublicKey;
//   connection: Connection;
//   lookupTables?: Array<AddressLookupTableAccount>;
//   microLamports?: number;
//   simulateErrorUint?: number;
// }
// export async function buildOptimalTransaction({
//                                                 connection,
//                                                 instructions,
//                                                 payer,
//                                                 lookupTables = [],
//                                                 microLamports = 1000, // 设置默认优先费用
//                                                 simulateErrorUint = 0, // 设置是否忽略模拟计算错误
//                                               }: OptimalTransactionOptions) {
//   const [units, recentBlockhash] = (await Promise.all([
//     await getSimulationComputeUnits(
//       // @ts-ignore
//       connection,
//       instructions,
//       payer,
//       lookupTables
//     ).then((units: number | null) => {
//       if (units) {
//         console.log('getSimulationComputeUnits units:', units);
//         return units + 1000; // 给计算单位留有一定余量
//       } else {
//         return simulateErrorUint // 20000; // 默认的计算单位限制
//       }
//     }).catch((e) => {
//       if (!simulateErrorUint) throw e;
//
//       console.warn(`getSimulationComputeUnits error, use default units: ${simulateErrorUint}`, e);
//       return simulateErrorUint; // 500000
//     }),
//     await connection.getLatestBlockhash(),
//   ])) as [number, BlockhashWithExpiryBlockHeight];
//
//   // 插入设置计算单位价格的指令，应用优先费用
//   instructions.unshift(
//     ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
//   );
//
//   // 设置计算单位限制
//   if (units) {
//     instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
//   }
//
//   // 构建交易
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
// // export async function buildOptimalTransaction({
// //   connection,
// //   instructions,
// //   payer,
// //   lookupTables,
// // }: {
// //   connection: Connection;
// //   instructions: Array<TransactionInstruction>;
// //   payer: PublicKey;
// //   lookupTables: Array<AddressLookupTableAccount>;
// // }) {
// //   const [microLamports, units, recentBlockhash] = (await Promise.all([
// //     100,
// //     await getSimulationComputeUnits(
// //       // @ts-ignore
// //       connection,
// //       instructions,
// //       payer,
// //       lookupTables
// //     ).then((units) => {
// //       if (units) {
// //         return units + 1000;
// //       } else {
// //         return 20000;
// //       }
// //     }),
// //     await connection.getLatestBlockhash(),
// //   ])) as [number, number, { blockhash: string; lastValidBlockHeight: number }];
// //
// //   instructions.unshift(
// //     ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
// //   );
// //   if (units) {
// //     instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
// //   }
// //   return {
// //     transaction: new VersionedTransaction(
// //       new TransactionMessage({
// //         instructions,
// //         recentBlockhash: recentBlockhash.blockhash,
// //         payerKey: payer,
// //       }).compileToV0Message(lookupTables)
// //     ),
// //     recentBlockhash,
// //   };
// // }
//
// export async function sendAndConfirmOptimalTransaction({
//   connection,
//   ixs,
//   payer,
//   otherSigners = [],
//   priorityFeeLamports = 1000,
//   simulateErrorUint = 0
// }: {
//   connection: Connection;
//   ixs: TransactionInstruction[];
//   payer: Keypair;
//   otherSigners?: Keypair[];
//   priorityFeeLamports?: number;
//   simulateErrorUint?: number;
// }): Promise<string> {
//   let txResult = await buildOptimalTransaction({
//     connection,
//     instructions: ixs,
//     payer: payer.publicKey,
//     lookupTables: [],
//     microLamports: priorityFeeLamports,
//     simulateErrorUint
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
//   console.log('sendAndConfirmOptimalTransaction sent', txsig);
//
//   const res = await waitForSignatureConfirmation(connection, txsig, txResult.recentBlockhash);
//   console.log('sendAndConfirmOptimalTransaction confirmed', txsig, res);
//
//   // await connection.confirmTransaction(
//   //   {
//   //     blockhash: txResult.recentBlockhash.blockhash,
//   //     lastValidBlockHeight: txResult.recentBlockhash.lastValidBlockHeight,
//   //     signature: txsig,
//   //   },
//   //   "confirmed"
//   // );
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

export async function waitForSignatureConfirmation(
  connection: Connection,
  signature: string,
  blockHash?: BlockhashWithExpiryBlockHeight
) {
  blockHash ||= await connection.getLatestBlockhash()
  return await connection.confirmTransaction({
    signature, ...blockHash
  }, "confirmed");
}
