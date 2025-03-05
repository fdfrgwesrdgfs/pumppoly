// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./LiquidityPool.sol";

/**
 * @title PredictionMarket
 * @dev Contract representing a single prediction market
 */
contract PredictionMarket is ReentrancyGuard {
    // Market details
    string public question;
    uint256 public endTime;
    bool public resolved;
    bool public outcome;
    
    // Token contracts for Yes and No shares
    ERC20 public yesToken;
    ERC20 public noToken;
    
    // Liquidity pool
    LiquidityPool public liquidityPool;
    
    // Chainlink price feed for resolution
    AggregatorV3Interface public priceFeed;
    
    // Events
    event MarketResolved(bool outcome);
    event SharesTraded(address indexed trader, bool isYes, uint256 amount);
    event LiquidityProvided(address indexed provider, uint256 amount);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _question The question/event to predict
     * @param _endTime Timestamp when the market ends
     * @param _platformToken Address of the platform token
     */
    constructor(
        string memory _question,
        uint256 _endTime,
        address _platformToken
    ) {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_endTime > block.timestamp, "End time must be in the future");
        
        question = _question;
        endTime = _endTime;
        
        // Create Yes and No tokens
        yesToken = new ERC20("Yes Share", "YES");
        noToken = new ERC20("No Share", "NO");
        
        // Create liquidity pool
        liquidityPool = new LiquidityPool(
            address(yesToken),
            address(noToken),
            _platformToken
        );
    }
    
    /**
     * @dev Trade shares in the market
     * @param isYes Whether to buy Yes or No shares
     * @param amount Amount of shares to trade
     */
    function tradeShares(bool isYes, uint256 amount) external nonReentrant {
        require(!resolved, "Market already resolved");
        require(amount > 0, "Amount must be greater than 0");
        
        if (isYes) {
            require(
                liquidityPool.swapExactTokensForTokens(
                    amount,
                    msg.sender,
                    true
                ),
                "Yes share trade failed"
            );
        } else {
            require(
                liquidityPool.swapExactTokensForTokens(
                    amount,
                    msg.sender,
                    false
                ),
                "No share trade failed"
            );
        }
        
        emit SharesTraded(msg.sender, isYes, amount);
    }
    
    /**
     * @dev Provide liquidity to the market
     * @param amount Amount of platform tokens to provide
     */
    function provideLiquidity(uint256 amount) external nonReentrant {
        require(!resolved, "Market already resolved");
        require(amount > 0, "Amount must be greater than 0");
        
        require(
            liquidityPool.addLiquidity(amount, msg.sender),
            "Liquidity provision failed"
        );
        
        emit LiquidityProvided(msg.sender, amount);
    }
    
    /**
     * @dev Remove liquidity from the market
     * @param amount Amount of liquidity tokens to remove
     */
    function removeLiquidity(uint256 amount) external nonReentrant {
        require(!resolved, "Market already resolved");
        require(amount > 0, "Amount must be greater than 0");
        
        require(
            liquidityPool.removeLiquidity(amount, msg.sender),
            "Liquidity removal failed"
        );
        
        emit LiquidityRemoved(msg.sender, amount);
    }
    
    /**
     * @dev Resolve the market using Chainlink price feed
     */
    function resolveMarket() external {
        require(!resolved, "Market already resolved");
        require(block.timestamp >= endTime, "Market not ended");
        
        // Get price from Chainlink feed
        (, int256 price,,,) = priceFeed.latestRoundData();
        require(price >= 0, "Invalid price feed");
        
        // Resolve market based on price
        outcome = price >= 0;
        resolved = true;
        
        emit MarketResolved(outcome);
    }
    
    /**
     * @dev Set the Chainlink price feed address
     * @param _priceFeed Address of the price feed contract
     */
    function setPriceFeed(address _priceFeed) external {
        require(_priceFeed != address(0), "Invalid price feed address");
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
} 