import { api } from "./api";

export const kdsService = {
  getOrders: ()           => api.get("/kds/orders").then((r) => r.data),
  prepare:   (id)         => api.patch(`/kds/orders/${id}/prepare`).then((r) => r.data),
  ready:     (id)         => api.patch(`/kds/orders/${id}/ready`).then((r) => r.data),
  complete:  (id)         => api.patch(`/kds/orders/${id}/complete`).then((r) => r.data),
};

