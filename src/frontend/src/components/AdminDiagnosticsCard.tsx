import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useAdminWalletStatus } from '@/hooks/useAdminWalletStatus';
import { formatBalance } from '@/lib/format';
import { normalizeBackendError } from '@/lib/backendError';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Wallet, Loader2, XCircle, AlertCircle } from 'lucide-react';

export default function AdminDiagnosticsCard() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const adminWalletState = useAdminWalletStatus();

  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Admin Diagnostics
        </CardTitle>
        <CardDescription className="text-xs">
          Internal admin status checks for debugging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* isCallerAdmin Check */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">isCallerAdmin():</span>
          {adminCheckLoading ? (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Loading...
            </Badge>
          ) : (
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? 'true' : 'false'}
            </Badge>
          )}
        </div>

        {/* Admin Wallet Balance Status */}
        <div className="flex items-start justify-between text-sm">
          <span className="text-muted-foreground">Admin Wallet Status:</span>
          <div className="flex flex-col items-end gap-1">
            {adminWalletState.status === 'loading' && (
              <Badge variant="secondary">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading
              </Badge>
            )}
            {adminWalletState.status === 'not-logged-in' && (
              <Badge variant="secondary">
                Not Logged In
              </Badge>
            )}
            {adminWalletState.status === 'unauthorized' && (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                Unauthorized
              </Badge>
            )}
            {adminWalletState.status === 'error' && (
              <div className="flex flex-col items-end gap-1">
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
                <span className="text-xs text-destructive max-w-[200px] text-right">
                  {normalizeBackendError(adminWalletState.message)}
                </span>
              </div>
            )}
            {adminWalletState.status === 'success' && (
              <div className="flex flex-col items-end gap-1">
                <Badge variant="default">
                  <Wallet className="w-3 h-3 mr-1" />
                  Success
                </Badge>
                <span className="text-xs font-semibold">
                  {formatBalance(adminWalletState.balance)} PKR
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <p>
            This card shows internal admin checks. If "Admin Wallet Status" shows "Success" with a balance,
            you are recognized as an admin. If it shows "Unauthorized", you do not have admin permissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
