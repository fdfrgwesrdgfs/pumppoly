import { PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, PROGRAM_ID, MARKET_SEED, TOKEN_ACCOUNT_SEED, SHARE_ACCOUNT_SEED } from '../constants';
import { TokenAccount, ShareAccount } from '../types/global';

export async function getTokenAccount(
  program: Program,
  owner: PublicKey,
  mint: PublicKey
): Promise<PublicKey> {
  const [tokenAccount] = await PublicKey.findProgramAddress(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    PROGRAM_ID
  );
  return tokenAccount;
}

export async function getShareAccount(
  program: Program,
  owner: PublicKey,
  market: PublicKey
): Promise<PublicKey> {
  const [shareAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from(SHARE_ACCOUNT_SEED),
      owner.toBuffer(),
      market.toBuffer(),
    ],
    PROGRAM_ID
  );
  return shareAccount;
}

export async function getMarketTokenAccount(
  program: Program,
  market: PublicKey,
  isYes: boolean
): Promise<PublicKey> {
  const [tokenAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from(TOKEN_ACCOUNT_SEED),
      market.toBuffer(),
      Buffer.from(isYes ? 'yes' : 'no'),
    ],
    PROGRAM_ID
  );
  return tokenAccount;
}

export async function getLiquidityPool(
  program: Program,
  market: PublicKey
): Promise<PublicKey> {
  const [liquidityPool] = await PublicKey.findProgramAddress(
    [
      Buffer.from('liquidity_pool'),
      market.toBuffer(),
    ],
    PROGRAM_ID
  );
  return liquidityPool;
}

export async function getMarket(
  program: Program,
  question: string
): Promise<PublicKey> {
  const [market] = await PublicKey.findProgramAddress(
    [
      Buffer.from(MARKET_SEED),
      Buffer.from(question),
    ],
    PROGRAM_ID
  );
  return market;
}

export async function getAssociatedTokenAccount(
  owner: PublicKey,
  mint: PublicKey
): Promise<PublicKey> {
  const [associatedTokenAccount] = await PublicKey.findProgramAddress(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_PROGRAM_ID
  );
  return associatedTokenAccount;
}

export function formatTokenAmount(amount: number, decimals: number): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

export function parseTokenAmount(amount: string, decimals: number): number {
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
} 