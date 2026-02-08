# Specification

## Summary
**Goal:** Make the Dashboard admin wallet status consistent so it never shows an admin wallet balance alongside “Not recognized as admin”/unauthorized messaging, and ensure admin-only actions are gated by the same canonical signal.

**Planned changes:**
- Refactor Dashboard admin wallet UI state handling so loading / not logged in / not an admin (unauthorized) / error / success are derived from a single canonical data source and rendered as one coherent state at a time.
- Update admin gating for admin-only Dashboard actions (e.g., “Distribute Funds to User”) to rely on the same canonical admin signal as the displayed admin wallet balance (successful non-null balance implies admin; unauthorized/null implies non-admin).
- Harden admin wallet balance query error handling so non-auth failures show an error state, while only true authorization failures produce a null balance and the “not an admin/unauthorized” state.
- Ensure all user-facing status strings remain in English.

**User-visible outcome:** The Dashboard will no longer display contradictory admin status (balance shown while also saying not admin); admin-only actions appear whenever the admin wallet balance is successfully fetched, and real errors are shown as errors rather than “not an admin.”
