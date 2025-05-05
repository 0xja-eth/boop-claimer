import { NextRequest, NextResponse } from "next/server"
import axios from 'axios'
import { getDistributions } from "@/lib/solana/op/get-distributions"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]
  
  // 获取 includeClaimed 查询参数
  const includeClaimed = request.nextUrl.searchParams.get('includeClaimed') === 'true'
  
  try {
    const distributions = await getDistributions(token, includeClaimed)

    return NextResponse.json(distributions)
  } catch (error) {
    console.error('Error fetching distributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch distributions' },
      { status: 500 }
    )
  }
}
