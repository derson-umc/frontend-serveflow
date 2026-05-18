import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 380 }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const translateFrom = side === 'right' ? 'translateX(100%)' : 'translateX(-100%)';

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0"
      style={{ background: 'rgba(0,0,0,0.45)', zIndex: 'var(--z-modal)', animation: 'fadeIn 150ms ease' }}
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div
        className="absolute top-0 bottom-0 flex flex-col"
        style={{
          [side]: 0,
          width,
          maxWidth: '95vw',
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-xl)',
          animation: `slideDrawer 220ms ease forwards`,
        }}
      >
        <style>{`
          @keyframes slideDrawer {
            from { transform: ${translateFrom}; }
            to { transform: translateX(0); }
          }
        `}</style>

        {title && (
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div
            className="flex-shrink-0 px-5 py-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
