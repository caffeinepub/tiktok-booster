# Specification

## Summary
**Goal:** Port the PHP/MySQL “new user gets 10 PKR funded from admin wallet” behavior to an Internet Identity + Motoko canister flow with stable, upgrade-safe balances and a frontend onboarding trigger.

**Planned changes:**
- Add a backend onboarding API in `backend/main.mo` that, for authenticated callers with no existing balance record, atomically credits the user +10 PKR and deducts 10 PKR from a single admin wallet; if admin balance < 10 PKR, fail with an English error and do not change any balances.
- Make admin wallet and per-user balances persist in stable canister state across upgrades, including initializing admin to 10,000 PKR on fresh install and applying conditional migration only when needed to preserve existing deployed state.
- Add a frontend post-sign-in onboarding flow (Internet Identity) that calls the onboarding API, updates the displayed balance without full refresh, and shows an English error message if admin funds are insufficient while keeping displayed balances unchanged.
- Add a React Query mutation/hook for onboarding, and on success invalidate/refetch existing balance queries so the BalanceIndicator updates immediately.

**User-visible outcome:** After signing in with Internet Identity, new users automatically receive an initial 10 PKR balance (when admin funds allow) and returning users are not re-credited; if admin funds are insufficient, the UI shows an English error and balances remain unchanged.
