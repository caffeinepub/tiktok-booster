# TikTok Engagement Simulator

## Current State
App has admin/user role system. Admin wallet starts at 10,000 PKR. Problem: after every new canister deployment, all state resets including `userRoles`. The "first caller becomes admin" logic means the user must log in before anyone else on every fresh deploy. This is unreliable and has caused persistent zero-balance display.

Currently: AdminPage exists with distribute funds + top-up forms. AdminWalletSidebar shows on left. BalanceIndicator shows in top-right.

## Requested Changes (Diff)

### Add
- `claimAdminRole()` backend function: grants admin if stored profile email matches hardcoded ADMIN_EMAIL
- `claimAdminRole` call in AppLayout after onboarding, and in ProfilePage after saving profile
- `useClaimAdminRole` mutation hook
- Dedicated Distribute Balance page (`/admin/distribute`) with clear UI showing admin wallet + user list + send form
- Auto-claim admin in `saveCallerUserProfile` when email matches ADMIN_EMAIL

### Modify
- `main.mo`: Replace role-only admin checks with `isAdminUser(caller)` which checks BOTH role AND email
- `getAccountSummary`: returns `role: "admin"` and `adminWalletBalance: adminWallet` if caller's email is ADMIN_EMAIL, regardless of stored role
- `ensureRegistered`: also upgrades to admin if `isAdminByEmail` returns true
- AppLayout: call `claimAdminRole()` after onboarding succeeds, then refetch account summary
- ProfilePage: call `claimAdminRole()` after saving profile, refetch account summary
- AdminPage: improve layout and add clear link to distribute page
- BalanceIndicator: ensure refresh button is prominent and works correctly

### Remove
- Nothing removed

## Implementation Plan
1. Backend: done (main.mo updated with ADMIN_EMAIL constant, isAdminByEmail helper, claimAdminRole function, email-based checks throughout)
2. Declarations: done (claimAdminRole added to .d.ts and .js)
3. Frontend hooks: add `useClaimAdminRole` to useQueries.ts
4. AppLayout: call claimAdminRole after onboarding + refetch
5. ProfilePage: call claimAdminRole after saveCallerUserProfile + refetch
6. AdminPage / DistributePage: dedicated, clean distribute-balance UI with users list
