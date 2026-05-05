
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const FALLBACK = [
  { id: 1, name: "Pizza Margherita", desc: "Massa fina, mussarela e manjericão", price: 49.9, category: "Pizzas", emoji: "🍕" },
  { id: 2, name: "Hambúrguer Artesanal", desc: "Blend bovino, cheddar e bacon", price: 38.5, category: "Lanches", emoji: "🍔" },
  { id: 3, name: "HEINEKEN 330ML", price: 8.0, category: "TODOS", emoji: "🍺" },
  { id: 4, name: "BAURU", price: 12.0, category: "TODOS", emoji: "🥪" },
  { id: 5, name: "CARNE DO SOL", price: 18.0, category: "TODOS", emoji: "🥩" },
  { id: 6, name: "COCA-COLA 2L", price: 12.0, category: "TODOS", emoji: "🥤" },
  { id: 7, name: "ÁGUA DE COCO", price: 5.0, category: "BEBIDAS", emoji: "🥥" },
  { id: 8, name: "BEIRUTE", price: 18.0, category: "BEBIDAS", emoji: "🍹" },
  { id: 9, name: "CAFÉ", price: 7.5, category: "BEBIDAS", emoji: "☕" },
  { id: 10, name: "CERVEJA BRAHMA 350ML", price: 4.0, category: "BEBIDAS", emoji: "🍺" },
  { id: 11, name: "COCA-COLA 350ML", price: 5.0, category: "BEBIDAS", emoji: "🥤" },
  { id: 12, name: "BIFE A CAVALO", price: 24.0, category: "LANCHES", emoji: "🍳" },
  { id: 13, name: "CALABRESA", price: 39.0, category: "LANCHES", emoji: "🌭" },
  { id: 14, name: "COXINHA DE FRANGO", price: 0.5, category: "LANCHES", emoji: "🍗" },
  { id: 15, name: "CAMARÃO", price: 40.0, category: "PIZZAS", emoji: "🍤" },
  { id: 16, name: "CHOPP", price: 8.0, category: "PIZZAS", emoji: "🍺" },
  { id: 17, name: "PROMOÇÃO CAMARÃO + SKOL + BRAHMA", price: 48.0, category: "PROMOÇÃO", emoji: "🎁" }
];

