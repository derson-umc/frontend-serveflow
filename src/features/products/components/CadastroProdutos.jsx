import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { palette } from '@styles/ds';
import { useAllProducts } from '../hooks/useProducts';
import { useProductCategories, normalizeCategory } from '../hooks/useProductCategories';
import { imageStore } from '@features/products/services/imageStore';
import Sidebar from '@shared/components/layout/Sidebar';
import { ProductCard } from './ProductCard';
import { ProductFormModal } from './ProductFormModal';
import { ProductDeactivateModal } from './ProductDeactivateModal';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CadastroProdutos() {
  const { data: products = [], isLoading, isError } = useAllProducts();

  const [localImages, setLocalImages] = useState({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { allCategories, addCategory } = useProductCategories(products.map((p) => p.category));
  const filterCategories = ['TODOS', ...allCategories];

  useEffect(() => {
    const missingIds = products.filter((p) => !p.imageUrl).map((p) => p.id);
    if (!missingIds.length) return;
    imageStore.getMany(missingIds).then(setLocalImages).catch(() => {});
  }, [products]);

  const filtered = products.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch = !query
      || p.name.toLowerCase().includes(query)
      || (p.description ?? '').toLowerCase().includes(query)
      || (p.brand ?? '').toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'TODOS'
      || normalizeCategory(p.category) === normalizeCategory(selectedCategory);
    return matchesSearch && matchesCategory;
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

  function handleAddCategory() {
    if (addCategory(newCategoryName)) {
      setSelectedCategory(newCategoryName.trim());
    }
    setAddingCategory(false);
    setNewCategoryName('');
  }

  const stats = [
    { label: 'Total de Produtos', value: products.length },
    { label: 'Categorias', value: new Set(products.map((p) => p.category)).size },
    {
      label: 'Ticket Médio',
      value: products.length
        ? formatCurrency(products.reduce((sum, p) => sum + Number(p.price), 0) / products.length)
        : 'R$ 0',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F5F5' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 52px)', overflow: 'hidden' }}>

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: palette.white, borderBottom: `1px solid ${palette.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: palette.textSecondary }}>Cadastro de Produtos</h1>
            <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>Gerencie o cardápio do estabelecimento</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: palette.green, color: palette.white, border: 'none', boxShadow: '0 4px 12px rgba(46,125,50,0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = palette.greenDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = palette.green)}
          >
            + Novo Produto
          </button>
        </div>

        <div className="px-6 py-3 flex flex-col gap-3"
          style={{ background: palette.white, borderBottom: `1px solid ${palette.border}` }}>
          <input
            type="text"
            placeholder="Buscar por nome, marca ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#FAFAFA', border: `1.5px solid ${palette.border}`, color: palette.textSecondary }}
            onFocus={(e) => (e.target.style.border = `1.5px solid ${palette.green}`)}
            onBlur={(e) => (e.target.style.border = `1.5px solid ${palette.border}`)}
          />

          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold whitespace-nowrap" style={{ color: palette.textMuted }}>Categoria:</p>
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  style={{
                    background: selectedCategory === cat ? palette.greenSurface : '#FAFAFA',
                    color: selectedCategory === cat ? palette.green : palette.textMuted,
                    border: `1.5px solid ${selectedCategory === cat ? palette.green : palette.border}`,
                  }}
                >
                  {cat === 'TODOS' ? 'Todos' : cat}
                </button>
              ))}

              {addingCategory ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCategory();
                      if (e.key === 'Escape') { setAddingCategory(false); setNewCategoryName(''); }
                    }}
                    placeholder="Nome..."
                    className="px-2 py-1.5 rounded-xl text-xs outline-none"
                    style={{ border: `1.5px solid ${palette.green}`, color: palette.textSecondary, background: '#FAFAFA', width: 130 }}
                  />
                  <button onClick={handleAddCategory} className="px-2 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: palette.green, color: palette.white, border: 'none' }}>
                    OK
                  </button>
                  <button onClick={() => { setAddingCategory(false); setNewCategoryName(''); }}
                    className="px-2 py-1.5 rounded-xl text-xs"
                    style={{ background: '#F5F5F5', color: palette.textMuted, border: `1px solid ${palette.border}` }}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCategory(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  style={{ background: palette.orangeSurface, color: palette.orange, border: `1.5px solid ${palette.orangeBorder}` }}
                >
                  + Categoria
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isError && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red }}>
              Erro ao carregar produtos. Verifique a conexão com o servidor.
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="rounded-full border-2 animate-spin"
                style={{ width: 24, height: 24, borderColor: `${palette.green}30`, borderTopColor: palette.green }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span style={{ fontSize: 48 }}>🍽️</span>
              <p className="mt-4 font-semibold" style={{ color: palette.textSecondary }}>
                {search || selectedCategory !== 'TODOS'
                  ? 'Nenhum resultado para este filtro.'
                  : 'Nenhum produto cadastrado.'}
              </p>
              {!search && selectedCategory === 'TODOS' && (
                <button onClick={openCreateModal} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: palette.green, color: palette.white, border: 'none' }}>
                  Cadastrar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
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

        <div className="flex gap-3 px-6 py-3"
          style={{ borderTop: `1px solid ${palette.border}`, background: palette.white }}>
          {stats.map(({ label, value }) => (
            <div key={label} className="flex-1 text-center rounded-2xl py-4"
              style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p className="text-2xl font-bold" style={{ color: palette.green }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: palette.textMuted }}>{label}</p>
            </div>
          ))}
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
    </div>
  );
}
