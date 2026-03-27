import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetAccountSummary, useOnboarding } from "@/hooks/useQueries";
import {
  isInitializationError,
  normalizeBackendError,
} from "@/lib/backendError";
import { Outlet } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import AdminWalletSidebar from "./AdminWalletSidebar";
import BalanceIndicator from "./BalanceIndicator";

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: accountSummary, isLoading: summaryLoading } =
    useGetAccountSummary();
  const onboardingMutation = useOnboarding();
  const hasAttemptedOnboarding = useRef<Set<string>>(new Set());

  const isAdmin = accountSummary?.role === "admin";
  const showAdminSidebar = isAdmin && !summaryLoading;

  useEffect(() => {
    // Gate onboarding on authenticated actor readiness
    if (!identity || !actor || actorFetching) {
      return;
    }

    const principalId = identity.getPrincipal().toString();

    // Only attempt onboarding once per principal per session
    if (hasAttemptedOnboarding.current.has(principalId)) {
      return;
    }

    hasAttemptedOnboarding.current.add(principalId);

    // Trigger onboarding for this principal
    onboardingMutation.mutate(undefined, {
      onError: (error) => {
        const errorMessage = normalizeBackendError(error);

        // Handle initialization errors with a user-safe, non-blocking UX
        if (isInitializationError(error)) {
          // Show a gentle notification that the system is initializing
          toast.info("System Initializing", {
            description:
              "Please wait a moment while the system completes setup.",
            duration: 3000,
          });
          // Remove from attempted set so it can retry on next mount
          hasAttemptedOnboarding.current.delete(principalId);
          return;
        }

        // Only show toast if it's not the "already exists" error
        if (!errorMessage.includes("already exists")) {
          toast.error("Onboarding Failed", {
            description: errorMessage,
            action: {
              label: "Reload",
              onClick: () => window.location.reload(),
            },
          });
        }
      },
    });
  }, [identity, actor, actorFetching, onboardingMutation]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage:
            "url(/assets/generated/booster-background.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <BalanceIndicator />
      {showAdminSidebar && <AdminWalletSidebar />}
      <div className={`relative z-10 ${showAdminSidebar ? "ml-[22rem]" : ""}`}>
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
