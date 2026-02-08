/**
 * Centralized React Query key helpers for consistent cache targeting.
 * All queries and mutations should use these helpers to ensure per-identity isolation.
 */

/**
 * Get the actor query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined for current/anonymous
 */
export function getActorQueryKey(principalString?: string) {
  return ['actor', principalString];
}

/**
 * Get the admin wallet balance query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined for current
 */
export function getAdminWalletBalanceQueryKey(principalString?: string) {
  return principalString ? ['adminWalletBalance', principalString] : ['adminWalletBalance'];
}

/**
 * Get the user balance query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined for current
 */
export function getBalanceQueryKey(principalString?: string) {
  return principalString ? ['balance', principalString] : ['balance'];
}

/**
 * Get the user profile query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined for current
 */
export function getUserProfileQueryKey(principalString?: string) {
  return principalString ? ['currentUserProfile', principalString] : ['currentUserProfile'];
}

/**
 * Get the isCallerAdmin query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined for current
 */
export function getIsCallerAdminQueryKey(principalString?: string) {
  return principalString ? ['isCallerAdmin', principalString] : ['isCallerAdmin'];
}
