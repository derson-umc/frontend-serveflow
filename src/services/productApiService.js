import { api } from "./api";

export const productApi = {
  findAll: () =>
    api.get("/products").then((r) => r.data),

  findById: (id) =>
    api.get(`/products/${id}`).then((r) => r.data),

  create: (data) =>
    api.post("/products", data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/products/${id}`, data).then((r) => r.data),

  deactivate: (id) =>
    api.delete(`/products/${id}`),
};
