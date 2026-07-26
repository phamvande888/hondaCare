import axios from "axios";

const BASE_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Gắn token vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response lỗi
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);

export default axiosClient;