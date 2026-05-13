import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, updateProduct, updateStock } from "../services/productService";
import Sidebar from "../components/Sidebar";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GF = "#E8F5E9";
const O  = "#F57C00";
const OF = "#FFF3E0";
const D  = "#424242";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";
const R  = "#C62828";
const RF = "#FFEBEE";

function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0"
      style={{ borderColor: `${G}30`, borderTopColor: G }} />
  );
}

function InlineAlert({ msg }) {
  if (!msg) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl text-sm mb-4"
      style={{ background: RF, border: "1px solid #EF9A9A", color: R }}>
      {msg}
    </div>
  );
}

function StockBadge({ qty }) {
  const low = qty < 10, med = qty < 30;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        background: low ? RF : med ? OF : GF,
        color: low ? R : med ? O : G,
        border: `1px solid ${low ? "#EF9A9A" : med ? "#FFCC80" : "#A5D6A7"}`,
      }}>
      {qty}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.15 }}
      className="flex-1 rounded-2xl p-4 text-center"
      style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <p className="text-2xl font-bold" style={{ color: accent || D }}>{value}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: M }}>{label}</p>
    </motion.div>
  );
}

export default function Estoque() {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [editingProduct, setEditingProduct] = useState(null);
  const [ajuste,         setAjuste]         = useState({ quantidade: "", tipo: "adicionar" });
  const [ajusteError,    setAjusteError]    = useState("");
  const [saving,         setSaving]         = useState(false);

  const loadProducts = () => { setProducts(getProducts()); setLoading(false); };

  useEffect(() => {
    loadProducts();
    window.addEventListener("productsUpdated", loadProducts);
    return () => window.removeEventListener("productsUpdated", loadProducts);
  }, []);

  const openAjuste = (product) => {
    setEditingProduct(product);
    setAjuste({ quantidade: "", tipo: "adicionar" });
    setAjusteError("");
  };

  const handleSalvarAjuste = () => {
    const qty = parseInt(ajuste.quantidade);
    if (!qty || qty <= 0) { setAjusteError("Informe uma quantidade válida."); return; }
    setSaving(true);
    updateStock(editingProduct.id, qty, ajuste.tipo === "adicionar" ? "adicionar" : "subtrair");
    loadProducts();
    setSaving(false);
    setEditingProduct(null);
  };

  const handleAtualizarPreco = (product, novoPreco) => {
    updateProduct(product.id, { price: parseFloat(novoPreco) });
    loadProducts();
  };

  const uniqueCategories = ["TODOS", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "TODOS" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalItens  = products.reduce((s, p) => s + (p.estoque || 0), 0);
  const estoqueBaixo = products.filter((p) => (p.estoque || 0) < 10).length;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <motion.div className="flex-1 p-6 pt-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
            <h1 className="text-2xl font-bold" style={{ color: D }}>Estoque</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: M }}>Controle de produtos e estoque</p>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <StatCard label="Total Produtos" value={products.length} />
          <StatCard label="Itens em Estoque" value={totalItens} accent={G} />
          <StatCard label="Estoque Baixo" value={estoqueBaixo} accent={estoqueBaixo > 0 ? R : G} />
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>

          <div className="flex gap-3 p-4 flex-wrap" style={{ borderBottom: `1px solid ${B}` }}>
            <input type="text" placeholder="Buscar produto..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }} />
            <div className="flex gap-2 flex-wrap">
              {uniqueCategories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: selectedCategory === cat ? GF : "#FAFAFA",
                    color: selectedCategory === cat ? G : M,
                    border: `1.5px solid ${selectedCategory === cat ? G : B}`,
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-14"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center" style={{ color: M }}>Nenhum produto encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F5F5F5" }}>
                    {["Produto", "Categoria", "Estoque", "Unidade", "Preço", "Ações"].map((h, i) => (
                      <th key={h}
                        className={`px-4 py-3 font-semibold text-xs uppercase tracking-wide ${i === 2 || i === 3 || i === 5 ? "text-center" : i === 4 ? "text-right" : "text-left"}`}
                        style={{ color: M }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, idx) => (
                    <motion.tr key={product.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      style={{ borderBottom: `1px solid ${B}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img src={product.image} alt={product.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              style={{ border: `1px solid ${B}` }} />
                          )}
                          <span className="font-medium" style={{ color: D }}>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: M }}>
                        {product.category}
                      </td>
                      <td className="px-4 py-3 text-center"><StockBadge qty={product.estoque || 0} /></td>
                      <td className="px-4 py-3 text-center text-xs" style={{ color: M }}>
                        {product.unidade || "unidade"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input type="number" step="0.01" value={product.price}
                          onChange={(e) => handleAtualizarPreco(product, e.target.value)}
                          className="w-24 px-2 py-1.5 rounded-lg text-right text-sm outline-none"
                          style={{ background: "#FAFAFA", border: `1px solid ${B}`, color: D }} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openAjuste(product)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: GF, color: G, border: `1px solid #A5D6A7` }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#C8E6C9")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = GF)}>
                          Ajustar
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {editingProduct && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 px-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setEditingProduct(null)}>
            <motion.div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              style={{ background: W, border: `1px solid ${B}` }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: D }}>Ajustar Estoque</h2>
                  <p className="text-xs mt-0.5" style={{ color: M }}>{editingProduct.name}</p>
                </div>
                <button onClick={() => setEditingProduct(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all"
                  style={{ background: "#F5F5F5", color: M, border: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = B)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F5F5")}>
                  ✕
                </button>
              </div>

              <div className="rounded-xl px-3 py-2 mb-4 text-sm" style={{ background: "#F5F5F5", border: `1px solid ${B}` }}>
                <span style={{ color: M }}>Estoque atual: </span>
                <span className="font-bold" style={{ color: D }}>
                  {editingProduct.estoque || 0} {editingProduct.unidade || "unidade"}
                </span>
              </div>

              <InlineAlert msg={ajusteError} />

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: M }}>Operação</label>
                <div className="flex gap-2">
                  {[
                    { val: "adicionar", label: "+ Adicionar", color: G, bg: GF, border: "#A5D6A7" },
                    { val: "remover",   label: "− Remover",   color: R, bg: RF, border: "#EF9A9A" },
                  ].map(({ val, label, color, bg, border }) => (
                    <button key={val}
                      onClick={() => { setAjuste((a) => ({ ...a, tipo: val })); setAjusteError(""); }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: ajuste.tipo === val ? bg : "#FAFAFA",
                        color: ajuste.tipo === val ? color : M,
                        border: `1.5px solid ${ajuste.tipo === val ? border : B}`,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: M }}>Quantidade</label>
                <input type="number" min="1" value={ajuste.quantidade}
                  onChange={(e) => { setAjuste((a) => ({ ...a, quantidade: e.target.value })); setAjusteError(""); }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "#F5F5F5", color: M, border: `1px solid ${B}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = B)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F5F5")}>
                  Cancelar
                </button>
                <button onClick={handleSalvarAjuste} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: G, color: W, border: "none", boxShadow: "0 4px 12px rgba(46,125,50,0.3)" }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = GD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = G; }}>
                  {saving ? <Spinner /> : "Salvar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
