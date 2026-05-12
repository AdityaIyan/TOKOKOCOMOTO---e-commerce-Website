import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post('http://localhost:4000/auth/refresh', {
                        refreshToken,
                    });

                    const { access_token, refresh_token: newRefreshToken } = response.data;

                    localStorage.setItem('token', access_token);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('user');
                        window.location.href = '/auth/login';
                    }
                }
            } else {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
