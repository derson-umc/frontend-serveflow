import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { palette } from '@styles/ds';
import { useAllProducts } from '../hooks/useProducts';
import { useProductCategories } from '../hooks/useProductCategories';
import { imageStore } from '@features/products/services/imageStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import Sidebar from '@shared/components/layout/Sidebar';
import { ProductCard } from './ProductCard';
import { ProductFormModal } from './ProductFormModal';
import { ProductDeactivateModal } from './ProductDeactivateModal';
import { CategoryModal } from './CategoryModal';



export default function CadastroProdutos() {
  const { data: products = [], isLoading, isError } = useAllProducts();
  const { hasRole } = useAuthStore();
  const canManageCategories = hasRole('admin', 'gerente');

  const [localImages, setLocalImages] = useState({});
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { allCategories, addCategory, renameCategory, deleteCategory, isCustom } =
    useProductCategories(products.map((p) => p.category));

  useEffect(() => {
    const missingIds = products.filter((p) => !p.imageUrl).map((p) => p.id);
    if (!missingIds.length) return;
    imageStore.getMany(missingIds).then(setLocalImages).catch(() => {});
  }, [products]);

  const filtered = products.filter((p) => {
    const query = search.toLowerCase();
    return !query
      || p.name.toLowerCase().includes(query)
      || (p.description ?? '').toLowerCase().includes(query)
      || (p.brand ?? '').toLowerCase().includes(query);
  });

  function openCreateModal() {
    setEditingProduct(null);
    setShowFormModal(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setShowFormModal(true);
  }

  function closeFormModal() {
    setShowFormModal(false);
    setEditingProduct(null);
  }


  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F5F5' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>

        {/* ── Busca + Filtros ────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-3 flex flex-col gap-2.5"
          style={{ background: palette.white, borderBottom: `1px solid ${palette.border}` }}>

          {/* Busca + Botão Categoria + Botão Novo Produto */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1" style={{ maxWidth: 420 }}>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15"
                fill="none" viewBox="0 0 24 24" stroke={palette.textMuted} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, marca ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#FAFAFA', border: `1.5px solid ${palette.border}`, color: palette.textSecondary }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${palette.green}`)}
                onBlur={(e) => (e.target.style.border = `1.5px solid ${palette.border}`)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
                  style={{ width: 18, height: 18, background: palette.border, border: 'none', color: palette.textMuted, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex-1" />

            {canManageCategories && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0"
                style={{ background: palette.orangeSurface, color: palette.orange, border: `1px dashed ${palette.orange}`, cursor: 'pointer' }}
              >
                + Categoria
              </button>
            )}

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0"
              style={{ background: palette.green, color: palette.white, border: 'none', boxShadow: '0 4px 12px rgba(46,125,50,0.28)', cursor: 'pointer', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = palette.greenDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = palette.green)}
            >
              + Novo Produto
            </button>
          </div>

          {/* Contador de resultados filtrados */}
          {search && !isLoading && (
            <p className="text-xs" style={{ color: palette.textMuted }}>
              {filtered.length === 0
                ? 'Nenhum produto encontrado'
                : `${filtered.length} produto${filtered.length > 1 ? 's' : ''} encontrado${filtered.length > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* ── Grid de produtos ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {isError && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Erro ao carregar produtos. Verifique a conexão com o servidor.
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="rounded-full border-2 animate-spin"
                style={{ width: 28, height: 28, borderColor: `${palette.green}30`, borderTopColor: palette.green }} />
              <p className="text-xs" style={{ color: palette.textMuted }}>Carregando produtos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🍽️</div>
              <p className="font-semibold mb-1" style={{ color: palette.textSecondary }}>
                {search ? 'Nenhum resultado para este filtro' : 'Nenhum produto cadastrado'}
              </p>
              <p className="text-xs mb-5" style={{ color: palette.textMuted }}>
                {search ? 'Tente outros termos ou remova o filtro' : 'Comece adicionando seu primeiro produto ao cardápio'}
              </p>
              {!search && (
                <button onClick={openCreateModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: palette.green, color: palette.white, border: 'none' }}>
                  Cadastrar primeiro produto
                </button>
              )}
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: '#F0F0F0', color: palette.textMuted, border: 'none' }}>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(220px,100%),1fr))' }}>
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  imageUrl={p.imageUrl ?? localImages[p.id] ?? null}
                  onEdit={() => openEditModal(p)}
                  onDelete={() => setDeactivateTarget(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showFormModal && (
          <ProductFormModal
            product={editingProduct}
            allCategories={allCategories}
            onClose={closeFormModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deactivateTarget && (
          <ProductDeactivateModal
            product={deactivateTarget}
            onClose={() => setDeactivateTarget(null)}
          />
        )}
      </AnimatePresence>

      <CategoryModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        allCategories={allCategories}
        isCustom={isCustom}
        onAdd={addCategory}
        onRename={renameCategory}
        onDelete={deleteCategory}
      />
    </div>
  );
}
