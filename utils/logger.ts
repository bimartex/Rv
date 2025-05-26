// utils/logger.ts
export async function logTradeAttempt(data: {
  symbol: string;
  side: string;
  size: string;
  value: number;
  time: string;
}) {
  console.log(`[TRADE LOG] ${data.time} | ${data.side.toUpperCase()} ${data.size} ${data.symbol} ≈ $${data.value.toFixed(2)}`);
}
