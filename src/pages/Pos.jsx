import React, { useState } from 'react';
import { createTransaction, getProducts } from '../storage.js';
import { rupiah } from '../utils.js';

export default function Pos() {
  const [products, setProducts] = useState(getProducts());
  const [cart, setCart] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const addToCart = (product) => {
    const inCart = cart.find((i) => i.id === product.id)?.quantity || 0;
    if (inCart + 1 > product.stock) return alert(`Stok ${product.name} tidak cukup!`);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i
        );
      }
      return [...prev, { ...product, quantity: 1, subtotal: product.price }];
    });
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const changeAmount = paidAmount - totalAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return alert('Keranjang kosong!');
    if (changeAmount < 0) return alert('Uang bayar kurang!');
    try {
      createTransaction(cart, paidAmount);
      setCart([]);
      setPaidAmount(0);
      setProducts(getProducts());
      alert('Transaksi Berhasil Disimpan!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="pos">
      <div className="card pos-menu">
        <h3 className="card-title">Daftar Menu</h3>
        {products.length === 0 ? (
          <p className="empty">Belum ada produk. Tambahkan di menu Kelola Produk.</p>
        ) : (
          <div className="menu-grid">
            {products.map((p) => (
              <button key={p.id} className="menu-item" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                <span className="menu-name">{p.name}</span>
                <span className="menu-price">{rupiah(p.price)}</span>
                <span className="menu-stock">{p.stock > 0 ? `Stok: ${p.stock}` : 'Habis'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card pos-cart">
        <h3 className="card-title">Pesanan</h3>
        <div className="cart-list">
          {cart.length === 0 ? (
            <p className="empty">Belum ada pesanan.</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.id}>
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-sub">
                      {item.quantity} x {rupiah(item.price)}
                    </div>
                  </div>
                  <div className="item-total">{rupiah(item.subtotal)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cart-footer">
          <div className="row big">
            <span>Total:</span>
            <span>{rupiah(totalAmount)}</span>
          </div>
          <div className="field">
            <label>Bayar (Rp):</label>
            <input
              type="number"
              min="0"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="row">
            <span>Kembali:</span>
            <span>{rupiah(changeAmount > 0 ? changeAmount : 0)}</span>
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={handleCheckout}>
            Bayar
          </button>
          {cart.length > 0 && (
            <button className="btn btn-block" onClick={() => setCart([])}>
              Kosongkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
