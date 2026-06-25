import React, { useContext } from 'react';
import { TradingContext } from '../context/TradingContext';
import { shortenAddress } from '../utils/apiFeature';

export default function Navbar() {
  const { account, connectWallet } = useContext(TradingContext);
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: '#1a1b1f', borderBottom: '1px solid #2d2f36' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3894ff' }}>🤖 DeBot Pro</div>
      <button onClick={connectWallet} style={{ background: '#3894ff', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer' }}>
        {account ? `🟢 ${shortenAddress(account)}` : "Connect Wallet"}
      </button>
    </nav>
  );
}