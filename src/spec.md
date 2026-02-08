# Specification

## Summary
**Goal:** Make authentication and wallet/balance status clearly visible, and fix authorization initialization so logged-in users can reliably access onboarding and balance features.

**Planned changes:**
- Add a clearly visible global-header action for unauthenticated users labeled **"Log In"** that uses the existing Internet Identity authentication flow (same mechanism as Sign Up) and returns the user to the app authenticated.
- Update header behavior so **"Log In"** is shown only when unauthenticated, and authenticated-state navigation (e.g., Profile) is shown when authenticated.
- Make the wallet/balance area always explicit in the UI: show an English sign-in prompt when unauthenticated; show loading state and then a numeric balance when authenticated; show an English error plus retry/refresh control when balance fetch fails.
- Fix backend authorization initialization so onboarding() and getBalance() work after deploy/upgrade without "Authorization system not ready", and ensure admin recognition/permissions persist across upgrades.

**User-visible outcome:** Unauthenticated users see a prominent **Log In** option in the header and clear wallet access messaging; authenticated users see a visible wallet/balance indicator that loads reliably (or shows a clear error with retry), and backend calls no longer fail due to authorization initialization after upgrades.
