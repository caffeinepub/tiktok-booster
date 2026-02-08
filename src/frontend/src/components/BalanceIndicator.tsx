import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useGetBalance } from '@/hooks/useQueries';
import { useAdminWalletStatus } from '@/hooks/useAdminWalletStatus';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { formatBalance } from '@/lib/format';
import { getBalanceQueryKey, getAdminWalletBalanceQueryKey } from '@/lib/queryKeys';
import { normalizeBackendError } from '@/lib/backendError';

export default function BalanceIndicator() {
  const { identity } = useInternetIdentity();
  const { data: balance, isLoading, isError, error, refetch } = useGetBalance();
  const adminWalletStatus = useAdminWalletStatus();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const principalString = identity?.getPrincipal().toString();
  const isAuthenticated = !!identity;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refetch user balance
      await refetch();
      
      // If admin, also refetch admin wallet balance
      if (adminWalletStatus.status === 'success') {
        await queryClient.refetchQueries({ 
          queryKey: getAdminWalletBalanceQueryKey(principalString) 
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="fixed-safe-top-right z-50">
        <Link to="/login">
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2 shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Log In</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed-safe-top-right z-50 flex flex-col gap-2 items-end">
      {/* User Balance */}
      <div className="bg-background/95 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isError ? (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Error</span>
            </div>
          ) : (
            formatBalance(balance || BigInt(0))
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title={isError ? 'Retry loading balance' : 'Refresh balance'}
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Error message tooltip */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 shadow-lg max-w-xs">
          <p className="text-xs text-destructive font-medium">
            {normalizeBackendError(error)}
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-destructive underline mt-1"
            onClick={handleRefresh}
          >
            Try again
          </Button>
        </div>
      )}

      {/* Admin Wallet Balance - Only show when admin access is confirmed */}
      {adminWalletStatus.status === 'success' && (
        <Badge variant="default" className="px-3 py-1.5 shadow-lg">
          <span className="text-xs font-medium">
            Admin: {formatBalance(adminWalletStatus.balance)}
          </span>
        </Badge>
      )}
    </div>
  );
}
