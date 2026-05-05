import { httpClient } from "./httpClient";

export const authService = {
  login(credentials) {
    return httpClient.post("/auth/login", credentials).then((r) => r.data);
  },
};
