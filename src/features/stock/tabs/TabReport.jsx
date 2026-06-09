import { useState, useEffect } from 'react';
import { Spinner } from '@shared/components/feedback/Spinner';
import { PlainInput } from '@shared/components/ui/PlainInput';
import { Btn } from '@shared/components/ui/Btn';
import { Paginator } from '../components/Paginator';
import { dsCard, palette } from '@styles/ds';

const PAGE_SIZE = 10;

const fmt = (n) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(n) || 0,
  );

/** Retorna true quando saldo real difere do saldo calculado por movimentações (> 0,01). */
function hasDiscrepancy(row) {
  const balanco   = (Number(row.totalEntradas) || 0) - (Number(row.totalSaidas) || 0);
  const saldoReal = Number(row.saldoAtual) || 0;
  return Math.abs(balanco - saldoReal) > 0.01;
}

const TH_STYLE = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 700,
  color: palette.textMuted,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
};

const TD = ({ children, style }) => (
  <td style={{ padding: '10px 16px', ...style }}>{children}</td>
);

export function TabReport({ filtered, loading, search, setSearch, load, totalEntradas, totalSaidas }) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const withDiscrepancy = filtered.filter(hasDiscrepancy).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Barra de busca ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <PlainInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar insumo..."
          style={{ flex: '1 1 200px', maxWidth: 320 }}
        />
        <Btn variant="ghost" onClick={load} style={{ padding: '9px 16px', fontSize: 12, flexShrink: 0 }}>
          Atualizar
        </Btn>
      </div>

      {/* ── Cards de totais ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
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
        {withDiscrepancy > 0 && (
          <div style={{ ...dsCard, padding: '14px 20px', borderTop: `3px solid ${palette.orange}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Pendentes ajuste
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: palette.orange }}>{withDiscrepancy}</div>
            <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 2 }}>
              insumos com divergência
            </div>
          </div>
        )}
      </div>

      {/* ── Tabela ── */}
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
                  <th style={TH_STYLE}>Insumo</th>
                  <th style={TH_STYLE}>Unidade</th>
                  <th style={TH_STYLE}>Total entradas</th>
                  <th style={TH_STYLE}>Total saídas</th>
                  <th style={{ ...TH_STYLE, textAlign: 'right' }}>Balanço</th>
                  <th style={{ ...TH_STYLE, textAlign: 'right' }}>Saldo atual</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: palette.textMuted }}>
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                ) : (
                  paged.map((r, i) => {
                    const balanco    = (Number(r.totalEntradas) || 0) - (Number(r.totalSaidas) || 0);
                    const diverge    = hasDiscrepancy(r);
                    const balancoPos = balanco >= 0;

                    return (
                      <tr
                        key={r.insumo ?? i}
                        style={{
                          borderTop: `1px solid ${palette.border}`,
                          background: diverge ? `${palette.orange}08` : 'transparent',
                        }}
                      >
                        {/* Nome */}
                        <TD style={{ fontWeight: 600, color: palette.textPrimary }}>
                          {r.insumo}
                        </TD>

                        {/* Unidade — campo correto: r.unidade */}
                        <TD style={{ color: palette.textMuted, fontSize: 12 }}>
                          {r.unidade}
                        </TD>

                        {/* Total entradas */}
                        <TD style={{ color: palette.green, fontWeight: 600 }}>
                          {fmt(r.totalEntradas)}
                        </TD>

                        {/* Total saídas */}
                        <TD style={{ color: palette.red, fontWeight: 600 }}>
                          {fmt(r.totalSaidas)}
                        </TD>

                        {/* Balanço calculado (entradas − saídas) */}
                        <TD style={{ textAlign: 'right', fontWeight: 700, color: balancoPos ? palette.green : palette.red }}>
                          {balancoPos ? '+' : ''}{fmt(balanco)}
                        </TD>

                        {/* Saldo atual (current_quantity no banco — valor real) */}
                        <TD style={{ textAlign: 'right', fontWeight: 700, color: palette.textPrimary }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {fmt(r.saldoAtual)}
                            {diverge && (
                              <span
                                title={`Divergência: balanço de movimentações (${fmt(balanco)}) difere do estoque real (${fmt(r.saldoAtual)}). Realize um Ajuste de Inventário para reconciliar.`}
                                style={{ fontSize: 13, cursor: 'help', lineHeight: 1 }}
                              >
                                ⚠️
                              </span>
                            )}
                          </span>
                        </TD>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Paginator
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            label="insumos"
            onChange={setPage}
          />
        </div>
      )}

      {/* ── Legenda ── */}
      {withDiscrepancy > 0 && (
        <p style={{ fontSize: 11, color: palette.textMuted, margin: 0, paddingLeft: 4 }}>
          ⚠️ <strong>Divergência</strong>: o <em>Saldo Atual</em> reflete o estoque físico cadastrado.
          O <em>Balanço</em> é calculado apenas pelas movimentações registradas.
          Se diferirem, use <strong>Ajuste de Inventário</strong> para reconciliar.
        </p>
      )}
    </div>
  );
}
