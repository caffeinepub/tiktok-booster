import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { packages } from '@/lib/packages';
import { formatPKR } from '@/lib/format';

interface OrderConfirmationPanelProps {
  orderId: bigint;
  packageType: string;
  videoUrl: string;
}

export default function OrderConfirmationPanel({ orderId, packageType, videoUrl }: OrderConfirmationPanelProps) {
  const selectedPackage = packages.find(p => p.id === packageType);

  return (
    <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
        <CardDescription className="text-base">
          Your boost order has been successfully created
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Order ID</span>
            <Badge variant="outline" className="font-mono text-base">
              #{orderId.toString()}
            </Badge>
          </div>
          
          {selectedPackage && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-semibold">{selectedPackage.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-2xl font-bold text-primary">{formatPKR(selectedPackage.price)}</span>
              </div>
              
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-sm font-medium">What you'll get:</p>
                <ul className="space-y-1">
                  {selectedPackage.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          
          <div className="pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground block mb-2">Video URL</span>
            <p className="text-sm break-all bg-background p-3 rounded-md">{videoUrl}</p>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Next Steps:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Contact us on Telegram: @tiktokboosterpro</li>
            <li>Complete payment ({formatPKR(selectedPackage?.price || 0)})</li>
            <li>Track your order status below</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link to="/status/$id" params={{ id: orderId.toString() }}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Order Status
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/">
            Create Another Order
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
