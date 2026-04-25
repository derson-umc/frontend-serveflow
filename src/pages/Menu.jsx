import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const FALLBACK = [
  { id: 1, name: "Pizza Margherita", description: "Massa fina, mussarela e manjericão", price: 49.9, category: "Pizzas", emoji: "🍕" },
  { id: 2, name: "Hambúrguer Artesanal", description: "Blend bovino, cheddar e bacon", price: 38.5, category: "Lanches", emoji: "🍔" },
  { id: 3, name: "Salada Caesar", description: "Frango grelhado, croutons, parmesão", price: 32.0, category: "Saladas", emoji: "🥗" },
  { id: 4, name: "Suco de Laranja", description: "500ml, espremido na hora", price: 12.0, category: "Bebidas", emoji: "🥤" },
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    api
      .get("/menu")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchCat = category === "Todos" || i.category === category;
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, category, search]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col min-h-screen"
      style={{ background: "#080404" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0008 0%, #0d0204 40%, #080404 100%)" }}
      />
      <Sidebar />

      <div className="relative flex-1 p-8 pb-24">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(180deg, #f43f5e, #e11d48)" }} />
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>
                Menu Inteligente
              </h1>
            </div>
            <p className="text-sm ml-4" style={{ color: "#6b2130" }}>
              Catálogo de produtos · monte o pedido
            </p>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none" viewBox="0 0 24 24" stroke="#6b2130">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar prato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-red w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(225,29,72,0.18)", color: "#fff1f2" }}
              />
            </div>
            <CartButton count={cart.count} onClick={() => setCartOpen(true)} />
          </div>
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {categories.map((c) => {
            const active = c === category;
            return (
              <motion.button
                key={c}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(c)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{
                  background: active ? "rgba(225,29,72,0.18)" : "rgba(255,255,255,0.025)",
                  color: active ? "#f43f5e" : "#6b2130",
                  border: active ? "1px solid rgba(225,29,72,0.5)" : "1px solid rgba(225,29,72,0.1)",
                }}
              >
                {c}
              </motion.button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ color: "#6b2130" }}>Carregando...</p>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((item) => (
                <ProductCard key={item.id} item={item} onAdd={() => cart.addItem(item)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
    </motion.div>
  );
}

function ProductCard({ item, onAdd }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-4 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(225,29,72,0.1)",
      }}
    >
      <div
        className="text-5xl mb-3 h-20 flex items-center justify-center rounded-xl"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(225,29,72,0.12), transparent 65%)",
        }}
      >
        {item.emoji || "🍽️"}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9f1239" }}>
        {item.category}
      </span>
      <h3 className="font-semibold text-sm mb-1" style={{ color: "#fff1f2" }}>
        {item.name}
      </h3>
      <p className="text-xs leading-snug mb-3 line-clamp-2 flex-1" style={{ color: "#6b2130" }}>
        {item.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-bold text-base" style={{ color: "#f43f5e" }}>
          {fmt(item.price)}
        </span>
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"
          style={{
            background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(225,29,72,0.35)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          Add
        </motion.button>
      </div>
    </motion.div>
  );
}

function CartButton({ count, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
      style={{
        background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
        color: "#fff",
        boxShadow: "0 4px 18px rgba(225,29,72,0.4)",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-5a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
      Carrinho
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: "#fff", color: "#e11d48" }}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function CartDrawer({ open, onClose, cart }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0a0204 0%, #080404 100%)",
              borderLeft: "1px solid rgba(225,29,72,0.2)",
              boxShadow: "-12px 0 48px rgba(0,0,0,0.8)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(225,29,72,0.1)" }}
            >
              <div>
                <h2 className="font-bold text-lg" style={{ color: "#fff1f2" }}>
                  Seu pedido
                </h2>
                <p className="text-xs" style={{ color: "#6b2130" }}>
                  {cart.count} {cart.count === 1 ? "item" : "itens"} no carrinho
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: "#6b2130", background: "rgba(225,29,72,0.06)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3 opacity-40">🛒</div>
                  <p className="text-sm" style={{ color: "#6b2130" }}>
                    Seu carrinho está vazio.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence>
                    {cart.items.map((it) => (
                      <motion.li
                        key={it.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(225,29,72,0.1)",
                        }}
                      >
                        <div className="text-2xl">{it.emoji || "🍽️"}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "#fff1f2" }}>
                            {it.name}
                          </p>
                          <p className="text-xs" style={{ color: "#9f1239" }}>
                            {fmt(it.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <QtyBtn onClick={() => cart.updateQuantity(it.id, it.quantity - 1)}>−</QtyBtn>
                          <span className="w-6 text-center text-sm font-bold" style={{ color: "#fff1f2" }}>
                            {it.quantity}
                          </span>
                          <QtyBtn onClick={() => cart.updateQuantity(it.id, it.quantity + 1)}>+</QtyBtn>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div
                className="p-5 flex flex-col gap-3"
                style={{ borderTop: "1px solid rgba(225,29,72,0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider" style={{ color: "#6b2130" }}>
                    Total
                  </span>
                  <motion.span
                    key={cart.total}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold"
                    style={{ color: "#f43f5e" }}
                  >
                    {fmt(cart.total)}
                  </motion.span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(225,29,72,0.5)" }}
                  className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
                    color: "#fff",
                    boxShadow: "0 4px 24px rgba(225,29,72,0.35)",
                  }}
                >
                  Confirmar pedido
                </motion.button>
                <button
                  onClick={cart.clear}
                  className="text-xs"
                  style={{ color: "#6b2130" }}
                >
                  Esvaziar carrinho
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyBtn({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
      style={{
        background: "rgba(225,29,72,0.12)",
        color: "#f43f5e",
        border: "1px solid rgba(225,29,72,0.22)",
      }}
    >
      {children}
    </motion.button>
  );
}
