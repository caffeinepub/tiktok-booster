import { useGetAdminWalletBalance } from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import { isAuthorizationError } from '@/lib/backendError';
import { getActorQueryKey } from '@/lib/queryKeys';

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
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();
  
  // Access the actor query state directly to check initialization status
  const actorQueryState = queryClient.getQueryState(getActorQueryKey(principalString));
  const isActorLoading = actorQueryState?.fetchStatus === 'fetching' && !actorQueryState?.data;
  const actorError = actorQueryState?.error;
  
  const { 
    data: adminBalance, 
    isLoading, 
    isFetching,
    error
  } = useGetAdminWalletBalance();

  const isAuthenticated = !!identity;

  // Not logged in
  if (!isAuthenticated) {
    return { status: 'not-logged-in' };
  }

  // Actor initialization failed
  if (actorError && !actor) {
    const errorMessage = actorError instanceof Error 
      ? actorError.message 
      : 'Failed to initialize backend connection';
    return { status: 'error', message: errorMessage };
  }

  // Loading: identity initializing, actor initializing, or query actively loading/fetching
  if (isInitializing || isActorLoading || actorFetching || !actor || isLoading || isFetching) {
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

  // If query is not enabled and hasn't run, return error instead of loading
  return { status: 'error', message: 'Unable to load admin wallet status' };
}
