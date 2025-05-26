// pages/api/trade.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { placeOrder, getAllTickers } from '@/utils/bitget';
import { logTradeAttempt } from '@/utils/logger';

let tradeCount = 0;
let lastReset = Date.now();

const MAX_TRADE_USDT = parseFloat(process.env.MAX_TRADE_USDT || '50');
const MAX_TRADES_PER_HOUR = parseInt(process.env.MAX_TRADES_PER_HOUR || '5');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol, side, size } = req.body;

  // Check input
  if (!symbol || !side || !size) {
    return res.status(400).json({ error: 'Missing trade parameters' });
  }

  // Reset trade counter hourly
  if (Date.now() - lastReset > 3600000) {
    tradeCount = 0;
    lastReset = Date.now();
  }

  // Fail-safe 1: Rate limit
  if (tradeCount >= MAX_TRADES_PER_HOUR) {
    return res.status(429).json({ error: 'Max trades per hour exceeded' });
  }

  // Fail-safe 2: Trade size USD value check
  const prices = await getAllTickers();
  const price = prices[symbol];
  if (!price) return res.status(400).json({ error: `No price found for ${symbol}` });

  const value = parseFloat(size) * price;
  if (value > MAX_TRADE_USDT) {
    return res.status(403).json({ error: `Trade exceeds $${MAX_TRADE_USDT} limit (${value.toFixed(2)})` });
  }

  // Log every attempt
  await logTradeAttempt({ symbol, side, size, value, time: new Date().toISOString() });

  if (process.env.BOT_MODE === 'paper') {
    return res.status(200).json({ message: '[Paper] Trade simulated', symbol, side, size, value });
  }

  try {
    const result = await placeOrder(symbol, size, side);
    tradeCount++;
    return res.status(200).json({ message: 'Trade executed', result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
