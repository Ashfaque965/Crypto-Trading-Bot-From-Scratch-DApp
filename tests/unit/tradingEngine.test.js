const { TradingEngine } = require('../../trading-engine/engine');
const { getOnChainPriceExchangeRate } = require('../../backend/oracles/priceAggregator');
const { executeAutomatedTokenSwap } = require('../../backend/bot/tradeExecutor');
const { checkRiskThresholdBreach } = require('../../backend/risk/stopLoss');

// Mock out the core on-chain interaction dependencies to maintain an isolated environment
jest.mock('../../backend/oracles/priceAggregator');
jest.mock('../../backend/bot/tradeExecutor');
jest.mock('../../backend/risk/stopLoss');

describe('🤖 Core Automated Trading Engine Suite', () => {
  let engineInstance;
  const mockConfig = {
    privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    chainId: 137,
    pollIntervalMs: 1000
  };

  const mockTokenIn = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';  // USDC
  const mockTokenOut = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'; // WETH

  beforeEach(() => {
    // Clear mock histories and instantiate fresh modules before each run loop
    jest.clearAllMocks();
    jest.useFakeTimers();
    engineInstance = new TradingEngine(mockConfig);
  });

  afterEach(() => {
    engineInstance.stopEngineLoop();
    jest.useRealTimers();
  });

  ### 1. Initialization and Structural Tracking Tests

  test('Should correctly instantiate properties and populate initial track states', () => {
    expect(engineInstance.privateKey).toBe(mockConfig.privateKey);
    expect(engineInstance.chainId).toBe(137);
    expect(engineInstance.isActive).toBe(false);

    engineInstance.trackAssetPosition(mockTokenIn, mockTokenOut, 2000, 1.5, 5);
    const positionKey = `${mockTokenIn.toLowerCase()}_${mockTokenOut.toLowerCase()}`;
    
    expect(engineInstance.trackedPositions.has(positionKey)).toBe(true);
    const position = engineInstance.trackedPositions.get(positionKey);
    expect(position.entryPrice).toBe(2000);
    expect(position.stopLossPercent).toBe(5);
  });

  ### 2. Strategy Loop & Risk Trigger Tests

  test('Should skip cycle calculation calmly if on-chain price oracles fail', async () => {
    engineInstance.trackAssetPosition(mockTokenIn, mockTokenOut, 2000, 1, 5);
    
    // Simulate node disconnection failure
    getOnChainPriceExchangeRate.mockResolvedValueOnce({ success: false, error: 'TIMEOUT' });

    engineInstance.startEngineLoop();
    await jest.advanceTimersByTimeAsync(mockConfig.pollIntervalMs);

    // Risk threshold checks should be bypassed if pricing reads fail
    expect(checkRiskThresholdBreach).not.toHaveBeenCalled();
  });

  test('Should hold positions without issuing swap commands inside safe price bounds', async () => {
    engineInstance.trackAssetPosition(mockTokenIn, mockTokenOut, 2000, 1, 5);

    getOnChainPriceExchangeRate.mockResolvedValueOnce({ success: true, amountOut: '2050.00' });
    checkRiskThresholdBreach.mockReturnValueOnce({ triggerExit: false, type: 'HOLD_POSITION' });

    engineInstance.startEngineLoop();
    await jest.advanceTimersByTimeAsync(mockConfig.pollIntervalMs);

    expect(executeAutomatedTokenSwap).not.toHaveBeenCalled();
  });

  ### 3. Emergency Liquidation Execution Tests

  test('Should execute immediate emergency liquidation swaps when risk boundaries are broken', async () => {
    engineInstance.trackAssetPosition(mockTokenIn, mockTokenOut, 2000, 2.5, 5);
    const positionKey = `${mockTokenIn.toLowerCase()}_${mockTokenOut.toLowerCase()}`;

    // Mock an extreme downside market plunge event
    getOnChainPriceExchangeRate.mockResolvedValueOnce({ success: true, amountOut: '1850.00' });
    checkRiskThresholdBreach.mockReturnValueOnce({
      triggerExit: true,
      reason: 'Asset price breached hard configuration floor limit'
    });
    executeAutomatedTokenSwap.mockResolvedValueOnce({ success: true, transactionHash: '0xTxHashConfirmed' });

    engineInstance.startEngineLoop();
    await jest.advanceTimersByTimeAsync(mockConfig.pollIntervalMs);

    // Verify engine safety layers fired off direct router interactions
    expect(executeAutomatedTokenSwap).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenIn: mockTokenOut, // Reversing route path back to baseline asset
        tokenOut: mockTokenIn,
        amountInRaw: 2.5,
        gasSpeedPreset: 'instant'
      })
    );

    // The asset must be wiped out of the risk engine pool immediately to protect memory allocation bounds
    expect(engineInstance.trackedPositions.has(positionKey)).toBe(false);
  });
});