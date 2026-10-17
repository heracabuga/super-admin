import axios from "axios";

// Use the Vite proxy locally and the same-origin API path in production.
const BASE_URL =
  import.meta.env.VITE_ENROLLMENT_API_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8001/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Existing routes are unchanged; send the session when Python auth is enabled.
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("token");
  if (token && token !== "dev-bypass-token") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
