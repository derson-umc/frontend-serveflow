import { useEffect, useRef, useState } from 'react';

export function ContextMenu({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Ações"
        style={{
          border:         'none',
          background:     'var(--color-bg)',
          border:         '1px solid var(--color-border)',
          borderRadius:   6,
          width:          28,
          height:         28,
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          'var(--color-text-secondary)',
          fontSize:       18,
          fontWeight:     700,
          lineHeight:     1,
        }}
      >
        ⋮
      </button>

      {open && (
        <div style={{
          position:     'absolute',
          right:         0,
          top:          '110%',
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow:    'var(--shadow-md)',
          zIndex:        100,
          minWidth:      168,
          overflow:     'hidden',
        }}>
          {visible.map(({ label, icon, onClick, danger }) => (
            <button
              key={label}
              onClick={() => { onClick(); setOpen(false); }}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:         8,
                width:      '100%',
                padding:    '9px 14px',
                border:     'none',
                background: 'none',
                cursor:     'pointer',
                fontSize:    13,
                fontWeight:  500,
                color:      danger ? 'var(--color-error)' : 'var(--color-text-primary)',
                textAlign:  'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {icon && <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{icon}</span>}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
