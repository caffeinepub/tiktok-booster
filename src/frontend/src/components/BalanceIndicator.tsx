import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetBalance, useIsCallerAdmin, useGetAdminWalletBalance } from '@/hooks/useQueries';
import { formatBalance } from '@/lib/format';
import { Wallet, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export default function BalanceIndicator() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: adminWalletBalance, isLoading: adminWalletLoading } = useGetAdminWalletBalance();

  const isAuthenticated = !!identity;
  const displayBalance = isAuthenticated ? (balance || BigInt(0)) : BigInt(0);
  const showLoading = isAuthenticated && (isInitializing || balanceLoading);
  const showAdminWallet = isAuthenticated && isAdmin === true;
  const displayAdminBalance = adminWalletBalance || BigInt(0);

  return (
    <div className="fixed-safe-top-right z-50 flex flex-col gap-2 items-end">
      <Badge 
        variant="secondary" 
        className="min-h-[44px] min-w-[44px] px-4 py-3 text-base font-semibold shadow-xl backdrop-blur-md bg-background/98 border-2 border-primary/30 ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-200"
      >
        <Wallet className="w-5 h-5 mr-2.5 text-primary flex-shrink-0" />
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Balance</span>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-lg font-bold text-foreground">
              {showLoading ? '...' : formatBalance(displayBalance)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">PKR</span>
          </div>
          
          {showAdminWallet && (
            <>
              <div className="w-full h-px bg-border/50 my-1" />
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Wallet</span>
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-lg font-bold text-primary">
                  {adminWalletLoading || adminCheckLoading ? '...' : formatBalance(displayAdminBalance)}
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
    </div>
  );
}
