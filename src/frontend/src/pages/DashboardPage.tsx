import { useState, useRef } from 'react';
import { useDistributeFunds } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminWalletStatus } from '@/hooks/useAdminWalletStatus';
import { validateUrl } from '@/lib/validation';
import { formatPKR, formatBalance } from '@/lib/format';
import { copyToClipboard } from '@/lib/copyToClipboard';
import { normalizeBackendError } from '@/lib/backendError';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, User, FileText, FolderOpen, Copy, Check, Wallet, AlertCircle, XCircle, LogIn } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import AdminDiagnosticsCard from '@/components/AdminDiagnosticsCard';

interface LocalOrder {
  id: string;
  url: string;
  pkg: string;
  status: string;
  time: string;
}

const DASHBOARD_PACKAGES = [
  { id: 'Mini', name: 'Mini', price: 25 },
  { id: 'Starter', name: 'Starter', price: 50 },
  { id: 'Pro', name: 'Pro', price: 100 },
  { id: 'Premium', name: 'Premium', price: 200 },
  { id: 'Elite', name: 'Elite', price: 350 },
  { id: 'Ultimate', name: 'Ultimate', price: 600 },
];

const INVITE_URL = 'https://tik-tok-booster-1--tayyabrandhawa1.replit.app';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const adminWalletState = useAdminWalletStatus();
  const distributeFundsMutation = useDistributeFunds();
  const profileRef = useRef<HTMLDivElement>(null);

  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [allocatedBalance, setAllocatedBalance] = useState('');
  const [userPrincipal, setUserPrincipal] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('Starter');
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!identity;

  // Determine what to show in the admin wallet badge
  const renderAdminWalletBadge = () => {
    switch (adminWalletState.status) {
      case 'not-logged-in':
        return (
          <Badge variant="secondary" className="px-4 py-2 text-base font-semibold">
            <LogIn className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Admin Wallet</span>
              <span className="text-xs text-muted-foreground">Not logged in</span>
            </div>
          </Badge>
        );

      case 'loading':
        return (
          <Badge variant="secondary" className="px-4 py-2 text-base font-semibold">
            <Wallet className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Admin Wallet</span>
              <span className="text-sm">Loading...</span>
            </div>
          </Badge>
        );

      case 'unauthorized':
        return (
          <Badge variant="secondary" className="px-4 py-2 text-base font-semibold">
            <XCircle className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Admin Wallet</span>
              <span className="text-xs text-muted-foreground">Not recognized as admin</span>
            </div>
          </Badge>
        );

      case 'error':
        return (
          <Badge variant="destructive" className="px-4 py-2 text-base font-semibold">
            <AlertCircle className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs uppercase tracking-wide">Admin Wallet</span>
              <span className="text-xs">Error: {normalizeBackendError(adminWalletState.message)}</span>
            </div>
          </Badge>
        );

      case 'success':
        return (
          <Badge variant="secondary" className="px-4 py-2 text-base font-semibold">
            <Wallet className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Admin Wallet</span>
              <span className="text-lg font-bold text-primary">
                {formatBalance(adminWalletState.balance)} <span className="text-sm text-muted-foreground">PKR</span>
              </span>
            </div>
          </Badge>
        );
    }
  };

  // Render prominent admin wallet card at top of content
  const renderAdminWalletCard = () => {
    switch (adminWalletState.status) {
      case 'not-logged-in':
        return (
          <Alert className="border-2 border-muted">
            <LogIn className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base">Admin Wallet</span>
                <span className="text-sm text-muted-foreground">
                  You are not logged in. Please log in to view the admin wallet balance.
                </span>
              </div>
            </AlertDescription>
          </Alert>
        );

      case 'loading':
        return (
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Admin Wallet</h3>
                  <p className="text-sm text-muted-foreground">Loading balance...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'unauthorized':
        return (
          <Alert className="border-2 border-muted">
            <XCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base">Admin Wallet</span>
                <span className="text-sm text-muted-foreground">
                  You are not recognized as an admin. Only administrators can view the admin wallet balance.
                </span>
              </div>
            </AlertDescription>
          </Alert>
        );

      case 'error':
        return (
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base">Admin Wallet Error</span>
                <span className="text-sm">
                  Failed to load admin wallet balance: {normalizeBackendError(adminWalletState.message)}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        );

      case 'success':
        return (
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 text-foreground">Admin Wallet Balance</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                      {formatBalance(adminWalletState.balance)}
                    </span>
                    <span className="text-xl font-semibold text-muted-foreground">PKR</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const handleCopyInviteLink = async () => {
    const success = await copyToClipboard(INVITE_URL);
    
    if (success) {
      setCopied(true);
      toast.success('Invite link copied!', {
        description: 'Share this link to invite others',
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link', {
        description: 'Please try again or copy manually',
      });
    }
  };

  const scrollToProfile = () => {
    profileRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    profileRef.current?.focus();
  };

  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateUrl(tiktokUrl);
    if (!validation.valid) {
      toast.error('Invalid URL', {
        description: validation.error,
      });
      return;
    }

    const pkg = DASHBOARD_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;

    const newOrder: LocalOrder = {
      id: `#${(localOrders.length + 1).toString().padStart(6, '0')}`,
      url: tiktokUrl,
      pkg: pkg.name,
      status: 'Pending',
      time: new Date().toLocaleString(),
    };

    setLocalOrders([newOrder, ...localOrders]);
    setTiktokUrl('');
    
    toast.success('Order placed successfully!', {
      description: `${pkg.name} package for ${formatPKR(pkg.price)}`,
    });
  };

  const handleDistributeFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(allocatedBalance);
    if (!allocatedBalance || isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount greater than zero',
      });
      return;
    }

    if (!userPrincipal.trim()) {
      toast.error('Invalid Principal ID', {
        description: 'Please enter a valid Principal ID',
      });
      return;
    }

    try {
      const principal = Principal.fromText(userPrincipal.trim());
      
      await distributeFundsMutation.mutateAsync({
        toUser: principal,
        amount: BigInt(Math.floor(amount)),
      });

      toast.success('Funds distributed successfully!', {
        description: `${Math.floor(amount)} PKR sent to user`,
      });
      
      setAllocatedBalance('');
      setUserPrincipal('');
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to distribute funds', {
        description: errorMessage,
      });
    }
  };

  // Show admin-only sections only when admin wallet balance is successfully loaded
  const showAdminActions = adminWalletState.status === 'success';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Admin Wallet Badge */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your orders and account</p>
          </div>
          {renderAdminWalletBadge()}
        </div>

        {/* Admin Wallet Card - Prominent at top */}
        <div className="mb-8">
          {renderAdminWalletCard()}
        </div>

        {/* Admin Diagnostics Card */}
        {isAuthenticated && (
          <div className="mb-8">
            <AdminDiagnosticsCard />
          </div>
        )}

        {/* Invite URL Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Invite Link
            </CardTitle>
            <CardDescription>Share this link to invite others to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                value={INVITE_URL} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button 
                onClick={handleCopyInviteLink}
                variant={copied ? "secondary" : "default"}
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Order Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Order
            </CardTitle>
            <CardDescription>Place a new order quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickOrder} className="space-y-4">
              <div>
                <Label htmlFor="tiktok-url">TikTok Video URL</Label>
                <Input
                  id="tiktok-url"
                  type="url"
                  placeholder="https://www.tiktok.com/@username/video/..."
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="package-select">Select Package</Label>
                <select
                  id="package-select"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DASHBOARD_PACKAGES.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatPKR(pkg.price)}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                Place Order
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin-only: Distribute Funds Section */}
        {showAdminActions && (
          <Card className="mb-8 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Distribute Funds to User
              </CardTitle>
              <CardDescription>Transfer funds from admin wallet to a user's balance</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDistributeFunds} className="space-y-4">
                <div>
                  <Label htmlFor="user-principal">User Principal ID</Label>
                  <Input
                    id="user-principal"
                    type="text"
                    placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                    value={userPrincipal}
                    onChange={(e) => setUserPrincipal(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="allocated-balance">Amount (PKR)</Label>
                  <Input
                    id="allocated-balance"
                    type="number"
                    placeholder="100"
                    value={allocatedBalance}
                    onChange={(e) => setAllocatedBalance(e.target.value)}
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={distributeFundsMutation.isPending}
                >
                  {distributeFundsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Distributing...
                    </>
                  ) : (
                    'Distribute Funds'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Your latest order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {localOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders yet. Place your first order above!
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {localOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{order.id}</span>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {order.url}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.pkg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders:</span>
                <span className="font-semibold">{localOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Type:</span>
                <span className="font-semibold">
                  {showAdminActions ? 'Administrator' : 'User'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
