"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { formatNumber, formatUSD, formatSOL, lamportsToSol } from "@/lib/format"
import Image from "next/image"
import WalletBtn from "@/components/wallet-btn"
import { Distribution } from "@/lib/solana/op/get-distributions"
import { useBatchClaim } from "@/hooks/use-batch-claim";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { useDistributionBalances } from "@/hooks/use-distribution-balances";
import { useBatchSell } from "@/hooks/use-batch-sell";
import { toast } from "sonner";
import { HowToPlayButton } from "@/components/how-to-play-modal";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { GetDistributions } from "@/constants/api";
import { getToken, getTokenValue, isValidToken, loadToken, setupToken } from "@/lib/auth";

export type ClaimStatus = 'unclaimed' | 'pending' | 'claiming' | 'claimed' | 'selling' | 'sold';

export interface ClaimingState {
  status: ClaimStatus;
  distribution: Distribution;
}

export function TokenTable() {
  const [jwtToken, setJwtToken] = useState("")
  const [minValue, setMinValue] = useState("1")
  const [showUnclaimed, setShowUnclaimed] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSellAfterClaim, setAutoSellAfterClaim] = useState(true)
  const [includeClaimed, setIncludeClaimed] = useState(false)
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(false)
  const [minUsdValue, setMinUsdValue] = useState<string>("0")

  const {claim, loading: claimLoading, claimingStates} = useBatchClaim()
  const {sell, loading: sellLoading, sellingStates} = useBatchSell()

  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const states = { ...claimingStates, ...sellingStates }

  // Remove claimed tokens from selection
  useEffect(() => {
    setSelectedTokens(prev => 
      prev.filter(id => 
        !claimingStates[id] || claimingStates[id]?.status !== 'claimed'
      )
    )
  }, [claimingStates])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = loadToken()?.value || ""
      setJwtToken(jwtToken)

      if (jwtToken) handleFetchDistributions(jwtToken, includeClaimed)
    }
  }, [])

  const { balances, refetch } = useDistributionBalances(distributions)

  const handleFetchDistributions = async (jwtToken: string, includeClaimed: boolean) => {
    // if (!jwtToken) return
    setIsLoading(true)
    setError(null)
    try {
      if (!isValidToken(jwtToken))
        throw new Error("Invalid or expired JWT token. Please get a new token from boop.fun and try again.")

      setupToken(jwtToken)

      const data = await GetDistributions({ includeClaimed })

      // const response = await fetch(`/api/distributions?includeClaimed=${includeClaimed}`, {
      //   headers: {
      //     "Authorization": `Bearer ${jwtToken}`
      //   }
      // })
      //
      // if (!response.ok) {
      //   localStorage.removeItem('jwtToken')
      //   throw new Error("Invalid or expired JWT token. Please get a new token from boop.fun and try again.")
      //
      //   // throw new Error(`HTTP error! status: ${response.status}`)
      // }
      //
      // const data = await response.json()

      // localStorage.setItem('jwtToken', jwtToken)
      setDistributions(data)
    } catch (error) {
      console.error("Failed to fetch distributions:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch distributions. Please get a new token from boop.fun and try again.")
      setJwtToken("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenSelect = (tokenId: string) => {
    setSelectedTokens(prev => {
      if (prev.includes(tokenId)) {
        return prev.filter(id => id !== tokenId)
      }
      return [...prev, tokenId]
    })
  }

  const handleSelectAll = () => {
    if (selectedTokens.length === filteredDistributions.length) {
      setSelectedTokens([])
    } else {
      setSelectedTokens(filteredDistributions.map(dist => dist.id))
    }
  }

  const claimSelected = async () => {
    const claimingDistributions = distributions.filter(dist => selectedTokens.includes(dist.id))

    await claim(claimingDistributions, autoSellAfterClaim)
    await refetch();
  }
  const sellSelected = async () => {
    const sellingDistributions = distributions.filter(
      d => selectedTokens.includes(d.id) && balances[d.id] > BigInt(0)
    )
    if (sellingDistributions.length <= 0) toast.message('No sellable tokens');
    else {
      setSelectedTokens(sellingDistributions.map(d => d.id))

      const amounts = sellingDistributions.map(d => new BN(balances[d.id].toString()))

      await sell(sellingDistributions, amounts)
      await refetch();
    }
  }

  const filteredDistributions = distributions.filter(dist => {
    const usdValue = parseFloat(dist.amountUsd);
    const meetsMinUsdValue = usdValue >= parseFloat(minUsdValue || "0");
    
    const hasBalance = !showOnlyWithBalance || (balances[dist.id] && balances[dist.id] > BigInt(0.1 * 1e9));
    
    return meetsMinUsdValue && hasBalance;
  });

  const selectedTotal = {
    usd: filteredDistributions
      .filter(dist => selectedTokens.includes(dist.id))
      .reduce((sum, dist) => sum + Number(dist.amountUsd), 0),
    sol: filteredDistributions
      .filter(dist => selectedTokens.includes(dist.id))
      .reduce((sum, dist) => sum + lamportsToSol(dist.amountSolLpt), 0),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 w-full max-w-[1440px] mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Boop Claimer Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-[#0FA9C8]">BoopClaimer</h1>
            <HowToPlayButton />
          </div>
          <div className="flex items-center gap-4">
            <Input
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              className="w-64"
              type="password"
              placeholder="Enter JWT Token"
            />
            <Button 
              variant="outline" 
              onClick={() => handleFetchDistributions(jwtToken, includeClaimed)}
              disabled={!jwtToken || isLoading}
            >
              {isLoading ? "Loading..." : distributions.length > 0 ? "Refresh Rewards" : "Fetch Rewards"}
            </Button>
            <WalletBtn />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/20 text-destructive rounded-md">
            {error}
          </div>
        )}

        {distributions.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Switch
                id="includeClaimed"
                checked={includeClaimed}
                onCheckedChange={(checked) => {
                  setIncludeClaimed(checked);
                  if (jwtToken) handleFetchDistributions(jwtToken, checked);
                }}
              />
              <Label htmlFor="includeClaimed" className="text-sm cursor-pointer">
                {includeClaimed ? "Showing all rewards" : "Only showing unclaimed"}
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="showOnlyWithBalance"
                checked={showOnlyWithBalance}
                onCheckedChange={setShowOnlyWithBalance}
              />
              <Label htmlFor="showOnlyWithBalance" className="text-sm cursor-pointer">
                {showOnlyWithBalance ? "Only showing tokens with balance" : "Showing all tokens"}
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="minUsdValue" className="text-sm whitespace-nowrap">USD Value:</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={minUsdValue}
                  onChange={(e) => setMinUsdValue(e.target.value)}
                  className="w-32"
                  placeholder="Min USD Value"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinUsdValue("0")}
                  className={cn(minUsdValue === "0" && "bg-primary text-primary-foreground")}
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinUsdValue("0.5")}
                  className={cn(minUsdValue === "0.5" && "bg-primary text-primary-foreground")}
                >
                  &gt; $0.5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinUsdValue("1")}
                  className={cn(minUsdValue === "1" && "bg-primary text-primary-foreground")}
                >
                  &gt; $1
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg border">
          <div className="grid grid-cols-7 gap-4 p-4 border-b text-muted-foreground">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-4 px-2"
              >
                {selectedTokens.length === filteredDistributions.length ? "Deselect All" : `Select All (${filteredDistributions.length})`}
              </Button>
            </div>
            <div>Token</div>
            <div>Balance</div>
            <div>Amount</div>
            <div>SOL Value</div>
            <div>USD Value</div>
            <div>Status</div>
          </div>

          <div className="space-y-0">
            {filteredDistributions.map((dist) => (
              <div
                key={dist.id}
                className="grid grid-cols-7 gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/50"
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selectedTokens.includes(dist.id)}
                    onChange={() => handleTokenSelect(dist.id)}
                    className="rounded border-primary text-primary focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {dist.token.logoUrl && (
                    <div className="relative w-6 h-6">
                      <Image
                        src={dist.token.logoUrl}
                        alt={dist.token.name}
                        fill
                        className="rounded-full"
                      />
                    </div>
                  )}
                  <Label className="font-medium">
                    {dist.token.symbol}
                  </Label>
                </div>
                <div className="text-muted-foreground">
                  {balances[dist.id] ? formatNumber(lamportsToSol(balances[dist.id]), 6) : "--"}
                </div>
                <div>
                  {formatNumber(lamportsToSol(dist.amountLpt), 6)}
                </div>
                <div>
                  {formatSOL(lamportsToSol(dist.amountSolLpt))}
                </div>
                <div>
                  {formatUSD(dist.amountUsd)}
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-sm inline-flex w-fit items-center gap-1",
                    !dist.claimedAt && (!states[dist.id] || states[dist.id]?.status === 'unclaimed') && "bg-primary/20 text-primary",
                    states[dist.id]?.status === 'pending' && "bg-yellow-500/20 text-yellow-500",
                    (states[dist.id]?.status === 'claiming' || states[dist.id]?.status === 'selling') && "bg-blue-500/20 text-blue-500",
                    (dist.claimedAt || states[dist.id]?.status === 'claimed' || states[dist.id]?.status === 'sold') && "bg-green-500/20 text-green-500"
                  )}
                >
                  {(states[dist.id]?.status === 'pending' || states[dist.id]?.status === 'claiming') && (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {states[dist.id]?.status === 'pending' ? "Pending" :
                    states[dist.id]?.status === 'claiming' ? "Claiming" :
                      dist.claimedAt || states[dist.id]?.status === 'claimed' ? "Claimed" :
                        states[dist.id]?.status === 'selling' ? "Selling" :
                          states[dist.id]?.status === 'sold' ? "Sold" :
                            "Unclaimed"
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-muted-foreground">Selected:</span>
            <div className="space-x-4">
              <span>{formatSOL(selectedTotal.sol)}</span>
              <span>{formatUSD(selectedTotal.usd)}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSellAfterClaim"
                checked={autoSellAfterClaim}
                onChange={(e) => setAutoSellAfterClaim(e.target.checked)}
                className="rounded border-primary text-primary focus:ring-primary"
              />
              <Label htmlFor="autoSellAfterClaim" className="text-sm cursor-pointer">
                Auto-sell after claim
              </Label>
            </div>
            <Button
              disabled={!wallet || !connection || selectedTokens.length === 0 || claimLoading}
              variant="default"
              className="flex-1 bg-primary text-primary-foreground"
              onClick={claimSelected}
            >
              {!wallet || !connection ? "Wallet not connected!" : claimLoading ? "Claiming..." : `Claim Selected (${selectedTokens.length})`}
            </Button>
            <Button
              // disabled={true}
              disabled={!wallet || !connection || selectedTokens.length === 0 || sellLoading}
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={sellSelected}
            >
              {!wallet || !connection ? "Wallet not connected!" : sellLoading ? "Selling..." : `Sell Selected (${selectedTokens.length})`}
              {/*Sell Selected ({selectedTokens.length})*/}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
