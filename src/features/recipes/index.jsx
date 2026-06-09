import { motion, AnimatePresence } from 'framer-motion';
import { useRecipes } from './hooks/useRecipes';
import { ProductList } from './components/ProductList';
import { ProductHeader } from './components/ProductHeader';
import { IngredientEditor } from './components/IngredientEditor';
import { RecipeSummary } from './components/RecipeSummary';
import { palette } from '@styles/ds';
import Sidebar from '@shared/components/layout/Sidebar';

export default function Recipes() {
  const ft = useRecipes();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: palette.background }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '24px 28px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: 20, alignItems: 'flex-start' }}>

          {/* ── Coluna 1: Lista de produtos ─────────────────────── */}
          <ProductList
            filteredProducts={ft.filteredProducts}
            selectedProductId={ft.selectedProductId}
            recipe={ft.recipe}
            search={ft.search}
            setSearch={ft.setSearch}
            searchType={ft.searchType}
            setSearchType={ft.setSearchType}
            onSelect={ft.handleProductSelect}
          />

          {/* ── Coluna 2: Conteúdo principal ────────────────────── */}
          <AnimatePresence mode="wait">
            {!ft.selectedProductId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  gridColumn:   '2 / 4',
                  background:   palette.white,
                  borderRadius: 14,
                  border:       `1px solid ${palette.border}`,
                  boxShadow:    '0 2px 10px rgba(0,0,0,0.06)',
                  padding:      '60px 32px',
                  textAlign:    'center',
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 18, background: palette.greenSurface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: palette.textPrimary, margin: '0 0 4px' }}>
                  Selecione um produto
                </p>
                <p style={{ fontSize: 13, color: palette.textMuted }}>
                  Escolha um produto na lista para ver ou criar sua ficha técnica
                </p>
              </motion.div>
            ) : ft.loadingRecipe ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background:   palette.white,
                  borderRadius: 14,
                  border:       `1px solid ${palette.border}`,
                  boxShadow:    '0 2px 10px rgba(0,0,0,0.06)',
                  padding:      '60px 32px',
                  textAlign:    'center',
                  color:        palette.textMuted,
                  fontSize:     14,
                }}
              >
                Carregando ficha técnica...
              </motion.div>
            ) : (
              <motion.div
                key={ft.selectedProductId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <ProductHeader
                  product={ft.selectedProduct}
                  ingredientCount={ft.ingredients.filter((i) => i.stockItemId).length}
                />

                <IngredientEditor
                  ingredients={ft.ingredients}
                  stockItems={ft.stockItems}
                  productType={ft.productType}
                  isCommercial={ft.isCommercial}
                  onIngredientChange={ft.handleIngredientChange}
                  onAddIngredient={ft.addIngredient}
                  onRemoveIngredient={ft.removeIngredient}
                  onReorder={ft.reorderIngredient}
                  onProductTypeChange={ft.handleProductTypeChange}
                />

                {/* Modo de Preparo — largura total da coluna central */}
                {!ft.isCommercial && (
                  <div style={{ background: palette.white, borderRadius: 14, border: `1px solid ${palette.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                        Modo de preparo
                      </p>
                      <span style={{ fontSize: 11, fontWeight: 600, color: ft.prepMode.length > 540 ? '#D32F2F' : palette.textMuted }}>
                        {ft.prepMode.length}/600
                      </span>
                    </div>
                    <textarea
                      value={ft.prepMode}
                      onChange={(e) => { if (e.target.value.length <= 600) ft.setPrepMode(e.target.value); }}
                      placeholder="Descreva o passo a passo do preparo..."
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = Math.max(120, el.scrollHeight) + 'px'; } }}
                      style={{
                        display: 'block', width: '100%', minHeight: 120, padding: '12px 14px',
                        borderRadius: 10, border: `1.5px solid ${palette.border}`, background: '#FAFAFA',
                        fontSize: 13, color: palette.textPrimary, outline: 'none', resize: 'none',
                        overflow: 'hidden', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7,
                        transition: 'border-color 0.15s',
                      }}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.max(120, e.target.scrollHeight) + 'px'; }}
                      onFocus={(e) => (e.target.style.borderColor = palette.green)}
                      onBlur={(e)  => (e.target.style.borderColor = palette.border)}
                    />
                  </div>
                )}

                {/* Botão Salvar */}
                <button
                  onClick={ft.handleSave}
                  disabled={ft.loading}
                  style={{
                    width: '100%', padding: '15px 0', borderRadius: 12, border: 'none',
                    background: ft.loading ? palette.border : `linear-gradient(135deg, ${palette.green} 0%, #1B5E20 100%)`,
                    color: palette.white, fontWeight: 700, fontSize: 15,
                    cursor: ft.loading ? 'not-allowed' : 'pointer',
                    boxShadow: ft.loading ? 'none' : '0 6px 24px rgba(46,125,50,0.35)',
                    transition: 'opacity 0.15s, box-shadow 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => { if (!ft.loading) { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(46,125,50,0.45)'; } }}
                  onMouseLeave={(e) => { if (!ft.loading) { e.currentTarget.style.opacity = '1';    e.currentTarget.style.boxShadow = '0 6px 24px rgba(46,125,50,0.35)'; } }}
                >
                  {ft.loading ? 'Salvando...' : (
                    <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {ft.recipe ? 'Atualizar Ficha Técnica' : 'Salvar Ficha Técnica'}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Coluna 3: Resumo sticky ──────────────────────────── */}
          {ft.selectedProductId && !ft.loadingRecipe && (
            <RecipeSummary
              ingredients={ft.ingredients}
              stockItems={ft.stockItems}
              productType={ft.productType}
              selectedProduct={ft.selectedProduct}
              prepMode={ft.prepMode}
            />
          )}

        </div>
      </div>
    </div>
  );
}
