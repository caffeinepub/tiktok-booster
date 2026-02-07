import { Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import BalanceIndicator from './BalanceIndicator';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useOnboarding } from '@/hooks/useQueries';
import { useEffect, useRef } from 'react';
import { normalizeBackendError } from '@/lib/backendError';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const onboardingMutation = useOnboarding();
  const hasAttemptedOnboarding = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!identity) {
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
        
        // Only show toast if it's not the "already exists" error
        if (!errorMessage.includes('already exists')) {
          toast.error('Onboarding Failed', {
            description: errorMessage,
          });
        }
      },
    });
  }, [identity, onboardingMutation]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/assets/generated/booster-background.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <BalanceIndicator />
      <div className="relative z-10">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
