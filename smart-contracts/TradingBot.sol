// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface for standard ERC20 token interactions.
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
}

/**
 * @dev Interface for UniswapV2-compatible Routers to execute swaps.
 */
interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

/**
 * @title Non-Custodial Algorithmic Trading Bot Executor
 * @notice Handles on-chain asset custody, routine automated swaps, and capital retrieval.
 */
contract TradingBot {
    address public immutable owner;

    // Log events for backend monitoring and the live execution ledger
    event FundsWithdrawn(address indexed token, address indexed recipient, uint256 amount);
    event StrategySwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOutReceived
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Caller is not the strategy manager");
        _;
    }

    /**
     * @notice Initializes the trading account container and assigns management permissions.
     */
    constructor() {
        owner = msg.sender;
    }

    // Allow contract to accept native gas tokens (ETH/MATIC) directly
    receive() external payable {}

    /**
     * @notice Performs an atomic programmatic swap through a targeted DEX router path.
     * @param routerAddress The deployment layout of the targeted AMM Router (e.g., Uniswap V2, QuickSwap).
     * @param amountIn The total baseline input asset allocation size to commit to this swap step.
     * @param amountOutMin Slippage security limit parameter. Reverts if block depth drops returns lower.
     * @param path Array list of token registry contract addresses defining the execution swap vector.
     */
    function executeArbitrageSwap(
        address routerAddress,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path
    ) external onlyOwner returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid structural tracking swap path");
        address sourceToken = path[0];

        // Ensure target liquidity router has permission to move our balance allocation
        IERC20(sourceToken).approve(routerAddress, amountIn);

        // Execute the low-latency token swap directly on-chain
        amounts = IUniswapV2Router(routerAddress).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this), // Store the acquired assets right back inside this secure vault contract
            block.timestamp + 300 // 5-minute deadline buffer window before block expiration
        );

        emit StrategySwapExecuted(sourceToken, path[path.length - 1], amountIn, amounts[amounts.length - 1]);
    }

    /**
     * @notice Sweeps capital allocations back to the owner's primary wallet interface.
     * @param tokenAddress The registry address of the target ERC20 token to sweep. Use address(0) for native gas tokens.
     */
    function withdrawCapital(address tokenAddress) external onlyOwner {
        if (tokenAddress == address(0)) {
            uint256 nativeBalance = address(this).balance;
            require(nativeBalance > 0, "No native balance to withdraw");
            (bool success, ) = payable(owner).call{value: nativeBalance}("");
            require(success, "Native transfer execution crashed");
            emit FundsWithdrawn(address(0), owner, nativeBalance);
        } else {
            uint256 tokenBalance = IERC20(tokenAddress).balanceOf(address(this));
            require(tokenBalance > 0, "Token allocation balance reads empty");
            require(IERC20(tokenAddress).transfer(owner, tokenBalance), "ERC20 transfer failed");
            emit FundsWithdrawn(tokenAddress, owner, tokenBalance);
        }
    }
}