import { WalletAdapter } from '@solana/wallet-adapter-base';

declare global {
  interface Window {
    solana: WalletAdapter;
  }
}

export interface Market {
  question: string;
  endTime: number;
  resolved: boolean;
  outcome: boolean;
  totalLiquidity: number;
  authority: string;
  yesToken: string;
  noToken: string;
  liquidityPool: string;
}

export interface MarketWithPubkey {
  publicKey: string;
  account: Market;
}

export interface TokenAccount {
  mint: string;
  owner: string;
  amount: number;
  delegate: string | null;
  state: number;
  isNative: number;
  delegatedAmount: number;
  closeAuthority: string | null;
}

export interface ShareAccount {
  owner: string;
  market: string;
  yesShares: number;
  noShares: number;
  lastUpdateTime: number;
}

export {}; 