import { httpClient } from "./httpClient";

const RESOURCE = "/users";

export const userService = {
  list() {
    return httpClient.get(RESOURCE).then((r) => r.data);
  },

  create(payload) {
    return httpClient.post(RESOURCE, payload).then((r) => r.data);
  },

  changePassword(id, payload) {
    return httpClient.patch(`${RESOURCE}/${id}/password`, payload).then((r) => r.data);
  },

  resetPassword(id, newPassword) {
    return httpClient.patch(`${RESOURCE}/${id}/reset-password`, { newPassword }).then((r) => r.data);
  },

  remove(id) {
    return httpClient.delete(`${RESOURCE}/${id}`).then((r) => r.data);
  },
};
