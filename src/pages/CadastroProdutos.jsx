import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";
import { productApi } from "../services/productApiService";
import { imageStore, fileToBase64 } from "../services/imageStore";
import Sidebar from "../components/Sidebar";

/* ─── tokens ─── */
const G = "#2E7D32", GD = "#1B5E20", GF = "#E8F5E9";
const O = "#F57C00", OF = "#FFF3E0";
const D = "#424242", M = "#757575", B = "#E0E0E0", W = "#FFFFFF";
const R = "#C62828", RF = "#FFEBEE";

const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CAT_KEY = "sf_categories";
const BASE_CATS = [
  "PRATOS PRINCIPAIS", "PRATOS A LA CARTE", "SUCOS", "PROMOÇÃO",
  "CERVEJAS", "BEBIDAS", "SOBREMESAS", "ACOMPANHAMENTOS", "PORÇÕES",
];

function loadCustomCats() {
  try {
    const v = JSON.parse(localStorage.getItem(CAT_KEY));
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
function saveCustomCats(list) {
  localStorage.setItem(CAT_KEY, JSON.stringify(list));
}

const EMPTY = { name: "", description: "", category: "PRATOS PRINCIPAIS", brand: "", price: "", portion: "" };

/* ─── sub-components ─── */

function Spinner({ size = 20, color = G }) {
  return (
    <div className="rounded-full border-2 animate-spin flex-shrink-0"
      style={{ width: size, height: size, borderColor: `${color}30`, borderTopColor: color }} />
  );
}

function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const err = type === "error";
  return (
    <div className="px-3 py-2.5 rounded-xl text-sm mb-3"
      style={{ background: err ? RF : GF, border: `1px solid ${err ? "#EF9A9A" : "#A5D6A7"}`, color: err ? R : G }}>
      {msg}
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>
      {children}
    </label>
  );
}

function Field({ value, onChange, placeholder, type = "text", step }) {
  return (
    <input type={type} step={step} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
      style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }}
      onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
      onBlur={(e)  => (e.target.style.border = `1.5px solid ${B}`)} />
  );
}

function ImgSlot({ src, onFile, size = 100 }) {
  const ref = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/") || f.size > 8388608) return;
    onFile(await fileToBase64(f));
    e.target.value = "";
  };
  return (
    <div className="relative cursor-pointer group" style={{ width: size, height: size }}
      onClick={() => ref.current?.click()}>
      <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: GF, border: `2px solid ${src ? G : B}` }}>
        {src
          ? <img src={src} alt="" className="w-full h-full object-cover" />
          : <span style={{ fontSize: size * 0.38, opacity: 0.45 }}>🍽️</span>}
      </div>
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "rgba(0,0,0,0.32)" }}>
        <span className="text-white text-xl">📷</span>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        background: active !== false ? GF : RF,
        color: active !== false ? G : R,
        border: `1px solid ${active !== false ? "#A5D6A7" : "#EF9A9A"}`,
      }}>
      {active !== false ? "Ativo" : "Inativo"}
    </span>
  );
}

