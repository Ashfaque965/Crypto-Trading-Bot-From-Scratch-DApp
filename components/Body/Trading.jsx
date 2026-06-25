import React, { useState, useEffect, useContext } from 'react';
import { TradingContext } from '../../context/TradingContext';
import { shortenAddress } from '../../utils/apiFeature';

export default function Trading() {
  const { account, loading } = useContext(TradingContext);
  const [tradeLogs, setTradeLogs] = useState([]);

  // Mock initial tracking state for demonstration
  useEffect(() => {
    if (account) {
      setTradeLogs([
        {
          id: 'tx_01',
          timestamp: new Date().toLocaleTimeString(),
          pair: 'WMATIC / USDT',
          type: 'BUY',
          amount: '10.0',
          status: 'SUCCESS',
          txHash: '0x32a1f...4e89'
        },
        {
          id: 'tx_02',
          timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
          pair: 'WETH / USDC',
          type: 'SELL',
          amount: '0.5',
          status: 'SUCCESS',
          txHash: '0x7b8c1...91fa'
        }
      ]);
    }
  }, [account]);

  const handleClearLogs = () => {
    setTradeLogs([]);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>⚡ Live Execution Audit Ledger</h3>
          <p style={styles.subtitle}>
            Monitor active algorithmic bot interactions, pipeline execution logs, and live on-chain confirmations.
          </p>
        </div>
        {tradeLogs.length > 0 && (
          <button style={styles.clearBtn} onClick={handleClearLogs}>
            Clear Audit History
          </button>
        )}
      </div>

      {loading && (
        <div style={styles.loadingBanner}>
          <span style={styles.spinner}>⏳</span> Engine Core interacting with blockchain router nodes...
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>Asset Pair</th>
              <th style={styles.th}>Direction</th>
              <th style={styles.th}>Execution Size</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Transaction Anchor</th>
            </tr>
          </thead>
          <tbody>
            {tradeLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyState}>
                  {!account 
                    ? 'Sync terminal credentials to initialize historical analytics pipeline.' 
                    : 'No automated trades intercepted in this session window.'}
                </td>
              </tr>
            ) : (
              tradeLogs.map((log) => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}>{log.timestamp}</td>
                  <td style={styles.td}>
                    <span style={styles.pairText}>{log.pair}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.typeBadge,
                      color: log.type === 'BUY' ? '#4edf7a' : '#ff4d4d',
                      background: log.type === 'BUY' ? 'rgba(78, 223, 122, 0.1)' : 'rgba(255, 77, 77, 0.1)'
                    }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={styles.td}>{log.amount}</td>
                  <td style={styles.td}>
                    <span style={styles.statusDot}>🟢 {log.status}</span>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.hashLink} title={log.txHash}>{log.txHash}</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a1b1f',
    border: '1px solid #2d2f36',
    borderRadius: '16px',
    padding: '1.5rem',
    color: '#fff',
    marginTop: '1.5rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'span-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#98a1c0',
    lineHeight: '1.4',
    marginTop: '0.25rem'
  },
  clearBtn: {
    background: 'none',
    border: '1px solid #ff4d4d',
    color: '#ff4d4d',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  loadingBanner: {
    background: 'rgba(56, 148, 255, 0.1)',
    border: '1px solid #3894ff',
    color: '#3894ff',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  spinner: {
    display: 'inline-block'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    borderBottom: '1px solid #2d2f36',
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    color: '#98a1c0',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  tr: {
    borderBottom: '1px solid #2d2f36',
    background: '#131417'
  },
  td: {
    padding: '1rem',
    fontSize: '0.85rem'
  },
  pairText: {
    fontWeight: '600',
    color: '#fff'
  },
  typeBadge: {
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  statusDot: {
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  hashLink: {
    fontFamily: 'monospace',
    color: '#3894ff',
    background: '#0d0e12',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '2.5rem',
    color: '#98a1c0',
    fontSize: '0.85rem',
    fontStyle: 'italic'
  }
};