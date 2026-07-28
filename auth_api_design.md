# Authentication Module API Design

This document details the production-ready REST API specifications for the Authentication module. It aligns with the updated database schema, incorporating session management, auditing, and enhanced security controls.

---

## 1. Register User & Workspace

**Purpose**: Creates a new user account and provisions an initial tenant (workspace) with an ADMIN role.
**Method**: `POST`
**URL**: `/api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

- **Validation**: 
  - `email`: Valid email format, required.
  - `password`: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
  - `name`: Required, min 2 characters.
- **Errors**: 
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already exists.
- **Permission**: Public (No authentication required).
- **Audit Log**: 
  - Event: `USER_REGISTERED`
  - Metadata: `{ "tenant_id": "uuid" }`
- **Notification**: Sends "Welcome & Verify Email" email asynchronously.
- **Rate Limiting**: 5 requests per hour per IP.
- **Status Codes**: `201 Created`, `400`, `409`, `429`, `500`

---

## 2. Authenticate User (Login)

**Purpose**: Authenticates a user with credentials and creates a secure session (sets HttpOnly cookie).
**Method**: `POST`
**URL**: `/api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "StrongPassword123!",
  "device_name": "Chrome on Windows" // Optional, for session tracking
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Login successful",
  "requires_2fa": false
}
```
*(Sets `session_token` as HttpOnly, Secure, SameSite=Lax cookie)*

- **Validation**:
  - `email`: Required, valid email format.
  - `password`: Required string.
- **Errors**:
  - `401 Unauthorized`: Invalid credentials (generic message to prevent email enumeration).
  - `403 Forbidden`: Account is suspended or locked.
- **Permission**: Public.
- **Audit Log**:
  - Events: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`
  - IP Address and User-Agent captured.
- **Notification**: Alert email sent if login is from a new IP/Country.
- **Rate Limiting**: 5 failed attempts per 15 minutes per email (triggers account lock or CAPTCHA).
- **Status Codes**: `200 OK`, `400`, `401`, `403`, `429`, `500`

---

## 3. Get Current User Context

**Purpose**: Retrieves the authenticated user's profile, active tenant context, and resolved RBAC permissions.
**Method**: `GET`
**URL**: `/api/auth/me`

**Request**: No body. Requires valid session cookie.

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "tenant_id": "uuid",
    "permissions": ["dashboard.view", "leads.create", "..."]
  }
}
```

- **Validation**: Validates session token against the database.
- **Errors**:
  - `401 Unauthorized`: Missing or invalid session token.
- **Permission**: Requires active session.
- **Audit Log**: None (Too frequent, logged at middleware level if needed).
- **Notification**: None.
- **Rate Limiting**: 100 requests per minute per IP.
- **Status Codes**: `200 OK`, `401`, `500`

---

## 4. Revoke Session (Logout)

**Purpose**: Terminates the current active session.
**Method**: `POST`
**URL**: `/api/auth/logout`

**Request**: No body. Requires valid session cookie.

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
*(Clears `session_token` cookie)*

- **Validation**: Requires active session token.
- **Errors**: None (Fails silently or returns 200 even if already logged out).
- **Permission**: Requires active session.
- **Audit Log**: Event: `LOGOUT_SUCCESS`.
- **Notification**: None.
- **Rate Limiting**: Standard API limits.
- **Status Codes**: `200 OK`, `500`

---

## 5. Request Password Reset

**Purpose**: Generates a password reset token and dispatches an email to the user.
**Method**: `POST`
**URL**: `/api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account exists, a password reset link has been sent."
}
```

- **Validation**: `email` must be a valid email format.
- **Errors**: None regarding existence (Always returns success to prevent user enumeration).
- **Permission**: Public.
- **Audit Log**: Event: `PASSWORD_RESET_REQUESTED` (only logged if user actually exists).
- **Notification**: Sends "Password Reset Instructions" email.
- **Rate Limiting**: 3 requests per hour per email.
- **Status Codes**: `200 OK`, `400`, `429`, `500`

---

## 6. Reset Password

**Purpose**: Consumes a reset token to update the user's password.
**Method**: `POST`
**URL**: `/api/auth/reset-password`

**Request Body**:
```json
{
  "token": "secure_token_string",
  "new_password": "NewStrongPassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been successfully reset."
}
```

- **Validation**: 
  - `token`: Required string.
  - `new_password`: Follows standard password strength rules.
- **Errors**:
  - `400 Bad Request`: Invalid or expired token.
- **Permission**: Public (Token acts as bearer).
- **Audit Log**: Event: `PASSWORD_RESET_COMPLETED`.
- **Notification**: Sends "Your password was recently changed" alert email.
- **Rate Limiting**: 5 requests per hour per IP.
- **Status Codes**: `200 OK`, `400`, `429`, `500`

---

## 7. Verify Email Address

**Purpose**: Verifies a user's email address using a token sent during registration.
**Method**: `POST`
**URL**: `/api/auth/verify-email`

**Request Body**:
```json
{
  "token": "email_verification_token"
}
```

- **Validation**: `token` must be present.
- **Errors**: `400 Bad Request` if token is invalid or expired.
- **Permission**: Public.
- **Audit Log**: Event: `EMAIL_VERIFIED`.
- **Notification**: None (UI handles success).
- **Rate Limiting**: 10 requests per hour per IP.
- **Status Codes**: `200 OK`, `400`, `500`

---

## 8. List Active Sessions

**Purpose**: Retrieves all currently active sessions for the authenticated user (for security hub).
**Method**: `GET`
**URL**: `/api/auth/sessions`

**Response**:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "device": "Chrome on Windows",
      "ip_address": "192.168.1.1",
      "created_at": "2026-07-28T10:00:00Z",
      "is_current": true
    }
  ]
}
```

- **Validation**: None.
- **Errors**: `401 Unauthorized`.
- **Permission**: Requires active session.
- **Audit Log**: None.
- **Notification**: None.
- **Rate Limiting**: Standard API limits.
- **Status Codes**: `200 OK`, `401`

---

## 9. Revoke Specific Session

**Purpose**: Terminates a specific session (remote logout from another device).
**Method**: `DELETE`
**URL**: `/api/auth/sessions/:sessionId`

**Response**:
```json
{
  "success": true,
  "message": "Session revoked successfully."
}
```

- **Validation**: `sessionId` must be valid UUID.
- **Errors**: 
  - `403 Forbidden` if user attempts to delete a session they do not own.
  - `404 Not Found` if session doesn't exist.
- **Permission**: Requires active session. User must own the target session.
- **Audit Log**: Event: `SESSION_REVOKED_REMOTELY`.
- **Notification**: None.
- **Rate Limiting**: Standard API limits.
- **Status Codes**: `200 OK`, `401`, `403`, `404`
