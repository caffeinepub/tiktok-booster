import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import OrderConfirmationPanel from '@/components/OrderConfirmationPanel';
import { packages } from '@/lib/packages';
import { formatPKR } from '@/lib/format';
import { validateUrl } from '@/lib/validation';
import { useCreateOrder } from '@/hooks/useOrders';
import { normalizeBackendError } from '@/lib/backendError';

export default function HomePage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState<bigint | null>(null);

  const createOrderMutation = useCreateOrder();

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    const pkg = packages.find(p => p.id === packageId);
    toast.success(`${pkg?.name} package selected!`, {
      description: `${formatPKR(pkg?.price || 0)} - ${pkg?.benefits[0]}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    // Validate package selection
    if (!selectedPackage) {
      toast.error('Please select a package first');
      return;
    }

    // Validate URL
    const urlValidation = validateUrl(videoUrl);
    if (!urlValidation.valid) {
      setUrlError(urlValidation.error || 'Invalid URL');
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) {
      toast.error('Selected package not found');
      return;
    }

    try {
      const orderId = await createOrderMutation.mutateAsync({
        url: videoUrl,
        price: pkg.price,
        packageName: pkg.name,
        packageId: pkg.id,
      });

      setConfirmedOrderId(orderId);
      
      toast.success('Order created successfully!', {
        description: `Order #${orderId.toString()} has been created`,
      });
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to create order', {
        description: errorMessage,
      });
    }
  };

  // If order is confirmed, show confirmation panel
  if (confirmedOrderId && selectedPackage) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-12">
          <OrderConfirmationPanel
            orderId={confirmedOrderId}
            packageType={selectedPackage}
            videoUrl={videoUrl}
          />
        </main>

        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Safe & Secure</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            TikTok Booster Pro
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Instant Views • Likes • Followers | 100% Safe
          </p>
        </section>

        {/* Packages Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`relative transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  selectedPackage === pkg.id ? 'border-2 border-primary shadow-xl' : ''
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center space-y-4">
                  <div className="text-4xl">{pkg.icon}</div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{formatPKR(pkg.price)}</div>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pkg.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full text-lg py-6"
                    onClick={() => handlePackageSelect(pkg.id)}
                    variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                  >
                    {selectedPackage === pkg.id ? 'Selected ✓' : 'Select Package'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Order Form Section */}
        <section className="py-12 max-w-2xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Start Boosting Now</CardTitle>
              <CardDescription className="text-base">
                Enter your TikTok video URL to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-base">TikTok Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.tiktok.com/@user/video/123456"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setUrlError('');
                    }}
                    className={`text-base py-6 ${urlError ? 'border-destructive' : ''}`}
                  />
                  {urlError && (
                    <p className="text-sm text-destructive">{urlError}</p>
                  )}
                </div>

                {selectedPackage && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Selected Package:</p>
                    <p className="font-semibold">
                      {packages.find(p => p.id === selectedPackage)?.name} - {formatPKR(packages.find(p => p.id === selectedPackage)?.price || 0)}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full text-lg py-6"
                  disabled={createOrderMutation.isPending}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {createOrderMutation.isPending ? 'Creating Order...' : 'Start Boosting'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
