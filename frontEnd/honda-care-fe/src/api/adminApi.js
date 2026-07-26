import axiosClient from "./axiosClient";

export const adminApi = {
  getAppointments: () => axiosClient.get("/api/appointments"),
  updateAppointment: (id, data) =>
    axiosClient.patch(`/api/appointments/${id}`, data),
  getCustomers: () => axiosClient.get("/api/users/list-customers"),
  getBranches: () => axiosClient.get("/api/branches/get-all"),
  getServices: () => axiosClient.get("/api/services/list-services"),
};
