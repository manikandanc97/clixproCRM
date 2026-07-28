# Authentication Module: QA Test Cases Checklist

## 1. Happy Path
- [ ] **TC-HP-01**: User successfully registers a new account with valid details (Name, Email, Password).
- [ ] **TC-HP-02**: User successfully logs in with correct email and password.
- [ ] **TC-HP-03**: User is automatically redirected to the Dashboard `/` after successful login.
- [ ] **TC-HP-04**: User successfully logs out and is redirected to `/login`.
- [ ] **TC-HP-05**: User successfully requests a password reset link using a registered email.
- [ ] **TC-HP-06**: User successfully resets their password using a valid token and can log in with the new password.
- [ ] **TC-HP-07**: "Stay signed in" functionality successfully persists the session across browser restarts.

## 2. Negative Path
- [ ] **TC-NP-01**: User attempts to register with an email that is already in use (Expect validation error).
- [ ] **TC-NP-02**: User attempts to register with mismatched passwords (if confirm password exists) or weak password.
- [ ] **TC-NP-03**: User attempts to log in with unregistered email (Expect generic invalid credentials error).
- [ ] **TC-NP-04**: User attempts to log in with correct email but incorrect password (Expect generic invalid credentials error).
- [ ] **TC-NP-05**: User submits login form with empty fields (Expect UI validation blocker).
- [ ] **TC-NP-06**: User attempts to reset password with an expired or invalid token (Expect token error message).
- [ ] **TC-NP-07**: User attempts to access a protected route (e.g., `/dashboard`) without an active session (Expect redirect to `/login`).
- [ ] **TC-NP-08**: User with `SUSPENDED` or `INACTIVE` status attempts to log in (Expect access denied error).

## 3. Boundary Cases
- [ ] **TC-BC-01**: Register with a password of exactly the minimum required length (e.g., 8 characters).
- [ ] **TC-BC-02**: Register with a password exceeding maximum recommended length (e.g., 128 characters) to check for truncation/hashing crash.
- [ ] **TC-BC-03**: Enter an email address string at the maximum database limit (e.g., 255 characters).
- [ ] **TC-BC-04**: Submit strings containing special UTF-8 characters (e.g., emojis) in the `Name` and `Password` fields.
- [ ] **TC-BC-05**: Log in at the exact moment the JWT is set to expire (edge of the 7-day window).

## 4. Security Cases
- [ ] **TC-SC-01**: Attempt SQL Injection on the login and register forms (e.g., `' OR 1=1 --`).
- [ ] **TC-SC-02**: Attempt Cross-Site Scripting (XSS) by inputting `<script>alert(1)</script>` in the Name field during registration.
- [ ] **TC-SC-03**: Verify `orbit_token` cookie flags (`HttpOnly=true`, `Secure=true`, `SameSite=Lax`).
- [ ] **TC-SC-04**: Trigger rate limiting on `/api/auth/login` (Submit 6 failed logins rapidly). Verify account lockout or IP block activates.
- [ ] **TC-SC-05**: Attempt session hijacking by copying the JWT cookie from browser A and pasting it into browser B.
- [ ] **TC-SC-06**: Attempt to view `/api/auth/me` data of another user by tampering with standard requests (IDOR check).
- [ ] **TC-SC-07**: Request password reset for a non-existent email. Verify API response does not reveal whether the email exists (prevent user enumeration).

## 5. Performance Cases
- [ ] **TC-PC-01**: Execute 100 concurrent login requests. Verify the server handles concurrent bcrypt hashing without crashing or excessive latency.
- [ ] **TC-PC-02**: Verify time-to-first-byte (TTFB) for `/api/auth/me` is under 150ms since it runs on every page load.
- [ ] **TC-PC-03**: Verify UI rendering time of the login split-screen layout on low-end devices (Throttled CPU/Network in DevTools).

## 6. Regression Cases
- [ ] **TC-RC-01**: Ensure an existing, legacy user can still log in after database schema changes (e.g., MFA fields added).
- [ ] **TC-RC-02**: Verify that password resets do not invalidate existing `Tenant` assignments or roles.
- [ ] **TC-RC-03**: Check that clearing cookies manually still elegantly forces the app back to the login screen without frontend crashes or unhandled promise rejections.
- [ ] **TC-RC-04**: Verify that using the browser's "Back" button after logging out does not allow access to protected cached pages.