function ProductCard({ p, img, onEdit, onDelete, onImg }) {
  const ref = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/") || f.size > 8388608) return;
    onImg(await fileToBase64(f));
    e.target.value = "";
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,0,0,0.12)" }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>

      {/* image */}
      <div className="relative w-full group cursor-pointer" style={{ height: 160, background: GF }}
        onClick={() => ref.current?.click()}>
        {img
          ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ color: "#A5D6A7" }}>
              <span style={{ fontSize: 38 }}>🍽️</span>
              <span className="text-xs">Sem imagem</span>
            </div>
          )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          <span className="text-white text-xs font-semibold">📷 {img ? "Trocar" : "Adicionar"}</span>
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
        <div className="absolute top-2 right-2">
          <StatusBadge active={p.active} />
        </div>
      </div>

      {/* body */}
      <div className="flex-1 p-3 flex flex-col gap-1">
        <span className="text-xs px-2 py-0.5 rounded-full self-start font-semibold"
          style={{ background: OF, color: O }}>{p.category}</span>
        <p className="font-bold text-sm leading-snug" style={{ color: D }}>{p.name}</p>
        {(p.brand || p.portion) && (
          <p className="text-xs" style={{ color: M }}>
            {p.brand && <span>Marca: <strong>{p.brand}</strong></span>}
            {p.brand && p.portion && " · "}
            {p.portion}
          </p>
        )}
        {p.description && (
          <p className="text-xs" style={{ color: "#9E9E9E", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {p.description}
          </p>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderTop: `1px solid #F5F5F5` }}>
        <p className="text-base font-extrabold" style={{ color: G }}>{fmt(p.price)}</p>
        <div className="flex gap-1.5">
          <button onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
            style={{ background: "#E3F2FD", color: "#1565C0" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#BBDEFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#E3F2FD")}>✏️</button>
          <button onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
            style={{ background: RF, color: R }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FFCDD2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = RF)}>🗑️</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── main page ─── */
export default function CadastroProdutos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ["root", "admin", "gerente"].includes(user?.role ?? "");

  const [products,   setProducts]   = useState([]);
  const [images,     setImages]     = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [editProd,   setEditProd]   = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [search,     setSearch]     = useState("");
  const [selCat,     setSelCat]     = useState("TODOS");
  const [formErr,    setFormErr]    = useState("");
  const [listErr,    setListErr]    = useState("");
  const [form,       setForm]       = useState(EMPTY);
  const [pendingImg, setPendingImg] = useState(null);
  const [customCats, setCustomCats] = useState(loadCustomCats);
  const [addingCat,  setAddingCat]  = useState(false);
  const [newCat,     setNewCat]     = useState("");

  const allCats = ["TODOS", ...new Set([...BASE_CATS, ...customCats, ...products.map((p) => p.category).filter(Boolean)])];

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setListErr("");
      const data = await productApi.findAll();
      setProducts(data);
      if (data.length > 0) {
        try {
          const imgs = await imageStore.getMany(data.map((p) => p.id));
          setImages(imgs);
        } catch { /* silently skip image loading errors */ }
      }
    } catch {
      setListErr("Erro ao carregar produtos. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) { navigate("/dashboard"); return; }
    loadProducts();
  }, []);

  const f = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const openAdd = () => {
    setEditProd(null); setForm(EMPTY); setPendingImg(null); setFormErr(""); setShowModal(true);
  };
  const openEdit = (p) => {
    setEditProd(p);
    setForm({ name: p.name ?? "", description: p.description ?? "", category: p.category ?? "PRATOS PRINCIPAIS", brand: p.brand ?? "", price: p.price ?? "", portion: p.portion ?? "" });
    setPendingImg(images[p.id] ?? null);
    setFormErr("");
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim())                      return setFormErr("Nome é obrigatório.");
    if (!form.brand.trim())                     return setFormErr("Marca é obrigatória.");
    if (!form.price || parseFloat(form.price) <= 0) return setFormErr("Informe um preço válido.");
    if (!form.portion.trim())                   return setFormErr("Porção é obrigatória.");

    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || null,
      category:    form.category.trim(),
      brand:       form.brand.trim(),
      price:       parseFloat(form.price),
      portion:     form.portion.trim(),
    };

    try {
      setSaving(true);
      setFormErr("");
      if (editProd) {
        const updated = await productApi.update(editProd.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        if (pendingImg) {
          await imageStore.save(updated.id, pendingImg).catch(() => {});
          setImages((prev) => ({ ...prev, [updated.id]: pendingImg }));
        }
      } else {
        const created = await productApi.create(payload);
        setProducts((prev) => [...prev, created]);
        if (pendingImg) {
          await imageStore.save(created.id, pendingImg).catch(() => {});
          setImages((prev) => ({ ...prev, [created.id]: pendingImg }));
        }
      }
      setShowModal(false);
    } catch (err) {
      setFormErr(err?.response?.data?.error ?? err?.response?.data?.message ?? "Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!delTarget) return;
    try {
      setDeleting(true);
      await productApi.deactivate(delTarget.id);
      imageStore.remove(delTarget.id).catch(() => {});
      setProducts((prev) => prev.filter((p) => p.id !== delTarget.id));
      setImages((prev) => { const n = { ...prev }; delete n[delTarget.id]; return n; });
      setDelTarget(null);
    } catch {
      setDelTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const addCat = () => {
    const name = newCat.trim().toUpperCase();
    if (!name || allCats.includes(name)) { setAddingCat(false); setNewCat(""); return; }
    const next = [...customCats, name];
    setCustomCats(next); saveCustomCats(next); setSelCat(name);
    setAddingCat(false); setNewCat("");
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const hit = !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q);
    return hit && (selCat === "TODOS" || p.category === selCat);
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col" style={{ maxHeight: "calc(100vh - 52px)", overflow: "hidden" }}>

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background: W, borderBottom: `1px solid ${B}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div>
            <h1 className="text-xl font-bold" style={{ color: D }}>Cadastro de Produtos</h1>
            <p className="text-xs mt-0.5" style={{ color: M }}>Gerencie o cardápio do estabelecimento</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadProducts}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: GF, color: G, border: `1px solid #A5D6A7` }}>Atualizar</button>
            <button onClick={openAdd}
              className="px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: G, color: W, border: "none", boxShadow: "0 4px 12px rgba(46,125,50,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GD)}
              onMouseLeave={(e) => (e.currentTarget.style.background = G)}>
              + Novo Produto
            </button>
          </div>
        </div>

        {/* filters */}
        <div className="px-6 py-3 flex flex-col gap-3" style={{ background: W, borderBottom: `1px solid ${B}` }}>
          <input type="text" placeholder="Buscar por nome, marca ou descrição..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }}
            onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
            onBlur={(e)  => (e.target.style.border = `1.5px solid ${B}`)} />

          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold whitespace-nowrap" style={{ color: M }}>Categoria:</p>
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {allCats.map((cat) => (
                <button key={cat} onClick={() => setSelCat(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  style={{ background: selCat === cat ? GF : "#FAFAFA", color: selCat === cat ? G : M, border: `1.5px solid ${selCat === cat ? G : B}` }}>
                  {cat}
                </button>
              ))}
              {addingCat ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input autoFocus value={newCat} onChange={(e) => setNewCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addCat(); if (e.key === "Escape") { setAddingCat(false); setNewCat(""); } }}
                    placeholder="Nome..."
                    className="px-2 py-1.5 rounded-xl text-xs outline-none"
                    style={{ border: `1.5px solid ${G}`, color: D, background: "#FAFAFA", width: 130 }} />
                  <button onClick={addCat} className="px-2 py-1.5 rounded-xl text-xs font-bold" style={{ background: G, color: W, border: "none" }}>OK</button>
                  <button onClick={() => { setAddingCat(false); setNewCat(""); }} className="px-2 py-1.5 rounded-xl text-xs" style={{ background: "#F5F5F5", color: M, border: `1px solid ${B}` }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setAddingCat(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  style={{ background: OF, color: O, border: `1.5px solid #FFCC80` }}>
                  + Categoria
                </button>
              )}
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {listErr && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: RF, border: `1px solid #EF9A9A`, color: R }}>
              {listErr}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span style={{ fontSize: 48 }}>🍽️</span>
              <p className="mt-4 font-semibold" style={{ color: D }}>
                {search || selCat !== "TODOS" ? "Nenhum resultado para este filtro." : "Nenhum produto cadastrado."}
              </p>
              {!search && selCat === "TODOS" && (
                <button onClick={openAdd} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: G, color: W, border: "none" }}>
                  Cadastrar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} img={images[p.id] ?? null}
                  onEdit={() => openEdit(p)}
                  onDelete={() => setDelTarget(p)}
                  onImg={async (b64) => {
                    await imageStore.save(p.id, b64).catch(() => {});
                    setImages((prev) => ({ ...prev, [p.id]: b64 }));
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* stats */}
        <div className="flex gap-3 px-6 py-3" style={{ borderTop: `1px solid ${B}`, background: W }}>
          {[
            { label: "Total de Produtos", val: products.length },
            { label: "Categorias", val: new Set(products.map((p) => p.category)).size },
            { label: "Ticket Médio", val: products.length ? fmt(products.reduce((s, p) => s + Number(p.price), 0) / products.length) : "R$ 0" },
          ].map(({ label, val }) => (
            <div key={label} className="flex-1 text-center rounded-2xl py-4"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <p className="text-2xl font-bold" style={{ color: G }}>{val}</p>
              <p className="text-xs mt-1" style={{ color: M }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* add/edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && !saving && setShowModal(false)}>
            <motion.div className="rounded-2xl w-full max-w-md p-6 overflow-y-auto"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", maxHeight: "92vh" }}
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }}>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: D }}>{editProd ? "Editar Produto" : "Novo Produto"}</h2>
                <button onClick={() => !saving && setShowModal(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: "#F5F5F5", color: M, border: "none" }}>✕</button>
              </div>

              <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center gap-1.5">
                  <ImgSlot src={pendingImg} onFile={setPendingImg} size={96} />
                  <p className="text-xs" style={{ color: M }}>Clique para {pendingImg ? "trocar" : "adicionar"} foto</p>
                  {pendingImg && (
                    <button onClick={() => setPendingImg(null)} className="text-xs" style={{ color: R, background: "none", border: "none", cursor: "pointer" }}>
                      Remover imagem
                    </button>
                  )}
                </div>
              </div>

              <Alert msg={formErr} />

              <div className="space-y-3">
                <div><Label>Nome *</Label><Field value={form.name} onChange={f("name")} placeholder="Ex: X-Burguer Artesanal" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Marca *</Label><Field value={form.brand} onChange={f("brand")} placeholder="Ex: Casa do Chef" /></div>
                  <div><Label>Porção *</Label><Field value={form.portion} onChange={f("portion")} placeholder="Ex: 350ml" /></div>
                </div>
                <div><Label>Preço *</Label><Field type="number" step="0.01" value={form.price} onChange={f("price")} placeholder="Ex: 49.90" /></div>
                <div>
                  <Label>Descrição</Label>
                  <textarea value={form.description} onChange={f("description")} rows="2"
                    placeholder="Ex: Blend bovino, cheddar e bacon crocante"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }}
                    onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                    onBlur={(e)  => (e.target.style.border = `1.5px solid ${B}`)} />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {allCats.filter((c) => c !== "TODOS").map((cat) => (
                      <button key={cat} type="button" onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                        className="py-1.5 px-3 text-xs font-semibold rounded-xl"
                        style={{ background: form.category === cat ? GF : "#FAFAFA", color: form.category === cat ? G : M, border: `1.5px solid ${form.category === cat ? G : B}` }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => !saving && setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#F5F5F5", color: M, border: `1px solid ${B}` }}>Cancelar</button>
                <button onClick={save} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: saving ? "#A5D6A7" : G, color: W, border: "none", boxShadow: saving ? "none" : "0 4px 12px rgba(46,125,50,0.3)", cursor: saving ? "not-allowed" : "pointer" }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = GD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = saving ? "#A5D6A7" : G; }}>
                  {saving ? <><Spinner size={15} color={W} /> Salvando...</> : editProd ? "Salvar Alterações" : "Cadastrar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* deactivate modal */}
      <AnimatePresence>
        {delTarget && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 px-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && !deleting && setDelTarget(null)}>
            <motion.div className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: RF }}>🗑️</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: D }}>Desativar Produto?</h3>
              <p className="text-sm mb-5" style={{ color: M }}>
                <span className="font-semibold" style={{ color: D }}>{delTarget.name}</span> será desativado e removido do menu.
              </p>
              <div className="flex gap-3">
                <button onClick={() => !deleting && setDelTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#F5F5F5", color: M, border: `1px solid ${B}` }}>Cancelar</button>
                <button onClick={deactivate} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: deleting ? "#EF9A9A" : R, color: W, border: "none", cursor: deleting ? "not-allowed" : "pointer" }}
                  onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = "#B71C1C"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = deleting ? "#EF9A9A" : R; }}>
                  {deleting ? <><Spinner size={15} color={W} /> Desativando...</> : "Desativar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
