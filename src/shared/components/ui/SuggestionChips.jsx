import { palette } from '@styles/ds';

export function SuggestionChips({ suggestions, value, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
      {suggestions.map((s) => {
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(active ? '' : s)}
            className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: active ? palette.greenSurface : palette.background,
              color:      active ? palette.green        : palette.textMuted,
              border:     `1px solid ${active ? palette.greenBorder : palette.border}`,
              cursor:     'pointer',
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
