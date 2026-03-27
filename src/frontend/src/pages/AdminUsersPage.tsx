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
import { useGetAllUsers, useIsCallerAdmin } from "@/hooks/useQueries";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { formatBalance } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useGetAllUsers();
  const [copiedPrincipal, setCopiedPrincipal] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  const handleCopyPrincipal = async (principal: string) => {
    const success = await copyToClipboard(principal);
    if (success) {
      setCopiedPrincipal(principal);
      toast.success("Principal ID copied to clipboard");
      setTimeout(() => setCopiedPrincipal(null), 2000);
    } else {
      toast.error("Failed to copy Principal ID");
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button asChild variant="ghost">
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>

          {!isAuthenticated && (
            <Alert>
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Login Required
              </AlertTitle>
              <AlertDescription className="mt-2">
                You need to log in to view this page.
              </AlertDescription>
            </Alert>
          )}

          {isAuthenticated && isAdminLoading && (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          )}

          {isAuthenticated && !isAdminLoading && !isAdmin && (
            <Alert variant="destructive">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Access Denied
              </AlertTitle>
              <AlertDescription className="mt-2">
                You do not have permission to view this page. Admin access is
                required.
              </AlertDescription>
            </Alert>
          )}

          {isAuthenticated && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <Users className="w-8 h-8" />
                  All Users
                </CardTitle>
                <CardDescription className="text-base">
                  View all registered users and their balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading && (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}

                {usersError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load users. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                {!usersLoading &&
                  !usersError &&
                  users &&
                  users.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No users found in the system.
                      </AlertDescription>
                    </Alert>
                  )}

                {!usersLoading && !usersError && users && users.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60%]">
                            Principal ID
                          </TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(([principal, balance]) => {
                          const principalString = principal.toString();
                          const isCopied = copiedPrincipal === principalString;

                          return (
                            <TableRow key={principalString}>
                              <TableCell className="font-mono text-sm">
                                {principalString}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatBalance(balance)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() =>
                                    handleCopyPrincipal(principalString)
                                  }
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  {isCopied ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
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
          )}
        </div>
      </main>
    </div>
  );
}
