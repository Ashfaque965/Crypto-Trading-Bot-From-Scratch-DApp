import React, { useContext } from 'react';
import { TradingContext } from '../context/TradingContext';
import Navbar from '../components/Navbar';
import PriceMonitor from '../components/PriceMonitor';
import StrategyController from '../components/StrategyController';

export default function Home() {
  const { account } = useContext(TradingContext);

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: account ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Terminal Interface</h2>
          <p style={{ color: '#98a1c0', marginBottom: '1.5rem' }}>
            Welcome to your direct bridge into decentralized exchange pools. Authenticate via MetaMask to initialize monitoring features.
          </p>
          {account && (
            <PriceMonitor 
              tokenIn="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // Example WETH Mainnet Addr
              tokenOut="0xA0b86991c6218b36c1d19D4a2e9Eb0CE3606eB48" // Example USDC Mainnet Addr
              amountIn="1"
            />
          )}
        </div>

        {account && (
          <div>
            <StrategyController />
          </div>
        )}
      </main>
    </div>
  );
}