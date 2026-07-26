import axiosClient from "./axiosClient";

export const branchApi = {
  getAll: () => axiosClient.get("/api/branches/get-all"),
  getById: (id) => axiosClient.get(`/api/branches/get-branch/${id}`),
};
