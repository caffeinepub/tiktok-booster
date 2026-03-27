import AppHeader from "@/components/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { useDistributeFunds, useGetBalance } from "@/hooks/useQueries";
import { normalizeBackendError } from "@/lib/backendError";
import { formatBalance } from "@/lib/format";
import { Principal } from "@dfinity/principal";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  LogIn,
  Package,
  Send,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userBalance, isLoading: balanceLoading } = useGetBalance();
  const adminWalletStatus = useAdminWalletStatus();
  const distributeMutation = useDistributeFunds();

  const [distributePrincipal, setDistributePrincipal] = useState("");
  const [distributeAmount, setDistributeAmount] = useState("");
  const [distributeValidationError, setDistributeValidationError] =
    useState("");

  const isAuthenticated = !!identity;
  const isAdminSuccess = adminWalletStatus.status === "success";

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

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your account and view your balance
              </p>
            </div>

            {/* User Balance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Your Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatBalance(userBalance || BigInt(0))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Available for orders
                </p>
              </CardContent>
            </Card>

            {/* Admin Wallet Status Card */}
            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Admin Wallet Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adminWalletStatus.status === "loading" && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Checking admin access...
                      </span>
                    </div>
                  )}

                  {adminWalletStatus.status === "not-logged-in" && (
                    <Alert>
                      <LogIn className="h-4 w-4" />
                      <AlertDescription>
                        Please log in to view admin wallet status
                      </AlertDescription>
                    </Alert>
                  )}

                  {adminWalletStatus.status === "unauthorized" && (
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertDescription>
                        You do not have admin permissions
                      </AlertDescription>
                    </Alert>
                  )}

                  {adminWalletStatus.status === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {adminWalletStatus.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {adminWalletStatus.status === "success" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Admin Wallet Balance:
                        </span>
                        <Badge
                          variant="default"
                          className="text-base px-3 py-1"
                        >
                          {formatBalance(adminWalletStatus.balance)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You have admin access to manage funds
                      </p>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/admin">View Admin Panel</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Distribute Funds Section - Always visible but conditionally enabled */}
            <Card className={!isAdminSuccess ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Distribute Funds to User
                </CardTitle>
                <CardDescription>
                  {isAdminSuccess
                    ? "Send funds from admin wallet to a user"
                    : adminWalletStatus.status === "not-logged-in"
                      ? "Login required to distribute funds"
                      : adminWalletStatus.status === "unauthorized"
                        ? "Admin access required to distribute funds"
                        : adminWalletStatus.status === "loading"
                          ? "Checking admin permissions..."
                          : "Admin permissions required"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAdminSuccess &&
                  adminWalletStatus.status === "unauthorized" && (
                    <Alert className="mb-4">
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Admin Access Required</AlertTitle>
                      <AlertDescription>
                        This feature is only available to administrators.
                        Contact a system administrator to request admin
                        permissions.
                      </AlertDescription>
                    </Alert>
                  )}

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
                      onChange={(e) => setDistributePrincipal(e.target.value)}
                      disabled={!isAdminSuccess || distributeMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distributeAmount">Amount (PKR)</Label>
                    <Input
                      id="distributeAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={distributeAmount}
                      onChange={(e) => setDistributeAmount(e.target.value)}
                      disabled={!isAdminSuccess || distributeMutation.isPending}
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
                    disabled={!isAdminSuccess || distributeMutation.isPending}
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
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    <Package className="w-4 h-4 mr-2" />
                    Place New Order
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">
                    <Wallet className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
