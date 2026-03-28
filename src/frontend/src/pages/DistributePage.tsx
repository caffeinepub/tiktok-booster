import AppHeader from "@/components/AppHeader";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useDistributeFunds,
  useGetAccountSummary,
  useGetAdminWalletBalance,
  useGetAllUsers,
} from "@/hooks/useQueries";
import { normalizeBackendError } from "@/lib/backendError";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { formatBalance } from "@/lib/format";
import {
  getAccountSummaryQueryKey,
  getAdminWalletBalanceQueryKey,
} from "@/lib/queryKeys";
import { Principal } from "@dfinity/principal";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Send,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DistributePage() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: accountSummary, isLoading: summaryLoading } =
    useGetAccountSummary();
  const { data: adminWalletBalance, isLoading: walletLoading } =
    useGetAdminWalletBalance();
  const { data: allUsers, isLoading: usersLoading } = useGetAllUsers();
  const distributeMutation = useDistributeFunds();

  const [principalInput, setPrincipalInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const principalString = identity?.getPrincipal().toString();
  const isAdmin = accountSummary?.role === "admin";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: getAdminWalletBalanceQueryKey(principalString),
        }),
        queryClient.refetchQueries({
          queryKey: getAccountSummaryQueryKey(principalString),
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyId = async (id: string) => {
    const success = await copyToClipboard(id);
    if (success) {
      setCopiedId(id);
      setPrincipalInput(id);
      toast.success("Principal ID copied and filled!");
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!principalInput.trim()) {
      setValidationError("Please enter a Principal ID");
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(principalInput.trim());
    } catch {
      setValidationError("Invalid Principal ID format");
      return;
    }

    const amount = Number.parseFloat(amountInput);
    if (!amountInput || Number.isNaN(amount) || amount <= 0) {
      setValidationError("Please enter a valid amount greater than zero");
      return;
    }
    if (!Number.isInteger(amount)) {
      setValidationError("Amount must be a whole number");
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
      setPrincipalInput("");
      setAmountInput("");
    } catch (error) {
      toast.error("Failed to distribute funds", {
        description: normalizeBackendError(error),
      });
    }
  };

  if (summaryLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="container mx-auto px-4 py-12 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-2" />
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="container mx-auto px-4 py-12 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-2" />
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                This page is restricted to admins only.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost">
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Panel
              </Link>
            </Button>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              👑 Admin
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-bold">Distribute Balance</h1>
            <p className="text-muted-foreground mt-1">
              Send PKR from admin wallet to users
            </p>
          </div>

          {/* Admin Wallet Balance Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-lg">Admin Wallet</CardTitle>
                  <CardDescription>Available for distribution</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                data-ocid="distribute.secondary_button"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton
                  className="h-10 w-40"
                  data-ocid="distribute.loading_state"
                />
              ) : (
                <div className="text-4xl font-bold text-primary">
                  {adminWalletBalance !== null &&
                  adminWalletBalance !== undefined
                    ? formatBalance(adminWalletBalance)
                    : "PKR 10,000"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribute Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Funds to User
              </CardTitle>
              <CardDescription>
                Enter the user's Principal ID and amount to transfer PKR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDistribute} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dist-principal">User Principal ID</Label>
                  <Input
                    id="dist-principal"
                    placeholder="e.g. aaaaa-aa or full principal ID"
                    value={principalInput}
                    onChange={(e) => setPrincipalInput(e.target.value)}
                    disabled={distributeMutation.isPending}
                    data-ocid="distribute.input"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dist-amount">Amount (PKR)</Label>
                  <Input
                    id="dist-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    disabled={distributeMutation.isPending}
                    data-ocid="distribute.input"
                  />
                </div>
                {validationError && (
                  <p
                    className="text-sm text-destructive"
                    data-ocid="distribute.error_state"
                  >
                    {validationError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={distributeMutation.isPending}
                  data-ocid="distribute.submit_button"
                >
                  {distributeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Funds
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Click "Copy ID" to fill the Principal ID field above
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2" data-ocid="distribute.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !allUsers || allUsers.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="distribute.empty_state"
                >
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="distribute.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Principal ID</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map(([principal, balance], idx) => {
                        const id = principal.toString();
                        return (
                          <TableRow
                            key={id}
                            data-ocid={`distribute.item.${idx + 1}`}
                          >
                            <TableCell className="text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-mono text-xs max-w-[200px] truncate">
                              {id}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatBalance(balance)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyId(id)}
                                data-ocid={`distribute.secondary_button.${idx + 1}`}
                              >
                                {copiedId === id ? (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy ID
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
