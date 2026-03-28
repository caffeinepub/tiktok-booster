import AppHeader from "@/components/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminWalletStatus } from "@/hooks/useAdminWalletStatus";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAdminTopUp,
  useDistributeFunds,
  useGetUserBalance,
} from "@/hooks/useQueries";
import { normalizeBackendError } from "@/lib/backendError";
import { formatBalance } from "@/lib/format";
import {
  getActorQueryKey,
  getAdminWalletBalanceQueryKey,
} from "@/lib/queryKeys";
import { hasAdminTokenInSession, hasAdminTokenInUrl } from "@/utils/urlParams";
import { Principal } from "@dfinity/principal";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Key,
  Loader2,
  LogIn,
  Plus,
  RefreshCw,
  RotateCw,
  Send,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const LONG_LOADING_THRESHOLD = 5000; // 5 seconds

export default function AdminPage() {
  const adminWalletStatus = useAdminWalletStatus();
  const { identity } = useInternetIdentity();
  const topUpMutation = useAdminTopUp();
  const distributeMutation = useDistributeFunds();
  const queryClient = useQueryClient();

  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpValidationError, setTopUpValidationError] = useState("");

  const [distributePrincipal, setDistributePrincipal] = useState("");
  const [distributeAmount, setDistributeAmount] = useState("");
  const [distributeValidationError, setDistributeValidationError] =
    useState("");

  const [showLongLoadingHint, setShowLongLoadingHint] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const principalString = identity?.getPrincipal().toString();

  // Parse the distribute principal for user balance lookup
  let distributePrincipalParsed: Principal | null = null;
  try {
    if (distributePrincipal.trim()) {
      distributePrincipalParsed = Principal.fromText(
        distributePrincipal.trim(),
      );
    }
  } catch {
    // Invalid principal, will be caught in validation
  }

  // Fetch the user's current balance when a valid principal is entered
  const { data: recipientBalance, isLoading: recipientBalanceLoading } =
    useGetUserBalance(distributePrincipalParsed);

  // Track long loading state
  useEffect(() => {
    if (adminWalletStatus.status === "loading") {
      const timer = setTimeout(() => {
        setShowLongLoadingHint(true);
      }, LONG_LOADING_THRESHOLD);

      return () => {
        clearTimeout(timer);
        setShowLongLoadingHint(false);
      };
    }
    setShowLongLoadingHint(false);
  }, [adminWalletStatus.status]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setShowLongLoadingHint(false);

    try {
      // Invalidate and refetch all relevant queries with correct per-identity keys
      await queryClient.invalidateQueries({
        queryKey: getActorQueryKey(principalString),
      });
      await queryClient.invalidateQueries({
        queryKey: getAdminWalletBalanceQueryKey(principalString),
      });
      await queryClient.refetchQueries({
        queryKey: getActorQueryKey(principalString),
      });
      await queryClient.refetchQueries({
        queryKey: getAdminWalletBalanceQueryKey(principalString),
      });
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleHardReload = () => {
    window.location.reload();
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpValidationError("");

    // Validate amount
    const amount = Number.parseFloat(topUpAmount);
    if (!topUpAmount || Number.isNaN(amount) || amount <= 0) {
      setTopUpValidationError("Please enter a valid amount greater than zero");
      return;
    }

    if (!Number.isInteger(amount)) {
      setTopUpValidationError("Amount must be a whole number");
      return;
    }

    try {
      await topUpMutation.mutateAsync(BigInt(amount));
      toast.success("Admin wallet topped up successfully!", {
        description: `Added ${amount} PKR to admin wallet`,
      });
      setTopUpAmount("");
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error("Failed to top up admin wallet", {
        description: errorMessage,
      });
    }
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setDistributeValidationError("");

    // Validate principal
    if (!distributePrincipal.trim()) {
      setDistributeValidationError("Please enter a Principal ID");
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(distributePrincipal.trim());
    } catch (_error) {
      setDistributeValidationError("Invalid Principal ID format");
      return;
    }

    // Validate amount
    const amount = Number.parseFloat(distributeAmount);
    if (!distributeAmount || Number.isNaN(amount) || amount <= 0) {
      setDistributeValidationError(
        "Please enter a valid amount greater than zero",
      );
      return;
    }

    if (!Number.isInteger(amount)) {
      setDistributeValidationError("Amount must be a whole number");
      return;
    }

    try {
      await distributeMutation.mutateAsync({
        toUser: principal,
        amount: BigInt(amount),
      });
      toast.success("Funds distributed successfully!", {
        description: `Sent ${amount} PKR to user`,
      });
      setDistributePrincipal("");
      setDistributeAmount("");
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error("Failed to distribute funds", {
        description: errorMessage,
      });
    }
  };

  // Determine unauthorized reason for better messaging
  const isLoggedIn = !!identity;
  const hasTokenInUrl = hasAdminTokenInUrl();
  const hasTokenInSession = hasAdminTokenInSession();
  const _isAdminSuccess = adminWalletStatus.status === "success";

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {adminWalletStatus.status === "not-logged-in" && (
            <Alert>
              <LogIn className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Login Required
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">
                  You need to log in with Internet Identity to access the admin
                  panel.
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the "Login" button in the header to authenticate with
                  your Internet Identity.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {adminWalletStatus.status === "loading" && (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <div>
                    <CardTitle className="text-3xl">
                      Loading Admin Panel...
                    </CardTitle>
                    <CardDescription className="text-base">
                      Verifying admin access
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-32" />

                  {showLongLoadingHint && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <span className="text-sm">
                            This is taking longer than expected. You can try
                            refreshing the connection.
                          </span>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={handleRetry}
                              disabled={isRetrying}
                              variant="outline"
                              size="sm"
                            >
                              {isRetrying ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Retrying...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Retry
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={handleHardReload}
                              variant="outline"
                              size="sm"
                            >
                              <RotateCw className="w-4 h-4 mr-2" />
                              Reload Page
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {adminWalletStatus.status === "unauthorized" && (
            <Alert variant="destructive">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Access Denied
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                {isLoggedIn ? (
                  <>
                    <p>
                      You are logged in, but your account does not have admin
                      permissions.
                    </p>
                    {!hasTokenInUrl && !hasTokenInSession ? (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-3">
                        <div className="flex items-start gap-2">
                          <Key className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium mb-1">
                              Missing Admin Token
                            </p>
                            <p className="text-muted-foreground">
                              Admin access requires the{" "}
                              <code className="bg-background/50 px-1 py-0.5 rounded text-xs">
                                caffeineAdminToken
                              </code>{" "}
                              parameter in the URL. Please use the admin link
                              that includes this token.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Contact a system administrator to grant admin
                        permissions to your account.
                      </p>
                    )}
                  </>
                ) : (
                  <p>Please log in to access the admin panel.</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {adminWalletStatus.status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Error Loading Admin Panel
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">{adminWalletStatus.message}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    variant="outline"
                    size="sm"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleHardReload}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {adminWalletStatus.status === "success" && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Admin Wallet Balance
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatBalance(adminWalletStatus.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available for distribution
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Quick Actions
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button asChild className="w-full" variant="default">
                        <Link to="/admin/distribute">
                          <Send className="w-4 h-4 mr-2" />
                          Distribute Balance
                        </Link>
                      </Button>
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/admin/users">
                          <Users className="w-4 h-4 mr-2" />
                          View All Users
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Up Admin Wallet */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Top Up Admin Wallet
                    </CardTitle>
                    <CardDescription>
                      Add funds to the admin wallet for distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTopUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="topUpAmount">Amount (PKR)</Label>
                        <Input
                          id="topUpAmount"
                          type="number"
                          placeholder="Enter amount"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          disabled={topUpMutation.isPending}
                        />
                        {topUpValidationError && (
                          <p className="text-sm text-destructive">
                            {topUpValidationError}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={topUpMutation.isPending}
                      >
                        {topUpMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Top Up Wallet
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Distribute Funds */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Distribute Funds to User
                    </CardTitle>
                    <CardDescription>
                      Send funds from admin wallet to a user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDistribute} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="distributePrincipal">
                          User Principal ID
                        </Label>
                        <Input
                          id="distributePrincipal"
                          type="text"
                          placeholder="Enter Principal ID"
                          value={distributePrincipal}
                          onChange={(e) =>
                            setDistributePrincipal(e.target.value)
                          }
                          disabled={distributeMutation.isPending}
                        />
                        {distributePrincipalParsed &&
                          recipientBalance !== undefined && (
                            <p className="text-sm text-muted-foreground">
                              Current balance: {formatBalance(recipientBalance)}
                            </p>
                          )}
                        {distributePrincipalParsed &&
                          recipientBalanceLoading && (
                            <p className="text-sm text-muted-foreground">
                              Loading balance...
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="distributeAmount">Amount (PKR)</Label>
                        <Input
                          id="distributeAmount"
                          type="number"
                          placeholder="Enter amount"
                          value={distributeAmount}
                          onChange={(e) => setDistributeAmount(e.target.value)}
                          disabled={distributeMutation.isPending}
                        />
                        {distributeValidationError && (
                          <p className="text-sm text-destructive">
                            {distributeValidationError}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={distributeMutation.isPending}
                      >
                        {distributeMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Distribute Funds
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
