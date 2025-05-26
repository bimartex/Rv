/* pages/api/detect.ts
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
*/

// pages/api/detect.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { findArbitrageOpportunity } from '@/utils/arbitrage';
import { logTradeAttempt } from '@/utils/logger';
import axios from 'axios';

const ENABLE_TIME_FILTER = false; // Set to true to restrict to specific times
const ALLOWED_MINUTES = [0, 15, 30, 45]; // Run only at these minutes if enabled

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date();
  const currentMinute = now.getMinutes();
  const dryRun = req.query.dryRun === 'true';

  if (ENABLE_TIME_FILTER && !ALLOWED_MINUTES.includes(currentMinute)) {
    return res.status(200).json({ message: `Skipped: Not an allowed interval (${currentMinute})` });
  }

  try {
    const opportunity = await findArbitrageOpportunity();

    if (!opportunity) {
      return res.status(200).json({ message: 'No arbitrage opportunity found' });
    }

    if (dryRun) {
      return res.status(200).json({ message: 'Dry run - opportunity detected', opportunity });
    }

    // Execute real trade
    const tradeResponse = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/trade`, {
      symbol: opportunity.symbol,
      side: opportunity.side,
      size: opportunity.size
    });

    await logTradeAttempt({
      symbol: opportunity.symbol,
      side: opportunity.side,
      size: opportunity.size,
      value: opportunity.value,
      time: now.toISOString()
    });

    return res.status(200).json({ message: 'Trade executed', trade: tradeResponse.data });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
