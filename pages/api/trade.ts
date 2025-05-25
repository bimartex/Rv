// pages/api/trade.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { placeOrder } from '@/utils/bitget';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol, side, size } = req.body;

  if (!symbol || !side || !size) {
    return res.status(400).json({ error: 'Missing trade parameters' });
  }

  if (process.env.BOT_MODE === 'paper') {
    return res.status(200).json({ message: 'Paper trade simulated', symbol, side, size });
  }

  try {
    const result = await placeOrder(symbol, size, side);
    res.status(200).json({ message: 'Trade executed', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
