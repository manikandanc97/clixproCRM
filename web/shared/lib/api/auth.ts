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
    redirectTo: getAuthRedirectUrl("/reset-password"),
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

/**
 * Helper to get environment-aware auth redirect URL.
 * Local: http://localhost:3000/api/auth/callback
 * Production: https://clixprocrm.vercel.app/api/auth/callback
 */
export const getAuthRedirectUrl = (path: string = "/api/auth/callback"): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${cleanPath}`;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}${cleanPath}`;
};

let activeOAuthPopup: Window | null = null;

export const signInWithGoogle = async (): Promise<{ success: boolean; target?: string }> => {
  if (typeof window === "undefined") {
    return { success: false };
  }

  // Prevent duplicate popup windows if one is already open and active
  if (activeOAuthPopup && !activeOAuthPopup.closed) {
    try {
      activeOAuthPopup.focus();
      return { success: false };
    } catch {
      // Continue to open fresh popup
    }
  }

  // Calculate centered coordinates relative to current browser window
  const width = 500;
  const height = 650;
  const screenLeft = typeof window.screenLeft !== "undefined" ? window.screenLeft : window.screenX;
  const screenTop = typeof window.screenTop !== "undefined" ? window.screenTop : window.screenY;
  const outerWidth = window.outerWidth || document.documentElement.clientWidth || 1024;
  const outerHeight = window.outerHeight || document.documentElement.clientHeight || 768;
  const left = Math.max(0, Math.floor(screenLeft + (outerWidth - width) / 2));
  const top = Math.max(0, Math.floor(screenTop + (outerHeight - height) / 2));

  // Open popup synchronously during user gesture call stack
  const popup = window.open(
    "about:blank",
    "clixprocrm-google-login",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
  );

  activeOAuthPopup = popup;

  // Handle popup-blocked browsers gracefully without navigating the main window
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    activeOAuthPopup = null;
    throw new Error(
      "Google sign-in could not open. Please allow popups for ClixProCRM and try again."
    );
  }

  const supabase = createClient();
  let oauthUrl = "";

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
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

    oauthUrl = data.url;
  } catch (err) {
    if (popup && !popup.closed) {
      popup.close();
    }
    activeOAuthPopup = null;
    throw err;
  }

  // Navigate the popup window to Google OAuth URL
  popup.location.href = oauthUrl;

  return new Promise((resolve, reject) => {
    let resolved = false;

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("clixprocrm_google_auth_channel");
      } catch {
        channel = null;
      }
    }

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        try {
          channel.close();
        } catch {
          // Ignore cleanup error
        }
      }
      clearInterval(timer);
      activeOAuthPopup = null;
    };

    const processPayload = (payload: { type?: string; target?: string; error?: string }) => {
      if (!payload || resolved) return;

      if (payload.type === "CLIXPROCRM_GOOGLE_AUTH_SUCCESS") {
        resolved = true;
        cleanup();
        if (typeof window !== "undefined") {
          localStorage.setItem("has_session", "1");
          localStorage.removeItem("clixprocrm_google_auth_event");
        }
        if (popup && !popup.closed) {
          try {
            popup.close();
          } catch {
            // Ignore popup close error
          }
        }
        resolve({ success: true, target: payload.target || "/dashboard" });
      } else if (payload.type === "CLIXPROCRM_GOOGLE_AUTH_ERROR") {
        resolved = true;
        cleanup();
        if (typeof window !== "undefined") {
          localStorage.removeItem("clixprocrm_google_auth_event");
        }
        if (popup && !popup.closed) {
          try {
            popup.close();
          } catch {
            // Ignore popup close error
          }
        }
        reject(new Error(payload.error || "Authentication failed"));
      }
    };

    const handleMessage = (event: MessageEvent) => {
      // Secure check: verify origin matches exact origin
      if (event.origin !== window.location.origin) return;
      processPayload(event.data);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "clixprocrm_google_auth_event" && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          processPayload(data);
        } catch {
          // Ignore JSON parse error
        }
      }
    };

    if (channel) {
      channel.onmessage = (event) => {
        processPayload(event.data);
      };
    }

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);

    // Watcher in case user closes popup window manually before completion
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Google sign-in was cancelled."));
          }
        }, 500);
      }
    }, 400);
  });
};

export const deleteAccount = async (confirmation: { confirm1: string; confirm2: string }) => {
  const response = await client.delete<{ success: boolean; message: string }>("/auth/account", {
    data: confirmation,
  });
  return response.data;
};
