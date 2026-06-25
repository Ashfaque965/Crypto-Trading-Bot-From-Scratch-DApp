import React from 'react';

const NETWORK_LIST = [
  {
    name: 'Ethereum Mainnet',
    chainId: '1 (0x1)',
    rpcUrl: 'https://cloudflare-eth.com',
    explorer: 'https://etherscan.io',
    color: '#627EEA',
    status: 'Operational'
  },
  {
    name: 'Polygon PoS',
    chainId: '137 (0x89)',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    color: '#8247E5',
    status: 'Operational'
  },
  {
    name: 'Arbitrum One',
    chainId: '42161 (0xa4b1)',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    color: '#28A0F0',
    status: 'Operational'
  },
  {
    name: 'Optimism Mainnet',
    chainId: '10 (0xa)',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    color: '#FF0420',
    status: 'Operational'
  }
];

export default function Networks() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🌐 Ecosystem Infrastructure Hub</h3>
        <p style={styles.subtitle}>
          Review network status parameters, standard fallback RPC execution layers, and cryptographic block confirmation paths.
        </p>
      </div>

      <div style={styles.grid}>
        {NETWORK_LIST.map((network, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.networkNameContainer}>
                <span style={{ ...styles.indicator, backgroundColor: network.color }} />
                <h4 style={styles.networkName}>{network.name}</h4>
              </div>
              <span style={styles.statusBadge}>{network.status}</span>
            </div>

            <div style={styles.infoStack}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Chain ID</span>
                <span style={styles.infoValue}>{network.chainId}</span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>RPC Node</span>
                <span style={{ ...styles.infoValue, ...styles.truncate }} title={network.rpcUrl}>
                  {network.rpcUrl}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Block Explorer</span>
                <a 
                  href={network.explorer} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={styles.link}
                >
                  Launch Explorer ↗
                </a>
              </div>
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
    marginBottom: '1.25rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#98a1c0',
    lineHeight: '1.4',
    marginTop: '0.3rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  card: {
    background: '#1a1b1f',
    border: '1px solid #2d2f36',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2d2f36',
    paddingBottom: '0.75rem'
  },
  networkNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  networkName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff'
  },
  statusBadge: {
    background: 'rgba(78, 223, 122, 0.1)',
    color: '#4edf7a',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  infoStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    alignItems: 'center'
  },
  infoLabel: {
    color: '#98a1c0'
  },
  infoValue: {
    color: '#fff',
    fontWeight: '500'
  },
  truncate: {
    maxWidth: '160px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  link: {
    color: '#3894ff',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  }
};