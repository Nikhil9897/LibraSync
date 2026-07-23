import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://librasync-1.onrender.com/api/v1',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

// ─── Client-side GET Cache ────────────────────────────────────────────────────
const CACHE_TTL = 30 * 1000; // 30 seconds
const cache = new Map();

const CACHEABLE_PREFIXES = ['/auth/me', '/notifications/my', '/borrows/my', '/users/wishlist', '/categories'];

const isCacheable = (url) => CACHEABLE_PREFIXES.some(p => url?.includes(p));

export const invalidateCache = (prefix) => {
    for (const key of cache.keys()) {
        if (key.includes(prefix)) cache.delete(key);
    }
};

// Override get to add caching
const originalGet = api.get.bind(api);
api.get = async (url, config) => {
    if (isCacheable(url)) {
        const key = `GET:${url}:${JSON.stringify(config?.params || {})}`;
        const cached = cache.get(key);
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            return cached.res;
        }
        const res = await originalGet(url, config);
        cache.set(key, { res, ts: Date.now() });
        return res;
    }
    return originalGet(url, config);
};

// ─── Interceptors ─────────────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Auto Token Refresh ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we have a refresh token and haven't already retried
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh-token') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                if (isRefreshing) {
                    // Queue this request until the token refresh completes
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const res = await axios.post('/api/v1/auth/refresh-token', {
                        refreshToken,
                    });
                    const newToken = res.data.data.accessToken;
                    localStorage.setItem('token', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    // Refresh failed — force logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // No refresh token — force logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);

export default api;
