import {
  isAuthorizationError,
  isInitializationError,
} from "@/lib/backendError";
import {
  getAccountSummaryQueryKey,
  getAdminWalletBalanceQueryKey,
  getAllUsersQueryKey,
  getBalanceQueryKey,
  getCommunityPostsQueryKey,
  getIsCallerAdminQueryKey,
  getUserProfileQueryKey,
} from "@/lib/queryKeys";
import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AccountSummary, Post, UserProfile } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();

  const query = useQuery<UserProfile | null>({
    queryKey: getUserProfileQueryKey(principalString),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors with short delay
      if (isInitializationError(error)) return failureCount < 3;
      // Don't retry authorization errors
      if (isAuthorizationError(error)) return false;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserProfileQueryKey(principalString),
      });
    },
  });
}

/**
 * Fetches account summary including role, user balance, and admin wallet balance (if admin).
 * This is the preferred method for getting role + balance information in a single call.
 */
export function useGetAccountSummary() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();

  const isAuthenticated = !!identity;

  return useQuery<AccountSummary>({
    queryKey: getAccountSummaryQueryKey(principalString),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getAccountSummary();
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !isInitializing &&
      !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors with short delay
      if (isInitializationError(error)) return failureCount < 3;
      // Don't retry authorization errors
      if (isAuthorizationError(error)) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

// Wallet-related hooks
export function useGetBalance() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();

  const isAuthenticated = !!identity;

  return useQuery<bigint>({
    queryKey: getBalanceQueryKey(principalString),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getBalance();
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !isInitializing &&
      !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors with short delay
      if (isInitializationError(error)) return failureCount < 3;
      // Don't retry on authorization errors
      if (isAuthorizationError(error)) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();

  const isAuthenticated = !!identity;

  return useQuery<boolean>({
    queryKey: getIsCallerAdminQueryKey(principalString),
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error("Failed to check admin status:", error);
        return false;
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !isInitializing &&
      !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors
      if (isInitializationError(error)) return failureCount < 3;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    placeholderData: false,
  });
}

/**
 * Permission-safe admin wallet balance hook.
 * Returns bigint on success, null on authorization failure.
 * Throws error for non-auth failures so React Query sets error state.
 */
export function useGetAdminWalletBalance() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();

  const isAuthenticated = !!identity;

  return useQuery<bigint | null>({
    queryKey: getAdminWalletBalanceQueryKey(principalString),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        // Use the canonical getAdminWalletBalance method
        return await actor.getAdminWalletBalance();
      } catch (error: any) {
        // Check if it's an authorization error
        if (isAuthorizationError(error)) {
          // Return null for unauthorized access (non-admin users)
          return null;
        }
        // Re-throw other errors so React Query sets error state
        throw error;
      }
    },
    enabled:
      !!actor &&
      !actorFetching &&
      isAuthenticated &&
      !isInitializing &&
      !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors
      if (isInitializationError(error)) return failureCount < 3;
      // Don't retry authorization errors
      if (isAuthorizationError(error)) return false;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: true,
    // Ensure stale data doesn't override error states
    staleTime: 0,
  });
}

export function useDistributeFunds() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async ({
      toUser,
      amount,
    }: { toUser: Principal; amount: bigint }) => {
      if (!actor) throw new Error("Actor not initialized");
      if (amount <= BigInt(0)) {
        throw new Error("Amount must be greater than zero");
      }
      return await actor.adminDistributeFunds(toUser, amount);
    },
    onSuccess: async (_data, variables) => {
      // Invalidate and immediately refetch admin wallet balance and the recipient's balance
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminWalletBalanceQueryKey(principalString),
        }),
        queryClient.invalidateQueries({
          queryKey: getBalanceQueryKey(variables.toUser.toString()),
        }),
        queryClient.invalidateQueries({
          queryKey: getAllUsersQueryKey(principalString),
        }),
        queryClient.invalidateQueries({
          queryKey: getAccountSummaryQueryKey(principalString),
        }),
      ]);

      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: getAdminWalletBalanceQueryKey(principalString),
        }),
        queryClient.refetchQueries({
          queryKey: getAllUsersQueryKey(principalString),
        }),
        queryClient.refetchQueries({
          queryKey: getAccountSummaryQueryKey(principalString),
        }),
      ]);
    },
  });
}

export function useAdminTopUp() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      if (amount <= BigInt(0)) {
        throw new Error("Amount must be greater than zero");
      }
      return await actor.adminTopUp(amount);
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch admin wallet balance
      await queryClient.invalidateQueries({
        queryKey: getAdminWalletBalanceQueryKey(principalString),
      });
      await queryClient.refetchQueries({
        queryKey: getAdminWalletBalanceQueryKey(principalString),
      });
      await queryClient.invalidateQueries({
        queryKey: getAccountSummaryQueryKey(principalString),
      });
      await queryClient.refetchQueries({
        queryKey: getAccountSummaryQueryKey(principalString),
      });
    },
  });
}

export function useOnboarding() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.onboarding();
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch balance queries to update UI
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getBalanceQueryKey(principalString),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminWalletBalanceQueryKey(principalString),
        }),
        queryClient.invalidateQueries({
          queryKey: getAccountSummaryQueryKey(principalString),
        }),
      ]);

      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: getBalanceQueryKey(principalString),
        }),
        queryClient.refetchQueries({
          queryKey: getAdminWalletBalanceQueryKey(principalString),
        }),
        queryClient.refetchQueries({
          queryKey: getAccountSummaryQueryKey(principalString),
        }),
      ]);
    },
    retry: (failureCount, error) => {
      // Retry initialization errors
      if (isInitializationError(error)) return failureCount < 3;
      // Don't retry other errors
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  return useQuery<Array<[Principal, bigint]>>({
    queryKey: getAllUsersQueryKey(principalString),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getAllUsers();
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !isInitializing &&
      isAdmin === true &&
      !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors
      if (isInitializationError(error)) return failureCount < 3;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

/**
 * Get balance for any user by Principal (admin only).
 * Used on Admin page to show user balance when distributing funds.
 */
export function useGetUserBalance(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  return useQuery<bigint>({
    queryKey: ["userBalance", userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal)
        throw new Error("Actor or user principal not available");
      return await actor.getUserBalance(userPrincipal);
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !isInitializing &&
      isAdmin === true &&
      !!userPrincipal,
    retry: (failureCount, error) => {
      // Retry initialization errors
      if (isInitializationError(error)) return failureCount < 3;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

// Community hooks
export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const principalString = identity?.getPrincipal().toString();

  const isAuthenticated = !!identity;

  return useQuery<Post[]>({
    queryKey: getCommunityPostsQueryKey(principalString),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getAllPosts();
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !isInitializing &&
      !!principalString,
    retry: (failureCount, error) => {
      // Retry initialization errors
      if (isInitializationError(error)) return failureCount < 3;
      // Don't retry authorization errors
      if (isAuthorizationError(error)) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!content.trim()) {
        throw new Error("Post content cannot be empty");
      }
      return await actor.createPost(content);
    },
    onSuccess: async () => {
      // Invalidate and refetch posts to show the new post
      await queryClient.invalidateQueries({
        queryKey: getCommunityPostsQueryKey(principalString),
      });
      await queryClient.refetchQueries({
        queryKey: getCommunityPostsQueryKey(principalString),
      });
    },
  });
}
