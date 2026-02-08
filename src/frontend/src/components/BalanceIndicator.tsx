import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetBalance } from '@/hooks/useQueries';
import { useAdminWalletStatus } from '@/hooks/useAdminWalletStatus';
import { formatBalance } from '@/lib/format';
import { normalizeBackendError } from '@/lib/backendError';
import { Wallet, ShieldCheck, LogIn, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useState } from 'react';

export default function BalanceIndicator() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useGetBalance();
  const adminWalletState = useAdminWalletStatus();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = !!identity;
  const displayBalance = isAuthenticated ? (balance !== undefined ? balance : BigInt(0)) : BigInt(0);
  const showLoading = isAuthenticated && (isInitializing || balanceLoading);
  
  // Show admin wallet section only when status is 'success'
  const showAdminWallet = adminWalletState.status === 'success';
  
  // Show zero balance helper when authenticated and balance is 0 (and not loading)
  const showZeroBalanceHelper = isAuthenticated && !showLoading && displayBalance === BigInt(0);
  
  // Show sign-in prompt when not authenticated
  const showSignInPrompt = !isAuthenticated;

  const handleRefresh = async () => {
    if (!isAuthenticated || isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Refetch user balance
      await refetchBalance();

      toast.success('Balance refreshed');
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to refresh balance', {
        description: errorMessage,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed-safe-top-right z-50 flex flex-col gap-2 items-end">
      <Badge 
        variant="secondary" 
        className="min-h-[44px] min-w-[44px] px-4 py-3 text-base font-semibold shadow-xl backdrop-blur-md bg-background/98 border-2 border-primary/30 ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-200"
      >
        <Wallet className="w-5 h-5 mr-2.5 text-primary flex-shrink-0" />
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Balance</span>
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-lg font-bold text-foreground">
              {showLoading ? '...' : formatBalance(displayBalance)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">PKR</span>
          </div>
          
          {/* Zero balance helper for authenticated users */}
          {showZeroBalanceHelper && (
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
              Balances are funded by the admin wallet. Contact an admin to receive funds via "Distribute Funds to User".
            </p>
          )}
          
          {/* Sign-in prompt for unauthenticated users */}
          {showSignInPrompt && (
            <div className="mt-2 flex flex-col gap-2 items-start">
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Sign in to view your balance
              </p>
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <Link to="/profile">
                  <LogIn className="w-3 h-3 mr-1.5" />
                  Sign In
                </Link>
              </Button>
            </div>
          )}
          
          {showAdminWallet && (
            <>
              <div className="w-full h-px bg-border/50 my-1" />
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Wallet</span>
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-lg font-bold text-primary">
                  {formatBalance(adminWalletState.balance)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">PKR</span>
              </div>
            </>
          )}
        </div>
      </Badge>
      
      {isAuthenticated && (
        <Button 
          asChild
          variant="default"
          size="default"
          className="min-h-[44px] px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Link to="/dashboard">
            Wallet
          </Link>
        </Button>
      )}
      
      <Button 
        asChild
        size="default"
        className="min-h-[44px] px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-[#25D366] hover:bg-[#20BA5A] text-white border-0"
      >
        <a 
          href="https://wa.me/923481641187" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Community / Add Funds
        </a>
      </Button>
    </div>
  );
}
