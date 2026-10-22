const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

export const API_BASE = `${BASE}/grading`;

export function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}