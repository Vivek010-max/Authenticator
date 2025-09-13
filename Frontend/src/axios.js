import axios from "axios";

// ✅ Use VITE_API_BASE_URL from .env (e.g., http://localhost:8000/api/v1)
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const instance = axios.create({
  baseURL,
  withCredentials: true, // Needed if backend sets httpOnly cookies
});

// ✅ Request Interceptor → attach access token (only for logged-in users)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor → auto-refresh token if expired
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.warn("[Axios] No refresh token → redirecting to login");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        console.log("[Axios] Refreshing access token...");

        // 🔑 Call refresh-token API
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // ✅ Save new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        console.log("[Axios] Token refreshed successfully");

        // Retry original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error("[Axios] Token refresh failed → redirecting to login", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
