import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    withCredentials: true // Extremely important for sending HTTP-only cookies
});

api.interceptors.request.use((config) => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
        const { token } = JSON.parse(adminInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const { data } = await axios.post(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Update token in local storage
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                if (adminInfo) {
                    adminInfo.token = data.token;
                    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
                }

                // Update authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed or expired
                localStorage.removeItem('adminInfo');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
