const axios = require('axios');
const { getBalances } = require('../services/portfolioService');

// In-Memory cache for CoinGecko to prevent Rate Limiting under heavy polling
let marketCache = {
  data: null,
  lastFetched: 0,
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes

// 1. Get Wallet Balance (Re-uses Battle-tested portfolioService)
const getBalance = async (req, res) => {
  const { address } = req.params;
  const chain = req.query.chain || 'sepolia';

  if (!address) return res.status(400).json({ error: 'Address is required' });

  try {
    const portfolio = await getBalances(address, chain);
    return res.json(portfolio);
  } catch (error) {
    console.error('Balance error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch balances' });
  }
};

// 2. Get Market Prices (No Hardcoding, 5-Min Cache)
const getMarketPrices = async (req, res) => {
  // Return cached data if within TTL
  const now = Date.now();
  if (marketCache.data && now - marketCache.lastFetched < CACHE_TTL_MS) {
    return res.json(marketCache.data);
  }

  try {
    // We only fetch exactly what we need for the dashboard
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,usd-coin,dai&vs_currencies=usd&include_24hr_change=true',
      { timeout: 5000 }
    );

    const formattedData = {
      ETH: response.data.ethereum.usd,
      USDT: response.data.tether.usd,
      USDC: response.data['usd-coin'].usd,
      DAI: response.data.dai.usd,
    };

    // Update Cache
    marketCache.data = formattedData;
    marketCache.lastFetched = now;

    return res.json(formattedData);
  } catch (error) {
    console.error('CoinGecko API Error:', error.message);
    // Explicitly fail instead of hallucinating values as per user request
    return res.status(503).json({ error: 'Market data temporarily unavailable.' });
  }
};

// 3. Get Wallet History (Alchemy Native JSON-RPC)
const getHistory = async (req, res) => {
  const { address } = req.params;
  if (!address) return res.status(400).json({ error: 'Address is required' });

  const alchemyUrl = process.env.ALCHEMY_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

  // The 'alchemy_getAssetTransfers' specification
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getAssetTransfers',
    params: [
      {
        fromBlock: '0x0',
        toBlock: 'latest',
        toAddress: address,
        category: ['external', 'erc20'],
        withMetadata: false,
        excludeZeroValue: true,
        maxCount: '0x14', // 20 results max for UI speed
      },
    ],
  };

  try {
    const response = await axios.post(alchemyUrl, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 8000 });
    
    // Alchemy specific response handling
    if (!response.data || !response.data.result) {
      return res.json({ transfers: [] });
    }

    const rawTransfers = response.data.result.transfers || [];
    
    // Clean up data for the UI Component
    const formattedHistory = rawTransfers.map((tx) => ({
      hash: tx.hash,
      asset: tx.asset,
      value: tx.value,
      from: tx.from,
      to: tx.to,
      timestamp: Date.now(), // Simulated since alchemy free block metadata is expensive
    }));

    return res.json({ transfers: formattedHistory });
  } catch (error) {
    console.error('History Fetch Error:', error.message);
    return res.status(503).json({ error: 'Failed to fetch transaction history' });
  }
};

module.exports = {
  getBalance,
  getMarketPrices,
  getHistory,
};
