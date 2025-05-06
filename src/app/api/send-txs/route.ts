import { NextRequest, NextResponse } from "next/server"
import axios from 'axios'
import { getDistributions } from "@/services/distributions";
import { getWalletAddressFromToken } from "@/lib/solana/op/get-distributions";
import {
  AccountMeta,
  CompiledInstruction,
  PublicKey,
  SystemInstruction,
  SystemProgram,
  VersionedTransaction,
} from "@solana/web3.js";
import { OpType } from "@/app/api/gen-txs/route";
import { genClaimTxs, genSellTxs } from "@/services/gentxs";
import bs58 from "bs58";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection } from "@/services/solana/common";
import { sendBundle, sendBundleDirectly } from "@/lib/solana/jito";
import { connect } from "@/lib/db/redis";

export async function POST(request: NextRequest) {
  await connect()

  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]
  const walletAddress = getWalletAddressFromToken(token)

  const body = await request.json()
  const op = body.op as OpType
  const ids = body.ids as string[] || []
  const serializedTxsGroup = body.txsGroup as string[][] || []
  const serializedTipTx = body.tipTx as string || ""

  // Deserialize transactions from frontend
  const txsGroup = serializedTxsGroup.map(sTxs =>
    sTxs.map(sTx => VersionedTransaction.deserialize(bs58.decode(sTx)))
  )

  // const tipTx = serializedTipTx ? VersionedTransaction.deserialize(bs58.decode(serializedTipTx)) : undefined;

  // Get distributions and generate expected transactions
  const distributions = await getDistributions(walletAddress, ids)

  let expectedTxsGroup: VersionedTransaction[][] = [];
  switch (op) {
    case "claim": expectedTxsGroup = await genClaimTxs(walletAddress, distributions); break;
    case "sell": expectedTxsGroup = await genSellTxs(walletAddress, distributions); break;
    case "claim-sell": expectedTxsGroup = await genClaimTxs(walletAddress, distributions, true); break;
  }

  // Verify transactions
  const verificationResults = verifyTransactions(txsGroup, expectedTxsGroup);
  
  if (!verificationResults.valid) {
    return NextResponse.json(
      { error: 'Transaction verification failed', details: verificationResults.errors },
      { status: 400 }
    );
  }

  // Send verified transactions
  try {
    const bundle = await sendBundleDirectly([serializedTipTx, ...serializedTxsGroup.flat()], false);
    return NextResponse.json(bundle);
  } catch (error: any) {
    console.error('Error sending transactions:', error);
    return NextResponse.json(
      { error: 'Failed to send transactions', details: error.message || String(error) },
      { status: 500 }
    );
  }
}

/**
 * Verifies that the signed transactions from frontend match the expected transactions
 */
function verifyTransactions(
  signedTxsGroup: VersionedTransaction[][],
  expectedTxsGroup: VersionedTransaction[][]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if the number of transaction groups matches
  if (signedTxsGroup.length !== expectedTxsGroup.length) {
    errors.push(`Transaction group count mismatch: expected ${expectedTxsGroup.length}, got ${signedTxsGroup.length}`);
    return { valid: false, errors };
  }

  // Check each transaction group
  for (let i = 0; i < signedTxsGroup.length; i++) {
    const signedTxs = signedTxsGroup[i];
    const expectedTxs = expectedTxsGroup[i];

    // Check if the number of transactions in this group matches
    if (signedTxs.length !== expectedTxs.length) {
      errors.push(`Transaction count mismatch in group ${i}: expected ${expectedTxs.length}, got ${signedTxs.length}`);
      continue;
    }

    // Check each transaction in the group
    for (let j = 0; j < signedTxs.length; j++) {
      const signedTx = signedTxs[j];
      const expectedTx = expectedTxs[j];

      // Compare instructions
      const signedInstructions = signedTx.message.compiledInstructions;
      const expectedInstructions = expectedTx.message.compiledInstructions;

      if (signedInstructions.length !== expectedInstructions.length) {
        errors.push(`Instruction count mismatch in transaction ${i}.${j}: expected ${expectedInstructions.length}, got ${signedInstructions.length}`);
        continue;
      }

      // Compare each instruction
      for (let k = 0; k < signedInstructions.length; k++) {
        const signedIx = signedInstructions[k];
        const expectedIx = expectedInstructions[k];
        
        // Compare program ID
        const signedKeys = signedTx.message.getAccountKeys();
        const expectedKeys = expectedTx.message.getAccountKeys();
        
        const signedProgramId = signedKeys.get(signedIx.programIdIndex);
        const expectedProgramId = expectedKeys.get(expectedIx.programIdIndex);
        
        if (!signedProgramId || !expectedProgramId || !signedProgramId.equals(expectedProgramId)) {
          errors.push(`Program ID mismatch in instruction ${i}.${j}.${k}: expected ${expectedProgramId?.toBase58()}, got ${signedProgramId?.toBase58()}`);
          continue;
        }

        // Compare instruction data
        if (!Buffer.from(signedIx.data).equals(Buffer.from(expectedIx.data))) {
          errors.push(`Instruction data mismatch in instruction ${i}.${j}.${k}`);
          continue;
        }

        // Compare accounts
        if (signedIx.accountKeyIndexes.length !== expectedIx.accountKeyIndexes.length) {
          errors.push(`Account count mismatch in instruction ${i}.${j}.${k}: expected ${expectedIx.accountKeyIndexes.length}, got ${signedIx.accountKeyIndexes.length}`);
          continue;
        }

        // Compare each account
        for (let l = 0; l < signedIx.accountKeyIndexes.length; l++) {
          const signedAccIndex = signedIx.accountKeyIndexes[l];
          const expectedAccIndex = expectedIx.accountKeyIndexes[l];
          
          const signedAcc = signedKeys.get(signedAccIndex);
          const expectedAcc = expectedKeys.get(expectedAccIndex);
          
          if (!signedAcc || !expectedAcc || !signedAcc.equals(expectedAcc)) {
            errors.push(`Account mismatch in instruction ${i}.${j}.${k}.${l}: expected ${expectedAcc?.toBase58()}, got ${signedAcc?.toBase58()}`);
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sends the verified transactions to the blockchain
 */
async function sendTransactions(txsGroup: VersionedTransaction[][]): Promise<string[][]> {
  const results: string[][] = [];

  for (const txs of txsGroup) {
    const txResults: string[] = [];
    
    for (const tx of txs) {
      try {
        const signature = await Connection.sendTransaction(tx);
        txResults.push(signature);
      } catch (error: any) {
        console.error('Error sending transaction:', error);
        txResults.push(`error: ${error.message || String(error)}`);
      }
    }
    
    results.push(txResults);
  }

  return results;
}
