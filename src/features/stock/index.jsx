import { useState } from 'react';
import { useStock } from './hooks/useStock';
import { useIngredients } from './hooks/useIngredients';
import { useMovements } from './hooks/useMovements';
import { useAlerts } from './hooks/useAlerts';
import { useReport } from './hooks/useReport';
import { TabIngredients } from './tabs/TabIngredients';
import { TabMovements } from './tabs/TabMovements';
import { TabAlerts } from './tabs/TabAlerts';
import { TabReport } from './tabs/TabReport';
import { TABS, PU } from './constants';
import { dsPage, dsCard, palette } from '@styles/ds';
import Sidebar from '@shared/components/layout/Sidebar';

export default function Stock() {
  const [activeTab, setActiveTab] = useState('insumos');

  const stock       = useStock();
  const ingredients = useIngredients({ items: stock.items, onRefresh: stock.loadItems });
  const movements   = useMovements();
  const alerts      = useAlerts();
  const report      = useReport();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: palette.background }}>
      <Sidebar />
    <div style={dsPage}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 4, height: 28, borderRadius: 4, background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})`, flexShrink: 0 }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: palette.textPrimary, margin: 0 }}>
            Controle de Estoque
          </h1>
        </div>
        <p style={{ fontSize: 13, color: palette.textMuted, marginLeft: 16 }}>
          Gerencie insumos, movimentações e alertas de estoque.
        </p>
      </div>

      <div style={{ ...dsCard, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '13px 22px',
                  border: 'none',
                  background: 'none',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? PU : palette.textMuted,
                  borderBottom: active ? `2px solid ${PU}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {tab.key === 'alertas' && alerts.alerts.length > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: palette.orange,
                    color: palette.white,
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                  }}>
                    {alerts.alerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'insumos' && (
        <TabIngredients
          items={stock.items}
          loading={stock.loading}
          filtered={ingredients.filtered}
          search={ingredients.search}
          setSearch={ingredients.setSearch}
          filterStatus={ingredients.filterStatus}
          setFilterStatus={ingredients.setFilterStatus}
          belowMin={stock.belowMin}
          openCreate={ingredients.openCreate}
          openEdit={ingredients.openEdit}
          modalCreate={ingredients.modalCreate}
          setModalCreate={ingredients.setModalCreate}
          modalEdit={ingredients.modalEdit}
          setModalEdit={ingredients.setModalEdit}
          action={ingredients.action}
          handleInventoryAction={ingredients.handleInventoryAction}
          closeAction={ingredients.closeAction}
          toggling={ingredients.toggling}
          createForm={ingredients.createForm}
          editForm={ingredients.editForm}
          onCreateSubmit={ingredients.onCreateSubmit}
          onEditSubmit={ingredients.onEditSubmit}
          handleToggle={ingredients.handleToggle}
          onRefresh={stock.loadItems}
        />
      )}

      {activeTab === 'movimentacoes' && (
        <TabMovements
          filters={movements.filters}
          result={movements.result}
          loading={movements.loading}
          page={movements.page}
          activeItems={stock.activeItems}
          handleApply={movements.handleApply}
          handleReset={movements.handleReset}
          handleFilterChange={movements.handleFilterChange}
          handlePageChange={movements.handlePageChange}
        />
      )}

      {activeTab === 'alertas' && (
        <TabAlerts
          alerts={alerts.alerts}
          loading={alerts.loading}
          resolving={alerts.resolving}
          handleResolve={alerts.handleResolve}
        />
      )}

      {activeTab === 'relatorio' && (
        <TabReport
          filtered={report.filtered}
          loading={report.loading}
          search={report.search}
          setSearch={report.setSearch}
          load={report.load}
          totalEntradas={report.totalEntradas}
          totalSaidas={report.totalSaidas}
        />
      )}
    </div>
    </div>
  );
}
