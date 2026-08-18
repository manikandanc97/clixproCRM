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
    "clixpro_google_oauth_popup",
    `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
  );

  activeOAuthPopup = popup;

  // Handle popup-blocked browsers gracefully without navigating the main window
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    activeOAuthPopup = null;
    throw new Error(
      "Popup was blocked by your browser. Please allow popups for this site and try again."
    );
  }

  try {
    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Connecting to Google...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #0b0f19;
              color: #f8fafc;
            }
            .container {
              text-align: center;
              padding: 24px;
            }
            .spinner {
              width: 32px;
              height: 32px;
              border: 3px solid rgba(255, 255, 255, 0.1);
              border-top: 3px solid #10b981;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .title {
              font-size: 15px;
              font-weight: 600;
              color: #f8fafc;
              margin-bottom: 4px;
            }
            .desc {
              font-size: 13px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <div class="title">Connecting to Google...</div>
            <div class="desc">Please select your account in the window.</div>
          </div>
        </body>
      </html>
    `);
  } catch {
    // Ignore if document.write fails in strict contexts
  }

  const supabase = createClient();
  let oauthUrl = "";

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthRedirectUrl("/api/auth/callback"),
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
        channel = new BroadcastChannel("oauth_auth_channel");
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

      if (payload.type === "OAUTH_AUTH_SUCCESS") {
        resolved = true;
        cleanup();
        if (typeof window !== "undefined") {
          localStorage.setItem("has_session", "1");
          localStorage.removeItem("oauth_auth_event");
        }
        if (popup && !popup.closed) {
          try {
            popup.close();
          } catch {
            // Ignore popup close error
          }
        }
        resolve({ success: true, target: payload.target || "/dashboard" });
      } else if (payload.type === "OAUTH_AUTH_ERROR") {
        resolved = true;
        cleanup();
        if (typeof window !== "undefined") {
          localStorage.removeItem("oauth_auth_event");
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
      if (event.key === "oauth_auth_event" && event.newValue) {
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
            reject(new Error("Login was cancelled"));
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
