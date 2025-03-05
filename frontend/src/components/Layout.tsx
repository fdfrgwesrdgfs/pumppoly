import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styled from 'styled-components';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1a1a1a;
  color: white;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  &:hover {
    color: #00ff9d;
  }
`;

const Main = styled.main`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { connected } = useWallet();

  return (
    <div>
      <Header>
        <Nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/create">Create Market</NavLink>
          {connected && <NavLink to="/my-markets">My Markets</NavLink>}
        </Nav>
        <WalletMultiButton />
      </Header>
      <Main>{children}</Main>
    </div>
  );
};

export default Layout; 