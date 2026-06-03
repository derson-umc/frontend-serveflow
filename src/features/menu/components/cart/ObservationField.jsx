import { useRef, useEffect, useState } from 'react';

const SUGGESTIONS = [
  'Sem cebola', 'Bem passado', 'Ponto', 'Mal passado',
  'Sem sal', 'Sem molho', 'Molho à parte', 'Extra queijo',
  'Sem queijo', 'Extra sal', 'Sem alho', 'Bem frito',
];

const MAX_CHARS = 200;

export function ObservationField({ value = '', onChange }) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const wrapperRef  = useRef(null);
  const showChips   = focused || value.length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }, [value]);

  useEffect(() => {
    if (!showChips) return;
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showChips]);

  function addSuggestion(text) {
    const current = value.trim();
    const next = current ? `${current}, ${text}` : text;
    if (next.length <= MAX_CHARS) {
      onChange(next);
      textareaRef.current?.focus();
    }
  }

  const remaining  = MAX_CHARS - value.length;
  const overLimit  = remaining < 0;

  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Chips — visíveis só quando campo está ativo ou tem conteúdo */}
      {showChips && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 2,
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
                  background: active ? 'var(--color-success-surface)' : 'var(--color-bg)',
                  color: active ? 'var(--color-success)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.1s',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* Input */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          placeholder="Observação (ex: sem cebola, bem passado…)"
          maxLength={MAX_CHARS + 10}
          onFocus={() => setFocused(true)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg)',
            border: `1px solid ${overLimit ? 'var(--color-error)' : focused ? 'var(--color-success)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '4px 36px 4px 8px',
            outline: 'none',
            minHeight: 28,
            maxHeight: 80,
            boxSizing: 'border-box',
            lineHeight: 1.5,
            transition: 'border-color 0.15s',
          }}
        />
        {value.length > 0 && (
          <span
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 9,
              color: overLimit ? 'var(--color-error)' : 'var(--color-text-disabled)',
              pointerEvents: 'none',
            }}
          >
            {value.length}/{MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}
