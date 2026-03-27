import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useDistributeFunds, useGetAccountSummary } from "@/hooks/useQueries";
import { normalizeBackendError } from "@/lib/backendError";
import { formatBalance } from "@/lib/format";
import {
  getAccountSummaryQueryKey,
  getAdminWalletBalanceQueryKey,
  getBalanceQueryKey,
} from "@/lib/queryKeys";
import { Principal } from "@dfinity/principal";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw, Send, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminWalletSidebar() {
  const { identity } = useInternetIdentity();
  const { data: accountSummary, isLoading: summaryLoading } =
    useGetAccountSummary();
  const distributeMutation = useDistributeFunds();
  const queryClient = useQueryClient();
  const principalString = identity?.getPrincipal().toString();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recipientPrincipal, setRecipientPrincipal] = useState("");
  const [amount, setAmount] = useState("");
  const [principalError, setPrincipalError] = useState("");
  const [amountError, setAmountError] = useState("");

  const isAdmin = accountSummary?.role === "admin";

  // Don't render if not admin
  if (!isAdmin || summaryLoading) {
    return null;
  }

  const adminWalletBalance = accountSummary?.adminWalletBalance || BigInt(0);
  const userBalance = accountSummary?.userBalance || BigInt(0);

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
      toast.success("Balances refreshed");
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh balances");
    } finally {
      setIsRefreshing(false);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setPrincipalError("");
    setAmountError("");

    // Validate Principal ID
    if (!recipientPrincipal.trim()) {
      setPrincipalError("Principal ID is required");
      isValid = false;
    } else {
      try {
        Principal.fromText(recipientPrincipal.trim());
      } catch {
        setPrincipalError("Invalid Principal ID format");
        isValid = false;
      }
    }

    // Validate Amount
    if (!amount.trim()) {
      setAmountError("Amount is required");
      isValid = false;
    } else {
      const amountNum = Number.parseInt(amount, 10);
      if (
        Number.isNaN(amountNum) ||
        amountNum <= 0 ||
        !Number.isInteger(amountNum)
      ) {
        setAmountError("Amount must be a positive integer");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleDistribute = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const principal = Principal.fromText(recipientPrincipal.trim());
      const amountBigInt = BigInt(Number.parseInt(amount, 10));

      await distributeMutation.mutateAsync({
        toUser: principal,
        amount: amountBigInt,
      });

      toast.success("Funds distributed successfully");

      // Clear form
      setRecipientPrincipal("");
      setAmount("");
      setPrincipalError("");
      setAmountError("");

      // Trigger refresh
      await handleRefresh();
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error("Distribution Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="fixed left-4 top-24 w-80 z-40 space-y-4">
      {/* Balance Display Card */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Admin Wallet
            </CardTitle>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Admin Wallet</p>
            <p className="text-2xl font-bold text-primary">
              {formatBalance(adminWalletBalance)} PKR
            </p>
          </div>
          <div className="pt-2 border-t space-y-1">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-xl font-semibold">
              {formatBalance(userBalance)} PKR
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Distribute Funds Card */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Distribute Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-principal">User Principal ID</Label>
            <Input
              id="recipient-principal"
              placeholder="Enter Principal ID"
              value={recipientPrincipal}
              onChange={(e) => {
                setRecipientPrincipal(e.target.value);
                setPrincipalError("");
              }}
              className={principalError ? "border-destructive" : ""}
            />
            {principalError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span>{principalError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PKR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountError("");
              }}
              className={amountError ? "border-destructive" : ""}
            />
            {amountError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span>{amountError}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleDistribute}
            disabled={distributeMutation.isPending}
            className="w-full"
          >
            {distributeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Distributing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Distribute Funds
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
