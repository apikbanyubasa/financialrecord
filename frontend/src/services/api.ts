import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
        if (!isAuthPage) {
          localStorage.removeItem('user_meta');
          window.location.href = '/login?expired=true';
        }
      }
    }

    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const serverMessage = error.response.data?.message || error.response.data?.error?.message;
      if (serverMessage) {
        error.message = serverMessage;
      } else if (retryAfter) {
        error.message = `Terlalu banyak permintaan. Silakan tunggu ${retryAfter} detik lagi.`;
      }
    }

    return Promise.reject(error);
  }
);
