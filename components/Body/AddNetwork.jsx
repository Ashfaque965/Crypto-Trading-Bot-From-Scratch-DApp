import React, { useState } from 'react';

// Common network configuration structures for MetaMask injection
const NETWORK_PARAMS = {
  POLYGON: {
    chainId: '0x89', // 137 in decimal
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in decimal
    chainName: 'Sepolia Test Network',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
};

export default function AddNetwork() {
  const [loadingNetwork, setLoadingNetwork] = useState(null);

  const handleSwitchOrAddNetwork = async (networkKey) => {
    if (!window.ethereum) return alert('Please install MetaMask to switch networks!');
    
    const targetNetwork = NETWORK_PARAMS[networkKey];
    setLoadingNetwork(networkKey);

    try {
      // Attempt to switch to the network if it already exists in user's wallet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
    } catch (switchError) {
      // Error code 4902 indicates that the chain has not been added to MetaMask yet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetNetwork],
          });
        } catch (addError) {
          console.error('Failed to add the new network configuration:', addError);
        }
      } else {
        console.error('Failed to switch to target chain:', switchError);
      }
    } finally {
      setLoadingNetwork(null);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🌐 Network Configurations</h3>
      <p style={styles.subtitle}>
        Quickly align your active MetaMask node provider network with your system's environment strategy parameters.
      </p>

      <div style={styles.buttonContainer}>
        <button 
          style={{ ...styles.btn, borderColor: '#8247e5' }}
          onClick={() => handleSwitchOrAddNetwork('POLYGON')}
          disabled={loadingNetwork !== null}
        >
          {loadingNetwork === 'POLYGON' ? 'Syncing Polygon...' : 'Switch to Polygon'}
        </button>

        <button 
          style={{ ...styles.btn, borderColor: '#f3ba2f' }}
          onClick={() => handleSwitchOrAddNetwork('SEPOLIA')}
          disabled={loadingNetwork !== null}
        >
          {loadingNetwork === 'SEPOLIA' ? 'Syncing Sepolia...' : 'Switch to Sepolia (Testnet)'}
        </button>
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
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#98a1c0',
    marginBottom: '1.5rem',
    lineHeight: '1.4'
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  btn: {
    background: '#0d0e12',
    color: '#fff',
    border: '1px solid',
    padding: '0.6rem 1.2rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'transform 0.2s ease, background 0.2s ease',
    flex: '1',
    minWidth: '160px'
  }
};