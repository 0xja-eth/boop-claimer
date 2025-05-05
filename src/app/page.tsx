import { TokenTable } from "@/components/token-table"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <TokenTable />
    </main>
  )
}
