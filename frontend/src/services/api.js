import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: (data) => api.post("/api/users/login", data),
  register: (data) => api.post("/api/users/register", data),
  me: () => api.get("/api/users/me"),
};

export const productService = {
  list: (params) => api.get("/api/products", { params }),
  get: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

export const orderService = {
  list: (params) => api.get("/api/orders", { params }),
  get: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post("/api/orders", data),
  cancel: (id) => api.delete(`/api/orders/${id}`),
};

export default api;
