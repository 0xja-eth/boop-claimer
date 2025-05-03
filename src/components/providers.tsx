"use client"

import WalletContextProvider from "@/contexts/wallet-context-provider"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <WalletContextProvider>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </WalletContextProvider>
  )
}
