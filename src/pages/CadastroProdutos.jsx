import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { productsApi } from '../services/api/products';
import { imageStore, fileToBase64 } from '../services/imageStore';
import Sidebar from '../components/ui/Sidebar';

const G = '#2E7D32', GD = '#1B5E20', GF = '#E8F5E9';
const O = '#F57C00', OF = '#FFF3E0';
const D = '#424242', M = '#757575', B = '#E0E0E0', W = '#FFFFFF';
const R = '#C62828', RF = '#FFEBEE';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CAT_KEY = 'sf_categories';
const BASE_CATS = [
  'PRATOS PRINCIPAIS', 'PRATOS A LA CARTE', 'SUCOS', 'PROMOÇÃO',
  'CERVEJAS', 'BEBIDAS', 'SOBREMESAS', 'ACOMPANHAMENTOS', 'PORÇÕES',
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

const productSchema = z.object({
  name:                   z.string().min(2, 'Nome é obrigatório (mínimo 2 caracteres)'),
  brand:                  z.string().min(1, 'Marca é obrigatória'),
  portion:                z.string().min(1, 'Porção é obrigatória'),
  price:                  z.coerce.number({ invalid_type_error: 'Informe um preço válido' }).positive('Preço deve ser maior que zero'),
  description:            z.string().optional(),
  category:               z.string().min(1, 'Categoria é obrigatória'),
  requiresTechnicalSheet: z.boolean().optional(),
});

function Spinner({ size = 20, color = G }) {
  return (
    <div className="rounded-full border-2 animate-spin flex-shrink-0"
      style={{ width: size, height: size, borderColor: `${color}30`, borderTopColor: color }} />
  );
}

function ProductCard({ p, img, onEdit, onDelete, onImg }) {
  const ref  = useRef(null);
  const isActive = p.active !== false;

  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/') || f.size > 8388608) return;
    onImg(f, await fileToBase64(f));
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 14px 36px rgba(0,0,0,0.13)' }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: W,
        border: `1px solid ${isActive ? '#E0E0E0' : '#FFCDD2'}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        borderTop: `3px solid ${isActive ? G : '#EF5350'}`,
        opacity: isActive ? 1 : 0.82,
      }}>

      {/* ── Image area ── */}
      <div
        className="relative w-full group cursor-pointer"
        style={{ height: 136, background: isActive ? GF : '#FFF3F3', flexShrink: 0 }}
        onClick={() => ref.current?.click()}>

        {img
          ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? '#A5D6A7' : '#EF9A9A'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1" />
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#A5D6A7' : '#EF9A9A', letterSpacing: '0.03em' }}>
                Sem imagem
              </span>
            </div>
          )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(3px)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-white font-semibold" style={{ fontSize: 11 }}>{img ? 'Trocar foto' : 'Adicionar foto'}</span>
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col" style={{ padding: '12px 14px 10px' }}>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
            padding: '3px 9px', borderRadius: 20,
            background: OF, color: O,
          }}>{p.category}</span>
          {p.requiresTechnicalSheet && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 9px', borderRadius: 20,
              background: GF, color: G, border: `1px solid #A5D6A7`,
            }}>Ficha Técnica</span>
          )}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
            padding: '3px 9px', borderRadius: 20,
            background: isActive ? GF : RF,
            color: isActive ? G : R,
            border: `1px solid ${isActive ? '#A5D6A7' : '#EF9A9A'}`,
          }}>{isActive ? 'Ativo' : 'Inativo'}</span>
        </div>

        {/* Name */}
        <p style={{ fontSize: 14, fontWeight: 800, color: D, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>

        {/* Brand · Portion */}
        {(p.brand || p.portion) && (
          <p style={{ fontSize: 11, color: M, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            {[p.brand, p.portion].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Description */}
        {p.description && (
          <p style={{
            fontSize: 11, color: '#9E9E9E', lineHeight: 1.55,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginTop: 'auto', paddingTop: 4,
          }}>
            {p.description}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #F0F0F0', padding: '10px 14px' }}>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 10, color: M, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>Preço</p>
            <p style={{ fontSize: 17, fontWeight: 900, color: G, letterSpacing: '-0.01em' }}>{fmt(p.price)}</p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Edit */}
            <button onClick={onEdit} title="Editar produto"
              style={{ width: 32, height: 32, borderRadius: 9, background: '#E3F2FD', border: 'none', color: '#1565C0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#BBDEFB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E3F2FD')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            {/* Delete */}
            <button onClick={onDelete} title="Desativar produto"
              style={{ width: 32, height: 32, borderRadius: 9, background: RF, border: 'none', color: R, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FFCDD2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = RF)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default function CadastroProdutos() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canManage = ['root', 'admin', 'gerente'].includes(user?.role ?? '');

  const [products,      setProducts]      = useState([]);
  const [images,        setImages]        = useState({});
  const [loading,       setLoading]       = useState(true);
  const [deleting,      setDeleting]      = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editProd,      setEditProd]      = useState(null);
  const [delTarget,     setDelTarget]     = useState(null);
  const [search,        setSearch]        = useState('');
  const [selCat,        setSelCat]        = useState('TODOS');
  const [listErr,       setListErr]       = useState('');
  const [serverFormErr, setServerFormErr] = useState('');
  const [pendingImg,    setPendingImg]    = useState(null);
  const [pendingImgUrl, setPendingImgUrl] = useState(null);
  const [uploadingImg,  setUploadingImg]  = useState(false);
  const [customCats,    setCustomCats]    = useState(loadCustomCats);
  const [addingCat,     setAddingCat]     = useState(false);
  const [newCat,        setNewCat]        = useState('');
  const [modalActive,   setModalActive]   = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', brand: '', portion: '', price: '', description: '', category: 'PRATOS PRINCIPAIS', requiresTechnicalSheet: false },
  });

  const categoryValue = watch('category');

  const allCats = ['TODOS', ...new Set([...BASE_CATS, ...customCats, ...products.map((p) => p.category).filter(Boolean)])];

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setListErr('');
      const data = await productsApi.list();
      setProducts(data);
      if (data.length > 0) {
        const imgs = await imageStore.getMany(data.map((p) => p.id)).catch(() => ({}));
        setImages(imgs);
      }
    } catch {
      setListErr('Erro ao carregar produtos. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) { navigate('/dashboard'); return; }
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImgFile = useCallback(async (file, base64) => {
    setPendingImg(base64);
    setPendingImgUrl(null);
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await productsApi.uploadImage(formData);
      setPendingImgUrl(typeof url === 'string' ? url : url?.url ?? null);
    } catch {
      setServerFormErr('Falha ao enviar imagem. O produto será salvo sem foto.');
    } finally {
      setUploadingImg(false);
    }
  }, []);

  const openAdd = () => {
    setEditProd(null);
    reset({ name: '', brand: '', portion: '', price: '', description: '', category: 'PRATOS PRINCIPAIS', requiresTechnicalSheet: false });
    setPendingImg(null); setPendingImgUrl(null);
    setModalActive(true);
    setServerFormErr(''); setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProd(p);
    reset({ name: p.name ?? '', brand: p.brand ?? '', portion: p.portion ?? '', price: p.price ?? '', description: p.description ?? '', category: p.category ?? 'PRATOS PRINCIPAIS', requiresTechnicalSheet: p.requiresTechnicalSheet ?? false });
    const preview = p.imageUrl ?? images[p.id] ?? null;
    setPendingImg(preview); setPendingImgUrl(p.imageUrl ?? null);
    setModalActive(p.active !== false);
    setServerFormErr(''); setShowModal(true);
  };

  const onSave = async (data) => {
    if (uploadingImg) { setServerFormErr('Aguarde o envio da imagem terminar.'); return; }
    setServerFormErr('');

    const payload = {
      name:                   data.name.trim(),
      description:            data.description?.trim() || null,
      category:               data.category.trim(),
      brand:                  data.brand.trim(),
      price:                  data.price,
      portion:                data.portion.trim(),
      imageUrl:               pendingImgUrl ?? null,
      requiresTechnicalSheet: data.requiresTechnicalSheet ?? false,
      active:                 modalActive,
    };

    try {
      if (editProd) {
        const updated = await productsApi.update(editProd.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        if (pendingImg && !pendingImgUrl) {
          await imageStore.save(updated.id, pendingImg).catch(() => {});
          setImages((prev) => ({ ...prev, [updated.id]: pendingImg }));
        }
      } else {
        const created = await productsApi.create(payload);
        setProducts((prev) => [...prev, created]);
        if (pendingImg && !pendingImgUrl) {
          await imageStore.save(created.id, pendingImg).catch(() => {});
          setImages((prev) => ({ ...prev, [created.id]: pendingImg }));
        }
      }
      setShowModal(false);
    } catch (err) {
      setServerFormErr(err?.response?.data?.error ?? err?.response?.data?.message ?? 'Erro ao salvar produto.');
    }
  };

  const deactivate = async () => {
    if (!delTarget) return;
    try {
      setDeleting(true);
      await productsApi.deactivate(delTarget.id);
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
    if (!name || allCats.includes(name)) { setAddingCat(false); setNewCat(''); return; }
    const next = [...customCats, name];
    setCustomCats(next); saveCustomCats(next); setSelCat(name);
    setAddingCat(false); setNewCat('');
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const hit = !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q);
    return hit && (selCat === 'TODOS' || p.category === selCat);
  });

  const imgRef = useRef(null);
  const pickImg = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/') || f.size > 8388608) return;
    await handleImgFile(f, await fileToBase64(f));
    e.target.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F5F5' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 52px)', overflow: 'hidden' }}>

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background: W, borderBottom: `1px solid ${B}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div>
            <h1 className="text-xl font-bold" style={{ color: D }}>Cadastro de Produtos</h1>
            <p className="text-xs mt-0.5" style={{ color: M }}>Gerencie o cardápio do estabelecimento</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadProducts}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: GF, color: G, border: '1px solid #A5D6A7' }}>Atualizar</button>
            <button onClick={openAdd}
              className="px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: G, color: W, border: 'none', boxShadow: '0 4px 12px rgba(46,125,50,0.3)' }}
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
            style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D }}
            onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
            onBlur={(e)  => (e.target.style.border = `1.5px solid ${B}`)} />

          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold whitespace-nowrap" style={{ color: M }}>Categoria:</p>
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {allCats.map((cat) => (
                <button key={cat} onClick={() => setSelCat(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  style={{ background: selCat === cat ? GF : '#FAFAFA', color: selCat === cat ? G : M, border: `1.5px solid ${selCat === cat ? G : B}` }}>
                  {cat}
                </button>
              ))}
              {addingCat ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input autoFocus value={newCat} onChange={(e) => setNewCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCat(); if (e.key === 'Escape') { setAddingCat(false); setNewCat(''); } }}
                    placeholder="Nome..."
                    className="px-2 py-1.5 rounded-xl text-xs outline-none"
                    style={{ border: `1.5px solid ${G}`, color: D, background: '#FAFAFA', width: 130 }} />
                  <button onClick={addCat} className="px-2 py-1.5 rounded-xl text-xs font-bold" style={{ background: G, color: W, border: 'none' }}>OK</button>
                  <button onClick={() => { setAddingCat(false); setNewCat(''); }} className="px-2 py-1.5 rounded-xl text-xs" style={{ background: '#F5F5F5', color: M, border: `1px solid ${B}` }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setAddingCat(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  style={{ background: OF, color: O, border: '1.5px solid #FFCC80' }}>
                  + Categoria
                </button>
              )}
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {listErr && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: RF, border: '1px solid #EF9A9A', color: R }}>
              {listErr}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span style={{ fontSize: 48 }}>🍽️</span>
              <p className="mt-4 font-semibold" style={{ color: D }}>
                {search || selCat !== 'TODOS' ? 'Nenhum resultado para este filtro.' : 'Nenhum produto cadastrado.'}
              </p>
              {!search && selCat === 'TODOS' && (
                <button onClick={openAdd} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: G, color: W, border: 'none' }}>
                  Cadastrar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} img={p.imageUrl ?? images[p.id] ?? null}
                  onEdit={() => openEdit(p)}
                  onDelete={() => setDelTarget(p)}
                  onImg={async (file, b64) => {
                    try {
                      const formData = new FormData();
                      formData.append('file', file);
                      const url = await productsApi.uploadImage(formData);
                      const imageUrl = typeof url === 'string' ? url : url?.url ?? null;
                      const updated = await productsApi.update(p.id, { imageUrl });
                      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
                    } catch {
                      await imageStore.save(p.id, b64).catch(() => {});
                      setImages((prev) => ({ ...prev, [p.id]: b64 }));
                    }
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* stats */}
        <div className="flex gap-3 px-6 py-3" style={{ borderTop: `1px solid ${B}`, background: W }}>
          {[
            { label: 'Total de Produtos', val: products.length },
            { label: 'Categorias', val: new Set(products.map((p) => p.category)).size },
            { label: 'Ticket Médio', val: products.length ? fmt(products.reduce((s, p) => s + Number(p.price), 0) / products.length) : 'R$ 0' },
          ].map(({ label, val }) => (
            <div key={label} className="flex-1 text-center rounded-2xl py-4"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && !isSubmitting && setShowModal(false)}>

            <motion.div className="rounded-2xl w-full overflow-hidden"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', maxWidth: 520, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
              initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}>

              {/* Modal header */}
              <div style={{ borderBottom: `1px solid ${B}` }}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${G}, ${GD})`, borderRadius: '8px 8px 0 0' }} />
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-xl"
                      style={{ width: 36, height: 36, background: GF, flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={2}>
                        {editProd
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />}
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-bold" style={{ color: D, fontSize: 15, lineHeight: 1.2 }}>
                        {editProd ? 'Atualizar Produto' : 'Cadastrar Produto'}
                      </h2>
                      <p style={{ fontSize: 11, color: M, marginTop: 1 }}>
                        {editProd ? 'Edite os dados do produto abaixo' : 'Preencha os dados do novo produto'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => !isSubmitting && setShowModal(false)}
                    className="flex items-center justify-center rounded-xl transition-colors"
                    style={{ width: 30, height: 30, background: '#F5F5F5', border: 'none', color: M, cursor: 'pointer', fontSize: 13 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#EEEEEE')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#F5F5F5')}>✕</button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1" style={{ padding: '20px 24px' }}>

                {/* Image picker */}
                <div className="flex items-start gap-4 mb-5 pb-5" style={{ borderBottom: `1px solid #F5F5F5` }}>
                  <div className="relative cursor-pointer group flex-shrink-0" style={{ width: 88, height: 88 }}
                    onClick={() => !uploadingImg && imgRef.current?.click()}>
                    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
                      style={{ background: GF, border: `2px dashed ${pendingImg ? G : '#A5D6A7'}`, transition: 'border-color 0.2s' }}>
                      {pendingImg
                        ? <img src={pendingImg} alt="" className="w-full h-full object-cover" />
                        : <span style={{ fontSize: 32, opacity: 0.4 }}>🍽️</span>}
                    </div>
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.35)' }}>
                      {uploadingImg ? <Spinner size={20} color="#FFFFFF" /> : <span className="text-white" style={{ fontSize: 18 }}>📷</span>}
                    </div>
                    <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={pickImg} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1" style={{ paddingTop: 8 }}>
                    <p className="font-semibold text-xs" style={{ color: D }}>Foto do Produto</p>
                    <p className="text-xs" style={{ color: M, lineHeight: 1.5 }}>
                      {uploadingImg ? 'Enviando imagem...' : 'Clique na área ao lado para selecionar uma foto. Máx. 8 MB.'}
                    </p>
                    {pendingImgUrl && (
                      <span className="text-xs font-semibold" style={{ color: G }}>✓ Foto salva no servidor</span>
                    )}
                    {pendingImg && !uploadingImg && (
                      <button type="button" onClick={() => { setPendingImg(null); setPendingImgUrl(null); }}
                        className="text-xs font-semibold w-fit"
                        style={{ color: R, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Remover imagem
                      </button>
                    )}
                  </div>
                </div>

                {serverFormErr && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs mb-4"
                    style={{ background: RF, border: '1px solid #EF9A9A', color: R }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {serverFormErr}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSave)} noValidate id="product-form">
                  {/* Section: Identificação */}
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: G, letterSpacing: '0.1em' }}>Identificação</p>
                  <div style={{ marginBottom: 16 }}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: D }}>Nome *</label>
                    <input {...register('name')} placeholder="Ex: X-Burguer Artesanal"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#FAFAFA', border: `1.5px solid ${errors.name ? '#EF5350' : B}`, color: D, transition: 'border-color 0.15s' }}
                      onFocus={(e) => (e.target.style.border = `1.5px solid ${errors.name ? '#EF5350' : G}`)}
                      onBlur={(e)  => (e.target.style.border  = `1.5px solid ${errors.name ? '#EF5350' : B}`)} />
                    {errors.name && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.name.message}</p>}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: D }}>Descrição</label>
                    <textarea {...register('description')} rows={2}
                      placeholder="Ex: Blend bovino, cheddar e bacon crocante"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D, transition: 'border-color 0.15s' }}
                      onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                      onBlur={(e)  => (e.target.style.border  = `1.5px solid ${B}`)} />
                  </div>

                  {/* Section: Detalhes */}
                  <div style={{ borderTop: `1px solid #F5F5F5`, paddingTop: 16, marginBottom: 16 }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: G, letterSpacing: '0.1em' }}>Detalhes</p>
                    <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: D }}>Marca *</label>
                        <input {...register('brand')} placeholder="Ex: Casa do Chef"
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: '#FAFAFA', border: `1.5px solid ${errors.brand ? '#EF5350' : B}`, color: D, transition: 'border-color 0.15s' }}
                          onFocus={(e) => (e.target.style.border = `1.5px solid ${errors.brand ? '#EF5350' : G}`)}
                          onBlur={(e)  => (e.target.style.border  = `1.5px solid ${errors.brand ? '#EF5350' : B}`)} />
                        {errors.brand && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.brand.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: D }}>Porção *</label>
                        <input {...register('portion')} placeholder="Ex: 350ml"
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: '#FAFAFA', border: `1.5px solid ${errors.portion ? '#EF5350' : B}`, color: D, transition: 'border-color 0.15s' }}
                          onFocus={(e) => (e.target.style.border = `1.5px solid ${errors.portion ? '#EF5350' : G}`)}
                          onBlur={(e)  => (e.target.style.border  = `1.5px solid ${errors.portion ? '#EF5350' : B}`)} />
                        {errors.portion && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.portion.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: D }}>Preço *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: M }}>R$</span>
                        <input {...register('price')} type="number" step="0.01" min="0.01" placeholder="0,00"
                          className="w-full py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: '#FAFAFA', border: `1.5px solid ${errors.price ? '#EF5350' : B}`, color: D, paddingLeft: 36, transition: 'border-color 0.15s' }}
                          onFocus={(e) => (e.target.style.border = `1.5px solid ${errors.price ? '#EF5350' : G}`)}
                          onBlur={(e)  => (e.target.style.border  = `1.5px solid ${errors.price ? '#EF5350' : B}`)} />
                      </div>
                      {errors.price && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.price.message}</p>}
                    </div>
                  </div>

                  {/* Section: Categoria */}
                  <div style={{ borderTop: `1px solid #F5F5F5`, paddingTop: 16, marginBottom: 16 }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: G, letterSpacing: '0.1em' }}>Categoria *</p>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-1.5">
                          {allCats.filter((c) => c !== 'TODOS').map((cat) => (
                            <button key={cat} type="button" onClick={() => field.onChange(cat)}
                              className="py-1.5 px-3 text-xs font-semibold rounded-xl transition-all"
                              style={{
                                background: field.value === cat ? GF : '#FAFAFA',
                                color: field.value === cat ? G : M,
                                border: `1.5px solid ${field.value === cat ? G : B}`,
                                boxShadow: field.value === cat ? '0 2px 8px rgba(46,125,50,0.15)' : 'none',
                              }}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                    {errors.category && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.category.message}</p>}
                  </div>

                  {/* Section: Opções */}
                  <div style={{ borderTop: `1px solid #F5F5F5`, paddingTop: 16 }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: G, letterSpacing: '0.1em' }}>Opções</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                      {/* Ficha Técnica toggle */}
                      <Controller
                        name="requiresTechnicalSheet"
                        control={control}
                        render={({ field }) => (
                          <div
                            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer select-none transition-colors"
                            style={{ background: field.value ? GF : '#FAFAFA', border: `1.5px solid ${field.value ? '#A5D6A7' : B}` }}
                            onClick={() => field.onChange(!field.value)}>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: field.value ? G : D }}>Exige Ficha Técnica</p>
                              <p className="text-xs mt-0.5" style={{ color: M }}>Requer ficha técnica com ingredientes</p>
                            </div>
                            <div className="relative flex-shrink-0" style={{ width: 40, height: 22 }}>
                              <div className="absolute inset-0 rounded-full" style={{ background: field.value ? G : B, transition: 'background 0.2s' }} />
                              <div className="absolute top-1 rounded-full" style={{ width: 14, height: 14, background: W, left: field.value ? 22 : 4, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                            </div>
                          </div>
                        )}
                      />

                      {/* Status toggle */}
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer select-none transition-colors"
                        style={{ background: modalActive ? GF : RF, border: `1.5px solid ${modalActive ? '#A5D6A7' : '#EF9A9A'}` }}
                        onClick={() => setModalActive((v) => !v)}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: modalActive ? G : R }}>Status</p>
                          <p className="text-xs mt-0.5" style={{ color: M }}>
                            {modalActive ? 'Produto visível no cardápio' : 'Produto oculto do cardápio'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold" style={{ color: modalActive ? G : R }}>
                            {modalActive ? 'Ativo' : 'Inativo'}
                          </span>
                          <div className="relative" style={{ width: 40, height: 22 }}>
                            <div className="absolute inset-0 rounded-full" style={{ background: modalActive ? G : '#EF9A9A', transition: 'background 0.2s' }} />
                            <div className="absolute top-1 rounded-full" style={{ width: 14, height: 14, background: W, left: modalActive ? 22 : 4, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${B}`, background: '#FAFAFA' }}>
                <button type="button" onClick={() => !isSubmitting && setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: W, color: M, border: `1.5px solid ${B}`, cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = W)}>
                  Cancelar
                </button>
                <button type="submit" form="product-form" disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  style={{ background: isSubmitting ? '#A5D6A7' : G, color: W, border: 'none', boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(46,125,50,0.35)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = GD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isSubmitting ? '#A5D6A7' : G; }}>
                  {isSubmitting
                    ? <><Spinner size={15} color={W} /> Salvando...</>
                    : editProd ? 'Atualizar Produto' : 'Cadastrar Produto'}
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
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && !deleting && setDelTarget(null)}>
            <motion.div className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: RF }}>🗑️</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: D }}>Desativar Produto?</h3>
              <p className="text-sm mb-5" style={{ color: M }}>
                <span className="font-semibold" style={{ color: D }}>{delTarget.name}</span> será desativado e removido do menu.
              </p>
              <div className="flex gap-3">
                <button onClick={() => !deleting && setDelTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#F5F5F5', color: M, border: `1px solid ${B}` }}>Cancelar</button>
                <button onClick={deactivate} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: deleting ? '#EF9A9A' : R, color: W, border: 'none', cursor: deleting ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#B71C1C'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = deleting ? '#EF9A9A' : R; }}>
                  {deleting ? <><Spinner size={15} color={W} /> Desativando...</> : 'Desativar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
