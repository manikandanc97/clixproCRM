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
  try {
    const meResponse = await client.get<AuthResponse>("/auth/me");
    return meResponse.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (meError: any) {
    const isNeedsOnboarding =
      meError.response?.status === 403 &&
      (meError.response?.data?.message === "NEEDS_ONBOARDING" ||
        meError.response?.data?.error === "NEEDS_ONBOARDING" ||
        meError.response?.data === "NEEDS_ONBOARDING");
    if (isNeedsOnboarding) {
      throw new Error("NEEDS_ONBOARDING");
    }
    throw meError;
  }
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
    if (!response.data?.success) {
      return null;
    }
    return response.data.data.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const isNeedsOnboarding =
      error.response?.status === 403 &&
      (error.response?.data?.message === "NEEDS_ONBOARDING" ||
        error.response?.data?.error === "NEEDS_ONBOARDING" ||
        error.response?.data === "NEEDS_ONBOARDING");
    if (isNeedsOnboarding) {
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

/**
 * Opens a centered popup window for Google OAuth.
 * MUST be called synchronously from a user-gesture event handler.
 * Returns the popup reference, or null if blocked by the browser.
 */
export const openGoogleAuthPopup = (): Window | null => {
  if (typeof window === "undefined") return null;

  const width = 500;
  const height = 650;
  const screenLeft = typeof window.screenLeft !== "undefined" ? window.screenLeft : window.screenX;
  const screenTop = typeof window.screenTop !== "undefined" ? window.screenTop : window.screenY;
  const outerWidth = window.outerWidth || document.documentElement.clientWidth || 1024;
  const outerHeight = window.outerHeight || document.documentElement.clientHeight || 768;
  const left = Math.max(0, Math.floor(screenLeft + (outerWidth - width) / 2));
  const top = Math.max(0, Math.floor(screenTop + (outerHeight - height) / 2));

  // IMPORTANT: Do NOT include location=no or status=no.
  // On HTTPS (production), Chromium blocks cross-origin popup navigation when location=no
  // is set — Google's OAuth redirect from about:blank to accounts.google.com gets blocked,
  // causing the parent window to navigate instead. Removing these flags fixes production.
  try {
    return window.open(
      "about:blank",
      "clixprocrm_google_auth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  } catch {
    return null;
  }
};

let activeOAuthPopup: Window | null = null;

/**
 * Drives the Google OAuth popup flow.
 * @param preCreatedPopup - A popup opened synchronously from a click handler (before any await).
 *   If not provided, a new popup is opened here (may lose user-gesture context in some browsers).
 *   If null is explicitly passed, falls back to full-page redirect.
 */
export const signInWithGoogle = async (
  preCreatedPopup?: Window | null
): Promise<{ success: boolean; target?: string; redirected?: boolean }> => {
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

  const supabase = createClient();
  const callbackUrl = getAuthRedirectUrl("/api/auth/callback");

  // Use pre-created popup if provided; otherwise open one now (fallback path)
  const popup: Window | null =
    preCreatedPopup !== undefined ? preCreatedPopup : openGoogleAuthPopup();

  // If popup is blocked by browser, fall back to standard full-page redirect flow
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    activeOAuthPopup = null;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("has_session");
      }
      throw new Error(error.message);
    }

    if (data?.url) {
      window.location.href = data.url;
      return { success: true, redirected: true };
    }

    throw new Error("Failed to initialize Google authentication");
  }

  activeOAuthPopup = popup;

  // Add sleek loading indicator inside the popup while waiting for oauthUrl
  try {
    popup.document.write(`<!DOCTYPE html><html><head><title>Connecting to Google...</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0b0f19;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center}.spinner{width:32px;height:32px;border:3px solid rgba(255,255,255,0.1);border-top:3px solid #10b981;border-radius:50%;animation:s 0.8s linear infinite;margin:0 auto 16px}@keyframes s{to{transform:rotate(360deg)}}p{font-size:14px;color:#94a3b8;margin:0}</style></head><body><div><div class="spinner"></div><p>Connecting to Google...</p></div></body></html>`);
    popup.document.close();
  } catch {
    // Ignore cross-origin write errors
  }

  let oauthUrl = "";
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
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
  try {
    popup.location.href = oauthUrl;
  } catch {
    if (popup && !popup.closed) {
      popup.close();
    }
    activeOAuthPopup = null;
    window.location.href = oauthUrl;
    return { success: true, redirected: true };
  }

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
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch {
          // Ignore popup close error
        }
        resolve({ success: true, target: payload.target || "/dashboard" });
      } else if (payload.type === "CLIXPROCRM_GOOGLE_AUTH_ERROR") {
        resolved = true;
        cleanup();
        if (typeof window !== "undefined") {
          localStorage.removeItem("clixprocrm_google_auth_event");
        }
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch {
          // Ignore popup close error
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
    let pollCount = 0;
    const timer = setInterval(() => {
      pollCount++;
      // Give initial grace period (3s) while navigating cross-origin to Google
      if (pollCount < 2) return;

      let isClosed = false;
      try {
        if (popup && typeof popup.closed !== "undefined") {
          isClosed = popup.closed === true;
        }
      } catch {
        // Cross-Origin-Opener-Policy policy can restrict accessing popup.closed while on Google's origin
        isClosed = false;
      }
      if (isClosed) {
        clearInterval(timer);
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Google sign-in was cancelled."));
          }
        }, 300);
      }
    }, 1500);
  });
};

export const deleteAccount = async (confirmation: { confirm1: string; confirm2: string }) => {
  const response = await client.delete<{ success: boolean; message: string }>("/auth/account", {
    data: confirmation,
  });
  return response.data;
};
