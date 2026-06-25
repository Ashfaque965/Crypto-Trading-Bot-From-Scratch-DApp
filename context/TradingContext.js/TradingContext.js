import React, { createContext, useState, useEffect } from 'react';

export const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not found");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accs => accs.length && setAccount(accs[0]));
    }
  }, []);

  return (
    <TradingContext.Provider value={{ account, connectWallet }}>
      {children}
    </TradingContext.Provider>
  );
};