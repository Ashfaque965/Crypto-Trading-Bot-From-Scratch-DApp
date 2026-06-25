import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI } from '../../utils/apiFeature';

export default function AddTokenPair({ onPairAdded }) {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleRegisterPair = async (e) => {
    e.preventDefault();

    // Structural Hex Check
    if (!ethers.utils.isAddress(tokenA) || !ethers.utils.isAddress(tokenB)) {
      return alert('One or both cryptographic addresses are invalid!');
    }

    if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
      return alert('Token addresses must be distinct!');
    }

    setIsValidating(true);

    try {
      // Connect to the provider injected by the browser (MetaMask)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const contractA = new ethers.Contract(tokenA, ERC20_ABI, provider);
      const contractB = new ethers.Contract(tokenB, ERC20_ABI, provider);

      // Verify token existence on-chain by pulling symbols
      const [symbolA, symbolB] = await Promise.all([
        contractA.symbol().catch(() => 'UNK_A'),
        contractB.symbol().catch(() => 'UNK_B'),
      ]);

      const pairConfig = {
        id: `pair_${Date.now()}`,
        tokenA: ethers.utils.getAddress(tokenA),
        tokenB: ethers.utils.getAddress(tokenB),
        symbolA,
        symbolB,
        label: `${symbolA} / ${symbolB}`
      };

      if (onPairAdded) {
        onPairAdded(pairConfig);
      }

      alert(`Successfully synchronized ${pairConfig.label} engine pair configuration!`);
      setTokenA('');
      setTokenB('');
    } catch (err) {
      console.error(err);
      alert('Failed validating underlying tokens. Make sure your network is aligned.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>⛓️ Register Asset Pair Pipeline</h3>
      <p style={styles.subtitle}>
        Map unique ERC-20 asset deployment contracts to populate your dashboard's index pool streaming configurations.
      </p>

      <form onSubmit={handleRegisterPair} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Base Asset Token Address (In)</label>
          <input 
            type="text" 
            style={styles.input}
            placeholder="0x..." 
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Target Quote Token Address (Out)</label>
          <input 
            type="text" 
            style={styles.input}
            placeholder="0x..." 
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          style={styles.btn} 
          disabled={isValidating}
        >
          {isValidating ? 'Validating Token Standards...' : 'Inject Asset Pair'}
        </button>
      </form>
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
    marginBottom: '1.2rem',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.8rem',
    color: '#98a1c0',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.9rem'
  },
  btn: {
    background: '#3894ff',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    marginTop: '0.5rem',
    transition: 'background 0.2s ease'
  }
};