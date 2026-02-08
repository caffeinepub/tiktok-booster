import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BarChart3, Wallet, AlertCircle, Users, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import { useGetAdminWalletBalance, useAdminTopUp } from '@/hooks/useQueries';
import { formatBalance } from '@/lib/format';
import { normalizeBackendError } from '@/lib/backendError';

export default function AdminPage() {
  const { data: adminBalance, isLoading: adminBalanceLoading, error: adminBalanceError } = useGetAdminWalletBalance();
  const topUpMutation = useAdminTopUp();
  
  const [topUpAmount, setTopUpAmount] = useState('');
  const [validationError, setValidationError] = useState('');

  // Show admin wallet section only if balance is not null (null = unauthorized/non-admin)
  const showAdminWallet = adminBalance !== null;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate amount
    const amount = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amount) || amount <= 0) {
      setValidationError('Please enter a valid amount greater than zero');
      return;
    }

    if (!Number.isInteger(amount)) {
      setValidationError('Amount must be a whole number');
      return;
    }

    try {
      await topUpMutation.mutateAsync(BigInt(amount));
      toast.success('Admin wallet topped up successfully!', {
        description: `Added ${amount} PKR to admin wallet`,
      });
      setTopUpAmount('');
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to top up admin wallet', {
        description: errorMessage,
      });
    }
  };

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

          {showAdminWallet ? (
            <>
              <Card className="border-2 mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-3xl">Admin Analytics</CardTitle>
                      <CardDescription className="text-base">
                        Overview of system statistics and wallet balance
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Admin Wallet Balance</p>
                    </div>
                    {adminBalanceLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : adminBalanceError ? (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {normalizeBackendError(adminBalanceError)}
                        </AlertDescription>
                      </Alert>
                    ) : adminBalance !== undefined && adminBalance !== null ? (
                      <p className="text-4xl font-bold text-primary">
                        {formatBalance(adminBalance)} <span className="text-2xl text-muted-foreground">PKR</span>
                      </p>
                    ) : (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Admin wallet balance unavailable
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Plus className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">Admin Wallet Top Up</CardTitle>
                      <CardDescription>
                        Add funds to the admin wallet to distribute to users
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTopUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topUpAmount">Amount (PKR)</Label>
                      <Input
                        id="topUpAmount"
                        type="number"
                        placeholder="Enter amount to add"
                        value={topUpAmount}
                        onChange={(e) => {
                          setTopUpAmount(e.target.value);
                          setValidationError('');
                        }}
                        disabled={topUpMutation.isPending}
                        min="1"
                        step="1"
                      />
                      {validationError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={topUpMutation.isPending || !topUpAmount}
                      className="w-full"
                    >
                      {topUpMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Top Up Admin Wallet
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">User Management</CardTitle>
                      <CardDescription>
                        View and manage all registered users
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      View All Users
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You do not have permission to access this page. Admin access required.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}
