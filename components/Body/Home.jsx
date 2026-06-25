import React, { useState, useContext } from 'react';
import { TradingContext } from '../../context/TradingContext';
import AddNetwork from './AddNetwork';
import AddTokenPair from './AddTokenPair';
import PriceMonitor from '../PriceMonitor';
import StrategyController from '../StrategyController';

export default function Home() {
  const { account } = useContext(TradingContext);
  const [monitoredPairs, setMonitoredPairs] = useState([
    {
      id: 'default_1',
      tokenA: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC address
      tokenB: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT address
      symbolA: 'WMATIC',
      symbolB: 'USDT',
      label: 'WMATIC / USDT'
    }
  ]);

  const handleNewPair = (newPair) => {
    setMonitoredPairs((prevPairs) => [newPair, ...prevPairs]);
  };

  return (
    <div style={styles.container}>
      {/* Upper Status Panel */}
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>DeFi Execution Desk</h1>
        <p style={styles.subtitle}>
          Manage automated network strategies, execute cross-asset pools, and govern localized trade parameters.
        </p>
      </header>

      {!account ? (
        <div style={styles.fallbackCard}>
          <h3>🔒 Terminal Offline</h3>
          <p style={{ color: '#98a1c0', marginTop: '0.5rem' }}>
            Please initialize and sync your browser Web3 extension wallet configuration to unlock active metrics streaming.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Left Control Plane */}
          <section style={styles.column}>
            <StrategyController />
            <AddTokenPair onPairAdded={handleNewPair} />
            <AddNetwork />
          </section>

          {/* Right Metrics Stream Plane */}
          <section style={styles.column}>
            <h2 style={styles.sectionTitle}>Active Engine Monitors ({monitoredPairs.length})</h2>
            <div style={styles.monitorStack}>
              {monitoredPairs.map((pair) => (
                <div key={pair.id} style={styles.monitorWrapper}>
                  <div style={styles.pairMeta}>
                    <span style={styles.badge}>{pair.label}</span>
                  </div>
                  <PriceMonitor 
                    tokenIn={pair.tokenA} 
                    tokenOut={pair.tokenB} 
                    amountIn="1" 
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
  },
  mainTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#98a1c0',
    marginTop: '0.5rem',
  },
  fallbackCard: {
    background: '#1a1b1f',
    border: '1px solid #2d2f36',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '2rem',
    alignItems: 'start',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.5rem',
  },
  monitorStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  monitorWrapper: {
    position: 'relative',
  },
  pairMeta: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.5rem',
    zIndex: 10,
  },
  badge: {
    background: '#2d2f36',
    color: '#3894ff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    border: '1px solid #3894ff',
  },
};