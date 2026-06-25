const { ethers } = require('ethers');

// --- ABI DEFINITIONS ---

// Minimal ERC-20 ABI required for standard asset interactions (metadata and allowances)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// UniswapV2 Router02 minimal interface for reading liquidity routes and executing swaps
const UNISWAP_V2_ROUTER_ABI = [
  'function factory() pure returns (address)',
  'function WETH() pure returns (address)',
  'function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
  'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
];

// UniswapV2 Factory minimal interface for fetching core pair instance addresses
const UNISWAP_V2_FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
  'function allPairs(uint) view returns (address pair)',
  'function allPairsLength() view returns (uint)'
];


// --- CONTRACT INSTANTIATION ENGINE ---

/**
 * Instantiates a standard ERC-20 contract instance
 * @param {string} tokenAddress - Cryptographic deployment address of the token
 * @param {ethers.providers.Provider|ethers.Signer} providerOrSigner - Active connection layer context
 * @returns {ethers.Contract}
 */
const getERC20Contract = (tokenAddress, providerOrSigner) => {
  if (!ethers.utils.isAddress(tokenAddress)) {
    throw new Error(`Invalid ERC-20 token contract pointer address: ${tokenAddress}`);
  }
  return new ethers.Contract(tokenAddress, ERC20_ABI, providerOrSigner);
};

/**
 * Instantiates a standard Automated Market Maker Router (UniswapV2/QuickSwap clones)
 * @param {string} routerAddress - Target router deployment address
 * @param {ethers.providers.Provider|ethers.Signer} providerOrSigner - Active connection layer context
 * @returns {ethers.Contract}
 */
const getV2RouterContract = (routerAddress, providerOrSigner) => {
  if (!ethers.utils.isAddress(routerAddress)) {
    throw new Error(`Invalid Automated Market Maker Router pointer address: ${routerAddress}`);
  }
  return new ethers.Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, providerOrSigner);
};

/**
 * Instantiates a standard factory ledger layout instance
 * @param {string} factoryAddress - Target factory registry deployment address
 * @param {ethers.providers.Provider|ethers.Signer} providerOrSigner - Active connection layer context
 * @returns {ethers.Contract}
 */
const getV2FactoryContract = (factoryAddress, providerOrSigner) => {
  if (!ethers.utils.isAddress(factoryAddress)) {
    throw new Error(`Invalid AMM Factory pointer address: ${factoryAddress}`);
  }
  return new ethers.Contract(factoryAddress, UNISWAP_V2_FACTORY_ABI, providerOrSigner);
};

module.exports = {
  ABIs: {
    ERC20_ABI,
    UNISWAP_V2_ROUTER_ABI,
    UNISWAP_V2_FACTORY_ABI
  },
  getERC20Contract,
  getV2RouterContract,
  getV2FactoryContract
};