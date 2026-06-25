/**
 * Assesses whether an active position has breached risk parameters, triggering an emergency stop-loss exit.
 * Supports both standard fixed stop-loss parameters and modular tracking mechanisms.
 * * @param {Object} riskParams - Structural profile mapping for the target position risk state
 * @param {string|number} riskParams.currentPrice - Live price extracted from direct decentralized AMM Oracles
 * @param {string|number} riskParams.entryPrice - Base cost price recorded at token purchase inception
 * @param {string|number} riskParams.stopLossPercent - Fixed floor drop trigger limit (e.g., 5 meaning 5% down)
 * @param {Object} [riskParams.trailingData] - Extended properties for dynamic trailing risk setups
 * @param {string|number} [riskParams.trailingData.highestPriceSeen] - Peak metric observed since position opened
 * @param {string|number} [riskParams.trailingData.trailingStopPercent] - Dynamic trailing floor drop buffer
 * @returns {Object} Risk evaluation verdict detailing if an emergency market dump is required
 */
const checkRiskThresholdBreach = ({
  currentPrice,
  entryPrice,
  stopLossPercent,
  trailingData = null
}) => {
  const livePrice = parseFloat(currentPrice);
  const costBasis = parseFloat(entryPrice);
  const fixedFloorLimit = parseFloat(stopLossPercent);

  // Structural sanity check against missing initialization markers
  if (isNaN(livePrice) || isNaN(costBasis) || livePrice <= 0 || costBasis <= 0) {
    return { triggerExit: false, reason: 'MALFORMED_METRICS_ERROR' };
  }

  // --- 1. EVALUATE TRAILING STOP PROTECTION ---
  if (trailingData && trailingData.highestPriceSeen && trailingData.trailingStopPercent) {
    const peakPrice = parseFloat(trailingData.highestPriceSeen);
    const trailingBuffer = parseFloat(trailingData.trailingStopPercent);

    if (!isNaN(peakPrice) && !isNaN(trailingBuffer) && peakPrice > 0) {
      // Calculate dynamic liquidation ceiling anchor point
      const trailingFloorPrice = peakPrice * (1 - trailingBuffer / 100);
      
      if (livePrice <= trailingFloorPrice) {
        return {
          triggerExit: true,
          type: 'TRAILING_STOP_LOSS',
          reason: `Asset price ($${livePrice}) breached trailing cost floor ($${trailingFloorPrice.toFixed(4)}) dropped from peak ($${peakPrice}).`
        };
      }
    }
  }

  // --- 2. EVALUATE STANDARD FIXED STOP LOSS ---
  if (!isNaN(fixedFloorLimit) && fixedFloorLimit > 0) {
    const fixedFloorPrice = costBasis * (1 - fixedFloorLimit / 100);

    if (livePrice <= fixedFloorPrice) {
      return {
        triggerExit: true,
        type: 'FIXED_STOP_LOSS',
        reason: `Asset price ($${livePrice}) breached hard configuration floor limit ($${fixedFloorPrice.toFixed(4)}) calculated from cost basis ($${costBasis}).`
      };
    }
  }

  // Position is stable inside healthy operational limits
  return {
    triggerExit: false,
    type: 'HOLD_POSITION',
    currentDrawdown: (((livePrice - costBasis) / costBasis) * 100).toFixed(2) + '%'
  };
};

module.exports = {
  checkRiskThresholdBreach
};