import { BASE_URL } from "../services/api";

export const getImageUrl = (path) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = token && token !== 'undefined' ? `?token=${token}` : '';
  return `${BASE_URL}${cleanPath}${queryString}`;
};