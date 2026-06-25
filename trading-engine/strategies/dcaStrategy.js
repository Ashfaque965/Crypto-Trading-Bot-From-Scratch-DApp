const { ethers } = require('ethers');
const { executeAutomatedTokenSwap } = require('../../backend/bot/tradeExecutor');
const { getOnChainPriceExchangeRate } = require('../../backend/oracles/priceAggregator');

class DollarCostAveragingStrategy {
  /**
   * Instantiates a DCA Accumulation Plan
   * @param {Object} params - Strategic parameter configuration block
   * @param {string} params.privateKey - Execution wallet signing credentials
   * @param {number} params.chainId - Operating blockchain network identifier
   * @param {string} params.baseToken - Asset contract address used to buy (e.g., USDC)
   * @param {string} params.targetToken - Asset contract address being accumulated (e.g., WETH)
   * @param {string|number} params.allocationPerTranche - Size of each discrete purchase block (e.g., "50.0")
   * @param {number} params.maxTrancheCount - Total number of accumulation steps before termination
   */
  constructor({
    privateKey,
    chainId = 137,
    baseToken,
    targetToken,
    allocationPerTranche,
    maxTrancheCount
  }) {
    this.privateKey = privateKey;
    this.chainId = chainId;
    this.baseToken = baseToken;
    this.targetToken = targetToken;
    this.allocationPerTranche = allocationPerTranche.toString();
    this.maxTrancheCount = parseInt(maxTrancheCount, 10);

    // Dynamic ledger state tracking parameters
    this.completedTranches = 0;
    this.totalBaseSpent = 0;
    this.totalTargetAcquired = 0;
    this.averageEntryPrice = 0;
  }

  /**
   * Triggers a single discrete purchase interval calculation and execution pipeline
   * @returns {Promise<Object>} Execution metrics summary log for this tranche
   */
  async executeTrancheInterval() {
    console.log(`\n[DCA STRATEGY TICK] Initializing Tranche ${this.completedTranches + 1} of ${this.maxTrancheCount}`);

    if (this.completedTranches >= this.maxTrancheCount) {
      console.log('🏁 [DCA COMPLETE] Maximum target allocation count reached. Strategy loop idling.');
      return { success: false, status: 'STRATEGY_COMPLETED' };
    }

    try {
      // 1. Fetch live market price benchmarks via on-chain oracles
      const marketQuote = await getOnChainPriceExchangeRate(
        this.baseToken,
        this.targetToken,
        this.allocationPerTranche,
        this.chainId
      );

      if (!marketQuote.success) {
        throw new Error(`Oracle route check dropped: ${marketQuote.error}`);
      }

      console.log(`[DCA PRICE CHECK] Quoted Value: ${this.allocationPerTranche} Input Token yields approx ${marketQuote.amountOut} Target Token units.`);

      // 2. Dispatch atomic contract interaction payload via router networks
      const receipt = await executeAutomatedTokenSwap({
        privateKey: this.privateKey,
        tokenIn: this.baseToken,
        tokenOut: this.targetToken,
        amountInRaw: this.allocationPerTranche,
        minAmountOutRaw: '0', // Adjust slippage arrays appropriately in live production
        chainId: this.chainId,
        gasSpeedPreset: 'fast'
      });

      if (!receipt.success) {
        throw new Error(`Execution router dropped transaction: ${receipt.error}`);
      }

      // 3. Update dynamic performance metrics ledger upon successful transaction mining
      this.completedTranches += 1;
      
      const unitsSpent = parseFloat(this.allocationPerTranche);
      const unitsAcquired = parseFloat(marketQuote.amountOut);

      this.totalBaseSpent += unitsSpent;
      this.totalTargetAcquired += unitsAcquired;
      
      // Calculate adjusted weighted cost basis values
      this.averageEntryPrice = this.totalBaseSpent / this.totalTargetAcquired;

      console.log(`✅ [TRANCHE CONFIRMED] Hash Anchor: ${receipt.transactionHash}`);
      console.log(`📊 [REBALANCED LEDGER] Total Spent: ${this.totalBaseSpent} | Total Acquired: ${this.totalTargetAcquired} | Weighted Avg Cost: $${this.averageEntryPrice.toFixed(4)}`);

      return {
        success: true,
        status: 'TRANCHE_SUCCESS',
        trancheIndex: this.completedTranches,
        transactionHash: receipt.transactionHash,
        averageEntryPrice: this.averageEntryPrice.toString()
      };

    } catch (error) {
      console.error(`❌ [DCA INTERVAL FAILURE] Step execution dropped at tranche index ${this.completedTranches + 1}:`, error.message);
      return {
        success: false,
        status: 'TRANCHE_FAILED',
        error: error.message
      };
    }
  }

  /**
   * Inspects current strategic allocation statistics summary blocks
   */
  getStrategyMetricsReport() {
    return {
      progress: `${this.completedTranches}/${this.maxTrancheCount}`,
      totalCapitalSpent: this.totalBaseSpent.toFixed(2),
      totalAssetAccumulated: this.totalTargetAcquired.toFixed(6),
      dollarCostAveragePrice: this.averageEntryPrice.toFixed(4),
      isPlanFinished: this.completedTranches >= this.maxTrancheCount
    };
  }
}

module.exports = {
  DollarCostAveragingStrategy
};