import { palette } from '@styles/ds';

export function SuggestionChips({ chips = [], active, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
      {chips.map((s) => {
        const isActive = active === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(isActive ? '' : s)}
            className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: isActive ? palette.greenSurface : palette.background,
              color:      isActive ? palette.green        : palette.textMuted,
              border:     `1px solid ${isActive ? palette.greenBorder : palette.border}`,
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
