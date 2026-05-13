import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CATEGORIAS = [
  "TODOS",
  "PRATOS PRINCIPAIS",
  "PRATOS A LA CARTE",
  "SUCOS",
  "PROMO",
  "CERVEJAS",
  "BEBIDAS",
  "SOBREMESAS",
  "ACOMPANHAMENTOS",
  "PORCOES",
];

const FALLBACK = [
  { id: 1, name: "Pizza Margherita", desc: "Massa fina, mussarela e manjericao", price: 49.9, category: "PRATOS PRINCIPAIS" },
  { id: 2, name: "Hamburguer Artesanal", desc: "Blend bovino, cheddar e bacon", price: 38.5, category: "PRATOS PRINCIPAIS" },
  { id: 3, name: "HEINEKEN 330ML", price: 8.0, category: "CERVEJAS" },
  { id: 4, name: "BAURU", price: 12.0, category: "PRATOS PRINCIPAIS" },
  { id: 5, name: "CARNE DO SOL", price: 18.0, category: "PRATOS PRINCIPAIS" },
  { id: 6, name: "COCA-COLA 2L", price: 12.0, category: "BEBIDAS" },
  { id: 7, name: "AGUA DE COCO", price: 5.0, category: "SUCOS" },
  { id: 8, name: "BEIRUTE", price: 18.0, category: "PRATOS PRINCIPAIS" },
  { id: 9, name: "CAFE", price: 7.5, category: "BEBIDAS" },
  { id: 10, name: "CERVEJA BRAHMA 350ML", price: 4.0, category: "CERVEJAS" },
  { id: 11, name: "COCA-COLA 350ML", price: 5.0, category: "BEBIDAS" },
  { id: 12, name: "BIFE A CAVALO", price: 24.0, category: "PRATOS PRINCIPAIS" },
  { id: 13, name: "CALABRESA", price: 39.0, category: "PRATOS PRINCIPAIS" },
  { id: 14, name: "COXINHA DE FRANGO", price: 0.5, category: "PORCOES" },
  { id: 15, name: "CAMARAO", price: 40.0, category: "PRATOS PRINCIPAIS" },
  { id: 16, name: "CHOPP", price: 8.0, category: "CERVEJAS" },
  { id: 17, name: "PROMOCAO CAMARAO + SKOL + BRAHMA", price: 48.0, category: "PROMO" }
];

