import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api";

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
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const currency = localStorage.getItem("orbit_currency") || "INR";
      config.headers["X-Currency"] = currency;
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
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
    return Promise.reject(error);
  }
);

// In-flight GET request deduplication:
// If multiple components or hooks trigger a GET request to the exact same URL + params concurrently,
// share the existing in-flight Promise and clear it immediately upon completion.
const inFlightGetRequests = new Map<string, Promise<any>>();
const originalGet = client.get.bind(client);

client.get = function <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: AxiosRequestConfig<D>
): Promise<R> {
  if (typeof window === "undefined") {
    return originalGet(url, config);
  }

  const currency = localStorage.getItem("orbit_currency") || "INR";
  const paramKey = config?.params ? JSON.stringify(config.params) : "";
  const dedupeKey = `GET:${url}:${currency}:${paramKey}`;

  if (inFlightGetRequests.has(dedupeKey)) {
    return inFlightGetRequests.get(dedupeKey) as Promise<R>;
  }

  const promise = originalGet<T, R, D>(url, config).finally(() => {
    inFlightGetRequests.delete(dedupeKey);
  });

  inFlightGetRequests.set(dedupeKey, promise);
  return promise;
};

export default client;
