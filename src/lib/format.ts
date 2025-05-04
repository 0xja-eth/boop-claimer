const LAMPORTS_PER_SOL = 1000000000

export function formatNumber(num: number | string | bigint, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(num))
}

export function lamportsToSol(lamports: string | number | bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL
}

export function formatUSD(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount))
}

export function formatSOL(amount: number | string): string {
  const value = Number(amount)
  if (value < 0.001) {
    return '< 0.001 SOL'
  }
  return `${formatNumber(value, 3)} SOL`
}
