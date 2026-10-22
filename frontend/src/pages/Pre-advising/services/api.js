export const PRE_ADVISING_API = (import.meta.env.VITE_PRE_ADVISING_API_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/pre-advising` : 'http://127.0.0.1:8001/api/pre-advising')).replace(/\/$/, '');
export default PRE_ADVISING_API;
