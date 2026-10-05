// Penyimpanan data berbasis localStorage (pengganti database Laravel).
const KEYS = {
  products: 'kasir.products',
  transactions: 'kasir.transactions',
  users: 'kasir.users',
  session: 'kasir.session',
};

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------- Auth ----------
export async function seedDefaults() {
  if (read(KEYS.users, []).length === 0) {
    write(KEYS.users, [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@kasir.test',
        password: await hashPassword('password'),
      },
    ]);
  }
}

export function getSession() {
  return read(KEYS.session, null);
}

export async function login(email, password) {
  const users = read(KEYS.users, []);
  const hash = await hashPassword(password);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === hash);
  if (!user) throw new Error('Email atau password salah.');
  const session = { id: user.id, name: user.name, email: user.email };
  write(KEYS.session, session);
  return session;
}

export async function register(name, email, password) {
  const users = read(KEYS.users, []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email sudah terdaftar.');
  }
  if (password.length < 6) throw new Error('Password minimal 6 karakter.');
  const user = { id: nextId(users), name, email, password: await hashPassword(password) };
  write(KEYS.users, [...users, user]);
  const session = { id: user.id, name: user.name, email: user.email };
  write(KEYS.session, session);
  return session;
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

// ---------- Produk ----------
export const getProducts = () => read(KEYS.products, []);

export function saveProduct({ id, name, price, stock }) {
  const products = getProducts();
  const clean = { name: name.trim(), price: Number(price), stock: Number(stock) };
  if (!clean.name) throw new Error('Nama produk wajib diisi.');
  if (!(clean.price >= 0)) throw new Error('Harga tidak valid.');
  if (!Number.isInteger(clean.stock) || clean.stock < 0) throw new Error('Stok tidak valid.');

  const now = new Date().toISOString();
  let next;
  if (id) {
    next = products.map((p) => (p.id === id ? { ...p, ...clean, updated_at: now } : p));
  } else {
    next = [...products, { id: nextId(products), ...clean, created_at: now, updated_at: now }];
  }
  write(KEYS.products, next);
  return next;
}

export function deleteProduct(id) {
  const next = getProducts().filter((p) => p.id !== id);
  write(KEYS.products, next);
  return next;
}

// ---------- Transaksi ----------
export const getTransactions = () =>
  read(KEYS.transactions, []).sort((a, b) => b.created_at.localeCompare(a.created_at));

export function createTransaction(cart, paidAmount) {
  if (!cart.length) throw new Error('Keranjang kosong!');
  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const change = paidAmount - total;
  if (change < 0) throw new Error('Uang bayar kurang!');

  const products = getProducts();
  for (const item of cart) {
    const p = products.find((x) => x.id === item.id);
    if (p && p.stock < item.quantity) throw new Error(`Stok ${p.name} tidak cukup (sisa ${p.stock}).`);
  }

  const transactions = read(KEYS.transactions, []);
  const random = Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, '0');
  const transaction = {
    id: nextId(transactions),
    invoice_number: `INV-${random}`,
    total_amount: total,
    paid_amount: paidAmount,
    change_amount: change,
    created_at: new Date().toISOString(),
    items: cart.map((i) => ({
      product_id: i.id,
      product_name: i.name,
      quantity: i.quantity,
      price: i.price,
      subtotal: i.subtotal,
    })),
  };
  write(KEYS.transactions, [...transactions, transaction]);
  write(
    KEYS.products,
    products.map((p) => {
      const item = cart.find((i) => i.id === p.id);
      return item ? { ...p, stock: p.stock - item.quantity } : p;
    })
  );
  return transaction;
}
