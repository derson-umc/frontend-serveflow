import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4',
};

export function Modal({ open, onClose, title, children, size = 'md', footer }) {
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

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-modal)', animation: 'fadeIn 150ms ease' }}
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div
        className={`w-full ${sizes[size] ?? sizes.md} flex flex-col rounded-[var(--radius-xl)]`}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          maxHeight: '90vh',
          animation: 'scaleIn 180ms ease',
        }}
      >
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

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div
            className="flex gap-2 px-5 py-4 flex-shrink-0"
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
