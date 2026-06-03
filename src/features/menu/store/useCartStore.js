import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  extras: {},
  observations: {},

  addItem(product) {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    });
  },

  removeItem(id) {
    set((state) => {
      const strId = String(id);
      return {
        items: state.items.filter((i) => i.id !== id),
        extras: Object.fromEntries(
          Object.entries(state.extras).filter(([k]) => k !== strId)
        ),
        observations: Object.fromEntries(
          Object.entries(state.observations).filter(([k]) => k !== strId)
        ),
      };
    });
  },

  updateQuantity(id, quantity) {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
  },

  setExtras(productId, newExtras) {
    set((state) => ({
      extras: { ...state.extras, [productId]: newExtras },
    }));
  },

  setObservation(productId, text) {
    set((state) => ({
      observations: { ...state.observations, [productId]: text },
    }));
  },

  clear() {
    set({ items: [], extras: {}, observations: {} });
  },
}));

export const selectCartTotal = (state) =>
  state.items.reduce((sum, item) => {
    const itemTotal = Number(item.price) * item.quantity;
    const extrasTotal = (state.extras[item.id] || []).reduce(
      (es, e) => es + Number(e.unitPrice) * Number(e.quantity),
      0
    );
    return sum + itemTotal + extrasTotal;
  }, 0);

export const selectCartCount = (state) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartIsEmpty = (state) => state.items.length === 0;
