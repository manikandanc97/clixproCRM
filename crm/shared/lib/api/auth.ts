import axios from "axios";
import client from "./client";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  companyName: string;
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName?: string;
  description?: string;
  permissions?: string[];
  routes?: string[];
  dashboardWidgets?: string[];
  analyticsVisibility?: "full" | "team" | "self" | "limited" | "hr";
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: AuthUser | null;
  };
}

type LoginResponse = AuthResponse;

export const loginUser = async (data: LoginPayload) => {
  try {
    const response = await client.post<LoginResponse>("/auth/login", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const registerUser = async (data: RegisterPayload) => {
  const response = await client.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordPayload) => {
  const response = await client.post<{ success: boolean; message: string }>("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  try {
    const response = await client.post<{ success: boolean; message: string }>("/auth/reset-password", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const response = await client.get<AuthResponse>("/auth/me");
  if (!response.data.success) {
    return null;
  }
  return response.data.data.user;
};

export const logoutUser = async () => {
  if (typeof window !== "undefined") {
    try {
      await client.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    }
  }
};











