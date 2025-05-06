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
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"; // Changed from @solana/spl_token to @solana/spl-token
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
 * More flexible verification that allows wallets to add their own instructions
 */
function verifyTransactions(
  signedTxsGroup: VersionedTransaction[][],
  expectedTxsGroup: VersionedTransaction[][]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // System program IDs to ignore (compute budget, etc.)
  const IGNORED_PROGRAM_IDS = [
    "ComputeBudget111111111111111111111111111111", // Compute budget program
    "Sysvar1111111111111111111111111111111111111", // Sysvar program
    "SysvarRent111111111111111111111111111111111", // Rent sysvar
    "SysvarC1ock11111111111111111111111111111111", // Clock sysvar
    "SysvarStakeHistory1111111111111111111111111", // Stake history sysvar
    "SysvarRecentB1ockHashes11111111111111111111", // Recent blockhashes
    "SysvarFees111111111111111111111111111111111", // Fees sysvar
  ];

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

      // Extract all essential instructions from the expected transaction
      const expectedInstructions = expectedTx.message.compiledInstructions;
      const expectedKeys = expectedTx.message.getAccountKeys();
      
      // Create fingerprints of expected instructions for matching
      // Filter out system instructions that wallets might modify
      const expectedFingerprints = expectedInstructions
        .map(ix => {
          const programId = expectedKeys.get(ix.programIdIndex);
          const programIdStr = programId?.toBase58() || '';
          
          // Skip system instructions that wallets might modify
          if (IGNORED_PROGRAM_IDS.includes(programIdStr)) {
            return null;
          }
          
          return {
            programId: programIdStr,
            data: Buffer.from(ix.data),
            accounts: ix.accountKeyIndexes.map(idx => {
              const acc = expectedKeys.get(idx);
              return acc?.toBase58() || '';
            })
          };
        })
        .filter(fp => fp !== null); // Remove null entries (ignored programs)
      
      // Get all instructions from the signed transaction
      const signedInstructions = signedTx.message.compiledInstructions;
      const signedKeys = signedTx.message.getAccountKeys();
      
      // For each expected instruction, check if it exists in the signed transaction
      for (const expectedFp of expectedFingerprints) {
        let found = false;
        
        // Try to find a matching instruction in the signed transaction
        for (const signedIx of signedInstructions) {
          const signedProgramId = signedKeys.get(signedIx.programIdIndex)?.toBase58() || '';
          
          // Skip system instructions in signed transaction too
          if (IGNORED_PROGRAM_IDS.includes(signedProgramId)) {
            continue;
          }
          
          // Check if program IDs match
          if (signedProgramId !== expectedFp.programId) continue;
          
          // Check if instruction data matches
          if (!Buffer.from(signedIx.data).equals(expectedFp.data)) continue;
          
          // Check if accounts match (allowing for different order)
          const signedAccounts = signedIx.accountKeyIndexes.map(idx => {
            const acc = signedKeys.get(idx);
            return acc?.toBase58() || '';
          });
          
          // Check if all expected accounts are present in the signed instruction
          const allAccountsPresent = expectedFp.accounts.every(expectedAcc => 
            signedAccounts.includes(expectedAcc)
          );
          
          if (allAccountsPresent) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          errors.push(`Missing expected instruction in transaction ${i}.${j}: program=${expectedFp.programId}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
