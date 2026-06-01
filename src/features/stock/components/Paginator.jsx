import { palette } from '@styles/ds';

function PBtn({ disabled, active, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '5px 10px',
        borderRadius: 8,
        border: `1px solid ${active ? palette.green : palette.border}`,
        background: active ? palette.greenSurface : disabled ? palette.surface : palette.white,
        color: active ? palette.green : disabled ? palette.textDisabled : palette.textSecondary,
        fontSize: 12,
        fontWeight: active ? 700 : 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: 32,
        lineHeight: 1.4,
        transition: 'border-color 0.12s, background 0.12s',
      }}
    >
      {children}
    </button>
  );
}

function buildPages(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set(
    [1, total, page, page - 1, page + 1].filter((p) => p >= 1 && p <= total)
  );
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

/**
 * Props:
 *   page        – 1-indexed current page
 *   totalPages  – total number of pages
 *   totalItems  – (optional) total record count for "X–Y de N label" display
 *   pageSize    – records per page (default 10)
 *   label       – noun for records (default "registros")
 *   onChange    – (newPage: number) => void  (1-indexed)
 */
export function Paginator({ page, totalPages, totalItems, pageSize = 10, label = 'registros', onChange }) {
  if (totalPages <= 0) return null;

  const from = totalItems != null ? (page - 1) * pageSize + 1 : null;
  const to   = totalItems != null ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderTop: `1px solid ${palette.border}`,
        background: '#FAFAFA',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, color: palette.textMuted }}>
        {from != null
          ? `${from}–${to} de ${totalItems} ${label}`
          : `Página ${page} de ${totalPages}`}
      </span>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <PBtn disabled={page === 1} onClick={() => onChange(page - 1)}>← Anterior</PBtn>

          {buildPages(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span
                key={`e${i}`}
                style={{ padding: '5px 2px', fontSize: 12, color: palette.textMuted, alignSelf: 'center' }}
              >
                …
              </span>
            ) : (
              <PBtn key={p} active={p === page} onClick={() => onChange(p)}>{p}</PBtn>
            )
          )}

          <PBtn disabled={page === totalPages} onClick={() => onChange(page + 1)}>Próximo →</PBtn>
        </div>
      )}
    </div>
  );
}
