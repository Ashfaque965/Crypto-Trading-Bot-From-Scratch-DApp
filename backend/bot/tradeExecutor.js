const { ethers } = require('ethers');
const { getStaticWalletSigner } = require('../../blockchain/provider');
const { getV2RouterContract, getERC20Contract } = require('../../blockchain/contracts');
const { DEX_ROUTERS } = require('../oracles/priceAggregator');

/**
 * Executes a definitive atomic token swap on-chain via automated router pipelines
 * @param {Object} executionParams - Parameter config block for the active trade
 * @param {string} executionParams.privateKey - Backing key for automation account signing
 * @param {string} executionParams.tokenIn - Asset contract being sold
 * @param {string} executionParams.tokenOut - Asset contract being purchased
 * @param {string} executionParams.amountInRaw - Human readable unit quantity to swap (e.g. "1.5")
 * @param {string} executionParams.minAmountOutRaw - Minimum asset yield threshold accepted (Slippage Guard)
 * @param {number} executionParams.chainId - Active network identifier (Defaults to 137 Polygon)
 * @param {number} executionParams.tokenInDecimals - Decimals of base asset (Defaults to 18)
 * @param {number} executionParams.tokenOutDecimals - Decimals of target asset (Defaults to 18)
 * @param {string} executionParams.gasSpeedPreset - Priority speed override level ("standard"|"fast"|"instant")
 * @returns {Promise<Object>} Execution receipt metadata containing tx hash anchors
 */
const executeAutomatedTokenSwap = async ({
  privateKey,
  tokenIn,
  tokenOut,
  amountInRaw,
  minAmountOutRaw = '0',
  chainId = 137,
  tokenInDecimals = 18,
  tokenOutDecimals = 18,
  gasSpeedPreset = 'fast'
}) => {
  try {
    // 1. Initialize authorized wallet signer and map routing contract paths
    const walletSigner = getStaticWalletSigner(privateKey, chainId);
    const traderAddress = await walletSigner.getAddress();
    
    const routerConfig = DEX_ROUTERS[parseInt(chainId, 10)];
    if (!routerConfig) {
      throw new Error(`Execution aborted: Missing router deployments for chain ID ${chainId}`);
    }

    const routerContract = getV2RouterContract(routerConfig.address, walletSigner);
    const tokenInContract = getERC20Contract(tokenIn, walletSigner);

    // 2. Parse human-readable input units into systemic big integers
    const parsedAmountIn = ethers.utils.parseUnits(amountInRaw.toString(), tokenInDecimals);
    const parsedMinAmountOut = ethers.utils.parseUnits(minAmountOutRaw.toString(), tokenOutDecimals);

    // 3. Verify on-chain balance levels before sending gas
    const walletBalance = await tokenInContract.balanceOf(traderAddress);
    if (walletBalance.lt(parsedAmountIn)) {
      throw new Error(`Insufficient Token Balance: Wallet has ${ethers.utils.formatUnits(walletBalance, tokenInDecimals)}, requested ${amountInRaw}`);
    }

    // 4. Validate current router allowance allocation
    const currentAllowance = await tokenInContract.allowance(traderAddress, routerConfig.address);
    if (currentAllowance.lt(parsedAmountIn)) {
      throw new Error(`Insufficient Allowance: Please sign an ERC-20 approval transaction for Router ${routerConfig.address} first.`);
    }

    // 5. Build transaction parameters (Dynamic Deadlines and Gas Speed Tweaking)
    const txDeadline = Math.floor(Date.now() / 1000) + 1200; // 20-minute validity pool fallback window
    const linearExecutionPath = [tokenIn, tokenOut];

    // Read blockchain base fees to scale overrides safely
    const baseGasPrice = await walletSigner.provider.getGasPrice();
    let gasPriceOverride = baseGasPrice;

    if (gasSpeedPreset === 'fast') {
      gasPriceOverride = baseGasPrice.mul(110).div(100); // Premium padding scale +10%
    } else if (gasSpeedPreset === 'instant') {
      gasPriceOverride = baseGasPrice.mul(125).div(100); // Frontrun mitigation layout +25%
    }

    console.log(`[ENGINE ACTION] Transmitting swap token route request to ${routerConfig.name}...`);
    console.log(`[TARGET WALLET] Signer Operator: ${traderAddress}`);

    // 6. Dispatch transaction payload directly to network pools
    const transactionResponse = await routerContract.swapExactTokensForTokens(
      parsedAmountIn,
      parsedMinAmountOut,
      linearExecutionPath,
      traderAddress,
      txDeadline,
      {
        gasPrice: gasPriceOverride,
        gasLimit: 300000 // Standard safety margin bound for standard AMM interactions
      }
    );

    console.log(`[BROADCAST SUCCESS] Tx dispatched successfully. Hash Anchor: ${transactionResponse.hash}`);
    
    // 7. Await mining and block inclusion cycles
    const executionReceipt = await transactionResponse.wait();

    return {
      success: true,
      transactionHash: executionReceipt.transactionHash,
      blockNumber: executionReceipt.blockNumber,
      gasUsed: executionReceipt.gasUsed.toString(),
      status: 'CONFIRMED_ON_CHAIN'
    };

  } catch (error) {
    console.error('Core Trade Executor System Crash:', error.message);
    return {
      success: false,
      error: error.message || 'Unknown network error inside active node runtime execution chains.',
      status: 'FAILED'
    };
  }
};

module.exports = {
  executeAutomatedTokenSwap
};
