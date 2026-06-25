import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRICE_FEEDS = [
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', defaultPrice: '3200.00' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', defaultPrice: '64000.00' },
  { id: 'polygon-pos', symbol: 'MATIC', name: 'Polygon', defaultPrice: '0.75' }
];

export default function Price() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchGlobalPrices = async () => {
    try {
      setLoading(true);
      // Fetches real-time valuations across main chains via standard public data API
      const ids = PRICE_FEEDS.map(f => f.id).join(',');
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );

      const updatedPrices = {};
      PRICE_FEEDS.forEach(feed => {
        updatedPrices[feed.symbol] = res.data[feed.id]?.usd || feed.defaultPrice;
      });

      setPrices(updatedPrices);
    } catch (err) {
      console.error('Coingecko Oracle Feed Error:', err.message);
      // Fallback to static defaults if rate limit is hit
      const fallbacks = {};
      PRICE_FEEDS.forEach(f => { fallbacks[f.symbol] = f.defaultPrice; });
      setPrices(fallbacks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalPrices();
    const interval = setInterval(fetchGlobalPrices, 30000); // Refreshes macro data every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📊 Macro Valuation Oracle</h3>
        <button style={styles.refreshBtn} onClick={fetchGlobalPrices} disabled={loading}>
          {loading ? 'Syncing...' : '↻ Refresh Data'}
        </button>
      </div>

      <div style={styles.grid}>
        {PRICE_FEEDS.map((feed) => (
          <div key={feed.id} style={styles.card}>
            <div style={styles.meta}>
              <span style={styles.name}>{feed.name}</span>
              <span style={styles.symbol}>{feed.symbol}</span>
            </div>
            <div style={styles.priceValue}>
              ${parseFloat(prices[feed.symbol] || feed.defaultPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '0.5rem 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  refreshBtn: {
    background: 'none',
    border: '1px solid #2d2f36',
    color: '#3894ff',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  card: {
    background: '#1a1b1f',
    border: '1px solid #2d2f36',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    fontSize: '0.85rem',
    color: '#98a1c0',
    fontWeight: '500'
  },
  symbol: {
    background: '#2d2f36',
    color: '#fff',
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  priceValue: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fff',
    marginTop: '0.25rem'
  }
};