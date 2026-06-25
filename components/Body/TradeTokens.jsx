import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { TradingContext } from '../../context/TradingContext';
import { ERC20_ABI } from '../../utils/apiFeature';

export default function TradeTokens() {
  const { account } = useContext(TradingContext);
  const [tokenAddress, setTokenAddress] = useState('');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (e) => {
    e.preventDefault();

    if (!window.ethereum) return alert('MetaMask wallet context not found.');
    if (!ethers.utils.isAddress(tokenAddress) || !ethers.utils.isAddress(spenderAddress)) {
      return alert('Please verify structural integrity of inputs.');
    }

    setIsProcessing(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Instantiate target ERC-20 reference token
      const erc20Contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      // Parse transaction scale (Assumes standard 18 decimals default payload)
      const parsedAmount = ethers.utils.parseEther(amount);

      console.log(`[TX CALL] Granting allowance limit for spender: ${spenderAddress}`);
      const tx = await erc20Contract.approve(spenderAddress, parsedAmount);
      
      alert(`Transaction broadcast! Hash: ${tx.hash}. Awaiting block inclusion...`);
      await tx.wait();
      
      alert('Allowance allocation confirmed on-chain successfully!');
      setAmount('');
    } catch (err) {
      console.error('ERC20 Approval pipeline crash:', err);
      alert(`Execution failed: ${err.message || 'Check browser terminal log console.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🔓 Token Infrastructure Authorization</h3>
      <p style={styles.subtitle}>
        Configure allowances allowing target liquidity router contracts to interact with your specific ERC-20 asset balances.
      </p>

      <form onSubmit={handleApprove} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Target Asset Contract Address</label>
          <input 
            type="text" 
            style={styles.input}
            placeholder="0x..." 
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Liquidity Router / Spender Address</label>
          <input 
            type="text" 
            style={styles.input}
            placeholder="0x..." 
            value={spenderAddress}
            onChange={(e) => setSpenderAddress(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Approval Scale Allocation Amount</label>
          <input 
            type="text" 
            style={styles.input}
            placeholder="100.0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            ...styles.btn, 
            background: isProcessing ? '#2d2f36' : '#3894ff',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }} 
          disabled={isProcessing || !account}
        >
          {!account ? 'Connect System Wallet to Sign' : isProcessing ? 'Processing Contract Signatures...' : 'Authorize Liquidity Path'}
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
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    marginTop: '0.5rem',
    transition: 'background 0.2s ease'
  }
};