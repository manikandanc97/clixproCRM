import client from "./client";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
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
  message: string;
  user: AuthUser;
}

interface LoginResponse extends AuthResponse {}

export const loginUser = async (data: LoginPayload) => {
  try {
    const response = await client.post<LoginResponse>("/auth/login", data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const registerUser = async (data: RegisterPayload) => {
  const response = await client.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await client.get<AuthResponse>("/auth/me");
  return response.data.user;
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











