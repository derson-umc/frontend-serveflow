import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/ui/Sidebar";
import { productsApi } from "../services/api/products";
import { stockApi } from "../services/api/stock";
import { toast } from "../components/ui/Toast";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GF = "#E8F5E9";
const O  = "#F57C00";
const OF = "#FFF3E0";
const D  = "#212121";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";
const R  = "#C62828";
const RF = "#FFEBEE";

const UNITS = ["UN", "kg", "g", "L", "ml", "cx", "pct", "dz"];

const PRODUCT_TYPES = [
  {
    value: "FABRICATED", label: "Fabricado",
    desc: "Múltiplos ingredientes, modo de preparo",
    color: G, bg: GF, border: "#A5D6A7",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    value: "COMMERCIAL", label: "Comercial",
    desc: "Produto pronto, consumido direto do estoque",
    color: O, bg: OF, border: "#FFCC80",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

const EMPTY_INGREDIENT = () => ({
  stockItemId: "", stockItemName: "",
  quantityPerUnit: "", unit: "UN", validity: "",
});

function Label({ children }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {children}
    </span>
  );
}

function FieldSelect({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={onChange} style={{
      width: "100%", padding: "8px 10px", borderRadius: 8,
      border: `1.5px solid ${B}`, background: "#FAFAFA",
      fontSize: 13, color: D, outline: "none", ...style,
    }}>
      {children}
    </select>
  );
}

function FieldInput({ value, onChange, placeholder, type = "text", style }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      width: "100%", padding: "8px 10px", borderRadius: 8,
      border: `1.5px solid ${B}`, background: "#FAFAFA",
      fontSize: 13, color: D, outline: "none", boxSizing: "border-box", ...style,
    }} />
  );
}

function StatBadge({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color }}>{value}</div>
    </div>
  );
}

