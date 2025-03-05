import { PublicKey } from '@solana/web3.js';

// Program IDs
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE'); // Replace with actual program ID
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const SYSVAR_RENT_PUBKEY = new PublicKey('SysvarRent111111111111111111111111111111111');

// Market constants
export const MARKET_SEED = 'market';
export const LIQUIDITY_POOL_SEED = 'liquidity_pool';
export const SHARE_ACCOUNT_SEED = 'share_account';
export const TOKEN_ACCOUNT_SEED = 'token_account';

// Time constants
export const SECONDS_PER_DAY = 86400;
export const MIN_MARKET_DURATION = SECONDS_PER_DAY; // 1 day
export const MAX_MARKET_DURATION = SECONDS_PER_DAY * 30; // 30 days

// Fee constants (in basis points, 1% = 100)
export const PLATFORM_FEE_BPS = 100; // 1%
export const LIQUIDITY_PROVIDER_FEE_BPS = 50; // 0.5%

// Token decimals
export const SOL_DECIMALS = 9;
export const SHARE_DECIMALS = 9;

// Error messages
export const ERRORS = {
  MARKET_NOT_FOUND: 'Market not found',
  MARKET_ALREADY_RESOLVED: 'Market already resolved',
  MARKET_NOT_RESOLVED: 'Market not resolved',
  INVALID_END_TIME: 'Invalid end time',
  INSUFFICIENT_LIQUIDITY: 'Insufficient liquidity',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_AMOUNT: 'Invalid amount',
} as const; 