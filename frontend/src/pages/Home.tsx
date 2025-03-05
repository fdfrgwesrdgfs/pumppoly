import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import styled from 'styled-components';
import { usePredictionMarket } from '../hooks/usePredictionMarket';
import { MarketWithPubkey } from '../types/global';
import { formatTokenAmount } from '../utils/accounts';

const MarketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const MarketCard = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  color: white;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const MarketTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #00ff9d;
`;

const MarketInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #888;
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background: #00ff9d;
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  margin-bottom: 2rem;
  
  &:hover {
    background: #00cc7d;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #888;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  text-align: center;
  margin-top: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  margin-top: 2rem;
`;

const Home: React.FC = () => {
  const { publicKey } = useWallet();
  const { getAllMarkets } = usePredictionMarket();
  const [markets, setMarkets] = useState<MarketWithPubkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const markets = await getAllMarkets();
        setMarkets(markets);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setError('Failed to load markets');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [getAllMarkets]);

  if (loading) {
    return <LoadingSpinner>Loading markets...</LoadingSpinner>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (markets.length === 0) {
    return (
      <EmptyState>
        <h2>No markets found</h2>
        <p>Be the first to create a prediction market!</p>
      </EmptyState>
    );
  }

  return (
    <div>
      <h1>Active Prediction Markets</h1>
      <CreateButton to="/create">Create New Market</CreateButton>
      
      <MarketGrid>
        {markets.map((market) => (
          <Link
            key={market.publicKey}
            to={`/market/${market.publicKey}`}
            style={{ textDecoration: 'none' }}
          >
            <MarketCard>
              <MarketTitle>{market.account.question}</MarketTitle>
              <MarketInfo>
                <span>Ends:</span>
                <span>{new Date(market.account.endTime * 1000).toLocaleString()}</span>
              </MarketInfo>
              <MarketInfo>
                <span>Status:</span>
                <span>{market.account.resolved ? 'Resolved' : 'Active'}</span>
              </MarketInfo>
              <MarketInfo>
                <span>Outcome:</span>
                <span>
                  {market.account.resolved
                    ? market.account.outcome
                      ? 'Yes'
                      : 'No'
                    : 'Pending'}
                </span>
              </MarketInfo>
              <MarketInfo>
                <span>Liquidity:</span>
                <span>{formatTokenAmount(market.account.totalLiquidity, 9)} SOL</span>
              </MarketInfo>
            </MarketCard>
          </Link>
        ))}
      </MarketGrid>
    </div>
  );
};

export default Home; 