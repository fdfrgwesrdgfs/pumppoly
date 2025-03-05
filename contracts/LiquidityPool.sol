// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/Math.sol";

/**
 * @title LiquidityPool
 * @dev Contract managing liquidity and trading in prediction markets
 */
contract LiquidityPool is ReentrancyGuard {
    // Token contracts
    ERC20 public yesToken;
    ERC20 public noToken;
    ERC20 public platformToken;
    
    // Liquidity token
    ERC20 public liquidityToken;
    
    // Pool state
    uint256 public totalLiquidity;
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant FEE_NUMERATOR = 30; // 0.3%
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    event TokensSwapped(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    /**
     * @dev Constructor
     * @param _yesToken Address of the Yes token contract
     * @param _noToken Address of the No token contract
     * @param _platformToken Address of the platform token contract
     */
    constructor(
        address _yesToken,
        address _noToken,
        address _platformToken
    ) {
        require(_yesToken != address(0), "Invalid Yes token address");
        require(_noToken != address(0), "Invalid No token address");
        require(_platformToken != address(0), "Invalid platform token address");
        
        yesToken = ERC20(_yesToken);
        noToken = ERC20(_noToken);
        platformToken = ERC20(_platformToken);
        
        // Create liquidity token
        liquidityToken = new ERC20("Liquidity Token", "LP");
    }
    
    /**
     * @dev Add liquidity to the pool
     * @param amount Amount of platform tokens to add
     * @param provider Address of the liquidity provider
     * @return success Whether the operation was successful
     */
    function addLiquidity(
        uint256 amount,
        address provider
    ) external nonReentrant returns (bool success) {
        require(amount > 0, "Amount must be greater than 0");
        require(provider != address(0), "Invalid provider address");
        
        // Transfer platform tokens from provider
        require(
            platformToken.transferFrom(provider, address(this), amount),
            "Platform token transfer failed"
        );
        
        // Calculate liquidity tokens to mint
        uint256 liquidityAmount;
        if (totalLiquidity == 0) {
            liquidityAmount = amount;
        } else {
            liquidityAmount = (amount * liquidityToken.totalSupply()) / totalLiquidity;
        }
        
        // Mint liquidity tokens
        _mintLiquidityTokens(provider, liquidityAmount);
        
        // Update total liquidity
        totalLiquidity += amount;
        
        emit LiquidityAdded(provider, amount);
        
        return true;
    }
    
    /**
     * @dev Remove liquidity from the pool
     * @param amount Amount of liquidity tokens to burn
     * @param provider Address of the liquidity provider
     * @return success Whether the operation was successful
     */
    function removeLiquidity(
        uint256 amount,
        address provider
    ) external nonReentrant returns (bool success) {
        require(amount > 0, "Amount must be greater than 0");
        require(provider != address(0), "Invalid provider address");
        require(
            liquidityToken.balanceOf(provider) >= amount,
            "Insufficient liquidity tokens"
        );
        
        // Calculate platform tokens to return
        uint256 platformAmount = (amount * totalLiquidity) / liquidityToken.totalSupply();
        
        // Burn liquidity tokens
        _burnLiquidityTokens(provider, amount);
        
        // Transfer platform tokens to provider
        require(
            platformToken.transfer(provider, platformAmount),
            "Platform token transfer failed"
        );
        
        // Update total liquidity
        totalLiquidity -= platformAmount;
        
        emit LiquidityRemoved(provider, platformAmount);
        
        return true;
    }
    
    /**
     * @dev Swap tokens in the pool
     * @param amountIn Amount of input tokens
     * @param recipient Address to receive output tokens
     * @param isYes Whether to swap for Yes or No tokens
     * @return success Whether the operation was successful
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        address recipient,
        bool isYes
    ) external nonReentrant returns (bool success) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient address");
        
        // Calculate fee
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        // Transfer input tokens
        require(
            platformToken.transferFrom(msg.sender, address(this), amountIn),
            "Input token transfer failed"
        );
        
        // Calculate output amount
        uint256 amountOut = calculateOutputAmount(amountInAfterFee, isYes);
        
        // Transfer output tokens
        if (isYes) {
            require(
                yesToken.transfer(recipient, amountOut),
                "Yes token transfer failed"
            );
        } else {
            require(
                noToken.transfer(recipient, amountOut),
                "No token transfer failed"
            );
        }
        
        emit TokensSwapped(
            msg.sender,
            address(platformToken),
            isYes ? address(yesToken) : address(noToken),
            amountIn,
            amountOut
        );
        
        return true;
    }
    
    /**
     * @dev Calculate output amount for a swap
     * @param amountIn Amount of input tokens
     * @param isYes Whether to swap for Yes or No tokens
     * @return amountOut Amount of output tokens
     */
    function calculateOutputAmount(
        uint256 amountIn,
        bool isYes
    ) public view returns (uint256 amountOut) {
        uint256 totalSupply = isYes ? yesToken.totalSupply() : noToken.totalSupply();
        
        if (totalSupply == 0) {
            return amountIn;
        }
        
        return (amountIn * totalSupply) / (totalLiquidity + amountIn);
    }
    
    /**
     * @dev Mint liquidity tokens
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     */
    function _mintLiquidityTokens(address to, uint256 amount) internal {
        // Implementation depends on the ERC20 implementation
        // This is a placeholder for the actual implementation
    }
    
    /**
     * @dev Burn liquidity tokens
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function _burnLiquidityTokens(address from, uint256 amount) internal {
        // Implementation depends on the ERC20 implementation
        // This is a placeholder for the actual implementation
    }
} 