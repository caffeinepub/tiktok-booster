/**
 * Normalizes backend error messages into user-friendly English messages
 */
export function normalizeBackendError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for common backend error patterns
  if (errorMessage.includes('Insufficient admin wallet funds')) {
    return 'Insufficient admin wallet funds. Please check the available balance.';
  }

  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admin')) {
    return 'Unauthorized. Only admin can perform this action.';
  }

  if (errorMessage.includes('Actor not initialized') || errorMessage.includes('Actor not available')) {
    return 'Connection error. Please refresh the page and try again.';
  }

  if (errorMessage.includes('Amount must be greater than zero')) {
    return 'Amount must be greater than zero';
  }

  // Return the original message if no pattern matches
  return errorMessage;
}
