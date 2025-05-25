// pages/api/prices.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTickers } from '@/utils/bitget';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const prices = await getAllTickers();
    res.status(200).json({ prices });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
