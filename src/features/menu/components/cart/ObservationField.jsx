import { useRef, useEffect, useState } from 'react';

const SUGGESTIONS = [
  'Bem passado', 'Mal passado', 'Sem cebola', 'Extra queijo'
];

const MAX_CHARS = 200;

export function ObservationField({ value = '', onChange }) {
  const [open, setOpen]         = useState(false);
  const textareaRef             = useRef(null);
  const wrapperRef              = useRef(null);
  const hasContent              = value.trim().length > 0;
  const overLimit               = value.length > MAX_CHARS;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !open) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 76) + 'px';
  }, [value, open]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  function addSuggestion(text) {
    const current = value.trim();
    const next    = current ? `${current}, ${text}` : text;
    if (next.length <= MAX_CHARS) onChange(next);
  }

  // ----- estado colapsado: mostra só um botão/label compacto -----
  if (!open && !hasContent) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 0); }}
        style={{
          alignSelf: 'flex-start',
          fontSize: 10,
          color: 'var(--color-text-disabled)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '1px 0',
          lineHeight: 1,
        }}
      >
        + observação
      </button>
    );
  }

  // ----- estado com conteúdo mas fechado: mostra resumo clicável -----
  if (!open && hasContent) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          alignSelf: 'stretch',
          textAlign: 'left',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 8px',
          cursor: 'pointer',
          lineHeight: 1.4,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </button>
    );
  }

  // ----- estado expandido -----
  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {SUGGESTIONS.map((s) => {
          const active = value.includes(s);
          return (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addSuggestion(s); }}
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: active ? 'var(--color-success-border)' : 'var(--color-border)',
                background:  active ? 'var(--color-success-surface)' : 'var(--color-bg)',
                color:       active ? 'var(--color-success)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', minWidth: 0 }}>
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          placeholder="Detalhe a observação…"
          maxLength={MAX_CHARS + 10}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg)',
            border: `1px solid ${overLimit ? 'var(--color-error)' : 'var(--color-success)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            outline: 'none',
            minHeight: 30,
            maxHeight: 76,
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />
        {value.length > 0 && (
          <span
            style={{
              display: 'block',
              textAlign: 'right',
              fontSize: 9,
              color: overLimit ? 'var(--color-error)' : 'var(--color-text-disabled)',
              marginTop: 2,
            }}
          >
            {value.length}/{MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}
