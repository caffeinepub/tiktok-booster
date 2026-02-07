# Specification

## Summary
**Goal:** Show the Admin Wallet balance (PKR) in the global BalanceIndicator for admin users while keeping existing balance behavior unchanged for non-admin and unauthenticated users.

**Planned changes:**
- Update the BalanceIndicator logic to fetch and display an additional, clearly labeled "Admin Wallet" balance (in PKR) only when the signed-in user is an admin.
- Ensure non-admin and unauthenticated users never see admin wallet information and that any admin-wallet fetch/authorization failures do not break or error the BalanceIndicator UI.
- Refresh the displayed Admin Wallet balance after successful admin distribution actions so it reflects the backend state without a full page reload.

**User-visible outcome:** Admin users see both their caller balance and an "Admin Wallet" balance in the fixed balance widget across the app; non-admin/unauthenticated users see the existing balance display only, with no new errors introduced.
