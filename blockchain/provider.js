const { ethers } = require('ethers');

// Fallback public RPC nodes to maintain active metrics streaming if MetaMask drops connection
const RPC_FALLBACKS = {
  1: 'https://cloudflare-eth.com',                        // Ethereum Mainnet
  137: 'https://polygon-rpc.com',                        // Polygon PoS
  42161: 'https://arb1.arbitrum.io/rpc',                 // Arbitrum One
  11155111: 'https://rpc.sepolia.org'                    // Sepolia Testnet
};

/**
 * Initializes a Read-Only JsonRpcProvider using backup node clusters
 * Ideal for backend server script execution and macro pricing oracle polling
 * @param {number|string} chainId - Target network chain ID configuration
 * @returns {ethers.providers.JsonRpcProvider}
 */
const getFallbackProvider = (chainId) => {
  const targetId = parseInt(chainId, 10);
  const rpcUrl = RPC_FALLBACKS[targetId] || RPC_FALLBACKS[1]; // Fallback to mainnet if unmapped
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

/**
 * Resolves the operational client-side provider state
 * Binds browser window contexts (MetaMask) or fallback RPC clusters into a single unified client
 * @returns {ethers.providers.Web3Provider|ethers.providers.JsonRpcProvider}
 */
const getConnectedProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  // Server-side fallback or default browser environment with no extension
  console.warn('Web3 browser extension missing. Dropping context down to Ethereum baseline fallback RPC node.');
  return getFallbackProvider(1);
};

/**
 * Abstract signer helper utilities to automatically sign execution payloads
 * @param {string} dynamicPrivateKey - Wallet private keys (for server-side/backend automation scripts)
 * @param {number} chainId - Target network target identifier
 * @returns {ethers.Wallet}
 */
const getStaticWalletSigner = (dynamicPrivateKey, chainId = 137) => {
  if (!dynamicPrivateKey) {
    throw new Error('Fatal Engine Error: Private execution key missing inside active configuration runtime.');
  }
  const provider = getFallbackProvider(chainId);
  return new ethers.Wallet(dynamicPrivateKey, provider);
};

module.exports = {
  RPC_FALLBACKS,
  getFallbackProvider,
  getConnectedProvider,
  getStaticWalletSigner
};