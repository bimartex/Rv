// utils/arbitrage.ts

interface PriceMap {
  [symbol: string]: number;
}

interface Opportunity {
  route: string[];
  profitPct: number;
}

export function findTriangularOpportunities(prices: PriceMap): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const symbols = Object.keys(prices);

  for (const base of ['USDT', 'BTC', 'ETH']) {
    const path1 = symbols.filter(s => s.endsWith(base));
    for (const leg1 of path1) {
      const a = leg1.replace(`_${base}`, '');
      const ab = prices[leg1];
      const leg2 = `${base}_${a}`;
      if (!(leg2 in prices)) continue;

      const ba = 1 / prices[leg2];
      const result = ba * ab;
      const profit = (result - 1) * 100;

      if (profit > Number(process.env.TRADE_THRESHOLD || 0.5)) {
        opportunities.push({
          route: [leg1, leg2],
          profitPct: parseFloat(profit.toFixed(2)),
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.profitPct - a.profitPct);
}
