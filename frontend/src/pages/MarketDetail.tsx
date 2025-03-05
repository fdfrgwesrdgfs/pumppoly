import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import styled from 'styled-components';
import { usePredictionMarket } from '../hooks/usePredictionMarket';
import { Market, ShareAccount } from '../types/global';
import { formatTokenAmount } from '../utils/accounts';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  color: white;
`;

const MarketHeader = styled.div`
  margin-bottom: 2rem;
`;

const MarketTitle = styled.h1`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`;

const MarketInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #888;
`;

const TradingSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #444;
`;

const TradeForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a1a;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #00ff9d;
  }
`;

const Button = styled.button`
  background: #00ff9d;
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: #00cc7d;
  }
  
  &:disabled {
    background: #444;
    cursor: not-allowed;
  }
`;

const LiquiditySection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #444;
`;

const ShareSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #444;
`;

const MarketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { publicKey } = useWallet();
  const {
    getMarketDetails,
    tradeShares,
    addLiquidity,
    removeLiquidity,
    getUserShares,
    formatTokenAmount,
  } = usePredictionMarket();

  const [market, setMarket] = useState<Market | null>(null);
  const [userShares, setUserShares] = useState<ShareAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey || !id) return;

      try {
        setLoading(true);
        const marketPubkey = new PublicKey(id);
        const [marketData, sharesData] = await Promise.all([
          getMarketDetails(marketPubkey),
          getUserShares(marketPubkey, publicKey),
        ]);
        setMarket(marketData);
        setUserShares(sharesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey, id, getMarketDetails, getUserShares]);

  const handleTrade = async (isYes: boolean) => {
    if (!publicKey || !market || !id) return;

    try {
      setTrading(true);
      setError(null);
      const marketPubkey = new PublicKey(id);
      await tradeShares(marketPubkey, amount, isYes);
      // Refresh data
      const [marketData, sharesData] = await Promise.all([
        getMarketDetails(marketPubkey),
        getUserShares(marketPubkey, publicKey),
      ]);
      setMarket(marketData);
      setUserShares(sharesData);
    } catch (error) {
      console.error('Error trading:', error);
      setError('Failed to execute trade');
    } finally {
      setTrading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!publicKey || !market || !id) return;

    try {
      setTrading(true);
      setError(null);
      const marketPubkey = new PublicKey(id);
      await addLiquidity(marketPubkey, amount);
      // Refresh data
      const [marketData, sharesData] = await Promise.all([
        getMarketDetails(marketPubkey),
        getUserShares(marketPubkey, publicKey),
      ]);
      setMarket(marketData);
      setUserShares(sharesData);
    } catch (error) {
      console.error('Error adding liquidity:', error);
      setError('Failed to add liquidity');
    } finally {
      setTrading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!publicKey || !market || !id) return;

    try {
      setTrading(true);
      setError(null);
      const marketPubkey = new PublicKey(id);
      await removeLiquidity(marketPubkey, amount);
      // Refresh data
      const [marketData, sharesData] = await Promise.all([
        getMarketDetails(marketPubkey),
        getUserShares(marketPubkey, publicKey),
      ]);
      setMarket(marketData);
      setUserShares(sharesData);
    } catch (error) {
      console.error('Error removing liquidity:', error);
      setError('Failed to remove liquidity');
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return <div>Loading market...</div>;
  }

  if (!market) {
    return <div>Market not found</div>;
  }

  return (
    <Container>
      <MarketHeader>
        <MarketTitle>{market.question}</MarketTitle>
        <MarketInfo>
          <span>Ends:</span>
          <span>{new Date(market.endTime * 1000).toLocaleString()}</span>
        </MarketInfo>
        <MarketInfo>
          <span>Status:</span>
          <span>{market.resolved ? 'Resolved' : 'Active'}</span>
        </MarketInfo>
        <MarketInfo>
          <span>Outcome:</span>
          <span>{market.resolved ? (market.outcome ? 'Yes' : 'No') : 'Pending'}</span>
        </MarketInfo>
        <MarketInfo>
          <span>Total Liquidity:</span>
          <span>{formatTokenAmount(market.totalLiquidity, 9)} SOL</span>
        </MarketInfo>
      </MarketHeader>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {!market.resolved && (
        <>
          <TradingSection>
            <h2>Trade</h2>
            <TradeForm>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in SOL"
                min="0"
                step="0.1"
              />
              <div>
                <Button
                  type="button"
                  onClick={() => handleTrade(true)}
                  disabled={trading}
                >
                  Buy Yes
                </Button>
                <Button
                  type="button"
                  onClick={() => handleTrade(false)}
                  disabled={trading}
                >
                  Buy No
                </Button>
              </div>
            </TradeForm>
          </TradingSection>

          <LiquiditySection>
            <h2>Liquidity</h2>
            <TradeForm>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in SOL"
                min="0"
                step="0.1"
              />
              <div>
                <Button
                  type="button"
                  onClick={handleAddLiquidity}
                  disabled={trading}
                >
                  Add Liquidity
                </Button>
                <Button
                  type="button"
                  onClick={handleRemoveLiquidity}
                  disabled={trading}
                >
                  Remove Liquidity
                </Button>
              </div>
            </TradeForm>
          </LiquiditySection>
        </>
      )}

      {userShares && (
        <ShareSection>
          <h2>Your Shares</h2>
          <MarketInfo>
            <span>Yes Shares:</span>
            <span>{formatTokenAmount(userShares.yesShares, 9)}</span>
          </MarketInfo>
          <MarketInfo>
            <span>No Shares:</span>
            <span>{formatTokenAmount(userShares.noShares, 9)}</span>
          </MarketInfo>
        </ShareSection>
      )}
    </Container>
  );
};

export default MarketDetail; 