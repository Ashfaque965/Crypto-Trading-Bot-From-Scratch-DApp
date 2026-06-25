import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length) setAccount(accounts[0]);
    } catch (error) {
      console.error("No account found", error);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  // Trigger automated backend trade execution
  const executeBotTrade = async (tradeDetails) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/trade', tradeDetails);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      console.error("Trade failed execution", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <TradingContext.Provider value={{ account, connectWallet, executeBotTrade, loading }}>
      {children}
    </TradingContext.Provider>
  );
};