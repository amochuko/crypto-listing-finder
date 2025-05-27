export function formatUSDCompact(
  amount: number,
  notation: "compact" | "standard" | "scientific" | "engineering" = "standard",
  maximumFractionDigits = 2
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation,
    compactDisplay: "short",
    maximumFractionDigits,
  }).format(amount);
}
