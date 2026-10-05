import React, { useState } from 'react';
import { login, register } from '../storage.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user =
        mode === 'login'
          ? await login(form.email, form.password)
          : await register(form.name, form.email, form.password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="guest">
      <div className="card guest-card">
        <div className="brand">KASIR</div>
        <h3 className="card-title">{mode === 'login' ? 'Masuk' : 'Daftar'}</h3>
        <form onSubmit={submit} className="form">
          {mode === 'register' && (
            <div className="field">
              <label>Nama</label>
              <input value={form.name} onChange={set('name')} required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
        {mode === 'login' && <p className="hint">Akun awal: admin@kasir.test / password</p>}
      </div>
    </div>
  );
}
