import React, { useEffect, useState } from 'react';
import { getSession, logout, seedDefaults } from './storage.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Pos from './pages/Pos.jsx';
import Products from './pages/Products.jsx';
import Transactions from './pages/Transactions.jsx';

const ROUTES = {
  '/dashboard': Pos,
  '/products': Products,
  '/transactions': Transactions,
};

const currentPath = () => window.location.hash.replace(/^#/, '') || '/dashboard';

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(getSession());
  const [path, setPath] = useState(currentPath());

  useEffect(() => {
    seedDefaults().then(() => setReady(true));
    const onHash = () => setPath(currentPath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!ready) return null;

  if (!user) return <Login onLogin={setUser} />;

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.hash = '/dashboard';
  };

  const Page = ROUTES[path] || Pos;
  const active = ROUTES[path] ? path : '/dashboard';

  return (
    <Layout user={user} active={active} onLogout={handleLogout}>
      <Page />
    </Layout>
  );
}
