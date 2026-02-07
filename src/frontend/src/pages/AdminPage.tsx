import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BarChart3, Wallet, AlertCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useGetAdminWalletBalance } from '@/hooks/useQueries';
import { formatBalance } from '@/lib/format';
import { normalizeBackendError } from '@/lib/backendError';

export default function AdminPage() {
  const { data: adminBalance, isLoading: adminBalanceLoading, error: adminBalanceError } = useGetAdminWalletBalance();

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
                ) : adminBalance !== undefined ? (
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

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">System Information</CardTitle>
              <CardDescription>
                Admin dashboard for managing the TikTok Booster system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Use the dashboard to distribute funds to users and manage the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
