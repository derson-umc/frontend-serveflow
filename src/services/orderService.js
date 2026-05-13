import { httpClient } from "./httpClient";

const RESOURCE = "/orders";

export const orderService = {
  list(params) {
    return httpClient.get(RESOURCE, { params }).then((r) => r.data);
  },

  getById(id) {
    return httpClient.get(`${RESOURCE}/${id}`).then((r) => r.data);
  },

  create(payload) {
    return httpClient.post(RESOURCE, payload).then((r) => r.data);
  },

  updateStatus(id, status) {
    return httpClient.patch(`${RESOURCE}/${id}/status`, { status }).then((r) => r.data);
  },

  pay(id, payment) {
    return httpClient.patch(`${RESOURCE}/${id}/payment`, payment).then((r) => r.data);
  },

  cancel(id) {
    return httpClient.delete(`${RESOURCE}/${id}`).then((r) => r.data);
  },
};
