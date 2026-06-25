const express = require('express');
const dotenv = require('dotenv');
const { ethers } = require('ethers');

dotenv.config({ path: './config.env' });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const routerAbi = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'
];

const routerContract = new ethers.Contract(process.env.V2_ROUTER_ADDRESS, routerAbi, wallet);
const activeStrategies = new Map();

// Helper Strategy Loop Engine
const startLimitOrder = (id, config) => {
  const intervalId = setInterval(async () => {
    try {
      const parsedAmount = ethers.utils.parseEther(config.amountIn);
      const amounts = await routerContract.getAmountsOut(parsedAmount, [config.tokenIn, config.tokenOut]);
      const currentPrice = parseFloat(ethers.utils.formatEther(amounts[1]));

      if (config.type === 'BUY' && currentPrice >= parseFloat(config.targetPrice)) {
        clearInterval(intervalId);
        executeSwap(parsedAmount, amounts[1], [config.tokenIn, config.tokenOut]);
        activeStrategies.delete(id);
      }
    } catch (err) {
      console.error("Strategy error loop:", err.message);
    }
  }, 15000);
  activeStrategies.set(id, intervalId);
};

const executeSwap = async (amountIn, amountOutMin, path) => {
  try {
    const tx = await routerContract.swapExactTokensForTokens(
      amountIn, amountOutMin, path, wallet.address, Math.floor(Date.now() / 1000) + 600, { gasLimit: 250000 }
    );
    await tx.wait();
  } catch (err) {
    console.error("Execution failure", err);
  }
};

app.post('/api/get-price', async (req, res) => {
  try {
    const { amountIn, tokenIn, tokenOut } = req.body;
    const amounts = await routerContract.getAmountsOut(ethers.utils.parseEther(amountIn), [tokenIn, tokenOut]);
    res.status(200).json({ success: true, expectedOutput: ethers.utils.formatEther(amounts[1]) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bot/start', (req, res) => {
  const strategyId = `strat_${Date.now()}`;
  startLimitOrder(strategyId, req.body);
  res.status(200).json({ success: true, strategyId });
});

app.post('/api/bot/stop', (req, res) => {
  if (activeStrategies.has(req.body.strategyId)) {
    clearInterval(activeStrategies.get(req.body.strategyId));
    activeStrategies.delete(req.body.strategyId);
    return res.status(200).json({ success: true });
  }
  res.status(404).json({ success: false });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));