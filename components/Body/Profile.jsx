import React, { useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TradingContext } from '../../context/TradingContext';
import { shortenAddress } from '../../utils/apiFeature';

export default function Profile() {
  const { account } = useContext(TradingContext);
  const [balance, setBalance] = useState('0.00');
  const [networkName, setNetworkName] = useState('Unknown Network');

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!account || !window.ethereum) return;
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Fetch native token balance
        const rawBalance = await provider.getBalance(account);
        setBalance(parseFloat(ethers.utils.formatEther(rawBalance)).toFixed(4));

        // Fetch connected chain metadata
        const network = await provider.getNetwork();
        setNetworkName(network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name);
      } catch (err) {
        console.error('Failed to resolve account profile meta:', err);
      }
    };

    fetchAccountData();
    
    // Listen for manual account or chain switches in MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', fetchAccountData);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, [account]);

  if (!account) {
    return (
      <div style={styles.card}>
        <h3 style={styles.title}>👤 Trader Profile</h3>
        <p style={{ color: '#98a1c0', fontSize: '0.85rem' }}>
          Connect your Web3 terminal wallet interface to populate administrative profile analytics.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>🤖</div>
          <div>
            <h3 style={styles.title}>Active Bot Operator</h3>
            <span style={styles.addressBadge}>{shortenAddress(account)}</span>
          </div>
        </div>
        <span style={styles.statusTag}>Authorized</span>
      </div>

      <div style={styles.divider} />

      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Connected Network</span>
          <span style={styles.statValue}>{networkName}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Native Balance</span>
          <span style={styles.statValue}>{balance} ETH/MATIC</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Strategy Guard Status</span>
          <span style={{ ...styles.statValue, color: '#4edf7a' }}>Active</span>
        </div>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#2d2f36',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  addressBadge: {
    display: 'inline-block',
    background: '#0d0e12',
    color: '#98a1c0',
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '6px',
    marginTop: '0.25rem',
    fontFamily: 'monospace'
  },
  statusTag: {
    background: 'rgba(56, 148, 255, 0.1)',
    color: '#3894ff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  divider: {
    height: '1px',
    background: '#2d2f36',
    margin: '1.25rem 0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem'
  },
  statBox: {
    background: '#0d0e12',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #2d2f36',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#98a1c0'
  },
  statValue: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  }
};