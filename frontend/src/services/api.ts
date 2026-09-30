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

let isRedirectingToLogin = false;

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Jangan redirect jika 401 berasal dari pengecekan sesi berkala/awal (/auth/me)
      const isAuthMeProbe = error.config?.url?.includes('/auth/me');

      if (!isAuthMeProbe && typeof window !== 'undefined' && !isRedirectingToLogin) {
        const pathname = window.location.pathname;
        const isPublicPage =
          pathname === '/' ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register');

        // Hanya arahkan ke /login jika pengguna sedang mengakses halaman proteksi
        if (!isPublicPage) {
          isRedirectingToLogin = true;
          localStorage.removeItem('user_meta');
          document.cookie = 'auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
