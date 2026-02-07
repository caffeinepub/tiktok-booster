import { Link, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Clock, Package, Video } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useGetOrderById } from '@/hooks/useOrders';
import { formatTimestamp, formatOrderId } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatusPage() {
  const { id } = useParams({ from: '/status/$id' });
  const { data: order, isLoading, isError } = useGetOrderById(id);

  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          {isLoading && (
            <Card className="border-2 border-muted">
              <CardHeader className="text-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          )}

          {!isLoading && (isError || !order) && (
            <Card className="border-2 border-destructive/20">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-destructive/10 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Order Not Found</CardTitle>
                <CardDescription className="text-base">
                  The order you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-muted/50 rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Order ID: <span className="font-mono font-semibold">#{id}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    If you believe this is an error, please contact us on Telegram: @tiktokboosterpro
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && order && (
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Package className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Order Status</CardTitle>
                <CardDescription className="text-base">
                  Track your TikTok boost order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <Badge variant="outline" className="font-mono text-base">
                      #{formatOrderId(order.orderId)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge 
                      variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'cancelled' || order.status === 'failed' ? 'destructive' :
                        'outline'
                      }
                      className="text-base font-semibold"
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Package</span>
                    <span className="font-semibold">{order.package}</span>
                  </div>

                  <div className="flex justify-between items-start pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video URL
                    </span>
                    <a 
                      href={order.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline max-w-xs break-all text-right"
                    >
                      {order.url}
                    </a>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Created
                    </span>
                    <span className="text-sm font-medium">
                      {formatTimestamp(order.createdAt)}
                    </span>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Next Steps:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Contact us on Telegram: @tiktokboosterpro</li>
                      <li>Complete payment to activate your order</li>
                      <li>Your boost will be delivered within 5-10 minutes</li>
                    </ol>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary">
                      ✓ Your order has been completed successfully!
                    </p>
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
