import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { Toaster } from 'sonner'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Boop Claimer",
  description: "hey frens! ✧˖° claim, manage & sell ur boop.fun rewards in one magical place! check ur token balances, see how much SOL they're worth, and claim or sell multiple tokens with just one click. it's super easy & totally safe! (´｡• ◡ •｡`) ♡",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))'
              },
              className: 'text-sm',
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
