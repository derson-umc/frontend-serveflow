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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: palette.textPrimary, margin: 0 }}>
            Fichas Técnicas
          </h1>
          <p style={{ fontSize: 12, color: palette.textMuted, margin: '3px 0 0' }}>
            {ft.products.length} produto{ft.products.length !== 1 ? 's' : ''} cadastrado{ft.products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {ft.selectedProductId && ft.recipe && (
          <span style={{
            padding:    '4px 12px',
            borderRadius: 20,
            fontSize:   11,
            fontWeight: 700,
            background: palette.greenSurface,
            color:      palette.green,
            border:     `1px solid ${palette.greenBorder}`,
          }}>
            Ficha existente
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'flex-start' }}>
        <ProductList
          filteredProducts={ft.filteredProducts}
          selectedProductId={ft.selectedProductId}
          recipe={ft.recipe}
          search={ft.search}
          setSearch={ft.setSearch}
          searchType={ft.searchType}
          setSearchType={ft.setSearchType}
          debouncedSearch={ft.debouncedSearch}
          onSelect={ft.handleProductSelect}
        />

        <AnimatePresence mode="wait">
          {!ft.selectedProductId ? (
            <motion.div
              key="empty"
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
                totalCost={ft.totalCost}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'flex-start' }}>
                <IngredientEditor
                  ingredients={ft.ingredients}
                  stockItems={ft.stockItems}
                  productType={ft.productType}
                  isCommercial={ft.isCommercial}
                  prepMode={ft.prepMode}
                  setPrepMode={ft.setPrepMode}
                  onIngredientChange={ft.handleIngredientChange}
                  onAddIngredient={ft.addIngredient}
                  onRemoveIngredient={ft.removeIngredient}
                  onProductTypeChange={ft.handleProductTypeChange}
                  loading={ft.loading}
                  recipe={ft.recipe}
                  onSave={ft.handleSave}
                />
                <RecipeSummary
                  ingredients={ft.ingredients}
                  stockItems={ft.stockItems}
                  productType={ft.productType}
                  totalCost={ft.totalCost}
                  selectedProduct={ft.selectedProduct}
                  prepMode={ft.prepMode}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}
