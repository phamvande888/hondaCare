import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => {
    return axiosClient.post("/api/authentication/login", data);
  },
  register: (data) => {
    return axiosClient.post("/api/authentication/register", data);
  },
};