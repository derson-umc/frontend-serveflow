import { useState, useEffect, useCallback, useRef } from 'react';
import { productsApi } from '@core/api/products';
import { stockApi } from '@core/api/stock';
import { toast } from '@shared/components/feedback/Toast';

const EMPTY_INGREDIENT = () => ({
  stockItemId: '',
  stockItemName: '',
  quantityPerUnit: '',
  unit: 'UN',
  validity: '',
});

export function useRecipes() {
  const [products, setProducts]               = useState([]);
  const [stockItems, setStockItems]           = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recipe, setRecipe]                   = useState(null);
  const [ingredients, setIngredients]         = useState([EMPTY_INGREDIENT()]);
  const [prepMode, setPrepMode]               = useState('');
  const [productType, setProductType]         = useState('FABRICATED');
  const [loading, setLoading]                 = useState(false);
  const [loadingRecipe, setLoadingRecipe]     = useState(false);
  const [search, setSearch]                   = useState('');
  const [searchType, setSearchType]           = useState('name');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    productsApi.list().then((d) => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    stockApi.items.list().then((d) => setStockItems(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.length === 0) { setDebouncedSearch(''); return; }
    if (search.length < 3) return;
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const resetForm = useCallback(() => {
    setRecipe(null);
    setIngredients([EMPTY_INGREDIENT()]);
    setPrepMode('');
    setProductType('FABRICATED');
  }, []);

  const loadRecipe = useCallback(async (productId) => {
    if (!productId) { resetForm(); return; }
    setLoadingRecipe(true);
    try {
      const data = await stockApi.recipes.getByProduct(productId);
      setRecipe(data);
      setIngredients(data.ingredients.map((i) => ({
        stockItemId:     i.stockItemId,
        stockItemName:   i.stockItemName,
        quantityPerUnit: String(i.quantityPerUnit),
        unit:            i.unit,
        validity:        i.validity ?? '',
      })));
      setPrepMode(data.preparationMode ?? '');
      setProductType(data.productType ?? 'FABRICATED');
    } catch (err) {
      if (err?.response?.status === 404) resetForm();
    } finally {
      setLoadingRecipe(false);
    }
  }, [resetForm]);

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    setSearch('');
    setDebouncedSearch('');
    loadRecipe(productId);
  };

  const handleIngredientChange = (idx, field, value) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'stockItemId') {
        const item = stockItems.find((s) => s.id === value);
        if (item) {
          next[idx].stockItemName = item.name;
          next[idx].unit = item.unit ?? 'UN';
        }
      }
      return next;
    });
  };

  const handleProductTypeChange = (type) => {
    setProductType(type);
    if (type === 'COMMERCIAL' && ingredients.length > 1) {
      setIngredients([ingredients[0]]);
    }
  };

  const addIngredient    = () => setIngredients((p) => [...p, EMPTY_INGREDIENT()]);
  const removeIngredient = (idx) => setIngredients((p) => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) { toast.error('Selecione um produto.'); return; }
    const validIngredients = ingredients.filter((i) => i.stockItemId && i.quantityPerUnit);
    if (validIngredients.length === 0) { toast.error('Adicione ao menos um ingrediente.'); return; }
    if (productType === 'COMMERCIAL' && validIngredients.some((i) => !i.validity)) {
      toast.error('Validade obrigatória para produtos comerciais.'); return;
    }
    const payload = {
      productId:       selectedProductId,
      productName:     product.name,
      preparationMode: prepMode || null,
      productType,
      ingredients: validIngredients.map((i) => ({
        stockItemId:     i.stockItemId,
        stockItemName:   i.stockItemName,
        quantityPerUnit: parseFloat(i.quantityPerUnit),
        unit:            i.unit,
        validity:        i.validity || null,
      })),
    };
    setLoading(true);
    try {
      if (recipe) {
        await stockApi.recipes.update(recipe.id, payload);
        toast.success('Ficha atualizada!');
      } else {
        await stockApi.recipes.create(payload);
        toast.success('Ficha criada!');
      }
      loadRecipe(selectedProductId);
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const isCommercial    = productType === 'COMMERCIAL';

  const totalCost = ingredients.reduce((acc, i) => {
    const item = stockItems.find((s) => s.id === i.stockItemId);
    const qty  = parseFloat(i.quantityPerUnit) || 0;
    return acc + qty * (item?.averageCost ?? 0);
  }, 0);

  const filteredProducts = debouncedSearch.length >= 3
    ? products.filter((p) => {
        const q = debouncedSearch.toLowerCase();
        if (searchType === 'category') return (p.category ?? '').toLowerCase().includes(q);
        return p.name.toLowerCase().includes(q);
      })
    : [];

  return {
    products,
    stockItems,
    selectedProductId,
    selectedProduct,
    recipe,
    ingredients,
    prepMode, setPrepMode,
    productType,
    loading,
    loadingRecipe,
    search, setSearch,
    searchType, setSearchType,
    debouncedSearch,
    isCommercial,
    totalCost,
    filteredProducts,
    handleProductSelect,
    handleIngredientChange,
    handleProductTypeChange,
    addIngredient,
    removeIngredient,
    handleSave,
  };
}
