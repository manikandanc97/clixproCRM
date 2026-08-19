import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { createClient } from "@/lib/supabase/client";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // When running in the browser on localhost or 127.0.0.1 during development
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://127.0.0.1:4000/api';
    }
  }

  return 'http://127.0.0.1:4000/api';
}

export const API_URL = getApiBaseUrl();

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to attach the token and validate API URL
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      // If running on a live deployed domain but API_URL still points to 127.0.0.1/localhost
      if (!isLocalhost && (config.baseURL?.includes("127.0.0.1") || config.baseURL?.includes("localhost"))) {
        console.error(
          "[ClixPro API] NEXT_PUBLIC_API_URL environment variable is missing in production. Frontend is attempting to connect to localhost API."
        );
      }

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
