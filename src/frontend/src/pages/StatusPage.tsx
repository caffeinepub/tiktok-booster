import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export default function StatusPage() {
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

          <Card className="border-2 border-muted">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-muted p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl">Order Status</CardTitle>
              <CardDescription className="text-base">
                Order tracking is currently being set up. Please contact us on Telegram (@tiktokboosterpro) to check your order status.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-muted/50 rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  For immediate assistance with your order:
                </p>
                <p className="font-semibold">
                  Contact us on Telegram: @tiktokboosterpro
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
        </div>
      </main>
    </div>
  );
}
