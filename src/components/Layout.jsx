import React from 'react';

const LINKS = [
  { href: '/dashboard', label: 'Pos Dashboard' },
  { href: '/products', label: 'Kelola Produk' },
  { href: '/transactions', label: 'Transaksi' },
];

const TITLES = {
  '/dashboard': 'Dashboard Kasir',
  '/products': 'Kelola Produk',
  '/transactions': 'Riwayat Transaksi',
};

export default function Layout({ user, active, onLogout, children }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">KASIR</div>
        <nav className="nav">
          {LINKS.map((l) => (
            <a key={l.href} href={`#${l.href}`} className={`nav-link ${active === l.href ? 'active' : ''}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="user-box">
          <div className="user-name">{user.name}</div>
          <button className="nav-link" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="page-header">
          <h2>{TITLES[active]}</h2>
        </header>
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}
