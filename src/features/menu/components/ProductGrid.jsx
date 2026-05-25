import { forwardRef, useMemo } from 'react';
import MenuProductCard from './MenuProductCard';
import { SkeletonCard } from '@shared/components/feedback/Skeleton';
import { EmptyState } from '@shared/components/feedback/EmptyState';

const toTitleCase = (s) =>
  String(s ?? '').toLowerCase().replace(/(^|\s|-|\/)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase());

const catKey = (s) => String(s ?? '').trim().toLowerCase();

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 16,
};

function CategorySection({ category, items, onAdd }) {
  return (
    <section data-category-section={category} style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 10,
          paddingLeft: 2,
        }}
      >
        {toTitleCase(category)}
      </h2>
      <div style={GRID_STYLE}>
        {items.map((item) => (
          <MenuProductCard
            key={item.id}
            item={item}
            onAdd={onAdd}
            outOfStock={item.outOfStock}
          />
        ))}
      </div>
    </section>
  );
}

export const ProductGrid = forwardRef(function ProductGrid(
  { items, loading, search, activeCategory, onAdd },
  ref
) {
  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.desc?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });

    if (search.trim()) {
      return [{ category: 'Resultados', items: filtered }];
    }

    const orderKeys = [];
    items.forEach((i) => {
      const k = catKey(i.category);
      if (k && !orderKeys.includes(k)) orderKeys.push(k);
    });
    const grouped = new Map();
    filtered.forEach((item) => {
      const label = toTitleCase(item.category || 'Outros');
      const k = catKey(label);
      if (!grouped.has(k)) grouped.set(k, { category: label, items: [] });
      grouped.get(k).items.push(item);
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => {
        const ai = orderKeys.indexOf(a);
        const bi = orderKeys.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b, 'pt-BR');
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
      .map(([, v]) => v);
  }, [items, search]);

  if (loading) {
    return (
      <div ref={ref} className="flex-1 overflow-y-auto p-4" style={{ background: 'var(--color-bg)' }}>
        <div style={GRID_STYLE}>
          {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!sections.length || sections.every((s) => !s.items.length)) {
    return (
      <div ref={ref} className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Nenhum produto encontrado"
          description={search ? `Sem resultados para "${search}"` : 'Nenhum produto cadastrado nessa categoria.'}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {sections.map(({ category, items: sectionItems }) => (
        <CategorySection
          key={category}
          category={category}
          items={sectionItems}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
});
