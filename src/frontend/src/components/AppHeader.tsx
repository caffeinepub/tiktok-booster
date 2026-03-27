import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetAccountSummary } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Crown, LogIn, MessageSquare, User } from "lucide-react";
import { useEffect, useRef } from "react";

export default function AppHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const { identity } = useInternetIdentity();
  const { data: accountSummary } = useGetAccountSummary();
  const isAuthenticated = !!identity;
  const isAdmin = accountSummary?.role === "admin";

  useEffect(() => {
    const updateHeaderOffset = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--balance-indicator-top-offset",
          `${height}px`,
        );
      }
    };

    updateHeaderOffset();

    const resizeObserver = new ResizeObserver(updateHeaderOffset);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.setProperty(
        "--balance-indicator-top-offset",
        "0px",
      );
    };
  }, []);

  return (
    <header ref={headerRef} className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/tiktok-booster-logo.dim_512x512.png"
              alt="TikTok Booster Pro"
              className="w-12 h-12 rounded-lg"
            />
            <span className="text-2xl font-bold text-foreground">
              TikTok Booster Pro
            </span>
          </Link>

          {isAuthenticated && isAdmin && (
            <Badge
              variant="default"
              className="ml-2 gap-1 bg-primary/90 hover:bg-primary"
            >
              <Crown className="w-3 h-3" />
              Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link to="/community">
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Community</span>
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
