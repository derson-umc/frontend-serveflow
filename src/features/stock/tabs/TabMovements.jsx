import { Spinner } from '@shared/components/feedback/Spinner';
import { PlainInput } from '@shared/components/ui/PlainInput';
import { PaletteSelect } from '@shared/components/ui/PaletteSelect';
import { Btn } from '@shared/components/ui/Btn';
import { MovementBadge } from '../components/MovementBadge';
import { Paginator } from '../components/Paginator';
import { dsCard, palette } from '@styles/ds';

const TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'ENTRY', label: 'Entrada' },
  { value: 'EXIT', label: 'Saída - Manual' },
  { value: 'ORDER_CONSUMPTION', label: 'Saída - Venda' },
  { value: 'LOSS', label: 'Perda' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
];

const fmtDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export function TabMovements({ filters, result, loading, activeItems, handleApply, handleReset, handleFilterChange, handlePageChange, page }) {
  const movements   = result?.content      ?? [];
  const totalPages  = result?.totalPages   ?? 0;
  const totalItems  = result?.totalElements ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filtros ── */}
      <div style={{ ...dsCard, padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
          <PaletteSelect
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </PaletteSelect>

          <PaletteSelect
            value={filters.itemId}
            onChange={(e) => handleFilterChange('itemId', e.target.value)}
          >
            <option value="">Todos os insumos</option>
            {activeItems.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </PaletteSelect>

          <PlainInput
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="Data inicial"
          />

          <PlainInput
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            placeholder="Data final"
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="primary" onClick={handleApply}>Buscar</Btn>
          <Btn variant="ghost"   onClick={handleReset}>Limpar</Btn>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={20} />
        </div>
      )}

      {/* ── Tabela + paginação ── */}
      {!loading && result && (
        <div style={{ ...dsCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Data/Hora', 'Insumo', 'Tipo', 'Quantidade', 'Observação'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontWeight: 700, color: palette.textMuted,
                        fontSize: 11, textTransform: 'uppercase',
                        letterSpacing: '0.06em', whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: palette.textMuted }}>
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} style={{ borderTop: `1px solid ${palette.border}` }}>
                      <td style={{ padding: '10px 16px', color: palette.textMuted, whiteSpace: 'nowrap' }}>{fmtDate(m.createdAt)}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: palette.textPrimary }}>{m.stockItemName}</td>
                      <td style={{ padding: '10px 16px' }}><MovementBadge type={m.type} /></td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{m.quantity} {m.unit}</td>
                      <td style={{ padding: '10px 16px', color: palette.textMuted }}>{m.notes ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginator — página 0-indexed no backend, 1-indexed no Paginator */}
          <Paginator
            page={page + 1}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={10}
            label="movimentações"
            onChange={(p) => handlePageChange(p - 1)}
          />
        </div>
      )}

      {/* ── Estado vazio ── */}
      {!loading && !result && (
        <div style={{ textAlign: 'center', padding: 48, color: palette.textMuted, fontSize: 14 }}>
          Aplique filtros para visualizar as movimentações.
        </div>
      )}
    </div>
  );
}
