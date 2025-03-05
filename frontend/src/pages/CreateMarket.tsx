import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import styled from 'styled-components';
import { usePredictionMarket } from '../hooks/usePredictionMarket';
import { MIN_MARKET_DURATION, MAX_MARKET_DURATION } from '../constants';

const Form = styled.form`
  max-width: 600px;
  margin: 0 auto;
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  color: white;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #888;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a1a;
  color: white;
  min-height: 100px;
  resize: vertical;
  
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
  width: 100%;
  
  &:hover {
    background: #00cc7d;
  }
  
  &:disabled {
    background: #444;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const CreateMarket: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { createMarket } = usePredictionMarket();
  const [question, setQuestion] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return false;
    }

    if (!endTime) {
      setError('Please select an end time');
      return false;
    }

    const selectedTime = new Date(endTime).getTime();
    const now = Date.now();
    const minTime = now + MIN_MARKET_DURATION * 1000;
    const maxTime = now + MAX_MARKET_DURATION * 1000;

    if (selectedTime < minTime) {
      setError(`Market must end at least ${MIN_MARKET_DURATION / 86400} days from now`);
      return false;
    }

    if (selectedTime > maxTime) {
      setError(`Market cannot end more than ${MAX_MARKET_DURATION / 86400} days from now`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const endTimeDate = new Date(endTime);
      const tx = await createMarket(question, endTimeDate);
      console.log('Market created:', tx);
      navigate(`/market/${tx}`);
    } catch (error) {
      console.error('Error creating market:', error);
      setError('Failed to create market');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return <div>Please connect your wallet to create a market.</div>;
  }

  return (
    <div>
      <h1>Create New Prediction Market</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="question">Question</Label>
          <TextArea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What will happen?"
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Market'}
        </Button>
      </Form>
    </div>
  );
};

export default CreateMarket; 