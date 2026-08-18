import client from "./client";
import { createClient } from "@/lib/supabase/client";

interface LoginPayload {
  email: string;
  password: string;
  staySignedIn?: boolean;
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
  token?: string;
  newPassword: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
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

export const loginUser = async (data: LoginPayload) => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("has_session", "1");
  }

  // Fetch current user details to return the expected AuthResponse format
  const meResponse = await client.get<AuthResponse>("/auth/me");
  return meResponse.data;
};

export const registerUser = async (data: RegisterPayload) => {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        companyName: data.companyName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("has_session", "1");
  }

  return { success: true, message: "Registration successful", data: { user: null } };
};

export const forgotPassword = async (data: ForgotPasswordPayload) => {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Password reset email sent" };
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Password updated successfully" };
};

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await client.get<AuthResponse>("/auth/me");
    if (!response.data.success) {
      return null;
    }
    return response.data.data.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response?.status === 403 && error.response?.data?.error === "NEEDS_ONBOARDING") {
      throw new Error("NEEDS_ONBOARDING");
    }
    return null;
  }
};

export const logoutUser = async () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("has_session");
  }
  const supabase = createClient();
  await supabase.auth.signOut();
};

export const updateProfile = async (data: Record<string, ReturnType<typeof JSON.parse>>) => {
  const response = await client.patch<AuthResponse>("/auth/me", data);
  return response.data;
};

export const signInWithGoogle = async (): Promise<{ success: boolean; target?: string }> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("has_session");
    }
    throw new Error(error.message);
  }

  if (!data?.url) {
    throw new Error("Failed to initialize Google authentication URL");
  }

  if (typeof window === "undefined") {
    return { success: false };
  }

  // Calculate centered coordinates for popup window
  const width = 500;
  const height = 650;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

  const popup = window.open(
    data.url,
    "google_oauth_popup",
    `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
  );

  // If popup is blocked by browser, fallback to standard redirect
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    window.location.href = data.url;
    return { success: true };
  }

  return new Promise((resolve, reject) => {
    let resolved = false;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(timer);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        resolved = true;
        cleanup();
        if (typeof window !== "undefined") {
          localStorage.setItem("has_session", "1");
        }
        resolve({ success: true, target: event.data.target || "/dashboard" });
      } else if (event.data?.type === "OAUTH_AUTH_ERROR") {
        resolved = true;
        cleanup();
        reject(new Error(event.data.error || "Authentication failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    // Watcher in case user closes popup window manually
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Login was cancelled"));
          }
        }, 500);
      }
    }, 500);
  });
};

export const deleteAccount = async (confirmation: { confirm1: string; confirm2: string }) => {
  const response = await client.delete<{ success: boolean; message: string }>("/auth/account", {
    data: confirmation,
  });
  return response.data;
};
