import React from 'react';
import { shortenAddress } from '../../utils/apiFeature';

const EXCHANGE_TOKENS = [
  {
    name: 'Uniswap Governance Token',
    symbol: 'UNI',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    ecosystem: 'Ethereum Ecosystem',
    platform: 'Uniswap V2 / V3 Router'
  },
  {
    name: 'SushiToken',
    symbol: 'SUSHI',
    address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fe2',
    ecosystem: 'Cross-Chain Deployed',
    platform: 'Sushiswap AMM Core'
  },
  {
    name: 'PancakeSwap Token',
    symbol: 'CAKE',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    ecosystem: 'BNB Smart Chain',
    platform: 'PancakeSwap V2 Router'
  },
  {
    name: 'QuickSwap Token',
    symbol: 'QUICK',
    address: '0x831753DD7087CaC61aFa5604030361152D1E834a',
    ecosystem: 'Polygon L2 Matrix',
    platform: 'QuickSwap V2 Factory'
  }
];

export default function TopExchangeTokens() {
  
  const handleCopyToClipboard = (address) => {
    navigator.clipboard.writeText(address);
    alert('Cryptographic token address copied to execution clipboard!');
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>🏆 High-Liquidity DEX Protocol Assets</h3>
        <p style={styles.subtitle}>
          Quick-reference baseline contract addresses for foundational decentralized automated market maker governance tokens.
        </p>
      </div>

      <div style={styles.tableResponsive}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Asset Meta</th>
              <th style={styles.th}>Contract Registry</th>
              <th style={styles.th}>Ecosystem Track</th>
              <th style={styles.th}>Primary Platform</th>
            </tr>
          </thead>
          <tbody>
            {EXCHANGE_TOKENS.map((token, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.tokenMeta}>
                    <span style={styles.symbolBadge}>{token.symbol}</span>
                    <span style={styles.tokenName}>{token.name}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.addressActionRow}>
                    <code style={styles.code}>{shortenAddress(token.address)}</code>
                    <button 
                      style={styles.copyBtn} 
                      onClick={() => handleCopyToClipboard(token.address)}
                      title="Copy Address"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.ecoText}>{token.ecosystem}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.platformBadge}>{token.platform}</span>
                </td>
              </tr>
            ))}
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
  title: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.4rem'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#98a1c0',
    lineHeight: '1.4',
    marginBottom: '1.5rem'
  },
  tableResponsive: {
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
    transition: 'background 0.2s',
    ':hover': {
      background: '#2d2f36'
    }
  },
  td: {
    padding: '1rem',
    fontSize: '0.85rem',
    verticalAlign: 'middle'
  },
  tokenMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  symbolBadge: {
    background: '#0d0e12',
    border: '1px solid #2d2f36',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: 'bold',
    color: '#3894ff',
    fontSize: '0.75rem'
  },
  tokenName: {
    fontWeight: '500',
    color: '#fff'
  },
  addressActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  code: {
    fontFamily: 'monospace',
    background: '#0d0e12',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#98a1c0'
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '2px',
    outline: 'none'
  },
  ecoText: {
    color: '#98a1c0'
  },
  platformBadge: {
    background: 'rgba(56, 148, 255, 0.05)',
    color: '#3894ff',
    border: '1px solid rgba(56, 148, 255, 0.15)',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem'
  }
};