/**
 * Centralized React Query key helpers for consistent cache targeting.
 * All queries and mutations should use these helpers to ensure per-identity isolation.
 */

/**
 * Get the actor query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getActorQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["actor", principalString];
}

/**
 * Get the balance query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getBalanceQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["balance", principalString];
}

/**
 * Get the admin wallet balance query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getAdminWalletBalanceQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["adminWalletBalance", principalString];
}

/**
 * Get the user profile query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getUserProfileQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["userProfile", principalString];
}

/**
 * Get the isCallerAdmin query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getIsCallerAdminQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["isCallerAdmin", principalString];
}

/**
 * Get the all users query key for a specific principal (admin only).
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getAllUsersQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["allUsers", principalString];
}

/**
 * Get the account summary query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getAccountSummaryQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["accountSummary", principalString];
}

/**
 * Get the community posts query key for a specific principal.
 * @param principalString - The principal ID as a string, or undefined if not authenticated
 */
export function getCommunityPostsQueryKey(
  principalString: string | undefined,
): [string, string | undefined] {
  return ["communityPosts", principalString];
}
