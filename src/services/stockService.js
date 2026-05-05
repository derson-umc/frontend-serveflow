import { httpClient } from "./httpClient";

const STOCK = "/stock";
const PRODUCTS = "/products";

export const stockService = {
  listStock() {
    return httpClient.get(STOCK).then((r) => r.data);
  },

  getStockByProduct(productId) {
    return httpClient.get(`${STOCK}/${productId}`).then((r) => r.data);
  },

  adjust(productId, payload) {
    return httpClient.patch(`${STOCK}/${productId}`, payload).then((r) => r.data);
  },

  listProducts() {
    return httpClient.get(PRODUCTS).then((r) => r.data);
  },

  createProduct(payload) {
    return httpClient.post(PRODUCTS, payload).then((r) => r.data);
  },

  updateProduct(id, payload) {
    return httpClient.put(`${PRODUCTS}/${id}`, payload).then((r) => r.data);
  },

  deleteProduct(id) {
    return httpClient.delete(`${PRODUCTS}/${id}`).then((r) => r.data);
  },
};
