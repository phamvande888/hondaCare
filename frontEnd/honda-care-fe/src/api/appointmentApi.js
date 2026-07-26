import axiosClient from "./axiosClient";

export const appointmentApi = {
  createCustomerAppointment: (data) =>
    axiosClient.post("/api/appoinment/customer", data),
  createAdminAppointment: (data) => axiosClient.post("/api/appoinment", data),
  getAll: () => axiosClient.get("/api/appoinment"),
  getByCustomerId: (customerId) =>
    axiosClient.get(`/api/appoinment/list/${customerId}`),
  getDetail: (id) => axiosClient.get(`/api/appoinment/${id}`),
  update: (id, data) => axiosClient.patch(`/api/appoinment/${id}`, data),
};
