import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

type Product = { id: number; name: string; description: string; price: number; stock_quantity: number; sku: string };
type Customer = { id: number; name: string; email: string; phone: string };
type Order = { id: number; customer_id: number; product_id: number; quantity: number; total_price: number };

const NAV = [
  { id: "Dashboard", icon: "⊞", label: "Dashboard" },
  { id: "Products", icon: "◫", label: "Products" },
  { id: "Customers", icon: "◎", label: "Customers" },
  { id: "Orders", icon: "◈", label: "Orders" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #eeeef3;
    --sidebar: #1e2235;
    --surface: #ffffff;
    --surface2: #f4f4f8;
    --surface3: #e8e8ef;
    --border: rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.14);
    --accent: #4f46e5;
    --accent-glow: rgba(79,70,229,0.15);
    --accent2: #f59e0b;
    --accent3: #10b981;
    --accent4: #ef4444;
    --text: #111827;
    --text2: #4b5563;
    --muted: #9ca3af;
    --danger: #ef4444;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
  }

  .app { display: flex; min-height: 100vh; }

  /* ─── SIDEBAR ─── */
  .sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    padding: 0 12px;
  }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 24px 12px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 16px;
  }

  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #818cf8, #a78bfa);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(129,140,248,0.4);
  }

  .logo-text {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.3px;
    color: #ffffff;
  }

  .logo-text span { color: #a5b4fc; }

  .nav-section {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 0 12px;
    margin-bottom: 6px;
    margin-top: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    transition: all 0.15s;
    margin-bottom: 2px;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.08);
    color: #ffffff;
  }

  .nav-item.active {
    background: rgba(255,255,255,0.15);
    color: #ffffff;
    font-weight: 600;
  }

  .nav-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .sidebar-footer-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.3);
  }

  /* ─── MAIN ─── */
  .main {
    margin-left: 240px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    height: 60px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    background: rgba(238,238,243,0.9);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .topbar-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text2);
  }

  .topbar-title strong {
    color: var(--text);
    font-weight: 700;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar-pill {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 99px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text2);
    font-family: 'Space Mono', monospace;
  }

  .content { padding: 36px 40px; flex: 1; }

  /* ─── PAGE HEADER ─── */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .page-heading {
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -1px;
    color: var(--text);
    line-height: 1.1;
  }

  .page-heading .highlight { color: var(--accent); }

  .page-sub {
    margin-top: 4px;
    font-size: 13px;
    color: var(--muted);
    font-weight: 400;
  }

  /* ─── STAT CARDS ─── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 50%;
    opacity: 0.06;
    background: var(--card-accent, var(--accent));
    transform: translate(20px, -20px);
  }

  .stat-card:hover {
    border-color: var(--border2);
    transform: translateY(-2px);
  }

  .stat-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  .stat-icon-wrap {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
  }

  .stat-value {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -1.5px;
    color: var(--text);
    line-height: 1;
  }

  .stat-delta {
    margin-top: 6px;
    font-size: 11px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
  }

  /* ─── QUICK ACTIONS ─── */
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .quick-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px 24px;
    cursor: pointer;
    text-align: left;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
  }

  .quick-card:hover {
    border-color: var(--accent);
    background: rgba(129,140,248,0.07);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(129,140,248,0.12);
  }

  .quick-card-icon {
    font-size: 22px;
    margin-bottom: 14px;
    display: block;
  }

  .quick-card-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }

  .quick-card-desc {
    font-size: 12px;
    color: var(--muted);
  }

  .quick-card-arrow {
    margin-top: 16px;
    font-size: 12px;
    color: var(--accent);
    font-family: 'Space Mono', monospace;
  }

  /* ─── SECTION HEADER ─── */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px;
    border-radius: 10px; border: none;
    background: var(--accent);
    color: white;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    box-shadow: 0 4px 16px rgba(129,140,248,0.3);
  }

  .add-btn:hover {
    background: #6366f1;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(129,140,248,0.4);
  }

  /* ─── TABLE ─── */
  .table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  table { width: 100%; border-collapse: collapse; }

  thead tr { background: var(--surface2); }

  th {
    padding: 12px 20px;
    text-align: left;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: 1px solid var(--border);
    font-weight: 400;
  }

  td { padding: 14px 20px; font-size: 14px; }

  tr:not(:last-child) td { border-bottom: 1px solid var(--border); }

  tr:hover td { background: rgba(129,140,248,0.03); }

  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 10px; font-weight: 400;
  }

  .badge-green { background: rgba(52,211,153,0.1); color: var(--accent3); border: 1px solid rgba(52,211,153,0.2); }
  .badge-amber { background: rgba(251,191,36,0.1); color: var(--accent2); border: 1px solid rgba(251,191,36,0.2); }
  .badge-red { background: rgba(248,113,113,0.1); color: var(--accent4); border: 1px solid rgba(248,113,113,0.2); }
  .badge-blue { background: rgba(129,140,248,0.1); color: var(--accent); border: 1px solid rgba(129,140,248,0.2); }

  .del-btn {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 14px;
    padding: 5px 8px; border-radius: 6px;
    transition: all 0.15s;
  }

  .del-btn:hover { color: var(--danger); background: rgba(248,113,113,0.1); }

  .empty-row td {
    text-align: center; padding: 48px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
    font-size: 12px;
  }

  .error-msg {
    color: var(--danger); font-size: 13px;
    margin-bottom: 16px; padding: 10px 16px;
    background: rgba(248,113,113,0.07);
    border-radius: 10px; border: 1px solid rgba(248,113,113,0.15);
    font-family: 'Space Mono', monospace;
  }

  .loading {
    color: var(--muted);
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    padding: 24px 0;
  }

  /* ─── MODAL ─── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 20px; padding: 30px;
    width: 460px; max-width: 90vw;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px var(--border);
  }

  .modal-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 24px;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .close-btn {
    background: var(--surface2); border: 1px solid var(--border);
    width: 32px; height: 32px; border-radius: 8px;
    cursor: pointer; color: var(--muted);
    font-size: 14px; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s;
  }

  .close-btn:hover { color: var(--text); border-color: var(--accent); }

  .field { margin-bottom: 16px; }

  .field label {
    display: block;
    font-family: 'Space Mono', monospace;
    font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px;
    margin-bottom: 7px;
  }

  .field input, .field select {
    width: 100%; padding: 11px 14px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'Outfit', sans-serif; font-size: 14px;
    transition: border-color 0.15s; outline: none;
  }

  .field input:focus, .field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .field select option { background: var(--surface2); }

  .submit-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, var(--accent), #a78bfa);
    border: none; border-radius: 10px; color: white;
    font-family: 'Outfit', sans-serif; font-size: 14px;
    font-weight: 700; cursor: pointer; margin-top: 8px;
    transition: all 0.15s; letter-spacing: 0.3px;
    box-shadow: 0 4px 20px rgba(129,140,248,0.35);
  }

  .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }

  .avatar {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    background: linear-gradient(135deg, #818cf8, #fbbf24);
    color: white; flex-shrink: 0;
  }

  .name-cell { display: flex; align-items: center; gap: 10px; }
  .name-cell .name { font-weight: 600; }
  .mono { font-family: 'Space Mono', monospace; font-size: 11px; }

  .sku-tag {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 2px 8px;
  }

  /* ─── DIVIDER ─── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }
`;

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string | number; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [error, setError] = useState("");

  const load = () => { setLoading(true); api.get("/products/").then(r => setProducts(r.data)).catch(() => setError("Failed to load")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      const sku = form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      await api.post("/products/", { sku, name: form.name, description: form.description, price: parseFloat(form.price), stock_quantity: parseInt(form.stock) });
      setShowAdd(false); setForm({ name: "", description: "", price: "", stock: "" }); load();
    } catch { setError("Failed to add product"); }
  };

  const del = async (id: number) => { await api.delete(`/products/${id}`); load(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Prod<span className="highlight">ucts</span></h1>
          <p className="page-sub">Manage your inventory catalogue</p>
        </div>
        <button className="add-btn" onClick={() => { setError(""); setShowAdd(true); }}>+ Add Product</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? <p className="loading">loading products...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Description</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {products.length === 0
                ? <tr className="empty-row"><td colSpan={6}>— no products yet —</td></tr>
                : products.map(p => (
                  <tr key={p.id}>
                    <td><span className="sku-tag">{p.sku}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: "var(--text2)", fontSize: 13 }}>{p.description}</td>
                    <td><span className="mono" style={{ color: "var(--accent3)" }}>₹{p.price?.toFixed(2)}</span></td>
                    <td><Badge color={p.stock_quantity > 10 ? "green" : p.stock_quantity > 0 ? "amber" : "red"}>{p.stock_quantity} units</Badge></td>
                    <td><button className="del-btn" onClick={() => del(p.id)}>✕</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Product" onClose={() => setShowAdd(false)}>
          <Field label="Product Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <Field label="Price (₹)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} />
          <Field label="Stock Quantity" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} />
          <button className="submit-btn" onClick={add}>Create Product →</button>
        </Modal>
      )}
    </div>
  );
}

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  const load = () => { setLoading(true); api.get("/customers/").then(r => setCustomers(r.data)).catch(() => setError("Failed to load")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await api.post("/customers/", form);
      setShowAdd(false); setForm({ name: "", email: "", phone: "" }); load();
    } catch { setError("Failed to add customer"); }
  };

  const del = async (id: number) => { await api.delete(`/customers/${id}`); load(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Custo<span className="highlight">mers</span></h1>
          <p className="page-sub">View and manage your customer base</p>
        </div>
        <button className="add-btn" onClick={() => { setError(""); setShowAdd(true); }}>+ Add Customer</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? <p className="loading">loading customers...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {customers.length === 0
                ? <tr className="empty-row"><td colSpan={4}>— no customers yet —</td></tr>
                : customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
                        <span className="name">{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text2)", fontSize: 13 }}>{c.email}</td>
                    <td><span className="mono" style={{ color: "var(--text2)" }}>{c.phone}</span></td>
                    <td><button className="del-btn" onClick={() => del(c.id)}>✕</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Customer" onClose={() => setShowAdd(false)}>
          <Field label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Email Address" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="Phone Number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <button className="submit-btn" onClick={add}>Add Customer →</button>
        </Modal>
      )}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customer_id: "", product_id: "", quantity: "" });
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/orders/"), api.get("/customers/"), api.get("/products/")])
      .then(([o, c, p]) => { setOrders(o.data); setCustomers(c.data); setProducts(p.data); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await api.post("/orders/", { customer_id: parseInt(form.customer_id), product_id: parseInt(form.product_id), quantity: parseInt(form.quantity) });
      setShowAdd(false); setForm({ customer_id: "", product_id: "", quantity: "" }); load();
    } catch { setError("Not enough stock or invalid data"); }
  };

  const customerName = (id: number) => customers.find(c => c.id === id)?.name ?? `#${id}`;
  const productName = (id: number) => products.find(p => p.id === id)?.name ?? `#${id}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Ord<span className="highlight">ers</span></h1>
          <p className="page-sub">Track and create new orders</p>
        </div>
        <button className="add-btn" onClick={() => { setError(""); setShowAdd(true); }}>+ New Order</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? <p className="loading">loading orders...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              {orders.length === 0
                ? <tr className="empty-row"><td colSpan={5}>— no orders yet —</td></tr>
                : orders.map(o => (
                  <tr key={o.id}>
                    <td><Badge color="blue">#{o.id}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{customerName(o.customer_id)}</td>
                    <td style={{ color: "var(--text2)" }}>{productName(o.product_id)}</td>
                    <td><span className="mono">{o.quantity}</span></td>
                    <td><span className="mono" style={{ color: "var(--accent3)", fontWeight: 600 }}>₹{o.total_price?.toFixed(2)}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Order" onClose={() => setShowAdd(false)}>
          <div className="field">
            <label>Customer</label>
            <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Product</label>
            <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock_quantity})</option>)}
            </select>
          </div>
          <Field label="Quantity" type="number" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} />
          <button className="submit-btn" onClick={add}>Place Order →</button>
        </Modal>
      )}
    </div>
  );
}

function Dashboard({ setTab }: { setTab: (t: string) => void }) {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  useEffect(() => {
    Promise.all([api.get("/products/"), api.get("/customers/"), api.get("/orders/")])
      .then(([p, c, o]) => {
        const revenue = o.data.reduce((sum: number, ord: Order) => sum + (ord.total_price ?? 0), 0);
        setStats({ products: p.data.length, customers: c.data.length, orders: o.data.length, revenue });
      }).catch(() => {});
  }, []);

  const statCards = [
    { icon: "◫", label: "Total Products", value: stats.products, accent: "#818cf8", delta: "In catalogue" },
    { icon: "◎", label: "Total Customers", value: stats.customers, accent: "#34d399", delta: "Registered" },
    { icon: "◈", label: "Total Orders", value: stats.orders, accent: "#fbbf24", delta: "Placed" },
    { icon: "₹", label: "Total Revenue", value: `₹${stats.revenue.toFixed(0)}`, accent: "#a78bfa", delta: "All time" },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-heading">Over<span className="highlight">view</span></h1>
          <p className="page-sub">Overview of your inventory and sales</p>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label} style={{ "--card-accent": s.accent } as React.CSSProperties}>
            <div className="stat-card-top">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon-wrap" style={{ color: s.accent }}>{s.icon}</div>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>Quick Access</span>
      </div>

      <div className="quick-grid">
        {[
          { icon: "◫", title: "Products", desc: "Manage your inventory stock", tab: "Products" },
          { icon: "◎", title: "Customers", desc: "View and manage customers", tab: "Customers" },
          { icon: "◈", title: "Orders", desc: "Track and create orders", tab: "Orders" },
        ].map(c => (
          <button className="quick-card" key={c.tab} onClick={() => setTab(c.tab)}>
            <span className="quick-card-icon">{c.icon}</span>
            <div className="quick-card-title">{c.title}</div>
            <div className="quick-card-desc">{c.desc}</div>
            <div className="quick-card-arrow">Go to {c.title} →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Dashboard");

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">⬡</div>
            <span className="logo-text">Stock<span>Sync</span></span>
          </div>

          <div className="nav-section">Main Menu</div>

          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="sidebar-footer-label">v1.0 · INVNT</div>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <span className="topbar-title">
              <strong>{tab}</strong>
            </span>
            <div className="topbar-right">
              <span className="topbar-pill">● Live</span>
            </div>
          </div>
          <div className="content">
            {tab === "Dashboard" && <Dashboard setTab={setTab} />}
            {tab === "Products" && <Products />}
            {tab === "Customers" && <Customers />}
            {tab === "Orders" && <Orders />}
          </div>
        </div>
      </div>
    </>
  );
}
