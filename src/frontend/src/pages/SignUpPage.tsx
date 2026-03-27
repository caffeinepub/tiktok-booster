import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Redirect to profile with setup mode after successful login
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      navigate({ to: "/profile", search: { setup: "1" } });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleSignUp = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Sign up failed", {
        description: error.message || "Please try again",
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
            <CardTitle className="text-2xl">
              You are already signed in
            </CardTitle>
            <CardDescription>
              You're all set! Go to your profile to manage your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={() => navigate({ to: "/profile" })}
              size="lg"
              className="w-full"
            >
              Go to Profile
            </Button>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Go to Home
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
            <UserPlus className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Sign Up</CardTitle>
          <CardDescription className="text-base mt-2">
            Create your account to start boosting your TikTok content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">What you'll get:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Secure authentication with Internet Identity</li>
              <li>• Personal profile and account management</li>
              <li>• Track your orders and balance</li>
              <li>• Fast and reliable service delivery</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignUp}
              disabled={isLoggingIn}
              size="lg"
              className="w-full"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our terms of service and privacy
              policy
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => navigate({ to: "/" })}
              >
                Go to Home & Log In
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
