import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function TabBar({ children, className = '' }) {
  return <div className={`tab-bar ${className}`}>{children}</div>;
}

export function Tab({ id, label, activeId, onSelect, to, icon }) {
  const location = useLocation();
  const isActive = to ? location.pathname === to : activeId === id;
  const Component = to ? Link : 'button';

  const props = to
    ? { to }
    : { onClick: () => onSelect?.(id), type: 'button' };

  return (
    <Component
      {...props}
      className={`tab-item ${isActive ? 'active' : ''}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </Component>
  );
}

export const CategoryNav = forwardRef(function CategoryNav({ children, className = '' }, ref) {
  const wrapperRef  = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const updateFades = useCallback(() => {
    const nav = ref?.current ?? wrapperRef.current?.querySelector('nav');
    if (!nav) return;
    const { scrollLeft, scrollWidth, clientWidth } = nav;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
  }, [ref]);

  useEffect(() => {
    const nav = ref?.current ?? wrapperRef.current?.querySelector('nav');
    if (!nav) return;
    updateFades();
    nav.addEventListener('scroll', updateFades, { passive: true });
    const ro = new ResizeObserver(updateFades);
    ro.observe(nav);
    return () => {
      nav.removeEventListener('scroll', updateFades);
      ro.disconnect();
    };
  }, [ref, updateFades]);

  const wrapperClass = [
    'category-nav-wrapper',
    atStart ? 'at-start' : '',
    atEnd   ? 'at-end'   : '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={wrapperRef} className={wrapperClass}>
      <nav ref={ref} className={`category-nav ${className}`}>{children}</nav>
    </div>
  );
});

export const CategoryPill = forwardRef(function CategoryPill({ label, active, onClick, icon, count }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`category-pill ${active ? 'active' : ''}`}
    >
      {icon && <span>{icon}</span>}
      {label}
      {count !== undefined && (
        <span
          style={{
            fontSize: 'var(--text-xs)',
            background: active ? 'var(--color-success)' : 'var(--color-border)',
            color: active ? 'white' : 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '0 6px',
            minWidth: 20,
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
});

