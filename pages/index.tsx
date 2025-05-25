// pages/index.tsx
import { useEffect, useState } from 'react';

interface Opportunity {
  route: string[];
  profitPct: number;
}

export default function Home() {
  const [opps, setOpps] = useState<Opportunity[]>([]);

  const fetchOpps = async () => {
    const res = await fetch('/api/detect');
    const data = await res.json();
    setOpps(data.opportunities);
  };

  useEffect(() => {
    fetchOpps();
    const interval = setInterval(fetchOpps, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 font-mono">
      <h1 className="text-xl font-bold mb-4">Arbitrage Opportunities</h1>
      <ul>
        {opps.map((opp, i) => (
          <li key={i} className="mb-2">
            {opp.route.join(' ➝ ')} — <strong>{opp.profitPct}%</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}
