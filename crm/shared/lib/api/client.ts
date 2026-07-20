import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to attach the token
client.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const currency = localStorage.getItem("orbit_currency") || "USD";
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
      localStorage.removeItem("orbit_token");
      localStorage.removeItem("orbit_user");
      localStorage.removeItem("token"); // legacy key
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    return Promise.reject(error);
  },
);

export default client;











