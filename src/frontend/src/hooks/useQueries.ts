import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Wallet-related hooks
export function useGetBalance() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return useQuery<bigint>({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getBalance();
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !isInitializing,
    placeholderData: BigInt(0),
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !isInitializing,
    retry: false,
    placeholderData: false,
  });
}

export function useGetAdminWalletBalance() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  return useQuery<bigint>({
    queryKey: ['adminWalletBalance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getAdminWalletBalance();
    },
    enabled: !!actor && !isFetching && isAuthenticated && !isInitializing && isAdmin === true,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useDistributeFunds() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toUser, amount }: { toUser: Principal; amount: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      if (amount <= BigInt(0)) {
        throw new Error('Amount must be greater than zero');
      }
      return await actor.distributeFunds(toUser, amount);
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch both queries to update UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminWalletBalance'] }),
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
      ]);
      
      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['adminWalletBalance'] }),
        queryClient.refetchQueries({ queryKey: ['balance'] }),
      ]);
    },
  });
}

export function useOnboarding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.onboarding();
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch balance queries to update UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
        queryClient.invalidateQueries({ queryKey: ['adminWalletBalance'] }),
      ]);
      
      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['balance'] }),
        queryClient.refetchQueries({ queryKey: ['adminWalletBalance'] }),
      ]);
    },
  });
}
