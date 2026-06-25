const { ethers } = require('ethers');
const { getFallbackProvider } = require('../../blockchain/provider');
const { getV2RouterContract } = require('../../blockchain/contracts');

// Common Router Registry Configurations across EVM environments
const DEX_ROUTERS = {
  1: {
    name: 'Uniswap V2 (Ethereum)',
    address: '0x7a250d5630B4cf539739dF2C5dAcb4c659F2488D'
  },
  137: {
    name: 'QuickSwap (Polygon PoS)',
    address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
  },
  11155111: {
    name: 'Uniswap V2 (Sepolia Testnet)',
    address: '0x7a250d5630B4cf539739dF2C5dAcb4c659F2488D'
  }
};

/**
 * Direct on-chain pricing oracle fetch engine 
 * Pulls current dynamic asset exchange weights directly using getAmountsOut pipelines
 * * @param {string} tokenIn - Base input token deployment address
 * @param {string} tokenOut - Target output token deployment address
 * @param {string|number} amountInRaw - Human readable unit quantity (e.g. "1.0")
 * @param {number} chainId - Operating active network chain ID identifier
 * @param {number} tokenInDecimals - Decimals parameter for base token (Defaults to 18)
 * @param {number} tokenOutDecimals - Decimals parameter for target token (Defaults to 18)
 * @returns {Promise<Object>} Object containing raw and parsed valuation indicators
 */
const getOnChainPriceExchangeRate = async (
  tokenIn,
  tokenOut,
  amountInRaw = '1',
  chainId = 137,
  tokenInDecimals = 18,
  tokenOutDecimals = 18
) => {
  try {
    // 1. Structurally sanitize operational parameters
    if (!ethers.utils.isAddress(tokenIn) || !ethers.utils.isAddress(tokenOut)) {
      throw new Error('Structural error: Target asset parameters are invalid hex arrays.');
    }

    const networkRouter = DEX_ROUTERS[parseInt(chainId, 10)];
    if (!networkRouter) {
      throw new Error(`Execution error: Router array mapping missing for target chain ID ${chainId}`);
    }

    // 2. Instantiate read-only RPC client node pipelines
    const provider = getFallbackProvider(chainId);
    const routerContract = getV2RouterContract(networkRouter.address, provider);

    // 3. Normalize human-readable inputs into big integer parameters
    const parsedAmountIn = ethers.utils.parseUnits(amountInRaw.toString(), tokenInDecimals);

    // Assemble simple linear structural asset path swap matrix
    const structuralPathArray = [tokenIn, tokenOut];

    console.log(`[ORACLE FETCH] Quoting ${amountInRaw} asset path units via ${networkRouter.name}...`);

    // 4. Hit router contract state functions
    const rawAmountsOutArray = await routerContract.getAmountsOut(
      parsedAmountIn,
      structuralPathArray
    );

    // Extract execution index calculations
    const rawOutputWei = rawAmountsOutArray[1];
    const formattedOutputUnits = ethers.utils.formatUnits(rawOutputWei, tokenOutDecimals);

    return {
      success: true,
      routerUsed: networkRouter.name,
      routerAddress: networkRouter.address,
      amountIn: amountInRaw.toString(),
      amountOut: formattedOutputUnits,
      rawAmountOut: rawOutputWei.toString(),
      timestamp: Math.floor(Date.now() / 1000)
    };

  } catch (error) {
    console.error('On-Chain Price Aggregator Core Failure:', error.message);
    return {
      success: false,
      error: error.message,
      amountOut: '0.00'
    };
  }
};

module.exports = {
  DEX_ROUTERS,
  getOnChainPriceExchangeRate
};