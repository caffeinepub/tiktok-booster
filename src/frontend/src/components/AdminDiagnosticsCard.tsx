import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminWalletStatus } from "@/hooks/useAdminWalletStatus";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetAccountSummary, useIsCallerAdmin } from "@/hooks/useQueries";
import { normalizeBackendError } from "@/lib/backendError";
import { formatBalance } from "@/lib/format";
import { hasAdminTokenInSession, hasAdminTokenInUrl } from "@/utils/urlParams";
import {
  AlertCircle,
  Clock,
  Key,
  Loader2,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

export default function AdminDiagnosticsCard() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: accountSummary, isLoading: summaryLoading } =
    useGetAccountSummary();
  const adminWalletState = useAdminWalletStatus();
  const { identity } = useInternetIdentity();

  const isLoggedIn = !!identity;
  const hasTokenInUrl = hasAdminTokenInUrl();
  const hasTokenInSession = hasAdminTokenInSession();

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
        {/* Account Summary */}
        <div className="flex items-start justify-between text-sm gap-2">
          <span className="text-muted-foreground flex-shrink-0">
            Account Summary:
          </span>
          <div className="flex flex-col items-end gap-1 min-w-0">
            {summaryLoading ? (
              <Badge variant="secondary">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            ) : accountSummary ? (
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={
                    accountSummary.role === "admin" ? "default" : "secondary"
                  }
                >
                  <User className="w-3 h-3 mr-1" />
                  {accountSummary.role}
                </Badge>
                <span className="text-xs">
                  User Balance: {formatBalance(accountSummary.userBalance)} PKR
                </span>
                {accountSummary.role === "admin" &&
                  accountSummary.adminWalletBalance > BigInt(0) && (
                    <span className="text-xs font-semibold">
                      Admin Wallet:{" "}
                      {formatBalance(accountSummary.adminWalletBalance)} PKR
                    </span>
                  )}
              </div>
            ) : (
              <Badge variant="secondary">Not Available</Badge>
            )}
          </div>
        </div>

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
              {isAdmin ? "true" : "false"}
            </Badge>
          )}
        </div>

        {/* Admin Wallet Balance Status */}
        <div className="flex items-start justify-between text-sm gap-2">
          <span className="text-muted-foreground flex-shrink-0">
            Admin Wallet Status:
          </span>
          <div className="flex flex-col items-end gap-1 min-w-0">
            {adminWalletState.status === "loading" && (
              <Badge variant="secondary">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading
              </Badge>
            )}
            {adminWalletState.status === "initializing" && (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Initializing
              </Badge>
            )}
            {adminWalletState.status === "not-logged-in" && (
              <Badge variant="secondary">Not Logged In</Badge>
            )}
            {adminWalletState.status === "unauthorized" && (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                Unauthorized
              </Badge>
            )}
            {adminWalletState.status === "error" && (
              <div className="flex flex-col items-end gap-1 min-w-0 max-w-full">
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
                <span className="text-xs text-destructive text-right break-words overflow-hidden max-h-20 line-clamp-3">
                  {normalizeBackendError(adminWalletState.message)}
                </span>
              </div>
            )}
            {adminWalletState.status === "success" && (
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

        {/* Admin Token Status */}
        <div className="flex items-start justify-between text-sm gap-2">
          <span className="text-muted-foreground flex-shrink-0">
            Admin Token:
          </span>
          <div className="flex flex-col items-end gap-1">
            {hasTokenInUrl ? (
              <Badge variant="default">
                <Key className="w-3 h-3 mr-1" />
                In URL
              </Badge>
            ) : hasTokenInSession ? (
              <Badge variant="default">
                <Key className="w-3 h-3 mr-1" />
                In Session
              </Badge>
            ) : (
              <Badge variant="secondary">Not Found</Badge>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="pt-2 border-t text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Success with balance:</strong> You are recognized as an
            admin and can access admin features.
          </p>
          <p>
            <strong>Initializing:</strong> The authorization system is starting
            up. Please wait a moment.
          </p>
          <p>
            <strong>Unauthorized:</strong>{" "}
            {isLoggedIn
              ? "You are logged in but not an admin."
              : "You need to log in."}
            {!hasTokenInUrl &&
              !hasTokenInSession &&
              isLoggedIn &&
              " The admin token parameter is missing from the URL."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
