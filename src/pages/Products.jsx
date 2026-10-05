import React, { useState } from 'react';
import { deleteProduct, getProducts, saveProduct } from '../storage.js';
import { rupiah } from '../utils.js';

const EMPTY = { id: null, name: '', price: '', stock: '' };

export default function Products() {
  const [products, setProducts] = useState(() => [...getProducts()].reverse());
  const [form, setForm] = useState(null); // null = modal tertutup
  const [error, setError] = useState('');

  const refresh = () => setProducts([...getProducts()].reverse());
  const isEdit = form && form.id !== null;

  const openModal = (product = null) => {
    setError('');
    setForm(product ? { ...product } : { ...EMPTY });
  };

  const closeModal = () => setForm(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      saveProduct({ ...form, id: form.id ?? undefined });
      refresh();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      deleteProduct(id);
      refresh();
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Daftar Produk</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Tambah Produk
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Harga</th>
                <th>Stok</th>
                <th className="center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="center">
                    Belum ada data produk.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{rupiah(p.price)}</td>
                    <td>{p.stock}</td>
                    <td className="center actions">
                      <button className="btn" onClick={() => openModal(p)}>
                        Edit
                      </button>
                      <button className="btn btn-primary" onClick={() => handleDelete(p.id)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="card-title">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="field">
                <label>Nama Produk</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
              </div>
              <div className="field">
                <label>Harga</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Stok</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
