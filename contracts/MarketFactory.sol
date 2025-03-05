// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PredictionMarket.sol";
import "./PlatformToken.sol";

/**
 * @title MarketFactory
 * @dev Factory contract for creating and managing prediction markets
 */
contract MarketFactory is Ownable, ReentrancyGuard {
    // Platform token contract
    PlatformToken public platformToken;
    
    // Mapping from market ID to market address
    mapping(uint256 => address) public markets;
    uint256 public marketCount;
    
    // Market creation fee (in platform tokens)
    uint256 public marketCreationFee;
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed market,
        string question,
        uint256 endTime
    );
    event MarketCreationFeeUpdated(uint256 newFee);
    
    /**
     * @dev Constructor
     * @param _platformToken Address of the platform token contract
     */
    constructor(address _platformToken) {
        require(_platformToken != address(0), "Invalid platform token address");
        platformToken = PlatformToken(_platformToken);
        marketCreationFee = 100 * 10**18; // 100 platform tokens
    }
    
    /**
     * @dev Creates a new prediction market
     * @param question The question/event to predict
     * @param endTime Timestamp when the market ends
     * @return marketId The ID of the created market
     */
    function createMarket(
        string memory question,
        uint256 endTime
    ) external nonReentrant returns (uint256 marketId) {
        require(bytes(question).length > 0, "Question cannot be empty");
        require(endTime > block.timestamp, "End time must be in the future");
        
        // Transfer creation fee
        require(
            platformToken.transferFrom(msg.sender, address(this), marketCreationFee),
            "Fee transfer failed"
        );
        
        // Create new market
        PredictionMarket market = new PredictionMarket(
            question,
            endTime,
            address(platformToken)
        );
        
        marketId = marketCount++;
        markets[marketId] = address(market);
        
        emit MarketCreated(marketId, address(market), question, endTime);
        
        return marketId;
    }
    
    /**
     * @dev Updates the market creation fee
     * @param newFee New fee amount in platform tokens
     */
    function updateMarketCreationFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Fee must be greater than 0");
        marketCreationFee = newFee;
        emit MarketCreationFeeUpdated(newFee);
    }
    
    /**
     * @dev Withdraws collected fees to the owner
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = platformToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(
            platformToken.transfer(owner(), balance),
            "Fee withdrawal failed"
        );
    }
} 