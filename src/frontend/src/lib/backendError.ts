/**
 * Normalizes backend error messages into user-friendly English messages.
 * Handles authorization errors, insufficient balance, admin wallet errors, validation errors, and IC replica rejections.
 */
export function normalizeBackendError(error: unknown): string {
  if (!error) return "An unknown error occurred";

  const errorMessage =
    typeof error === "string"
      ? error
      : (error as any)?.message || String(error);

  // IC Replica rejection errors (IC0508, canister stopped, etc.)
  if (
    errorMessage.includes("IC0508") ||
    errorMessage.includes("is stopped") ||
    errorMessage.includes("replica returned a rejection error") ||
    (errorMessage.includes("Canister") && errorMessage.includes("stopped")) ||
    errorMessage.includes("reject_code") ||
    errorMessage.includes("non_replicated_rejection")
  ) {
    return "Backend canister is temporarily unavailable. Please try again or reload the page.";
  }

  // Authentication required errors
  if (
    errorMessage.includes("Must be authenticated") ||
    errorMessage.includes("must be authenticated") ||
    errorMessage.includes("Must be aunthitication") ||
    errorMessage.includes("authentication to perform")
  ) {
    return "Please log in first to perform this action";
  }

  // Authorization system not ready - distinct from permission denial
  if (errorMessage.includes("Authorization system not ready")) {
    return "System is initializing. Please wait a moment and try again.";
  }

  // Authorization errors
  if (
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("Only admin")
  ) {
    return "You do not have permission to perform this action";
  }

  // Insufficient balance errors
  if (errorMessage.includes("Insufficient balance")) {
    return "Insufficient balance to complete this transaction";
  }

  // Admin wallet errors
  if (errorMessage.includes("Not enough funds in admin wallet")) {
    return "Admin wallet does not have enough funds. Please contact an administrator.";
  }

  // Top-up validation errors
  if (errorMessage.includes("Cannot top up with zero amount")) {
    return "Amount must be greater than zero";
  }

  // User already exists
  if (errorMessage.includes("User already exists")) {
    return "You have already received your welcome bonus";
  }

  // Order not found
  if (errorMessage.includes("does not exist")) {
    return "Order not found";
  }

  // Generic error
  return errorMessage || "An error occurred";
}

/**
 * Checks if an error is specifically an authorization/permission error.
 * Used to distinguish auth failures from other backend errors.
 */
export function isAuthorizationError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    typeof error === "string"
      ? error
      : (error as any)?.message || String(error);

  return (
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("Only admin") ||
    errorMessage.includes("not recognized as admin") ||
    errorMessage.includes("permission")
  );
}

/**
 * Checks if an error is an initialization error that should be retried.
 * "Authorization system not ready" is a transient state during canister startup.
 */
export function isInitializationError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    typeof error === "string"
      ? error
      : (error as any)?.message || String(error);

  return errorMessage.includes("Authorization system not ready");
}

/**
 * Checks if an error is an insufficient balance error.
 * Used to show specific guidance for users who need a top-up.
 */
export function isInsufficientBalanceError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    typeof error === "string"
      ? error
      : (error as any)?.message || String(error);

  return errorMessage.includes("Insufficient balance");
}

/**
 * Checks if an error is an authentication error (unauthenticated user).
 */
export function isAuthenticationError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    typeof error === "string"
      ? error
      : (error as any)?.message || String(error);

  return (
    errorMessage.includes("Must be authenticated") ||
    errorMessage.includes("must be authenticated") ||
    errorMessage.includes("authentication to perform")
  );
}
