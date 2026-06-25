const { ethers } = require('ethers');

class TradingBotEngine {
  constructor(routerContract, wallet) {
    this.routerContract = routerContract;
    this.wallet = wallet;
    this.activeStrategies = new Map(); // Tracks live running jobs by ID
  }

  // Initialize a new automated tracking cycle
  startLimitOrderStrategy(strategyId, { tokenIn, tokenOut, amountIn, targetPrice, type }) {
    console.log(`[BOT ENGINE] Strategy ${strategyId} started for ${type} order.`);
    
    const intervalId = setInterval(async () => {
      try {
        const parsedAmountIn = ethers.utils.parseEther(amountIn);
        const amounts = await this.routerContract.getAmountsOut(parsedAmountIn, [tokenIn, tokenOut]);
        const currentOutput = parseFloat(ethers.utils.formatEther(amounts[1]));

        console.log(`[MONITOR - ${strategyId}] Target: ${targetPrice} | Current: ${currentOutput}`);

        // Strategy Logic
        if (type === 'BUY' && currentOutput >= parseFloat(targetPrice)) {
          console.log(`[TRIGGER] Target buying yield met! Executing Swap...`);
          clearInterval(intervalId);
          await this.executeTrade(parsedAmountIn, amounts[1], [tokenIn, tokenOut]);
          this.activeStrategies.delete(strategyId);
        } else if (type === 'SELL' && currentOutput <= parseFloat(targetPrice)) {
          console.log(`[TRIGGER] Target stop loss / exit met! Executing Swap...`);
          clearInterval(intervalId);
          await this.executeTrade(parsedAmountIn, amounts[1], [tokenIn, tokenOut]);
          this.activeStrategies.delete(strategyId);
        }

      } catch (error) {
        console.error(`[ENGINE ERROR] Strategy ${strategyId} failed cycle check:`, error.message);
      }
    }, 15000); // Polls chain states every 15 seconds

    this.activeStrategies.set(strategyId, intervalId);
  }

  stopStrategy(strategyId) {
    if (this.activeStrategies.has(strategyId)) {
      clearInterval(this.activeStrategies.get(strategyId));
      this.activeStrategies.delete(strategyId);
      console.log(`[BOT ENGINE] Strategy ${strategyId} manually halted.`);
      return true;
    }
    return false;
  }

  async executeTrade(amountIn, amountOutMin, path) {
    try {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 5; 
      const tx = await this.routerContract.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        this.wallet.address,
        deadline,
        { gasLimit: 250000 }
      );
      const receipt = await tx.wait();
      console.log(`[SUCCESS] Automated order completed! Tx Hash: ${receipt.transactionHash}`);
    } catch (err) {
      console.error("[CRITICAL] Automated trade execution failed:", err);
    }
  }
}

module.exports = TradingBotEngine;