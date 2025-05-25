// pages/api/detect.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTickers } from '@/utils/bitget';
import { findTriangularOpportunities } from '@/utils/arbitrage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prices = await getAllTickers();
    const opportunities = findTriangularOpportunities(prices);
    res.status(200).json({ opportunities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
