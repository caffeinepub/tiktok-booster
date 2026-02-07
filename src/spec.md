# Specification

## Summary
**Goal:** Fix the admin wallet balance so it persists correctly across upgrades and never misleadingly displays “0 PKR” when the balance cannot be loaded.

**Planned changes:**
- Persist the admin wallet balance in stable canister state, initializing to 10,000 PKR only on first install and preserving updates across upgrades/redeployments.
- Ensure the backend reliably recognizes the intended admin principal(s) so admin-only methods remain accessible to the admin account and protected from non-admin access.
- Update the BalanceIndicator admin wallet UI to show a clear English “unavailable/error” state for admins when the balance fetch fails (instead of showing 0), and keep the admin wallet section hidden for non-admin users.
- Update the /admin wallet-balance card to display the real persisted balance when available and show a clear English “unavailable/error” message when it cannot be loaded (no 0 fallback).

**User-visible outcome:** Admins see the correct persisted admin wallet balance (starting at 10,000 PKR on first install and preserved across upgrades), and if the balance cannot be loaded the UI clearly indicates it’s unavailable rather than showing “0 PKR”; non-admin users do not see admin wallet information.
