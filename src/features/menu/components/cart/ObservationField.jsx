import { useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'Sem cebola', 'Bem passado', 'Ponto', 'Mal passado',
  'Sem sal', 'Extra sal', 'Sem molho', 'Molho à parte',
  'Sem queijo', 'Extra queijo', 'Sem alho', 'Bem frito',
];

const MAX_CHARS = 200;

export function ObservationField({ value = '', onChange }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [value]);

  function addSuggestion(text) {
    const current = value.trim();
    const next = current ? `${current}, ${text}` : text;
    if (next.length <= MAX_CHARS) onChange(next);
  }

  const remaining = MAX_CHARS - value.length;
  const overLimit = remaining < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => addSuggestion(s)}
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: value.includes(s) ? 'var(--color-success-surface)' : 'var(--color-bg)',
              color: value.includes(s) ? 'var(--color-success)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.1s',
              whiteSpace: 'nowrap',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: sem cebola, bem passado, molho à parte…"
          maxLength={MAX_CHARS + 10}
          rows={1}
          style={{
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg)',
            border: `1px solid ${overLimit ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '5px 8px',
            outline: 'none',
            lineHeight: 1.5,
            minHeight: 32,
            maxHeight: 96,
            boxSizing: 'border-box',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 6,
            bottom: 4,
            fontSize: 9,
            color: overLimit ? 'var(--color-error)' : 'var(--color-text-disabled)',
            pointerEvents: 'none',
          }}
        >
          {value.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
