import { useState, useEffect } from 'react';
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

const REPORT_PAGE_SIZE = 10;

const fmtDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

const fmt = (n) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function KpiCard({ label, value, accent }) {
  return (
    <div style={{
      ...dsCard,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}

function SubTabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 20,
        border: `1.5px solid ${active ? palette.green : palette.border}`,
        background: active ? palette.green : palette.white,
        color: active ? palette.white : palette.textMuted,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

// ── Histórico detalhado ──────────────────────────────────────────────────────
function HistoricoView({ filters, result, loading, handleApply, handleReset, handleFilterChange, handlePageChange, page }) {
  const movements  = result?.content      ?? [];
  const totalPages = result?.totalPages   ?? 0;
  const totalItems = result?.totalElements ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filtros */}
      <div style={{ ...dsCard, padding: '18px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Tipo de movimento
            </label>
            <PaletteSelect value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </PaletteSelect>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Data inicial
            </label>
            <PlainInput type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Data final
            </label>
            <PlainInput type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="primary" onClick={handleApply} style={{ minWidth: 100 }}>Buscar</Btn>
            <Btn variant="ghost"   onClick={handleReset} style={{ minWidth: 100 }}>Limpar</Btn>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size={24} />
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 12 }}>Carregando movimentações...</div>
          </div>
        </div>
      )}

      {!loading && result && (
        <div style={{ ...dsCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Data/Hora', 'Insumo', 'Tipo', 'Quantidade'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: palette.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: palette.textMuted, fontSize: 14 }}>
                      Nenhuma movimentação encontrada para o período selecionado.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} style={{ borderTop: `1px solid ${palette.border}`, transition: 'background 0.12s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '12px 16px', color: palette.textMuted, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(m.createdAt)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: palette.textPrimary }}>{m.stockItemName ?? '-'}</td>
                      <td style={{ padding: '12px 16px' }}><MovementBadge type={m.type} /></td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: palette.textPrimary, whiteSpace: 'nowrap' }}>{m.quantity} {m.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Paginator page={page + 1} totalPages={totalPages} totalItems={totalItems} pageSize={10} label="movimentações" onChange={(p) => handlePageChange(p - 1)} />
        </div>
      )}

      {!loading && !result && (
        <div style={{ ...dsCard, padding: '48px 20px', textAlign: 'center', color: palette.textMuted, fontSize: 14 }}>
          Aplique os filtros para visualizar o histórico de movimentações.
        </div>
      )}
    </div>
  );
}

// ── Resumo por insumo ────────────────────────────────────────────────────────
function ResumoView({ filtered, loading, search, setSearch, load }) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / REPORT_PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * REPORT_PAGE_SIZE, page * REPORT_PAGE_SIZE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <PlainInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar insumo..."
          style={{ flex: '1 1 200px' }}
        />
        <Btn variant="ghost" onClick={load} style={{ padding: '9px 16px', fontSize: 12, flexShrink: 0 }}>
          Atualizar
        </Btn>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size={24} />
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 12 }}>Carregando resumo...</div>
          </div>
        </div>
      ) : (
        <div style={{ ...dsCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Insumo', 'Unidade', 'Total Entradas', 'Total Saídas', 'Saldo Atual'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: palette.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: palette.textMuted, fontSize: 14 }}>
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                ) : (
                  paged.map((r, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${palette.border}`, transition: 'background 0.12s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: palette.textPrimary }}>{r.insumo}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: palette.surface, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, color: palette.textMuted }}>
                          {r.unidade ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: palette.green, fontWeight: 700 }}>{fmt(r.totalEntradas)}</td>
                      <td style={{ padding: '12px 16px', color: palette.red, fontWeight: 700 }}>{fmt(r.totalSaidas)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: palette.textPrimary }}>
                        {r.saldoAtual != null ? fmt(r.saldoAtual) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Paginator page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={REPORT_PAGE_SIZE} label="insumos" onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Tab principal ────────────────────────────────────────────────────────────
export function TabMovements({
  filters, result, loading, page, activeItems,
  handleApply, handleReset, handleFilterChange, handlePageChange,
  reportFiltered, reportLoading, reportSearch, setReportSearch, reportLoad,
  totalEntradas, totalSaidas,
}) {
  const [subView, setSubView] = useState('historico');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        <SubTabBtn label="Histórico"         active={subView === 'historico'} onClick={() => setSubView('historico')} />
        <SubTabBtn label="Resumo por Insumo" active={subView === 'resumo'}    onClick={() => setSubView('resumo')}    />
      </div>

      {subView === 'historico' && (
        <HistoricoView
          filters={filters} result={result} loading={loading}
          handleApply={handleApply} handleReset={handleReset}
          handleFilterChange={handleFilterChange} handlePageChange={handlePageChange} page={page}
        />
      )}

      {subView === 'resumo' && (
        <ResumoView
          filtered={reportFiltered} loading={reportLoading}
          search={reportSearch} setSearch={setReportSearch}
          load={reportLoad}
        />
      )}
    </div>
  );
}
