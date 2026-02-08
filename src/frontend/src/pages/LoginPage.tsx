import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect to home after successful login
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error.message || 'Please try again',
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">You are logged in</CardTitle>
            <CardDescription>
              Welcome back! You can now access all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={() => navigate({ to: '/' })}
              size="lg"
              className="w-full"
            >
              Go to Home
            </Button>
            <Button
              onClick={() => navigate({ to: '/profile' })}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogIn className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Log In</CardTitle>
          <CardDescription className="text-base mt-2">
            Sign in to your account to access your balance and orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">Secure Authentication</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Access your wallet and balance</li>
              <li>• View and manage your orders</li>
              <li>• Update your profile settings</li>
              <li>• Secure login with Internet Identity</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              size="lg"
              className="w-full"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your data is secured with Internet Identity authentication
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => navigate({ to: '/signup' })}
              >
                Sign Up
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
