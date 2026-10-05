import React from 'react';
import { getTransactions } from '../storage.js';
import { rupiah } from '../utils.js';

export default function Transactions() {
  const transactions = getTransactions();

  return (
    <div className="card">
      <h3 className="card-title">Daftar Transaksi</h3>
      <div className="trx-list">
        {transactions.length === 0 ? (
          <p className="empty">Belum ada transaksi.</p>
        ) : (
          transactions.map((trx) => (
            <div key={trx.id} className="trx">
              <div>
                <div className="invoice">{trx.invoice_number}</div>
                <div className="trx-date">{new Date(trx.created_at).toLocaleString('id-ID')}</div>
                <div className="trx-items">
                  {trx.items.map((item, idx) => (
                    <div key={idx}>
                      <span>- {item.product_name || 'Produk Dihapus'}</span> <span>({item.quantity}x)</span>{' '}
                      <span>= {rupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="trx-total">
                <div className="trx-total-label">
                  Total: <span>{rupiah(trx.total_amount)}</span>
                </div>
                <div>Dibayar: {rupiah(trx.paid_amount)}</div>
                <div>Kembali: {rupiah(trx.change_amount)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
