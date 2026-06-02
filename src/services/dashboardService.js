import { httpClient } from "./httpClient";

const RESOURCE = "/dashboard";

export const dashboardService = {
  metrics() {
    return httpClient.get(`${RESOURCE}/metrics`).then((r) => r.data);
  },

  salesByDay() {
    return httpClient.get(`${RESOURCE}/sales-by-day`).then((r) => r.data);
  },

  topProducts() {
    return httpClient.get(`${RESOURCE}/top-products`).then((r) => r.data);
  },
};
