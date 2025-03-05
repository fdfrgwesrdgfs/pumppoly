// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlatformToken
 * @dev Platform's native token contract
 */
contract PlatformToken is ERC20, Ownable {
    // Token distribution
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant TEAM_ALLOCATION = 100_000_000 * 10**18; // 100 million tokens
    uint256 public constant ECOSYSTEM_ALLOCATION = 200_000_000 * 10**18; // 200 million tokens
    uint256 public constant LIQUIDITY_ALLOCATION = 300_000_000 * 10**18; // 300 million tokens
    
    // Vesting
    uint256 public constant VESTING_DURATION = 365 days;
    uint256 public constant VESTING_CLIFF = 90 days;
    uint256 public startTime;
    
    // Team tokens
    address public teamWallet;
    uint256 public teamTokensReleased;
    
    // Events
    event TeamWalletUpdated(address indexed newWallet);
    event TokensVested(address indexed beneficiary, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _teamWallet Address of the team wallet
     */
    constructor(address _teamWallet) ERC20("PumpPoly Token", "PUMP") {
        require(_teamWallet != address(0), "Invalid team wallet address");
        teamWallet = _teamWallet;
        startTime = block.timestamp;
        
        // Mint initial supply
        _mint(address(this), TOTAL_SUPPLY);
        
        // Transfer allocations
        _transfer(address(this), teamWallet, TEAM_ALLOCATION);
        _transfer(address(this), owner(), ECOSYSTEM_ALLOCATION);
        _transfer(address(this), address(this), LIQUIDITY_ALLOCATION);
    }
    
    /**
     * @dev Update team wallet address
     * @param _newWallet New team wallet address
     */
    function updateTeamWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        teamWallet = _newWallet;
        emit TeamWalletUpdated(_newWallet);
    }
    
    /**
     * @dev Release vested tokens to team wallet
     */
    function releaseTeamTokens() external {
        require(block.timestamp >= startTime + VESTING_CLIFF, "Vesting cliff not reached");
        
        uint256 vestedAmount = calculateVestedAmount();
        uint256 releasableAmount = vestedAmount - teamTokensReleased;
        
        require(releasableAmount > 0, "No tokens to release");
        
        teamTokensReleased = vestedAmount;
        _transfer(address(this), teamWallet, releasableAmount);
        
        emit TokensVested(teamWallet, releasableAmount);
    }
    
    /**
     * @dev Calculate amount of tokens vested
     * @return amount Amount of tokens vested
     */
    function calculateVestedAmount() public view returns (uint256 amount) {
        if (block.timestamp < startTime + VESTING_CLIFF) {
            return 0;
        }
        
        if (block.timestamp >= startTime + VESTING_DURATION) {
            return TEAM_ALLOCATION;
        }
        
        return (TEAM_ALLOCATION * (block.timestamp - startTime)) / VESTING_DURATION;
    }
    
    /**
     * @dev Add liquidity to the platform
     * @param amount Amount of tokens to add
     */
    function addLiquidity(uint256 amount) external onlyOwner {
        require(amount <= balanceOf(address(this)), "Insufficient balance");
        _transfer(address(this), msg.sender, amount);
    }
    
    /**
     * @dev Remove liquidity from the platform
     * @param amount Amount of tokens to remove
     */
    function removeLiquidity(uint256 amount) external onlyOwner {
        require(amount <= balanceOf(msg.sender), "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
    }
} 