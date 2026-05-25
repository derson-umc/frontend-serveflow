import { Spinner } from '@shared/components/feedback/Spinner';
import { PlainInput } from '@shared/components/ui/PlainInput';
import { Btn } from '@shared/components/ui/Btn';
import { dsCard, palette } from '@styles/ds';

const fmt = (n) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export function TabReport({ filtered, loading, search, setSearch, load, totalEntradas, totalSaidas }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <PlainInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar insumo..."
          style={{ maxWidth: 280 }}
        />
        <Btn variant="ghost" onClick={load} style={{ padding: '9px 16px', fontSize: 12 }}>
          Atualizar
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ ...dsCard, padding: '14px 20px', borderTop: `3px solid ${palette.green}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Total entradas
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: palette.green }}>{fmt(totalEntradas)}</div>
        </div>
        <div style={{ ...dsCard, padding: '14px 20px', borderTop: `3px solid ${palette.red}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Total saídas
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: palette.red }}>{fmt(totalSaidas)}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={20} />
        </div>
      ) : (
        <div style={{ ...dsCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Insumo', 'Unidade', 'Estoque atual', 'Total entradas', 'Total saídas'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: palette.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: palette.textMuted }}>
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.stockItemId ?? i} style={{ borderTop: `1px solid ${palette.border}` }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: palette.textPrimary }}>{r.insumo}</td>
                      <td style={{ padding: '10px 16px', color: palette.textMuted }}>{r.unit}</td>
                      <td style={{ padding: '10px 16px' }}>{r.currentQuantity}</td>
                      <td style={{ padding: '10px 16px', color: palette.green, fontWeight: 600 }}>{fmt(r.totalEntradas)}</td>
                      <td style={{ padding: '10px 16px', color: palette.red, fontWeight: 600 }}>{fmt(r.totalSaidas)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
