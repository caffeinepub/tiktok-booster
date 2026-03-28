import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetAccountSummary, useGetBalance } from "@/hooks/useQueries";
import { formatBalance } from "@/lib/format";
import {
  getAccountSummaryQueryKey,
  getAdminWalletBalanceQueryKey,
  getBalanceQueryKey,
} from "@/lib/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Crown,
  Loader2,
  LogIn,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useState } from "react";

export default function BalanceIndicator() {
  const { login, identity, loginStatus } = useInternetIdentity();
  const {
    data: balance,
    isLoading: balanceLoading,
    isError: balanceError,
    refetch: refetchBalance,
  } = useGetBalance();
  const { data: accountSummary, isLoading: summaryLoading } =
    useGetAccountSummary();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const principalString = identity?.getPrincipal().toString();

  // Determine admin status from account summary
  const isAdmin = accountSummary?.role === "admin";

  // For admin users, show adminWalletBalance; for regular users show their balance
  const displayBalance: bigint | undefined = isAdmin
    ? accountSummary?.adminWalletBalance
    : balance;

  // Loading state: admin waits for summary, user waits for balance
  const isBalanceLoading = isAdmin ? summaryLoading : balanceLoading;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
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
      await Promise.all([
        refetchBalance(),
        queryClient.refetchQueries({
          queryKey: getAdminWalletBalanceQueryKey(principalString),
        }),
        queryClient.refetchQueries({
          queryKey: getAccountSummaryQueryKey(principalString),
        }),
      ]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Not logged in - show login button
  if (!isAuthenticated) {
    return (
      <div className="fixed-safe-top-right z-50">
        <Card className="shadow-lg border-2">
          <CardContent className="p-3">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              size="sm"
              className="w-full"
              data-ocid="auth.login.button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in - show balance
  return (
    <div className="fixed-safe-top-right z-50">
      <Card className="shadow-lg border-2">
        <CardContent className="p-3 space-y-2">
          {/* Admin Badge */}
          {isAdmin && !summaryLoading && (
            <div className="flex items-center justify-center pb-2 border-b">
              <Badge variant="default" className="gap-1 bg-primary/90">
                <Crown className="w-3 h-3" />
                You are an Admin
              </Badge>
            </div>
          )}

          {/* Balance */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Balance:</span>
            </div>
            <div className="flex items-center gap-2">
              {isBalanceLoading ? (
                <Loader2
                  className="w-4 h-4 animate-spin text-muted-foreground"
                  data-ocid="balance.loading_state"
                />
              ) : balanceError && !isAdmin ? (
                <div
                  className="flex items-center gap-1"
                  data-ocid="balance.error_state"
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    data-ocid="balance.secondary_button"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              ) : (
                <span className="font-bold text-primary">
                  {formatBalance(displayBalance ?? BigInt(0))}
                </span>
              )}
              {/* Refresh button always available */}
              {!isBalanceLoading && (
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  data-ocid="balance.secondary_button"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
