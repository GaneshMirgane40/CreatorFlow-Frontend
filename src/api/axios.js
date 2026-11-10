import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
);

// An expired/invalid JWT makes every call fail; send the user back to login.
instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const hadToken = Boolean(localStorage.getItem("auth_token"));
      const isAuthCall = error.config?.url?.startsWith("/auth/");

      if (status === 401 && hadToken && !isAuthCall) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
        window.location.assign("/login");
      }

      return Promise.reject(error);
    }
);

export default instance;
