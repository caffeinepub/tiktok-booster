import { useGetAdminWalletBalance } from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';
import { isAuthorizationError } from '@/lib/backendError';

/**
 * Canonical admin wallet UI state.
 * Provides a single source of truth for admin wallet status across the application.
 */
export type AdminWalletUIState =
  | { status: 'not-logged-in' }
  | { status: 'loading' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'success'; balance: bigint };

export function useAdminWalletStatus(): AdminWalletUIState {
  const { identity, isInitializing } = useInternetIdentity();
  const { 
    data: adminBalance, 
    isLoading, 
    error,
    isFetched 
  } = useGetAdminWalletBalance();

  const isAuthenticated = !!identity;

  // Not logged in
  if (!isAuthenticated) {
    return { status: 'not-logged-in' };
  }

  // Loading (including initial auth)
  if (isInitializing || isLoading || !isFetched) {
    return { status: 'loading' };
  }

  // Error state takes precedence over any cached data
  if (error) {
    // Check if it's an authorization error
    if (isAuthorizationError(error)) {
      return { status: 'unauthorized' };
    }
    // Other errors
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error as any)?.message || 'Failed to load admin wallet balance';
    return { status: 'error', message: errorMessage };
  }

  // Authorization failure (null response)
  if (adminBalance === null) {
    return { status: 'unauthorized' };
  }

  // Success
  if (adminBalance !== undefined) {
    return { status: 'success', balance: adminBalance };
  }

  // Fallback to loading if we somehow get here
  return { status: 'loading' };
}
