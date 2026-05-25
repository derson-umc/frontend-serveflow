import { useEffect, useRef, useCallback } from 'react';
import { CategoryNav, CategoryPill } from '@shared/components/ui/Tabs';

export function CategoryBar({ categories, activeCategory, onCategoryChange, productGridRef }) {
  const navRef = useRef(null);
  const pillRefs = useRef({});
  const observerRef = useRef(null);

  /* ── Scroll active pill into view on change ────────────── */
  useEffect(() => {
    const pill = pillRefs.current[activeCategory];
    if (pill && navRef.current) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  /* ── IntersectionObserver: track which section is in view ─ */
  useEffect(() => {
    const grid = productGridRef?.current;
    if (!grid) return;

    const sections = grid.querySelectorAll('[data-category-section]');
    if (!sections.length) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const cat = entry.target.getAttribute('data-category-section');
            onCategoryChange(cat);
          }
        });
      },
      {
        root: grid,
        threshold: 0.25,
        rootMargin: '-20% 0px -60% 0px',
      }
    );

    sections.forEach((s) => observerRef.current.observe(s));

    return () => observerRef.current?.disconnect();
  }, [productGridRef, onCategoryChange]);

  /* ── Click: scroll to section ──────────────────────────── */
  const handleClick = useCallback(
    (cat) => {
      onCategoryChange(cat);

      if (cat === 'TODOS') {
        productGridRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const section = productGridRef?.current?.querySelector(
        `[data-category-section="${cat}"]`
      );
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [onCategoryChange, productGridRef]
  );

  return (
    <CategoryNav ref={navRef}>
      {categories.map((cat) => (
        <CategoryPill
          key={cat}
          label={cat === 'TODOS' ? 'Todos' : cat}
          active={activeCategory === cat}
          onClick={() => handleClick(cat)}
          ref={(el) => (pillRefs.current[cat] = el)}
        />
      ))}
    </CategoryNav>
  );
}
