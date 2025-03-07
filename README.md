# PumpPoly - Decentralized Prediction Market Platform

<div align="center">
  <img src="assets/logo.svg" alt="PumpPoly Logo" width="800">
</div>

A revolutionary decentralized prediction market platform that combines the best features of Pump.fun and Polymarket, creating an engaging and accessible platform for event prediction and trading.

## Author

<div align="center">
  <img src="https://avatars.githubusercontent.com/fdfrgwesrdgfs" alt="Author Avatar" width="100" height="100" style="border-radius: 50%;">
  <p><strong>fdfrgwesrdgfs</strong></p>
</div>

## Features

- **Low-Barrier Market Creation**: Anyone can create prediction markets
- **Automated Liquidity Pools**: Automatic liquidity pool creation for each market
- **Community-Driven**: Value determined by community sentiment and participation
- **Speculative Trading**: High volatility trading opportunities
- **Gamification**: Leaderboards and rewards to increase user engagement
- **Event-Driven**: Predict real-world events with binary outcomes
- **Decentralized**: Built on blockchain with no trusted third parties
- **Tokenized Shares**: Trade prediction shares as ERC-20 tokens

## Technical Stack

- **Smart Contracts**: Solidity 0.8.19
- **Development Framework**: Hardhat
- **Frontend**: React + TypeScript
- **Blockchain**: Polygon Network
- **Oracle**: Chainlink
- **Token Standard**: ERC-20

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fdfrgwesrdgfs/pumppoly.git
cd pumppoly
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

### Development

1. Start local blockchain:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. Start frontend development server:
```bash
npm start
```

### Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
pump-poly/
├── contracts/           # Smart contracts
├── scripts/            # Deployment and utility scripts
├── test/              # Test files
├── frontend/          # React frontend application
├── hardhat.config.ts  # Hardhat configuration
└── package.json       # Project dependencies
```

## Smart Contracts

### Core Contracts

- `MarketFactory.sol`: Creates and manages prediction markets
- `PredictionMarket.sol`: Individual prediction market contract
- `LiquidityPool.sol`: Manages market liquidity
- `PlatformToken.sol`: Platform's native token
- `Oracle.sol`: Handles event resolution

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

For security concerns, please open a security advisory on GitHub.

## Acknowledgments

- Inspired by Pump.fun and Polymarket
- Built with OpenZeppelin contracts
- Powered by Chainlink oracles 