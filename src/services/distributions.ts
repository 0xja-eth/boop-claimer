import { Distribution } from "@/lib/solana/op/get-distributions";
import { client } from "@/lib/db/redis";

export const getDistributionsKey = (address: string, ids: string) => `distributions:${address}:${ids}`

export async function cacheDistributions(address: string, distributions: Distribution[]) {
  const multi = client.multi()

  distributions.forEach(d => multi.SET(getDistributionsKey(address, d.id), JSON.stringify(d)))

  await multi.exec()
}

export async function getDistributions(address: string, ids: string[]) {
  const multi = client.multi()

  ids.forEach(id => multi.GET(getDistributionsKey(address, id)))

  const results = await multi.exec() as string[]
  return results.map(result => JSON.parse(result) as Distribution)
}

export async function getDistribution(address: string, id: string) {
  return JSON.parse(await client.GET(getDistributionsKey(address, id)) || "null") as Distribution
}