export default function FichaTecnica() {
  const [products, setProducts]                   = useState([]);
  const [stockItems, setStockItems]               = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [recipe, setRecipe]                       = useState(null);
  const [ingredients, setIngredients]             = useState([EMPTY_INGREDIENT()]);
  const [prepMode, setPrepMode]                   = useState("");
  const [productType, setProductType]             = useState("FABRICATED");
  const [loading, setLoading]                     = useState(false);
  const [loadingRecipe, setLoadingRecipe]         = useState(false);
  const [search, setSearch]                       = useState("");
  const [searchType, setSearchType]               = useState("name");
  const [debouncedSearch, setDebouncedSearch]     = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    productsApi.list().then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    stockApi.items.list().then(d => setStockItems(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.length === 0) { setDebouncedSearch(""); return; }
    if (search.length < 3)  { return; }
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadRecipe = useCallback(async (productId) => {
    if (!productId) { resetForm(); return; }
    setLoadingRecipe(true);
    try {
      const data = await stockApi.recipes.getByProduct(productId);
      setRecipe(data);
      setIngredients(data.ingredients.map(i => ({
        stockItemId: i.stockItemId, stockItemName: i.stockItemName,
        quantityPerUnit: String(i.quantityPerUnit), unit: i.unit, validity: i.validity ?? "",
      })));
      setPrepMode(data.preparationMode ?? "");
      setProductType(data.productType ?? "FABRICATED");
    } catch (err) {
      if (err?.response?.status === 404) resetForm();
    } finally {
      setLoadingRecipe(false);
    }
  }, []);

  const resetForm = () => {
    setRecipe(null);
    setIngredients([EMPTY_INGREDIENT()]);
    setPrepMode("");
    setProductType("FABRICATED");
  };

  const handleProductChange = (e) => {
    setSelectedProductId(e.target.value);
    loadRecipe(e.target.value);
  };

  const handleIngredientChange = (idx, field, value) => {
    setIngredients(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "stockItemId") {
        const item = stockItems.find(s => s.id === value);
        if (item) { next[idx].stockItemName = item.name; next[idx].unit = item.unit ?? "UN"; }
      }
      return next;
    });
  };

  const handleProductTypeChange = (type) => {
    setProductType(type);
    if (type === "COMMERCIAL" && ingredients.length > 1) setIngredients([ingredients[0]]);
  };

  const handleSave = async () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) { toast.error("Selecione um produto."); return; }
    const validIngredients = ingredients.filter(i => i.stockItemId && i.quantityPerUnit);
    if (validIngredients.length === 0) { toast.error("Adicione ao menos um ingrediente."); return; }
    if (isCommercial && validIngredients.some(i => !i.validity)) {
      toast.error("Validade obrigatória para produtos comerciais."); return;
    }
    const payload = {
      productId: selectedProductId, productName: product.name,
      preparationMode: prepMode || null, productType,
      ingredients: validIngredients.map(i => ({
        stockItemId: i.stockItemId, stockItemName: i.stockItemName,
        quantityPerUnit: parseFloat(i.quantityPerUnit), unit: i.unit, validity: i.validity || null,
      })),
    };
    setLoading(true);
    try {
      if (recipe) { await stockApi.recipes.update(recipe.id, payload); toast.success("Ficha atualizada!"); }
      else        { await stockApi.recipes.create(payload);            toast.success("Ficha criada!"); }
      loadRecipe(selectedProductId);
    } catch (err) {
      toast.error(err.message ?? "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const isCommercial    = productType === "COMMERCIAL";
  const totalCost       = ingredients.reduce((acc, i) => {
    const item = stockItems.find(s => s.id === i.stockItemId);
    const qty  = parseFloat(i.quantityPerUnit) || 0;
    return acc + qty * (item?.averageCost ?? 0);
  }, 0);

  const filteredProducts = debouncedSearch.length >= 3
    ? products.filter(p => {
        const q = debouncedSearch.toLowerCase();
        if (searchType === "category") return (p.category ?? "").toLowerCase().includes(q);
        return p.name.toLowerCase().includes(q);
      })
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F4F6F8", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "24px 28px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: D, margin: 0 }}>Fichas Técnicas</h1>
            <p style={{ fontSize: 12, color: M, margin: "3px 0 0" }}>
              {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          {selectedProductId && recipe && (
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: GF, color: G, border: `1px solid #A5D6A7`,
              }}>
                ✓ Ficha existente
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "flex-start" }}>

          {/* ── Coluna esquerda: lista de produtos ─────────────────────────── */}
          <div style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${B}`, background: "#FAFAFA" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>
                Produtos
              </p>
              {/* Search type selector */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[{ value: "name", label: "Nome" }, { value: "category", label: "Categoria" }].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSearchType(opt.value); setSearch(""); setDebouncedSearch(""); }}
                    style={{
                      flex: 1, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${searchType === opt.value ? G : B}`,
                      background: searchType === opt.value ? GF : W,
                      color: searchType === opt.value ? G : M, cursor: "pointer",
                    }}
                  >{opt.label}</button>
                ))}
              </div>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Buscar por ${searchType === "name" ? "nome" : "categoria"}...`}
                  style={{
                    width: "100%", padding: "7px 32px 7px 10px", borderRadius: 8,
                    border: `1.5px solid ${search.length > 0 && search.length < 3 ? O : B}`,
                    background: W, fontSize: 12, color: D, outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.border = `1.5px solid ${G}`; }}
                  onBlur={e => { e.target.style.border = `1.5px solid ${search.length > 0 && search.length < 3 ? O : B}`; }}
                />
                {search.length > 0 && (
                  <button
                    onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: M, cursor: "pointer", fontSize: 13, lineHeight: 1 }}
                  >✕</button>
                )}
              </div>
              {search.length > 0 && search.length < 3 && (
                <p style={{ fontSize: 10, color: O, margin: "4px 0 0", fontWeight: 600 }}>
                  Digite ao menos 3 caracteres
                </p>
              )}
            </div>
            <div style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
              {debouncedSearch.length < 3 ? (
                <div style={{ padding: "28px 16px", textAlign: "center" }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={B} strokeWidth={1.5} style={{ margin: "0 auto 8px", display: "block" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  <p style={{ fontSize: 12, color: M }}>
                    {search.length === 0 ? "Digite para pesquisar" : "Continue digitando..."}
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: M, fontSize: 13 }}>Nenhum produto encontrado</div>
              ) : filteredProducts.map(p => {
                const hasRecipe = selectedProductId === p.id && recipe !== null;
                const isActive  = selectedProductId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProductId(p.id); loadRecipe(p.id); setSearch(""); setDebouncedSearch(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "10px 16px", border: "none", borderBottom: `1px solid ${B}`,
                      background: isActive ? GF : "transparent",
                      cursor: "pointer", textAlign: "left", transition: "background 0.12s",
                      borderLeft: isActive ? `3px solid ${G}` : "3px solid transparent",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#F9F9F9"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                        onError={e => { e.target.style.display = "none"; }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isActive ? "#C8E6C9" : "#EEEEEE", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={isActive ? G : M} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? GD : D, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 10, color: M, marginTop: 1 }}>
                        {p.category}
                      </div>
                    </div>
                    {isActive && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: hasRecipe ? GF : OF, color: hasRecipe ? G : O, border: `1px solid ${hasRecipe ? "#A5D6A7" : "#FFCC80"}`, flexShrink: 0 }}>
                        {hasRecipe ? "Ficha" : "Nova"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Coluna direita: editor ──────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {!selectedProductId ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", padding: "60px 32px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: GF, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: D, margin: "0 0 4px" }}>Selecione um produto</p>
                <p style={{ fontSize: 13, color: M }}>Escolha um produto na lista para ver ou criar sua ficha técnica</p>
              </motion.div>
            ) : loadingRecipe ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", padding: "60px 32px", textAlign: "center", color: M, fontSize: 14 }}>
                Carregando ficha técnica...
              </motion.div>
            ) : (
              <motion.div key={selectedProductId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* ── Cabeçalho do produto ── */}
                <div style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                    {selectedProduct?.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.name}
                        style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                        onError={e => { e.target.style.display = "none"; }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: GF, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: D, margin: 0 }}>{selectedProduct?.name}</h2>
                      <p style={{ fontSize: 12, color: M, margin: "2px 0 0" }}>
                        {selectedProduct?.category} · R$ {selectedProduct?.price?.toFixed(2).replace(".", ",")}
                        {selectedProduct?.portion ? ` · ${selectedProduct.portion}` : ""}
                      </p>
                    </div>
                    {/* Stats */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <StatBadge label="Ingredientes" value={ingredients.filter(i => i.stockItemId).length} color={G} bg={GF} />
                      <StatBadge label="Custo Est." value={`R$ ${totalCost.toFixed(2).replace(".", ",")}`} color={O} bg={OF} />
                    </div>
                  </div>
                </div>

                {/* ── Corpo do editor em 2 colunas ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "flex-start" }}>

                  {/* Editor principal */}
                  <div style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", padding: 20 }}>

                    {/* Tipo de produto */}
                    <div style={{ marginBottom: 20 }}>
                      <Label>Tipo de Produto</Label>
                      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                        {PRODUCT_TYPES.map(({ value, label, desc, color, bg, border, icon }) => (
                          <button
                            key={value}
                            onClick={() => handleProductTypeChange(value)}
                            style={{
                              flex: 1, padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                              border: `2px solid ${productType === value ? border : B}`,
                              background: productType === value ? bg : "#FAFAFA",
                              textAlign: "left", transition: "all 0.15s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ color: productType === value ? color : M }}>{icon}</span>
                              <span style={{ fontWeight: 700, fontSize: 13, color: productType === value ? color : D }}>{label}</span>
                            </div>
                            <div style={{ fontSize: 11, color: M, lineHeight: 1.4 }}>{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ingredientes */}
                    <div style={{ marginBottom: isCommercial ? 20 : 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <Label>{isCommercial ? "Insumo de Estoque" : "Ingredientes / Insumos"}</Label>
                        {!isCommercial && (
                          <button
                            onClick={() => setIngredients(p => [...p, EMPTY_INGREDIENT()])}
                            style={{
                              background: GF, color: G, border: `1px solid #A5D6A7`,
                              borderRadius: 8, padding: "4px 12px", fontSize: 11,
                              fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            + Adicionar linha
                          </button>
                        )}
                      </div>

                      {/* Cabeçalho da grade */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 72px 32px", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase" }}>Insumo</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase" }}>Qtd / Un</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase" }}>Unidade</span>
                        {!isCommercial && <span />}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {ingredients.map((ing, idx) => {
                          const stockItem = stockItems.find(s => s.id === ing.stockItemId);
                          const lineCost  = (parseFloat(ing.quantityPerUnit) || 0) * (stockItem?.averageCost ?? 0);
                          return (
                            <div key={idx} style={{
                              background: ing.stockItemId ? "#FAFFFE" : "#FAFAFA",
                              borderRadius: 10, padding: "8px 10px",
                              border: `1px solid ${ing.stockItemId ? "#C8E6C9" : B}`,
                            }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 72px 32px", gap: 6, alignItems: "center" }}>
                                <FieldSelect
                                  value={ing.stockItemId}
                                  onChange={e => handleIngredientChange(idx, "stockItemId", e.target.value)}
                                >
                                  <option value="">— Insumo —</option>
                                  {stockItems.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                                  ))}
                                </FieldSelect>
                                <FieldInput
                                  type="number"
                                  value={ing.quantityPerUnit}
                                  onChange={e => handleIngredientChange(idx, "quantityPerUnit", e.target.value)}
                                  placeholder="0"
                                />
                                <FieldSelect
                                  value={ing.unit}
                                  onChange={e => handleIngredientChange(idx, "unit", e.target.value)}
                                >
                                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </FieldSelect>
                                {!isCommercial ? (
                                  <button
                                    onClick={() => { if (ingredients.length > 1) setIngredients(p => p.filter((_, i) => i !== idx)); }}
                                    disabled={ingredients.length === 1}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6, border: `1px solid #EF9A9A`,
                                      background: RF, color: R, fontWeight: 700, fontSize: 14,
                                      cursor: ingredients.length === 1 ? "not-allowed" : "pointer",
                                      opacity: ingredients.length === 1 ? 0.35 : 1,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                  >×</button>
                                ) : <span />}
                              </div>

                              {/* Info row */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {isCommercial && (
                                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: M }}>
                                      <span style={{ fontWeight: 600 }}>Validade <span style={{ color: R }}>*</span></span>
                                      <input
                                        type="date"
                                        value={ing.validity}
                                        onChange={e => handleIngredientChange(idx, "validity", e.target.value)}
                                        style={{
                                          padding: "3px 7px", borderRadius: 6,
                                          border: `1px solid ${ing.validity ? B : "#EF9A9A"}`,
                                          background: ing.validity ? W : RF,
                                          fontSize: 11, color: D, outline: "none",
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                                {lineCost > 0 && (
                                  <span style={{ fontSize: 10, color: O, fontWeight: 600 }}>
                                    custo: R$ {lineCost.toFixed(4).replace(".", ",")}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modo de preparo */}
                    {!isCommercial && (
                      <div style={{ marginBottom: 20 }}>
                        <Label>Modo de Preparo</Label>
                        <textarea
                          value={prepMode}
                          onChange={e => setPrepMode(e.target.value)}
                          placeholder="Descreva o passo a passo do preparo..."
                          rows={5}
                          style={{
                            display: "block", marginTop: 6, width: "100%",
                            padding: "10px 12px", borderRadius: 10,
                            border: `1.5px solid ${B}`, background: "#FAFAFA",
                            fontSize: 13, color: D, outline: "none",
                            resize: "vertical", boxSizing: "border-box",
                            fontFamily: "inherit", lineHeight: 1.7,
                          }}
                        />
                      </div>
                    )}

                    {/* Salvar */}
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      style={{
                        width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                        background: loading ? B : G, color: W, fontWeight: 700, fontSize: 14,
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: loading ? "none" : "0 4px 16px rgba(46,125,50,0.28)",
                        transition: "background 0.15s",
                      }}
                    >
                      {loading ? "Salvando..." : recipe ? "Atualizar Ficha Técnica" : "Criar Ficha Técnica"}
                    </button>
                  </div>

                  {/* Preview lateral */}
                  <div style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${B}`, background: "#FAFAFA" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        Resumo da Ficha
                      </span>
                    </div>
                    <div style={{ padding: "14px 16px" }}>

                      {/* Tipo badge */}
                      <div style={{ marginBottom: 14 }}>
                        {PRODUCT_TYPES.filter(t => t.value === productType).map(t => (
                          <span key={t.value} style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "4px 12px", borderRadius: 20,
                            fontSize: 11, fontWeight: 700,
                            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
                          }}>
                            {t.icon}{t.label}
                          </span>
                        ))}
                      </div>

                      {/* Lista de ingredientes */}
                      {ingredients.filter(i => i.stockItemId && i.quantityPerUnit).length > 0 ? (
                        <>
                          <p style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>
                            Ingredientes
                          </p>
                          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                            <tbody>
                              {ingredients.filter(i => i.stockItemId).map((ing, i) => {
                                const item = stockItems.find(s => s.id === ing.stockItemId);
                                const cost = (parseFloat(ing.quantityPerUnit) || 0) * (item?.averageCost ?? 0);
                                return (
                                  <tr key={i} style={{ borderBottom: `1px solid #F0F0F0` }}>
                                    <td style={{ padding: "6px 0 6px 0", fontSize: 12, color: D }}>
                                      {ing.stockItemName || "—"}
                                      {ing.validity && <div style={{ fontSize: 9, color: M }}>val. {ing.validity}</div>}
                                    </td>
                                    <td style={{ padding: "6px 0", fontSize: 12, color: M, textAlign: "right", whiteSpace: "nowrap" }}>
                                      {Number(ing.quantityPerUnit || 0).toLocaleString("pt-BR")} {ing.unit}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </>
                      ) : (
                        <p style={{ fontSize: 12, color: M, textAlign: "center", padding: "16px 0" }}>
                          Nenhum ingrediente adicionado
                        </p>
                      )}

                      {/* Custo */}
                      <div style={{
                        background: OF, border: `1px solid #FFCC80`, borderRadius: 10,
                        padding: "10px 12px", marginBottom: 14,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: O, textTransform: "uppercase", marginBottom: 2 }}>
                          Custo estimado
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: O }}>
                          R$ {totalCost.toFixed(2).replace(".", ",")}
                        </div>
                        {selectedProduct?.price > 0 && (
                          <div style={{ fontSize: 10, color: M, marginTop: 2 }}>
                            {((totalCost / selectedProduct.price) * 100).toFixed(1)}% do preço de venda
                          </div>
                        )}
                      </div>

                      {/* Modo de preparo (preview) */}
                      {prepMode && (
                        <>
                          <p style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
                            Preparo
                          </p>
                          <p style={{ fontSize: 12, color: D, lineHeight: 1.7, margin: 0, whiteSpace: "pre-line",
                            maxHeight: 120, overflow: "hidden", maskImage: "linear-gradient(to bottom, black 70%, transparent)" }}>
                            {prepMode}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
