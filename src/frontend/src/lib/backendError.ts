/**
 * Normalizes backend error messages into user-friendly English messages.
 * Handles authorization errors, insufficient balance, admin wallet errors, and validation errors.
 */
export function normalizeBackendError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  const errorMessage = typeof error === 'string' 
    ? error 
    : (error as any)?.message || String(error);

  // Authorization errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admin')) {
    return 'You do not have permission to perform this action';
  }

  // Insufficient balance errors
  if (errorMessage.includes('Insufficient balance')) {
    return 'Insufficient balance to complete this transaction';
  }

  // Admin wallet errors
  if (errorMessage.includes('Not enough funds in admin wallet')) {
    return 'Admin wallet does not have enough funds. Please contact an administrator.';
  }

  // Top-up validation errors
  if (errorMessage.includes('Cannot top up with zero amount')) {
    return 'Amount must be greater than zero';
  }

  // User already exists
  if (errorMessage.includes('User already exists')) {
    return 'You have already received your welcome bonus';
  }

  // Order not found
  if (errorMessage.includes('does not exist')) {
    return 'Order not found';
  }

  // Generic error
  return errorMessage || 'An error occurred';
}

/**
 * Checks if an error is specifically an authorization/permission error.
 * Used to distinguish auth failures from other backend errors.
 */
export function isAuthorizationError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : (error as any)?.message || String(error);
  
  return errorMessage.includes('Unauthorized') || 
         errorMessage.includes('Only admin') ||
         errorMessage.includes('not recognized as admin') ||
         errorMessage.includes('permission');
}
