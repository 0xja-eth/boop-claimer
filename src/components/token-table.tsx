"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatNumber, formatUSD, formatSOL, lamportsToSol } from "@/lib/format"
import Image from "next/image"
import WalletBtn from "@/components/wallet-btn"

interface TokenInfo {
  name: string
  address: string
  symbol: string
  logoUrl: string
  imageFlag: string
}

interface Distribution {
  id: string
  amountLpt: string
  amountUsd: string
  amountSolLpt: string
  proofs: number[][]
  claimedAt: string | null
  txHash: string | null
  token: TokenInfo
}

export function TokenTable() {
  const [jwtToken, setJwtToken] = useState("")
  const [minValue, setMinValue] = useState("1")
  const [showUnclaimed, setShowUnclaimed] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchDistributions = async () => {
    if (!jwtToken) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/distributions", {
        headers: {
          "Authorization": `Bearer ${jwtToken}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      setDistributions(data)
    } catch (error) {
      console.error("Failed to fetch distributions:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch distributions")
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

  const claimSelected = () => {

  }
  const sellSelected = () => {

  }

  const filteredDistributions = distributions
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
      <div className="flex-1 w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">BoopClaimer</h1>
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
              onClick={handleFetchDistributions}
              disabled={!jwtToken || isLoading}
            >
              {isLoading ? "Loading..." : "Fetch Tokens"}
            </Button>
            <WalletBtn />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/20 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-32"
              placeholder="value > $1"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowUnclaimed(!showUnclaimed)}
            className={cn(showUnclaimed && "bg-primary text-primary-foreground")}
          >
            Show Unclaimed
          </Button>
        </div>

        <div className="bg-card rounded-lg border">
          <div className="grid grid-cols-7 gap-4 p-4 border-b text-muted-foreground">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-4 px-2"
              >
                {selectedTokens.length === filteredDistributions.length ? "Deselect All" : "Select All"}
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
                  --
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
                    "px-2 py-1 rounded-full text-sm inline-flex w-fit",
                    !dist.claimedAt && "bg-primary/20 text-primary",
                    dist.claimedAt && "bg-green-500/20 text-green-500"
                  )}
                >
                  {dist.claimedAt ? "Claimed" : "Unclaimed"}
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
            <Button
              disabled={selectedTokens.length === 0}
              variant="default"
              className="flex-1 bg-primary text-primary-foreground"
              onClick={claimSelected}
            >
              Claim Selected ({selectedTokens.length})
            </Button>
            <Button
              disabled={selectedTokens.length === 0}
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={sellSelected}
            >
              Sell Selected ({selectedTokens.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
