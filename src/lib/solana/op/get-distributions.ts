import axios from 'axios';
import jwt from 'jsonwebtoken';

const BOOP_API = 'https://graphql-mainnet.boop.works/graphql';

export interface JWTPayload {
  wallet_address: string;
  wallet_id: number;
  company: string;
  exp: number;
  iat: number;
}

export interface TokenInfo {
  name: string;
  address: string;
  symbol: string;
  logoUrl: string;
  imageFlag: string;
}

export interface Distribution {
  id: string;
  amountLpt: string;
  amountUsd: string;
  amountSolLpt: string;
  proofs: number[][];
  claimedAt: string | null;
  txHash: string | null;
  token: TokenInfo;
}

interface DistributionResponse {
  data: {
    account: {
      stakingAirdrops: {
        nodes: Distribution[];
      };
    };
  };
}

// Get wallet address from JWT token
export function getWalletAddressFromToken(token: string): string {
  try {
    // Note: we only decode, not verify, since we don't have the secret
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded.wallet_address;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    throw error;
  }
}

export async function getDistributions(jwtToken: string, includeClaimed = false) {
  try {
    const walletAddress = getWalletAddressFromToken(jwtToken);
    
    const variables = {
      address: walletAddress, // || Provider.publicKey.toString(),
      orderBy: 'AMOUNT_DESC',
      // status: 'PENDING'
    } as any;

    if (!includeClaimed) variables.status = 'PENDING';

    const query = `
query GetAccountDistributions($address: String!, $orderBy: StakingAirdropClaimSort${!includeClaimed ? ", $status: StakingAirdropClaimStatus" : ""}) {
  account(address: $address) {
    stakingAirdrops(orderBy: $orderBy${!includeClaimed ? ", status: $status" : ""}) {
      nodes {
        ...AccountAirdrop
      }
    }
  }
}

fragment AccountAirdrop on AccountStakingAirdrop {
  id
  amountLpt
  amountUsd
  amountSolLpt
  proofs
  claimedAt
  txHash
  token {
    name
    address
    symbol
    logoUrl
    imageFlag
  }
}
`;

    const response = await axios.post<DistributionResponse>(
      BOOP_API,
      {
        query,
        variables,
        operationName: 'GetAccountDistributions'
      },
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/graphql-response+json, application/json',
          'Origin': 'https://boop.fun',
          'Referer': 'https://boop.fun/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...'
        }
      }
    );

    console.log("response.data", response.data)

    return response.data.data.account.stakingAirdrops.nodes;
  } catch (error: any) {
    console.error('GraphQL query failed:', error.response?.data || error.message);
    throw error;
  }
}