const SECTION_TABS = [
  { id: "venda", label: "VENDAS"},
  { id: "comandas", label: "COMANDAS" },
  { id: "delivery", label: "DELIVERY" },
  { to: "/pagamento", label: "PAGAMENTO" }
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TODOS");
  const [activeTab, setActiveTab] = useState("venda");
  const [comandas, setComandas] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(null);
  const [printType, setPrintType] = useState(null);
  const [editingComanda, setEditingComanda] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [editDeliveryModalOpen, setEditDeliveryModalOpen] = useState(false);
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

  const categories = CATEGORIAS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchCat = category === "TODOS" || i.category === category;
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.desc?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, category, search]);

  const handleFinalizarVenda = () => {
    const itensVendidos = cart.items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    if (tipoVenda === "comanda") {
      const novaComanda = {
        id: Date.now(),
        mesa: detalhesVenda.numero || detalhesVenda.nome || "Mesa " + (comandas.length + 1),
        itens: itensVendidos,
        total: cart.total,
        data: new Date().toLocaleString()
      };
      setComandas([...comandas, novaComanda]);
      setActiveTab("comandas");
      setDetalhesVenda({ nome: "", numero: "" });
    } else if (tipoVenda === "delivery") {
      const novoDelivery = {
        id: Date.now(),
        nome: detalhesVenda.nome || "Cliente " + (deliveries.length + 1),
        endereco: detalhesVenda.numero || "Endereço não informado",
        itens: itensVendidos,
        total: cart.total,
        data: new Date().toLocaleString()
      };
      setDeliveries([...deliveries, novoDelivery]);
      setActiveTab("delivery");
      setDetalhesVenda({ nome: "", numero: "" });
    } else if (tipoVenda === "pagamento") {
      localStorage.setItem("tipoVenda", tipoVenda);
      localStorage.setItem("detalhesVenda", JSON.stringify(detalhesVenda));
      localStorage.setItem("totalVenda", cart.total);
      localStorage.setItem("itensVenda", JSON.stringify(itensVendidos));
      navigate("/pagamento");
    }
    cart.clear();
  };

  const handleImprimir = (item, type) => {
    setPrintType(type);
    setShowPrintModal(item);
  };

  const handleConfirmarImpressao = () => {
    const texto = gerarTextoImpressao(showPrintModal, printType);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Impressão</title><style>body{font-family:'Courier New',monospace;padding:24px;background:white}pre{white-space:pre-wrap;font-size:13px}button{margin-top:16px;padding:10px 20px;width:100%;background:#2E7D32;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:bold}</style></head><body><pre>${texto}</pre><button onclick="window.print();window.close()">Imprimir</button></body></html>`);
      w.document.close();
    }
    setShowPrintModal(null);
    setPrintType(null);
  };

  const gerarTextoImpressao = (item, type) => {
    if (type === "comanda") {
      return `COMANDA #${item.id}\nMesa: ${item.mesa}\nData: ${item.data}\n\nITENS:\n${item.itens.map(i => `${i.quantity}x ${i.name} - ${fmt(i.total)}`).join('\n')}\n\nTOTAL: ${fmt(item.total)}\n\nObrigado!`;
    } else {
      return `DELIVERY #${item.id}\nCliente: ${item.nome}\nEndereço: ${item.endereco}\nData: ${item.data}\n\nITENS:\n${item.itens.map(i => `${i.quantity}x ${i.name} - ${fmt(i.total)}`).join('\n')}\n\nTOTAL: ${fmt(item.total)}\n\nObrigado!`;
    }
  };

  const handleFecharConta = (item, type) => {
    localStorage.setItem("tipoVenda", type);
    localStorage.setItem("detalhesVenda", JSON.stringify({
      nome: type === "comanda" ? item.mesa : item.nome,
      numero: type === "comanda" ? "" : item.endereco
    }));
    localStorage.setItem("totalVenda", item.total);
    localStorage.setItem("itensVenda", JSON.stringify(item.itens));
    navigate("/pagamento");
  };


  const handleEditarComanda = (comanda) => {
    setEditingComanda(JSON.parse(JSON.stringify(comanda)));
    setEditModalOpen(true);
  };

  const handleSalvarEdicaoComanda = () => {
    const novoTotal = editingComanda.itens.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const comandaAtualizada = {
      ...editingComanda,
      total: novoTotal
    };

    setComandas(comandas.map(c => c.id === editingComanda.id ? comandaAtualizada : c));
    setEditModalOpen(false);
    setEditingComanda(null);
  };

  const handleEditarItemComanda = (itemIndex, field, value) => {
    const novosItens = [...editingComanda.itens];
    if (field === 'quantity') {
      const novaQuantidade = parseInt(value) || 0;
      novosItens[itemIndex].quantity = novaQuantidade;
      novosItens[itemIndex].total = novosItens[itemIndex].price * novaQuantidade;
    } else if (field === 'name') {
      novosItens[itemIndex].name = value;
    } else if (field === 'price') {
      const novoPreco = parseFloat(value) || 0;
      novosItens[itemIndex].price = novoPreco;
      novosItens[itemIndex].total = novoPreco * novosItens[itemIndex].quantity;
    }
    setEditingComanda({ ...editingComanda, itens: novosItens });
  };

  const handleRemoverItemComanda = (itemIndex) => {
    const novosItens = editingComanda.itens.filter((_, idx) => idx !== itemIndex);
    setEditingComanda({ ...editingComanda, itens: novosItens });
  };

  const handleAdicionarItemComanda = () => {
    const novoItem = {
      id: Date.now(),
      name: "Novo Produto",
      quantity: 1,
      price: 0,
      total: 0
    };
    setEditingComanda({
      ...editingComanda,
      itens: [...editingComanda.itens, novoItem]
    });
  };

  const handleMudarMesa = (novaMesa) => {
    setEditingComanda({ ...editingComanda, mesa: novaMesa });
  };


  const handleEditarDelivery = (delivery) => {
    setEditingDelivery(JSON.parse(JSON.stringify(delivery)));
    setEditDeliveryModalOpen(true);
  };

  const handleSalvarEdicaoDelivery = () => {
    const novoTotal = editingDelivery.itens.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryAtualizada = {
      ...editingDelivery,
      total: novoTotal
    };

    setDeliveries(deliveries.map(d => d.id === editingDelivery.id ? deliveryAtualizada : d));
    setEditDeliveryModalOpen(false);
    setEditingDelivery(null);
  };

  const handleEditarItemDelivery = (itemIndex, field, value) => {
    const novosItens = [...editingDelivery.itens];
    if (field === 'quantity') {
      const novaQuantidade = parseInt(value) || 0;
      novosItens[itemIndex].quantity = novaQuantidade;
      novosItens[itemIndex].total = novosItens[itemIndex].price * novaQuantidade;
    } else if (field === 'name') {
      novosItens[itemIndex].name = value;
    } else if (field === 'price') {
      const novoPreco = parseFloat(value) || 0;
      novosItens[itemIndex].price = novoPreco;
      novosItens[itemIndex].total = novoPreco * novosItens[itemIndex].quantity;
    }
    setEditingDelivery({ ...editingDelivery, itens: novosItens });
  };

  const handleRemoverItemDelivery = (itemIndex) => {
    const novosItens = editingDelivery.itens.filter((_, idx) => idx !== itemIndex);
    setEditingDelivery({ ...editingDelivery, itens: novosItens });
  };

  const handleAdicionarItemDelivery = () => {
    const novoItem = {
      id: Date.now(),
      name: "Novo Produto",
      quantity: 1,
      price: 0,
      total: 0
    };
    setEditingDelivery({
      ...editingDelivery,
      itens: [...editingDelivery.itens, novoItem]
    });
  };

  const handleMudarCliente = (novoNome) => {
    setEditingDelivery({ ...editingDelivery, nome: novoNome });
  };

  const handleMudarEndereco = (novoEndereco) => {
    setEditingDelivery({ ...editingDelivery, endereco: novoEndereco });
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: "#F5F5F5", height: "100vh" }}>
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-hidden" style={{ marginTop: "52px", height: "calc(100vh - 52px)" }}>

        {/* Tab bar verde */}
        <div className="flex items-stretch flex-shrink-0" style={{ background: "#2E7D32", borderBottom: "1px solid #1B5E20" }}>
          {SECTION_TABS.map((tab) => {
            const active = activeTab === tab.id || (tab.to && location.pathname === tab.to);
            const handleClick = tab.id ? () => setActiveTab(tab.id) : undefined;
            const Component = tab.to ? Link : "button";
            return (
              <Component
                key={tab.label || tab.id}
                to={tab.to}
                onClick={handleClick}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all"
                style={{
                  color: "#FFFFFF",
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  borderBottom: active ? "2px solid #F57C00" : "2px solid transparent",
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: active ? "2px solid #F57C00" : "2px solid transparent",
                }}
              >
                {tab.label}
              </Component>
            );
          })}
          <div className="ml-auto flex items-center px-4 gap-2">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", width: "180px", outline: "none" }}
            />
          </div>
        </div>

        {activeTab === "venda" && (
        <div className="flex flex-1 overflow-hidden">

          {/* Área de produtos */}
          <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: "1px solid #E0E0E0" }}>
            <div className="flex-shrink-0 p-3" style={{ borderBottom: "1px solid #E0E0E0", background: "#FFFFFF" }}>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="py-2 px-2 text-xs font-bold uppercase tracking-wide rounded text-center transition-all"
                    style={{
                      background: cat === category ? "#E8F5E9" : "#F5F5F5",
                      color: cat === category ? "#2E7D32" : "#757575",
                      border: cat === category ? "1px solid #A5D6A7" : "1px solid #E0E0E0"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3" style={{ background: "#F5F5F5" }}>
              {loading
                ? <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#E0E0E0", borderTop: "2px solid #2E7D32" }} />
                  </div>
                : filtered.length === 0
                ? <div className="text-center py-12"><p style={{ color: "#757575" }}>Nenhum produto encontrado.</p></div>
                : <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                    {filtered.map((item) => <ProductCard key={item.id} item={item} onAdd={() => cart.addItem(item)} />)}
                  </div>
              }
            </div>
          </div>

          {/* Carrinho lateral */}
          <div className="flex flex-col flex-shrink-0" style={{ width: "340px", background: "#FFFFFF", borderLeft: "1px solid #E0E0E0" }}>
            <div className="flex-shrink-0 p-3 flex items-end gap-2" style={{ borderBottom: "1px solid #E0E0E0" }}>
              <span className="text-sm font-bold pb-1.5" style={{ color: "#424242" }}>Carrinho</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <p className="text-sm" style={{ color: "#BDBDBD" }}>Nenhum item adicionado</p>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: "#F5F5F5" }}>
                      <th className="px-2 py-2 text-left" style={{ color: "#757575" }}>#</th>
                      <th style={{ color: "#757575" }}>Produto</th>
                      <th style={{ color: "#757575" }}>Qt</th>
                      <th style={{ color: "#757575" }}>Unit.</th>
                      <th style={{ color: "#757575" }}>Total</th>
                      <th style={{ color: "#757575" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item, i) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                        <td className="px-2 py-2.5 font-bold" style={{ color: "#424242" }}>{i+1}</td>
                        <td style={{ color: "#424242" }}>{item.name}</td>
                        <td className="text-center" style={{ color: "#424242" }}>{item.quantity}</td>
                        <td className="text-right" style={{ color: "#757575" }}>{fmt(item.price)}</td>
                        <td className="text-right font-bold" style={{ color: "#2E7D32" }}>{fmt(item.price * item.quantity)}</td>
                        <td className="text-center">
                          <div className="flex items-center gap-1">
                            <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>-</button>
                            <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>+</button>
                            <button onClick={() => cart.updateQuantity(item.id, 0)} className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ background: "#FFEBEE", color: "#C62828" }}>x</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ borderTop: "1px solid #E0E0E0" }}>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-sm font-bold uppercase" style={{ color: "#424242" }}>Valor Total</span>
                <span className="text-2xl font-black" style={{ color: "#2E7D32" }}>{fmt(cart.total)}</span>
              </div>
              {cart.items.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="flex gap-2 items-center mb-3">
                    <button
                      onClick={() => setTipoVenda("comanda")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: tipoVenda === "comanda" ? "#E8F5E9" : "#F5F5F5",
                        color: tipoVenda === "comanda" ? "#2E7D32" : "#757575",
                        border: tipoVenda === "comanda" ? "1px solid #A5D6A7" : "1px solid #E0E0E0"
                      }}
                    >
                      Comanda
                    </button>
                    <button
                      onClick={() => setTipoVenda("delivery")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: tipoVenda === "delivery" ? "#E8F5E9" : "#F5F5F5",
                        color: tipoVenda === "delivery" ? "#2E7D32" : "#757575",
                        border: tipoVenda === "delivery" ? "1px solid #A5D6A7" : "1px solid #E0E0E0"
                      }}
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => setTipoVenda("pagamento")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: tipoVenda === "pagamento" ? "#E8F5E9" : "#F5F5F5",
                        color: tipoVenda === "pagamento" ? "#2E7D32" : "#757575",
                        border: tipoVenda === "pagamento" ? "1px solid #A5D6A7" : "1px solid #E0E0E0"
                      }}
                    >
                      Pagamento
                    </button>
                  </div>
                  {tipoVenda === "comanda" && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input type="text" placeholder="Nome da Mesa" value={detalhesVenda.nome} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, nome: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }} />
                      <input type="text" placeholder="Numero" value={detalhesVenda.numero} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, numero: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }} />
                    </div>
                  )}
                  {tipoVenda === "delivery" && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input type="text" placeholder="Nome do Cliente" value={detalhesVenda.nome} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, nome: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }} />
                      <input type="text" placeholder="Endereco" value={detalhesVenda.numero} onChange={(e) => setDetalhesVenda({ ...detalhesVenda, numero: e.target.value })} className="px-3 py-2 rounded-lg text-xs" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }} />
                    </div>
                  )}
                </div>
              )}
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                <button onClick={() => { cart.clear(); }} className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold" style={{ background: "#F5F5F5", color: "#757575", border: "1px solid #E0E0E0" }}>Cancelar</button>
                <button onClick={handleFinalizarVenda} className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold" style={{ background: cart.items.length > 0 ? "#2E7D32" : "#A5D6A7", color: "#FFFFFF", cursor: cart.items.length > 0 ? "pointer" : "not-allowed" }}>Finalizar</button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "comandas" && (
          <div className="flex flex-col gap-3 p-3 overflow-y-auto" style={{ background: "#F5F5F5" }}>
            {comandas.length === 0
              ? <div className="text-center py-12"><p style={{ color: "#757575" }}>Nenhuma comanda encontrada.</p></div>
              : comandas.map((c) => (
              <div key={c.id} className="flex flex-col px-5 py-4 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-lg" style={{ color: "#424242" }}>Mesa {c.mesa}</span>
                    {c.data && <span className="text-xs ml-3" style={{ color: "#757575" }}>{c.data}</span>}
                  </div>
                  <span className="font-bold text-xl" style={{ color: "#2E7D32" }}>{fmt(c.total)}</span>
                </div>

                {c.itens && c.itens.length > 0 && (
                  <div className="mb-3 p-3 rounded-lg" style={{ background: "#F5F5F5", border: "1px solid #E0E0E0" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#757575" }}>ITENS CONSUMIDOS:</p>
                    <div className="space-y-1">
                      {c.itens.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span style={{ color: "#424242" }}>{item.quantity}x {item.name}</span>
                          <span style={{ color: "#2E7D32" }}>{fmt(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleImprimir(c, "comanda")} className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#F5F5F5", color: "#757575", border: "1px solid #E0E0E0" }}>Imprimir</button>
                  <button onClick={() => handleEditarComanda(c)} className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#FFF3E0", color: "#F57C00", border: "1px solid #FFCC80" }}>Editar</button>
                  <button onClick={() => handleFecharConta(c, "comanda")} className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#2E7D32", color: "#FFFFFF", border: "none" }}>Fechar Conta</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A" }} onClick={() => setComandas(comandas.filter(co => co.id !== c.id))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="flex flex-col gap-3 p-3 overflow-y-auto" style={{ background: "#F5F5F5" }}>
            {deliveries.length === 0
              ? <div className="text-center py-12"><p style={{ color: "#757575" }}>Nenhum delivery encontrado.</p></div>
              : deliveries.map((d) => (
              <div key={d.id} className="flex flex-col px-5 py-4 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-lg" style={{ color: "#424242" }}>{d.nome}</span>
                    <span className="block text-xs" style={{ color: "#757575" }}>{d.endereco}</span>
                    {d.data && <span className="text-xs" style={{ color: "#757575" }}>{d.data}</span>}
                  </div>
                  <span className="font-bold text-xl" style={{ color: "#2E7D32" }}>{fmt(d.total)}</span>
                </div>

                {d.itens && d.itens.length > 0 && (
                  <div className="mb-3 p-3 rounded-lg" style={{ background: "#F5F5F5", border: "1px solid #E0E0E0" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#757575" }}>ITENS PEDIDOS:</p>
                    <div className="space-y-1">
                      {d.itens.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span style={{ color: "#424242" }}>{item.quantity}x {item.name}</span>
                          <span style={{ color: "#2E7D32" }}>{fmt(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleImprimir(d, "delivery")} className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#F5F5F5", color: "#757575", border: "1px solid #E0E0E0" }}>Imprimir</button>
                  <button onClick={() => handleEditarDelivery(d)} className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#FFF3E0", color: "#F57C00", border: "1px solid #FFCC80" }}>Editar</button>
                  <button onClick={() => handleFecharConta(d, "delivery")} className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#2E7D32", color: "#FFFFFF", border: "none" }}>Fechar Conta</button>
                  <button className="px-3 py-1 rounded text-sm font-medium" style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A" }} onClick={() => setDeliveries(deliveries.filter(de => de.id !== d.id))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de impressão */}
      {showPrintModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl w-full max-w-md p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "#424242" }}>
              {printType === "comanda" ? "Pré-visualização da Comanda" : "Pré-visualização do Delivery"}
            </h2>

            <div className="mb-4 p-4 rounded-lg" style={{ background: "#F5F5F5", border: "1px solid #E0E0E0", maxHeight: "400px", overflowY: "auto" }}>
              <pre className="text-xs whitespace-pre-wrap font-mono" style={{ color: "#424242" }}>
                {printType === "comanda" ?
                  `COMANDA #${showPrintModal.id}
Mesa: ${showPrintModal.mesa}
Data: ${showPrintModal.data}

ITENS CONSUMIDOS:
${showPrintModal.itens.map(i => `${i.quantity}x ${i.name.padEnd(30)} ${fmt(i.total)}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ${fmt(showPrintModal.total)}
━━━━━━━━━━━━━━━━━━━━━━

Obrigado pela preferência!`
                  :
                  `DELIVERY #${showPrintModal.id}
Cliente: ${showPrintModal.nome}
Endereço: ${showPrintModal.endereco}
Data: ${showPrintModal.data}

ITENS PEDIDOS:
${showPrintModal.itens.map(i => `${i.quantity}x ${i.name.padEnd(30)} ${fmt(i.total)}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ${fmt(showPrintModal.total)}
━━━━━━━━━━━━━━━━━━━━━━

Obrigado pela preferência!`
                }
              </pre>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPrintModal(null)} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#F5F5F5", color: "#757575", border: "1px solid #E0E0E0" }}>Cancelar</button>
              <button onClick={handleConfirmarImpressao} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#2E7D32", color: "#FFFFFF" }}>Confirmar Impressão</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição de comanda */}
      {editModalOpen && editingComanda && editingComanda.itens && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl w-full max-w-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "#424242" }}>Editar Comanda #{editingComanda.id}</h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#757575" }}>Número da Mesa</label>
              <input
                type="text"
                value={editingComanda.mesa}
                onChange={(e) => handleMudarMesa(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold" style={{ color: "#757575" }}>Itens da Comanda</label>
                <button
                  onClick={handleAdicionarItemComanda}
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" }}
                >
                  + Adicionar Item
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {editingComanda.itens.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ background: "#F5F5F5", border: "1px solid #E0E0E0" }}>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleEditarItemComanda(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm"
                          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleEditarItemComanda(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center"
                          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleEditarItemComanda(idx, 'price', e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-right"
                          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoverItemComanda(idx)}
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A" }}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="text-right text-xs" style={{ color: "#757575" }}>
                      Subtotal: {fmt(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 p-3 rounded-lg" style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: "#424242" }}>Novo Total:</span>
                <span className="text-2xl font-bold" style={{ color: "#2E7D32" }}>
                  {fmt(editingComanda.itens.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#F5F5F5", color: "#757575", border: "1px solid #E0E0E0" }}>Cancelar</button>
              <button onClick={handleSalvarEdicaoComanda} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#2E7D32", color: "#FFFFFF" }}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição de delivery */}
      {editDeliveryModalOpen && editingDelivery && editingDelivery.itens && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl w-full max-w-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "#424242" }}>Editar Delivery #{editingDelivery.id}</h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#757575" }}>Nome do Cliente</label>
              <input
                type="text"
                value={editingDelivery.nome}
                onChange={(e) => handleMudarCliente(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#757575" }}>Endereço</label>
              <input
                type="text"
                value={editingDelivery.endereco}
                onChange={(e) => handleMudarEndereco(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold" style={{ color: "#757575" }}>Itens do Pedido</label>
                <button
                  onClick={handleAdicionarItemDelivery}
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" }}
                >
                  + Adicionar Item
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {editingDelivery.itens.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ background: "#F5F5F5", border: "1px solid #E0E0E0" }}>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleEditarItemDelivery(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm"
                          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleEditarItemDelivery(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center"
                          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleEditarItemDelivery(idx, 'price', e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-right"
                          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#424242", outline: "none" }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoverItemDelivery(idx)}
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A" }}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="text-right text-xs" style={{ color: "#757575" }}>
                      Subtotal: {fmt(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 p-3 rounded-lg" style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: "#424242" }}>Novo Total:</span>
                <span className="text-2xl font-bold" style={{ color: "#2E7D32" }}>
                  {fmt(editingDelivery.itens.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditDeliveryModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#F5F5F5", color: "#757575", border: "1px solid #E0E0E0" }}>Cancelar</button>
              <button onClick={handleSalvarEdicaoDelivery} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#2E7D32", color: "#FFFFFF" }}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ item, onAdd }) {
  const fmtPrice = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div
      className="rounded-xl flex flex-col cursor-pointer overflow-hidden transition-all"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E0E0E0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(46,125,50,0.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
    >
      <div className="flex items-center justify-center" style={{ height: "72px", background: "#E8F5E9" }}></div>
      <div className="px-2 pt-1 pb-2 flex flex-col gap-1">
        <p className="text-xs font-semibold leading-tight" style={{ color: "#424242" }}>{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-bold" style={{ color: "#2E7D32" }}>{fmtPrice(item.price)}</span>
          <button
            onClick={onAdd}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
            style={{ background: "#2E7D32", color: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1B5E20")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2E7D32")}
          >+</button>
        </div>
      </div>
    </div>
  );
}
