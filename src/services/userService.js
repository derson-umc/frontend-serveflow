import { api } from "./api";

export const userService = {
  findAll: () => api.get("/users").then((r) => r.data),
  findById: (id) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data) => api.post("/users", data).then((r) => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data),
  changePassword: (id, currentPassword, newPassword) =>
    api.patch(`/users/${id}/password`, { currentPassword, newPassword }),
  resetPassword: (id, newPassword) =>
    api.patch(`/users/${id}/reset-password`, { newPassword }),
  changeJobPosition: (id, jobposition) =>
    api.patch(`/users/${id}/job-position`, { jobposition }),
  delete: (id) => api.delete(`/users/${id}`),
};
