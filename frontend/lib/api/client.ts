import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token
client.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const currency = localStorage.getItem("clientrise_currency") || "USD";
      config.headers["X-Currency"] = currency;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    return Promise.reject(error);
  },
);

export default client;
