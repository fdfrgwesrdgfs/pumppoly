import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import Home from './pages/Home';
import CreateMarket from './pages/CreateMarket';
import MarketDetail from './pages/MarketDetail';
import Layout from './components/Layout';
import '@solana/wallet-adapter-react-ui/styles.css';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  // Set up network and wallets
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateMarket />} />
                <Route path="/market/:id" element={<MarketDetail />} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App; 