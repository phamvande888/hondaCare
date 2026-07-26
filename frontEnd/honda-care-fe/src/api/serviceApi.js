import axiosClient from "./axiosClient";

export const serviceApi = {
  getAll: () => axiosClient.get("/api/services/list-services"),
  getById: (id) => axiosClient.get(`/api/services/${id}`),
};
