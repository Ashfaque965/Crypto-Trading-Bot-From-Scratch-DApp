const { getConnectedProvider } = require('../blockchain/provider');
const { getOnChainPriceExchangeRate } = require('../backend/oracles/priceAggregator');
const { executeAutomatedTokenSwap } = require('../backend/bot/tradeExecutor');
const { checkRiskThresholdBreach } = require('../backend/risk/stopLoss');
const { calculatePositionPnL } = require('../backend/portfolio/pnlCalculator');

class TradingEngine {
  /**
   * Instantiates the core automated execution engine
   * @param {Object} config - Configuration object parameters
   * @param {string} config.privateKey - Execution wallet signing credentials
   * @param {number} config.chainId - Operating blockchain network profile identifier
   * @param {number} config.pollIntervalMs - Time between blockchain oracle state checks (e.g. 10000)
   */
  constructor(config) {
    this.privateKey = config.privateKey;
    this.chainId = config.chainId || 137;
    this.pollIntervalMs = config.pollIntervalMs || 15000;
    
    this.isActive = false;
    this.executionTimer = null;
    this.trackedPositions = new Map(); // Tracks active asset allocations on-chain
  }

  /**
   * Registers a target token asset into the risk engine monitor pool
   */
  trackAssetPosition(tokenIn, tokenOut, entryPrice, tokenAmount, stopLossPercent) {
    const positionKey = `${tokenIn.toLowerCase()}_${tokenOut.toLowerCase()}`;
    this.trackedPositions.set(positionKey, {
      tokenIn,
      tokenOut,
      entryPrice,
      tokenAmount,
      stopLossPercent,
      highestPriceSeen: entryPrice
    });
    console.log(`[ENGINE INITIALIZATION] Now auditing risk vectors for pair track: ${positionKey}`);
  }

  /**
   * Starts the automated background ledger evaluation thread
   */
  startEngineLoop() {
    if (this.isActive) return;
    this.isActive = true;
    console.log(`[ENGINE START] Bootstrapping automated strategy polling... Check interval: ${this.pollIntervalMs}ms`);
    
    this.executionTimer = setInterval(() => this.executeStrategyCycle(), this.pollIntervalMs);
  }

  /**
   * Core processing loop evaluating state conditions on every timer pulse
   */
  async executeStrategyCycle() {
    console.log(`\n[CYCLE RUN] Executing systemic evaluation tick... Timestamp: ${new Date().toLocaleTimeString()}`);

    for (const [key, position] of this.trackedPositions.entries()) {
      try {
        // 1. Fetch real-time on-chain oracle valuation weights
        const priceQuote = await getOnChainPriceExchangeRate(
          position.tokenIn,
          position.tokenOut,
          '1',
          this.chainId
        );

        if (!priceQuote.success) {
          console.warn(`[ORACLE FAILURE] Skipping calculation matrix for ${key} due to node communication drop.`);
          continue;
        }

        const currentLivePrice = parseFloat(priceQuote.amountOut);
        
        // Update dynamic data points for trailing mechanisms
        if (currentLivePrice > position.highestPriceSeen) {
          position.highestPriceSeen = currentLivePrice;
        }

        // 2. Perform matrix ledger calculations
        const pnlSummary = calculatePositionPnL(position.entryPrice, currentLivePrice, position.tokenAmount);
        console.log(`[AUDIT - ${key}] Live Val: $${currentLivePrice} | Return Spread: ${pnlSummary.percentagePnL}% (${pnlSummary.performanceLabel})`);

        // 3. Submit variables to risk mitigation guardrails
        const riskVerdict = checkRiskThresholdBreach({
          currentPrice: currentLivePrice,
          entryPrice: position.entryPrice,
          stopLossPercent: position.stopLossPercent,
          trailingData: {
            highestPriceSeen: position.highestPriceSeen,
            trailingStopPercent: position.stopLossPercent // Re-use buffer configuration
          }
        });

        // 4. Handle emergency exit commands immediately
        if (riskVerdict.triggerExit) {
          console.error(`🚨 [RISK ALERT] Emergency condition triggered: ${riskVerdict.reason}`);
          await this.triggerEmergencyMarketExit(key, position);
        }

      } catch (cycleError) {
        console.error(`[CRITICAL CYCLE FAULT] Failed to evaluate position key context: ${key}`, cycleError.message);
      }
    }
  }

  /**
   * Fires atomic balance liquidation commands to clear volatile parameters out of risk pools
   */
  async triggerEmergencyMarketExit(positionKey, position) {
    console.warn(`[LIQUIDATION ROUTE] Dispatching atomic block swap to dump asset holdings for: ${positionKey}`);
    
    this.trackedPositions.delete(positionKey); // Drop tracking context immediately to avoid multiple tx calls

    const receipt = await executeAutomatedTokenSwap({
      privateKey: this.privateKey,
      tokenIn: position.tokenOut, // Swap back out of target asset
      tokenOut: position.tokenIn, // Convert back to base stablecoin/native gas token
      amountInRaw: position.tokenAmount,
      minAmountOutRaw: '0', // Adjust to protect slippage profiles if liquidity is dense
      chainId: this.chainId,
      gasSpeedPreset: 'instant' // Force transaction priority via gas multipliers
    });

    if (receipt.success) {
      console.log(`✅ [LIQUIDATION CONFIRMED] Hard exit executed successfully. Tx Anchor: ${receipt.transactionHash}`);
    } else {
      console.error(`❌ [EXECUTION FAULT] Asset clearing dropped on-chain: ${receipt.error}`);
    }
  }

  /**
   * Safely halts background monitoring tasks
   */
  stopEngineLoop() {
    if (this.executionTimer) {
      clearInterval(this.executionTimer);
      this.isActive = false;
      console.log('[ENGINE SHUTDOWN] Internal monitoring pipelines paused safely.');
    }
  }
}

module.exports = {
  TradingEngine
};