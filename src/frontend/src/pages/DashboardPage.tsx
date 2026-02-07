import { useState, useRef } from 'react';
import { useGetAdminWalletBalance, useDistributeFunds } from '@/hooks/useQueries';
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
import { Loader2, User, FileText, FolderOpen, Copy, Check, Wallet, AlertCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';

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
  const { data: adminBalance, isLoading: adminBalanceLoading, error: adminBalanceError } = useGetAdminWalletBalance();
  const distributeFundsMutation = useDistributeFunds();
  const profileRef = useRef<HTMLDivElement>(null);

  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [allocatedBalance, setAllocatedBalance] = useState('');
  const [userPrincipal, setUserPrincipal] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('Starter');
  const [copied, setCopied] = useState(false);

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

  const handlePlaceOrder = () => {
    const validation = validateUrl(tiktokUrl);
    if (!validation.valid) {
      toast.error(validation.error || 'Please enter a valid URL');
      return;
    }

    const pkg = DASHBOARD_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;

    const currentBalance = Number(adminBalance || BigInt(0));
    if (currentBalance < pkg.price) {
      toast.error('Insufficient balance!', {
        description: 'Admin wallet does not have enough funds',
      });
      return;
    }

    const orderId = 'CFF' + Date.now();
    const newOrder: LocalOrder = {
      id: orderId,
      url: tiktokUrl,
      pkg: pkg.name,
      status: 'Processing...',
      time: new Date().toLocaleTimeString(),
    };

    setLocalOrders(prev => [newOrder, ...prev]);
    setTiktokUrl('');

    toast.success(`Order #${orderId} placed!`, {
      description: `Package: ${pkg.name} (${formatPKR(pkg.price)}) - Delivery: 5–10 min ⚡`,
    });

    setTimeout(() => {
      setLocalOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: '✅ Completed!' } : order
        )
      );
    }, 5000 + Math.random() * 5000);
  };

  const handleDistributeFunds = async () => {
    if (!userPrincipal.trim()) {
      toast.error('Please enter a user Principal ID');
      return;
    }

    const allocatedAmount = parseInt(allocatedBalance) || 0;
    if (allocatedAmount <= 0) {
      toast.error('Please enter a valid amount greater than zero');
      return;
    }

    // Optional client-side check for better UX
    const currentBalance = Number(adminBalance || BigInt(0));
    if (allocatedAmount > currentBalance) {
      toast.error('Insufficient admin wallet balance!', {
        description: `Admin wallet only has ${formatBalance(adminBalance || BigInt(0))} PKR available`,
      });
      return;
    }

    try {
      const principal = Principal.fromText(userPrincipal.trim());
      
      await distributeFundsMutation.mutateAsync({
        toUser: principal,
        amount: BigInt(allocatedAmount),
      });

      toast.success('Funds distributed successfully!', {
        description: `${allocatedAmount} PKR allocated to user`,
      });
      
      // Clear fields only after successful distribution
      setUserPrincipal('');
      setAllocatedBalance('');
    } catch (error) {
      // Use normalized error message
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to distribute funds', {
        description: errorMessage,
      });
      // Do not clear fields or change any displayed balances on error
    }
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-br from-primary via-primary/90 to-destructive shadow-2xl border-b border-white/10">
        <div className="container mx-auto px-4 py-6 max-w-7xl relative">
          {/* Profile Button - Top Right Corner */}
          <Button
            onClick={scrollToProfile}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pr-24 lg:pr-28">
            {/* Left: Title and URL */}
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Caffeine TikTok Booster
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm text-white/90">
                  Your Site: <span className="font-semibold">{INVITE_URL}</span>
                </p>
                <Button
                  onClick={handleCopyInviteLink}
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Invite Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right: Admin Balance */}
            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                <Wallet className="w-4 h-4 text-white/80" />
                <p className="text-sm text-white/80">Admin Balance</p>
              </div>
              {adminBalanceLoading ? (
                <div className="flex justify-center sm:justify-end">
                  <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                </div>
              ) : adminBalanceError ? (
                <p className="text-sm text-red-300">Unauthorized</p>
              ) : (
                <p className="text-3xl lg:text-4xl font-bold text-yellow-300">
                  {formatBalance(adminBalance || BigInt(0))} PKR
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Order */}
          <Card className="bg-card/95 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔥 Quick Order (Low Price!)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tiktok-url">TikTok Video URL</Label>
                <Input
                  id="tiktok-url"
                  placeholder="TikTok Video URL"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Select Package</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DASHBOARD_PACKAGES.map((pkg) => (
                    <Button
                      key={pkg.id}
                      variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className="justify-between"
                    >
                      <span>{pkg.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {pkg.price} PKR
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full"
                size="lg"
              >
                Place Order
              </Button>
            </CardContent>
          </Card>

          {/* Distribute Funds to User */}
          <Card className="bg-card/95 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Distribute Funds to User
              </CardTitle>
              <CardDescription>
                Transfer balance from admin wallet to a user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminBalanceError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Only admin can distribute funds
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="user-principal">User Principal ID</Label>
                <Input
                  id="user-principal"
                  placeholder="Enter user Principal ID"
                  value={userPrincipal}
                  onChange={(e) => setUserPrincipal(e.target.value)}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The user must be logged in to receive funds. You can find their Principal ID in their profile.
                </p>
              </div>

              <div>
                <Label htmlFor="distribute-amount">Amount (PKR)</Label>
                <Input
                  id="distribute-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={allocatedBalance}
                  onChange={(e) => setAllocatedBalance(e.target.value)}
                  className="mt-1"
                />
                {adminBalance && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatBalance(adminBalance)} PKR
                  </p>
                )}
              </div>

              <Button
                onClick={handleDistributeFunds}
                className="w-full"
                size="lg"
                disabled={distributeFundsMutation.isPending || !!adminBalanceError}
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
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="bg-card/95 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {localOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No orders yet. Place your first order!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {localOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm font-semibold">
                            #{order.id}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {order.pkg}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {order.url}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{order.time}</span>
                          <span className={order.status.includes('✅') ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="bg-card/95 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium mb-1">Wallet System</p>
                  <p className="text-xs text-muted-foreground">
                    User balances are shown in the top-right corner. Balances are added by the admin via "Distribute Funds to User".
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium mb-1">Order Processing</p>
                  <p className="text-xs text-muted-foreground">
                    All orders are processed within 5–10 minutes. Track status in Recent Orders.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium mb-1">Support</p>
                  <p className="text-xs text-muted-foreground">
                    For assistance, contact via Telegram or check the Credits page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <div ref={profileRef} tabIndex={-1} className="mt-8">
          <Card className="bg-card/95 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Profile & Settings
              </CardTitle>
              <CardDescription>
                Manage your profile and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Visit your profile page to update your information
                </p>
                <Button asChild>
                  <a href="/profile">Go to Profile</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
