import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return ""
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export function formatStark(amount: bigint | string, decimals = 18): string {
  if (!amount) return "0"
  const amountString = typeof amount === "bigint" ? amount.toString() : amount
  const divisor = BigInt(10 ** decimals)
  const quotient = BigInt(amountString) / divisor
  const remainder = BigInt(amountString) % divisor

  if (remainder === 0n) {
    return quotient.toString()
  }

  const remainderString = remainder.toString().padStart(decimals, "0")
  const trimmedRemainder = remainderString.replace(/0+$/, "")

  return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString()
}

export function generatePixelGradient(color1: string, color2: string): string {
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}