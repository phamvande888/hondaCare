import axiosClient from "./axiosClient";

export const adminApi = {
  getAppointments: () => axiosClient.get("/api/appointments"),
  updateAppointment: (id, data) => axiosClient.patch(`/api/appointments/${id}`, data),
  getCustomers: () => axiosClient.get("/api/users/list-customers"),
  toggleCustomerStatus: (id) => axiosClient.patch(`/api/users/update-account-status/${id}`),
  getBranches: () => axiosClient.get("/api/branches/get-all"),
  toggleBranchStatus: (id) => axiosClient.patch(`/api/branches/changestatus-branch/${id}`),
  getServices: () => axiosClient.get("/api/services/list-services"),
};
