/**
 * Calculates current profit and loss metrics across tracked portfolio tokens
 * Includes absolute numeric returns, percentage spikes, and net valuation layouts.
 * * @param {Object} positionParams - Structural parameter block for valuation tracking
 * @param {string|number} positionParams.entryPrice - Average cost baseline value token was purchased at
 * @param {string|number} positionParams.currentPrice - Live dynamic asset valuation extracted from Oracle layers
 * @param {string|number} positionParams.tokenAmount - Net volumetric size of current asset pool held
 * @returns {Object} Structured data package detailing net execution performance metrics
 */
const calculatePositionPnL = (entryPrice, currentPrice, tokenAmount) => {
  // Convert standard strings or numbers into operational float primitives
  const costBasisPrice = parseFloat(entryPrice);
  const liveMarketPrice = parseFloat(currentPrice);
  const totalVolumeSize = parseFloat(tokenAmount);

  // Fallback checks against structural mathematical zero division anomalies
  if (isNaN(costBasisPrice) || isNaN(liveMarketPrice) || isNaN(totalVolumeSize) || costBasisPrice <= 0) {
    return {
      success: false,
      error: 'Invalid token position metrics provided for mathematical ledger evaluation.',
      absolutePnL: '0.00',
      percentagePnL: '0.00',
      totalCostBasis: '0.00',
      currentNetValue: '0.00',
      performanceLabel: 'NEUTRAL'
    };
  }

  // Calculate investment parameters using native algebraic foundations
  const totalCostBasis = totalVolumeSize * costBasisPrice;
  const currentNetValue = totalVolumeSize * liveMarketPrice;
  
  const absolutePnL = currentNetValue - totalCostBasis;
  const percentagePnL = (absolutePnL / totalCostBasis) * 100;

  // Assign qualitative risk engine tags based on return spreads
  let performanceLabel = 'NEUTRAL';
  if (percentagePnL > 0.05) {
    performanceLabel = 'PROFIT';
  } else if (percentagePnL < -0.05) {
    performanceLabel = 'LOSS';
  }

  return {
    success: true,
    totalCostBasis: totalCostBasis.toFixed(2),
    currentNetValue: currentNetValue.toFixed(2),
    absolutePnL: absolutePnL.toFixed(2),
    percentagePnL: percentagePnL.toFixed(2),
    performanceLabel
  };
};

/**
 * Aggregates portfolio matrices into centralized dashboard index totals
 * Useful for building total equity curves and real-time dashboard status summaries
 * * @param {Array<Object>} positionsArray - Stack list of active token position metrics
 * @returns {Object} Comprehensive summary metrics layout
 */
const aggregateTotalPortfolioPnL = (positionsArray = []) => {
  let aggregatedCost = 0;
  let aggregatedValue = 0;

  if (!Array.isArray(positionsArray) || positionsArray.length === 0) {
    return {
      totalPortfolioCost: '0.00',
      totalPortfolioValue: '0.00',
      totalNetPnL: '0.00',
      totalReturnPercentage: '0.00'
    };
  }

  positionsArray.forEach(position => {
    const pnlBlock = calculatePositionPnL(position.entryPrice, position.currentPrice, position.tokenAmount);
    if (pnlBlock.success) {
      aggregatedCost += parseFloat(pnlBlock.totalCostBasis);
      aggregatedValue += parseFloat(pnlBlock.currentNetValue);
    }
  });

  const totalNetPnL = aggregatedValue - aggregatedCost;
  const totalReturnPercentage = aggregatedCost > 0 ? (totalNetPnL / aggregatedCost) * 100 : 0;

  return {
    totalPortfolioCost: aggregatedCost.toFixed(2),
    totalPortfolioValue: aggregatedValue.toFixed(2),
    totalNetPnL: totalNetPnL.toFixed(2),
    totalReturnPercentage: totalReturnPercentage.toFixed(2)
  };
};

module.exports = {
  calculatePositionPnL,
  aggregateTotalPortfolioPnL
};