const SECTION_TABS = [
  { id: "venda", label: "Venda"},
  { id: "comandas", label: "Comandas" },
  { id: "delivery", label: "Delivery" },
  { to: "/pagamento", label: "Pagamento" }
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TODOS");
  const [activeTab, setActiveTab] = useState("venda");
  const [comandas, setComandas] = useState([
    { id: 1, mesa: 5, itens: 3, total: 45.00 },
    { id: 2, mesa: 12, itens: 2, total: 30.00 },
  ]);
  const [deliveries, setDeliveries] = useState([]);
  const cart = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [tipoVenda, setTipoVenda] = useState("comanda");
  const [detalhesVenda, setDetalhesVenda] = useState({ nome: "", numero: "" });

  useEffect(() => {
    api.get("/menu")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "delivery") {
      api.get("/pedidos/delivery").then((res) => setDeliveries(res.data)).catch(() => {});
    }
  }, [activeTab]);

  const categories = useMemo(
    () => ["TODOS", ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchCat = category === "TODOS" || i.category === category;
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.desc?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, category, search]);

  const handleFinalizarVenda = () => {
    if (tipoVenda === "comanda") {
      const novaComanda = {
        id: Date.now(),
        mesa: detalhesVenda.numero || detalhesVenda.nome,
        itens: cart.items.length,
        total: cart.total
      };
      setComandas([...comandas, novaComanda]);
      setActiveTab("comandas");
    } else if (tipoVenda === "delivery") {
      const novoDelivery = {
        id: Date.now(),
        nome: detalhesVenda.nome,
        endereco: detalhesVenda.numero,
        total: cart.total
      };
      setDeliveries([...deliveries, novoDelivery]);
      setActiveTab("delivery");
    } else if (tipoVenda === "pagamento") {
      localStorage.setItem("tipoVenda", tipoVenda);
      localStorage.setItem("detalhesVenda", JSON.stringify(detalhesVenda));
      localStorage.setItem("totalVenda", cart.total);
      navigate("/pagamento");
    }
    cart.clear();
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: "#080503", height: "100vh" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 55% at 60% 20%, #1a0a03 0%, #0d0603 40%, #080503 100%)" }} />
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-hidden" style={{ marginTop: "48px", height: "calc(100vh - 48px)" }}>
       
        <div className="flex items-stretch flex-shrink-0" style={{ background: "rgba(8,5,3,0.97)", borderBottom: "1px solid rgba(228,96,51,0.18)" }}>
          {SECTION_TABS.map((tab) => {
            const active = activeTab === tab.id || (tab.to && location.pathname === tab.to);
            const handleClick = tab.id ? () => setActiveTab(tab.id) : undefined;
            const Component = tab.to ? Link : "button";
            return (
              <Component key={tab.label || tab.id} to={tab.to} onClick={handleClick} className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all" style={{ color: active ? "#f07040" : "#7a3518", background: active ? "rgba(228,96,51,0.12)" : "transparent", borderBottom: active ? "2px solid #e46033" : "2px solid transparent", textDecoration: "none", border: "none", cursor: "pointer" }}>
                <span>{tab.icon}</span> {tab.label}
              </Component>
            );
          })}
          <div className="ml-auto flex items-center px-4 gap-2">
            <input type="text" placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(228,96,51,0.2)", color: "#fff1f2", width: "180px", outline: "none" }} />
          </div>
        </div>

        {activeTab === "venda" && (
        <div className="flex flex-1 overflow-hidden">
          
          <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: "1px solid rgba(228,96,51,0.12)" }}>
            <div className="flex-shrink-0 p-3" style={{ borderBottom: "1px solid rgba(228,96,51,0.10)" }}>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} className="py-2 px-2 text-xs font-bold uppercase tracking-wide rounded text-center transition-all" style={{ background: cat === category ? "rgba(228,96,51,0.20)" : "rgba(255,255,255,0.04)", color: cat === category ? "#f07040" : "#7a3518", border: cat === category ? "1px solid rgba(228,96,51,0.55)" : "1px solid rgba(228,96,51,0.10)" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {loading ? <div className="flex items-center justify-center h-32"><div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(228,96,51,0.3)", borderTopColor: "#e46033" }} /></div>
              : filtered.length === 0 ? <div className="text-center py-12"><p style={{ color: "#4a2010" }}>Nenhum produto encontrado.</p></div>
              : <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                  {filtered.map((item) => <ProductCard key={item.id} item={item} onAdd={() => cart.addItem(item)} />)}
                </div>
              }
            </div>
          </div>

         
          <div className="flex flex-col flex-shrink-0" style={{ width: "340px", background: "rgba(8,5,3,0.97)" }}>
            <div className="flex-shrink-0 p-3 flex items-end gap-2" style={{ borderBottom: "1px solid rgba(228,96,51,0.12)" }}>
              <span className="text-sm font-bold pb-1.5" style={{ color: "#4a2010" }}>Carrinho</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <p className="text-sm" style={{ color: "#4a2010" }}>Nenhum item adicionado</p>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead><tr style={{ background: "rgba(228,96,51,0.10)" }}><th className="px-2 py-2 text-left">#</th><th>Produto</th><th>Qt</th><th>Unit.</th><th>Total</th><th>Ações</th></tr></thead>
                  <tbody>
                    {cart.items.map((item, i) => (
                      <tr key={item.id} style={{ background: "transparent" }}>
                        <td className="px-2 py-2.5 font-bold" style={{ color: "#4a2010" }}>{i+1}</td>
                        <td style={{ color: "#c8a080" }}>{item.name}</td>
                        <td className="text-center" style={{ color: "#c8a080" }}>{item.quantity}</td>
                        <td className="text-right" style={{ color: "#7a3518" }}>{fmt(item.price)}</td>
                        <td className="text-right font-bold" style={{ color: "#b84020" }}>{fmt(item.price * item.quantity)}</td>
                        <td className="text-center">
                          <div className="flex items-center gap-1">
                            <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: "rgba(228,96,51,0.12)", color: "#f07040" }}>−</button>
                            <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: "rgba(228,96,51,0.12)", color: "#f07040" }}>+</button>
                            <button onClick={() => cart.updateQuantity(item.id, 0)} className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ background: "rgba(184,64,32,0.2)", color: "#b84020" }}>×</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ borderTop: "1px solid rgba(228,96,51,0.15)" }}>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-sm font-bold uppercase" style={{ color: "#7a3518" }}>Valor Total</span>
                <span className="text-2xl font-black" style={{ color: "#f07040" }}>{fmt(cart.total)}</span>
              </div>
              {cart.items.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="flex gap-2 items-center mb-3">
                    <button
                      onClick={() => setTipoVenda("comanda")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: tipoVenda === "comanda" ? "rgba(228,96,51,0.20)" : "rgba(255,255,255,0.05)",
                        color: tipoVenda === "comanda" ? "#f07040" : "#7a3518",
                        border: tipoVenda === "comanda" ? "1px solid rgba(228,96,51,0.55)" : "1px solid rgba(228,96,51,0.20)"
                      }}
                    >
                      Comanda
                    </button>
                    <button
                      onClick={() => setTipoVenda("delivery")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: tipoVenda === "delivery" ? "rgba(228,96,51,0.20)" : "rgba(255,255,255,0.05)",
                        color: tipoVenda === "delivery" ? "#f07040" : "#7a3518",
                        border: tipoVenda === "delivery" ? "1px solid rgba(228,96,51,0.55)" : "1px solid rgba(228,96,51,0.20)"
                      }}
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => setTipoVenda("pagamento")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: tipoVenda === "pagamento" ? "rgba(228,96,51,0.20)" : "rgba(255,255,255,0.05)",
                        color: tipoVenda === "pagamento" ? "#f07040" : "#7a3518",
                        border: tipoVenda === "pagamento" ? "1px solid rgba(228,96,51,0.55)" : "1px solid rgba(228,96,51,0.20)"
                      }}
                    >
                      Pagamento
                    </button>
                  </div>
                  {tipoVenda === "comanda" && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input type="text" placeholder="Nome da Mesa" value={detalhesVenda.nome} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, nome: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(228,96,51,0.22)", color: "#fff1f2", outline: "none" }} />
                      <input type="number" placeholder="Número" value={detalhesVenda.numero} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, numero: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(228,96,51,0.22)", color: "#fff1f2", outline: "none" }} />
                    </div>
                  )}
                  {tipoVenda === "delivery" && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input type="text" placeholder="Nome do Cliente" value={detalhesVenda.nome} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, nome: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(228,96,51,0.22)", color: "#fff1f2", outline: "none" }} />
                      <input type="text" placeholder="Endereço" value={detalhesVenda.numero} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, numero: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(228,96,51,0.22)", color: "#fff1f2", outline: "none" }} />
                    </div>
                  )}
                </div>
              )}
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                <button onClick={() => { cart.clear(); }} className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold" style={{ background: "rgba(228,96,51,0.08)", color: "#f07040", border: "1px solid rgba(228,96,51,0.25)" }}>Cancelar</button>
                <button onClick={handleFinalizarVenda} className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold" style={{ background: cart.items.length > 0 ? "linear-gradient(135deg, #e46033 0%, #b84020 100%)" : "rgba(58,24,8,0.8)", color: cart.items.length > 0 ? "#fff" : "#4a2010", cursor: cart.items.length > 0 ? "pointer" : "not-allowed" }}>Finalizar</button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "comandas" && (
          <div className="flex flex-col gap-3 p-3">
            {comandas.length === 0 ? <div className="text-center py-12"><p style={{ color: "#4a2010" }}>Nenhuma comanda encontrada.</p></div>
            : comandas.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4 rounded-xl animate-fade-in" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)", animationDelay: `${i * 0.06}s` }}>
                <div>
                  <span className="font-medium" style={{ color: "#fff1f2" }}>Mesa {c.mesa}</span>
                  <span className="font-semibold ml-4" style={{ color: "#f07040" }}>R$ {c.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#6b7280", color: "#fff" }} onClick={() => alert(`Imprimindo comanda ${c.id}`)}>Imprimir</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#f59e0b", color: "#fff" }} onClick={() => alert(`Editar comanda ${c.id}`)}>Editar</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", border: "none" }} onClick={() => { localStorage.setItem("tipoVenda", "comanda"); localStorage.setItem("detalhesVenda", JSON.stringify({ nome: c.mesa, numero: "" })); localStorage.setItem("totalVenda", c.total); navigate("/pagamento"); }}>Fechar Conta</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#ef4444", color: "#fff" }} onClick={() => setComandas(comandas.filter(co => co.id !== c.id))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="flex flex-col gap-3 p-3">
            {deliveries.length === 0 ? <div className="text-center py-12"><p style={{ color: "#4a2010" }}>Nenhum delivery encontrado.</p></div>
            : deliveries.map((d, i) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-4 rounded-xl animate-fade-in" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)", animationDelay: `${i * 0.06}s` }}>
                <div>
                  <span className="font-medium" style={{ color: "#fff1f2" }}>{d.nome}</span>
                  <span className="block text-xs" style={{ color: "#7a3518" }}>{d.endereco}</span>
                  <span className="font-semibold" style={{ color: "#f07040" }}>R$ {d.total}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#6b7280", color: "#fff" }} onClick={() => alert(`Imprimindo delivery ${d.id}`)}>Imprimir</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#f59e0b", color: "#fff" }} onClick={() => alert(`Editar delivery ${d.id}`)}>Editar</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", border: "none" }} onClick={() => { localStorage.setItem("tipoVenda", "delivery"); localStorage.setItem("detalhesVenda", JSON.stringify({ nome: d.nome, numero: d.endereco })); localStorage.setItem("totalVenda", d.total); navigate("/pagamento"); }}>Fechar Conta</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#ef4444", color: "#fff" }} onClick={() => setDeliveries(deliveries.filter(de => de.id !== d.id))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ item, onAdd }) {
  return (
    <div className="rounded-xl flex flex-col cursor-pointer overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(228,96,51,0.12)" }}>
      <div className="flex items-center justify-center text-4xl" style={{ height: "72px", background: "radial-gradient(circle at 50% 30%, rgba(228,96,51,0.13), transparent 65%)" }}>{item.emoji || "🍽️"}</div>
      <div className="px-2 pt-1 pb-2 flex flex-col gap-1">
        <p className="text-xs font-semibold leading-tight" style={{ color: "#c8a080" }}>{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-bold" style={{ color: "#f07040" }}>{fmt(item.price)}</span>
          <button onClick={onAdd} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #e46033 0%, #b84020 100%)", color: "#fff" }}>+</button>
        </div>
      </div>
    </div>
  );
}