import { NextRequest, NextResponse } from "next/server"
import { Distribution, getDistributions, getWalletAddressFromToken } from "@/lib/solana/op/get-distributions";
import { client, connect, getKeys } from "@/lib/db/redis";
import { cacheDistributions } from "@/services/distributions";

export async function GET(request: NextRequest) {
  await connect()

  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]
  const includeClaimed = request.nextUrl.searchParams.get('includeClaimed') === 'true'

  const walletAddress = getWalletAddressFromToken(token)

  try {
    let distributions = await getDistributions(token, includeClaimed)
    await cacheDistributions(walletAddress, distributions)

    distributions = distributions.map(d => ({...d, proofs: []} as Distribution))

    return NextResponse.json(distributions)

  } catch (error) {
    console.error('Error fetching distributions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch distributions' },
      { status: 500 }
    )
  }
}
