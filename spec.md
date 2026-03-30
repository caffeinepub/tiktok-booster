# TikTok Engagement Simulator

## Current State
Backend has `getAccountSummary()` as a `query` function. It returns adminWalletBalance only if `isAdminUser` is true. But admin role is set via `onboarding()` which is a separate update call. Race condition: `getAccountSummary` fires before `onboarding` completes, so admin role isn't set yet → returns 0.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Convert `getAccountSummary` from `query` to `shared` (update) call so it can call `ensureRegistered` internally, guaranteeing the user is registered and gets correct admin role in a single atomic call.

### Remove
- Remove dependency on separate `onboarding()` call for role assignment in the summary path

## Implementation Plan
1. Change `public query ({ caller }) func getAccountSummary()` → `public shared ({ caller }) func getAccountSummary()` in main.mo
2. Add `ensureRegistered(caller)` call at start of `getAccountSummary`
3. Wrap in try/catch so anonymous callers still get a safe empty response
4. Update frontend: since `getAccountSummary` is now an update call, it will be slower but always accurate — no other frontend changes needed
