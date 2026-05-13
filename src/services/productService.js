
const STORAGE_KEY = "menuProducts";

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Pizza Margherita", desc: "Massa fina, mussarela e manjericão", price: 49.9, category: "PRATOS PRINCIPAIS", image: null, estoque: 50, unidade: "unidade" },
  { id: 2, name: "Hambúrguer Artesanal", desc: "Blend bovino, cheddar e bacon", price: 38.5, category: "PRATOS PRINCIPAIS", image: null, estoque: 30, unidade: "unidade" },
  { id: 3, name: "HEINEKEN 330ML", price: 8.0, category: "CERVEJAS", image: null, estoque: 100, unidade: "lata" },
  { id: 4, name: "COCA-COLA 2L", price: 12.0, category: "BEBIDAS", image: null, estoque: 50, unidade: "garrafa" },
  { id: 5, name: "COXINHA DE FRANGO", price: 0.5, category: "PORÇÕES", image: null, estoque: 200, unidade: "unidade" },
];

export const getProducts = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
};

export const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("productsUpdated"));
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now(), estoque: product.estoque || 0 };
  const updated = [...products, newProduct];
  saveProducts(updated);
  return newProduct;
};

export const updateProduct = (id, updatedData) => {
  const products = getProducts();
  const updated = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
  saveProducts(updated);
  return updated;
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const updated = products.filter(p => p.id !== id);
  saveProducts(updated);
  return updated;
};

export const updateStock = (id, quantidade, operacao = "subtrair") => {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    if (operacao === "subtrair") {
      product.estoque = Math.max(0, product.estoque - quantidade);
    } else {
      product.estoque += quantidade;
    }
    saveProducts(products);
  }
  return product;
};

export const checkStock = (id, quantidade) => {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  return product && product.estoque >= quantidade;
};