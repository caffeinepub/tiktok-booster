import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, AlertCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useGetAllUsers, useIsCallerAdmin } from '@/hooks/useQueries';
import { formatBalance } from '@/lib/format';
import { normalizeBackendError } from '@/lib/backendError';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: users, isLoading: usersLoading, error: usersError } = useGetAllUsers();
  const [copiedPrincipal, setCopiedPrincipal] = useState<string | null>(null);

  const handleCopyPrincipal = async (principal: string) => {
    try {
      await navigator.clipboard.writeText(principal);
      setCopiedPrincipal(principal);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setCopiedPrincipal(null), 2000);
    } catch (error) {
      toast.error('Failed to copy Principal ID');
    }
  };

  // Show loading state while checking admin status
  if (isAdminLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Button asChild variant="ghost" className="mb-8">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unauthorized. Admin access required.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

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

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">Users List</CardTitle>
                  <CardDescription className="text-base">
                    View all registered users and their balances
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : usersError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {normalizeBackendError(usersError)}
                  </AlertDescription>
                </Alert>
              ) : !users || users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">Principal ID</TableHead>
                        <TableHead className="text-right">Balance (PKR)</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(([principal, balance]) => {
                        const principalStr = principal.toString();
                        const isCopied = copiedPrincipal === principalStr;
                        
                        return (
                          <TableRow key={principalStr}>
                            <TableCell className="font-mono text-sm break-all">
                              {principalStr}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatBalance(balance)} PKR
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPrincipal(principalStr)}
                                className="h-8 w-8 p-0"
                              >
                                {isCopied ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
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
