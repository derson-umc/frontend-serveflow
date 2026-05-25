import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  extras: {},

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
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      extras: Object.fromEntries(
        Object.entries(state.extras).filter(([k]) => k !== String(id))
      ),
    }));
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

  clear() {
    set({ items: [], extras: {} });
  },
}));

export const selectCartTotal = (state) =>
  state.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

export const selectCartCount = (state) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartIsEmpty = (state) => state.items.length === 0;
