# Authentication Module UX Design Documentation

As a Senior UX Designer, this document outlines the production-ready User Experience (UX) standards for the CLIXPRO CRM Authentication module. The goal is to provide a frictionless, accessible, and responsive experience for users across all devices while maintaining enterprise-grade security perception.

---

## 1. Screen Explanations

### 1.1 Login Screen (`/login`)
**Purpose**: The primary gateway for returning users.
**Layout Approach**: Split-screen design on desktop (Brand image/value prop on the left 50%, authentication form on the right 50% centered).
**Flow**: Users input credentials, can optionally check "Stay signed in", or navigate to password recovery/registration.

### 1.2 Registration Screen (`/register`)
**Purpose**: Onboard new users and create their initial workspace.
**Layout Approach**: Matches the Login screen's split layout to maintain visual consistency.
**Flow**: Users input Name, Email, and Password. Real-time password strength indicators guide the user.

### 1.3 Forgot Password (`/forgot-password`)
**Purpose**: Initiate the account recovery process.
**Layout Approach**: Centered card layout (single column) to eliminate distractions and focus purely on the recovery task.
**Flow**: Email input -> Submit -> Success confirmation state (Check your inbox).

### 1.4 Reset Password (`/reset-password`)
**Purpose**: Finalize account recovery securely.
**Layout Approach**: Centered card layout.
**Flow**: Hidden token validation -> New Password input -> Confirm Password input -> Submit.

---

## 2. Component Specifications

### 2.1 Auth Layout Container
- **Max-Width**: 1440px (Centered).
- **Split View (Desktop)**: Left side uses a dark, subtle gradient with an abstract geometry or CRM dashboard mockup. Right side is a pure `#FFFFFF` background for maximum contrast against the form.
- **Card View (Recovery)**: 480px max-width, elevated with a soft shadow (`0 10px 40px rgba(0,0,0,0.08)`), rounded corners (`border-radius: 16px`).

### 2.2 Text Inputs (Email, Name)
- **Height**: 48px (Touch-friendly target).
- **Border**: `1px solid #E2E8F0` (Default), `#3B82F6` (Focused), `#EF4444` (Error).
- **Border Radius**: 12px.
- **Padding**: `0 16px`.
- **Typography**: Inter, 16px, `#0F172A`. (16px prevents iOS Safari from auto-zooming).

### 2.3 Password Input (with Toggle)
- **Features**: Inherits styling from Text Inputs.
- **Action**: Absolute positioned `Eye` / `EyeOff` icon on the right (`padding-right: 48px` on input to prevent text overlap).
- **Icon Color**: `#94A3B8`, changes to `#475569` on hover.

### 2.4 Primary Button
- **Height**: 48px.
- **Background**: Brand Emerald `#059669`. Hover: `#047857`. Active (Click): `#065F46`.
- **Text**: 16px, Semi-Bold, `#FFFFFF`.
- **Radius**: 12px.
- **Transition**: `background-color 0.2s ease-in-out, transform 0.1s ease`. (Scale down to `0.98` on click).

### 2.5 Typography & Spacing
- **Headings (H1)**: 32px, Bold, `#0F172A`, `-0.02em` tracking. Bottom margin: `8px`.
- **Subtitles**: 16px, Regular, `#64748B`. Bottom margin: `32px`.
- **Input Labels**: 14px, Medium, `#334155`. Bottom margin: `8px`.
- **Vertical Rhythm**: `24px` spacing between form groups. `32px` spacing between the form and the submit button.

---

## 3. Accessibility (a11y)

- **Color Contrast**: All text and crucial icons meet or exceed the WCAG 2.1 AA ratio of 4.5:1. (e.g., `#64748B` on `#FFFFFF`).
- **Focus States**: Every interactive element has a visible, high-contrast focus ring (`outline: 2px solid #3B82F6; outline-offset: 2px`).
- **ARIA Attributes**:
  - `aria-invalid="true"` added to inputs with errors.
  - `aria-describedby="error-msg-id"` linking inputs to their error messages.
  - Password toggle button uses `aria-label="Show password"` or `aria-label="Hide password"` dynamically.
- **Form Semantics**: Explicit `<label>` tags linked via `htmlFor` to input `id`s.

---

## 4. Keyboard Shortcuts & Navigation

- **Tab Navigation**: Strictly logical DOM order (Email -> Password -> Show Password Toggle -> Remember Me -> Login Button -> Links).
- **Enter Key**: Submits the form natively when focus is inside any input field.
- **Space/Enter**: Toggles the "Show Password" button and the "Remember Me" checkbox.
- **Escape Key**: Dismisses any active toast notifications or popups.

---

## 5. Responsive Behavior

### 5.1 Mobile Behavior (0px - 767px)
- **Layout**: Single column. Split-screen brand image is hidden entirely (`display: none`).
- **Padding**: 24px screen margins. Forms stretch to 100% width.
- **Touch Targets**: Minimum 48x48px for all clickable elements.
- **Keyboard Optimization**: Inputs trigger correct mobile keyboards (`type="email"` shows @ symbol, no auto-capitalize).

### 5.2 Tablet Behavior (768px - 1023px)
- **Layout**: Centered card layout. The split-screen is still hidden, as 50/50 splits on portrait tablets compress the form too much.
- **Form Width**: Constrained to a max of 400px, centered horizontally and vertically on the screen.
- **Background**: Soft brand-colored background behind the white form card.

### 5.3 Desktop Behavior (1024px+)
- **Layout**: Full split-screen (50/50).
- **Interactions**: Hover states on buttons, links, and inputs are fully active.
- **Focus Management**: `autoFocus` on the Email input field upon page load to allow immediate typing.

---

## 6. States

### 6.1 Loading Skeletons & Spinners
- **Form Submission**: Instead of a full-page skeleton, the primary button transitions to a disabled state with a subtle, looping SVG spinner on the left side of the text (e.g., `<Spinner /> Signing in...`).
- **Page Load (Me Check)**: If the system is verifying an existing session before showing the login screen, a centralized, pulsing logo or skeleton of the auth card is displayed.

### 6.2 Empty States
- **Not Applicable for Auth**: Auth forms don't have traditional empty data states, but inputs should start completely blank without pre-filled confusing placeholders (use clear, generic placeholders like `name@company.com`).

### 6.3 Error States
- **Inline Validation**: Errors (e.g., "Invalid email format") appear directly below the respective input field in `#EF4444` (Red), 12px text. The input border also turns red.
- **Global Errors**: Server-side errors (e.g., "Invalid credentials", "Account suspended") trigger a Top-Right Toast notification with a red background, an error icon, and a vibration/shake micro-animation on the form card to draw immediate attention.
- **Recovery**: If a reset token is invalid/expired on the `/reset-password` route, the form is replaced by a "Token Expired" error state block with a button leading back to `/forgot-password`.

### 6.4 Success States
- **Login**: Instant Toast notification ("Welcome back!"). The form slightly fades (`opacity: 0.7`) and prevents further clicking while redirecting to the dashboard.
- **Registration**: Confetti micro-animation (optional/delightful) + redirect to a "Check your email" verification screen.
- **Forgot Password**: Form swaps to a static "Inbox Check" graphic, informing the user that instructions have been sent, preventing spam clicks.
