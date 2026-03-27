import { isInitializationError } from "@/lib/backendError";
import { getActorQueryKey } from "@/lib/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { useGetAdminWalletBalance, useIsCallerAdmin } from "./useQueries";

/**
 * Canonical admin wallet UI state.
 * Provides a single source of truth for admin wallet status across the application.
 */
export type AdminWalletUIState =
  | { status: "not-logged-in" }
  | { status: "loading" }
  | { status: "initializing" }
  | { status: "unauthorized" }
  | { status: "error"; message: string }
  | { status: "success"; balance: bigint };

export function useAdminWalletStatus(): AdminWalletUIState {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  // Check admin status first
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();

  // Access the actor query state directly to check initialization status
  const actorQueryState = queryClient.getQueryState(
    getActorQueryKey(principalString),
  );
  const isActorLoading =
    actorQueryState?.fetchStatus === "fetching" && !actorQueryState?.data;
  const actorError = actorQueryState?.error;

  const {
    data: adminBalance,
    isLoading,
    isFetching,
    error,
  } = useGetAdminWalletBalance();

  // Not logged in
  if (!identity) {
    return { status: "not-logged-in" };
  }

  // Actor or identity still initializing
  if (isInitializing || isActorLoading || actorFetching || !actor) {
    return { status: "loading" };
  }

  // Actor initialization error
  if (actorError) {
    if (isInitializationError(actorError)) {
      return { status: "initializing" };
    }
    return {
      status: "error",
      message: String(actorError),
    };
  }

  // Admin check is loading
  if (adminCheckLoading) {
    return { status: "loading" };
  }

  // Not an admin (confirmed)
  if (isAdmin === false) {
    return { status: "unauthorized" };
  }

  // Admin wallet balance query is loading
  if (isLoading || isFetching) {
    return { status: "loading" };
  }

  // Admin wallet balance query error
  if (error) {
    if (isInitializationError(error)) {
      return { status: "initializing" };
    }
    return {
      status: "error",
      message: String(error),
    };
  }

  // Unauthorized (null balance means no admin access)
  if (adminBalance === null) {
    return { status: "unauthorized" };
  }

  // Success - admin access confirmed with balance
  if (adminBalance !== undefined && isAdmin === true) {
    return {
      status: "success",
      balance: adminBalance,
    };
  }

  // Default to loading if state is indeterminate
  return { status: "loading" };
}
