"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface HowToPlayModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc?: string
}

export function HowToPlayModal({ isOpen, onClose, imageSrc }: HowToPlayModalProps) {
  const [fadeIn, setFadeIn] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      // Prevent scrolling
      document.body.style.overflow = "hidden"
      // Fade in animation
      setTimeout(() => setFadeIn(true), 10)
      // Add event listener
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      // Re-enable scrolling
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${
        fadeIn ? "opacity-100" : "opacity-0"
      } transition-opacity duration-200`}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">hey frens! how to use BoopClaimer (´｡• ◡ •｡`) ♡</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 12.461L8.3 6.772L13.534 1.539L12.006 0L6.772 5.234L1.54 0L0 1.539L5.234 6.772L0 12.006L1.539 13.534L6.772 8.3L12.462 14L14 12.461Z" fill="currentColor" />
            </svg>
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">step 1: grab ur JWT token ✧˖°</h3>
            <p className="text-muted-foreground">
              to fetch those sweet rewards, u need to snag ur JWT token from boop.fun:
            </p>
            <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
              <li>
                <strong>visit boop.fun and connect ur wallet</strong>
                <p className="mt-1">head over to <a href="https://boop.fun" target="_blank" rel="noopener noreferrer" className="text-primary underline">boop.fun</a> and connect ur wallet to access ur account.</p>
              </li>
              <li>
                <strong>open ur browser's dev tools (the secret menu)</strong>
                <p className="mt-1">pop open ur browser's developer console:</p>
                <ul className="list-disc pl-5 mt-1 text-sm">
                  <li><strong>Chrome/Edge</strong>: smash F12 or Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)</li>
                  <li><strong>Firefox</strong>: hit F12 or Ctrl+Shift+K (Windows) / Cmd+Option+K (Mac)</li>
                </ul>
              </li>
              <li>
                <strong>find the Application/Storage tab</strong>
                <p className="mt-1">in the dev tools panel, click on the "Application" tab (Chrome) or "Storage" tab (Firefox).</p>
              </li>
              <li>
                <strong>hunt for the magic cookie</strong>
                <p className="mt-1">in the left sidebar, expand "Cookies" and click on "https://boop.fun". in the table that appears, find the row with "boop_token_v6" in the Name column.</p>
              </li>
              <li>
                <strong>copy that token value</strong>
                <p className="mt-1">double-click the Value field for the boop_token_v6 cookie and copy the entire string. it's a bit of a mess, but we need the whole thing!</p>
              </li>
            </ol>
            
            {imageSrc && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <Image 
                  src={imageSrc} 
                  alt="How to get JWT token" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto object-contain max-h-[500px]"
                  style={{ objectFit: "contain" }}
                  unoptimized={true}
                />
              </div>
            )}
          </div>
          <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 space-y-2">
            <h3 className="text-lg font-semibold text-green-400 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              super safe, pinky promise! ⋅˚₊‧ 𐙚 ‧₊˚ ⋅
            </h3>
            <div className="text-green-300 font-medium">
              <p>
                ur security is our top priority, bestie! that JWT Token we're asking for:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>ONLY</strong> grabs ur airdrop list (nothing sketchy, we swear!)</li>
                <li><strong>CANNOT</strong> touch ur funds or tokens (they're safe n sound)</li>
                <li><strong>DOES NOT</strong> have any control over ur wallet (it's just window shopping)</li>
                <li><strong>HAS NO</strong> ability to sign transactions (ur wallet stays locked tight)</li>
              </ul>
              <p className="mt-2">
                all wallet interactions need ur explicit approval through ur wallet's standard confirmation. we're just here to help, not to be creepy! {">⩊<"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">step 2: claim ur rewards with BoopClaimer ♡</h3>
            <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
              <li>
                <strong>paste ur JWT token</strong>
                <p className="mt-1">drop that copied JWT token into the "Enter JWT Token" field on BoopClaimer.</p>
              </li>
              <li>
                <strong>fetch those rewards!</strong>
                <p className="mt-1">hit the "Fetch Rewards" button to load all ur shiny rewards.</p>
              </li>
              <li>
                <strong>connect ur wallet</strong>
                <p className="mt-1">connect the same wallet u used on boop.fun (don't mix them up!).</p>
              </li>
              <li>
                <strong>pick n claim ur rewards</strong>
                <p className="mt-1">select the rewards u want and smash that "Claim Selected" button.</p>
              </li>
              <li>
                <strong>auto-sell if u want those sweet gains</strong>
                <p className="mt-1">toggle "Auto-sell after claim" to automatically convert ur tokens to SOL after claiming. instant gratification!</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HowToPlayButton() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="text-primary border-primary hover:bg-primary/10"
      >
        How to Play
      </Button>
      <HowToPlayModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        imageSrc="/how-to-play.png"
      />
    </>
  )
}
