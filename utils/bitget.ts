// utils/bitget.ts
import crypto from 'crypto';

const BASE_URL = 'https://api.bitget.com/api';
const API_KEY = process.env.BITGET_API_KEY!;
const API_SECRET = process.env.BITGET_API_SECRET!;
const PASSPHRASE = process.env.BITGET_API_PASSPHRASE!;

function signRequest(timestamp: string, method: string, path: string, body = '') {
  const preHash = timestamp + method.toUpperCase() + path + body;
  return crypto.createHmac('sha256', API_SECRET).update(preHash).digest('base64');
}

async function request(method: string, path: string, body = '') {
  const timestamp = new Date().toISOString();
  const signature = signRequest(timestamp, method, path, body);
  const headers = {
    'ACCESS-KEY': API_KEY,
    'ACCESS-SIGN': signature,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-PASSPHRASE': PASSPHRASE,
    'Content-Type': 'application/json',
  };

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: method === 'GET' ? undefined : body,
  });

  const json = await res.json();
  if (!res.ok || json.code !== '00000') throw new Error(JSON.stringify(json));
  return json.data;
}

export async function getAllTickers(): Promise<Record<string, number>> {
  const result = await fetch(`${BASE_URL}/spot/v1/market/tickers`);
  const json = await result.json();
  const prices: Record<string, number> = {};
  for (const item of json.data) {
    prices[item.symbol] = parseFloat(item.close);
  }
  return prices;
}

export async function placeOrder(symbol: string, size: string, side: 'buy' | 'sell') {
  const path = '/spot/v1/trade/orders';
  const body = JSON.stringify({
    symbol,
    side,
    orderType: 'market',
    size,
    force: true,
  });
  return request('POST', path, body);
}
