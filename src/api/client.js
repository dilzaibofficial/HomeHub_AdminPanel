import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "https://homehubbackend-yfvj.onrender.com";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("hh_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      // Admin token missing/invalid/expired - the only recovery is a
      // fresh login, so drop straight back to it instead of leaving the
      // user stuck on a broken dashboard.
      const isLoginCall = err.config?.url?.includes("/admin/login");
      if (!isLoginCall) {
        localStorage.removeItem("hh_admin_token");
        localStorage.removeItem("hh_admin_user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default client;
