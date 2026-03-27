import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminWalletStatus } from "@/hooks/useAdminWalletStatus";
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
  const adminWalletStatus = useAdminWalletStatus();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const principalString = identity?.getPrincipal().toString();

  // Determine admin status from account summary
  const isAdmin = accountSummary?.role === "admin";

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

  // Logged in - show balance(s)
  return (
    <div className="fixed-safe-top-right z-50">
      <Card className="shadow-lg border-2">
        <CardContent className="p-3 space-y-2">
          {/* Admin Badge - shown when admin status is confirmed */}
          {isAdmin && !summaryLoading && (
            <div className="flex items-center justify-center pb-2 border-b">
              <Badge variant="default" className="gap-1 bg-primary/90">
                <Crown className="w-3 h-3" />
                You are an Admin
              </Badge>
            </div>
          )}

          {/* User Balance */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Balance:</span>
            </div>
            <div className="flex items-center gap-2">
              {balanceLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : balanceError ? (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              ) : (
                <span className="font-bold text-primary">
                  {formatBalance(balance || BigInt(0))}
                </span>
              )}
            </div>
          </div>

          {/* Admin Wallet Balance - only show when admin status is confirmed */}
          {isAdmin && adminWalletStatus.status === "success" && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground">
                Admin Wallet:
              </span>
              <span className="text-xs font-bold text-primary">
                {formatBalance(adminWalletStatus.balance)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
