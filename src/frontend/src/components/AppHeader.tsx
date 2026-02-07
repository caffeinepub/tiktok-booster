import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { User, UserPlus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export default function AppHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  useEffect(() => {
    const updateHeaderOffset = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--balance-indicator-top-offset', `${height}px`);
      }
    };

    updateHeaderOffset();

    const resizeObserver = new ResizeObserver(updateHeaderOffset);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.setProperty('--balance-indicator-top-offset', '0px');
    };
  }, []);

  return (
    <header ref={headerRef} className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/assets/generated/tiktok-booster-logo.dim_512x512.png" 
            alt="TikTok Booster Pro" 
            className="w-12 h-12 rounded-lg"
          />
          <span className="text-2xl font-bold text-foreground">TikTok Booster Pro</span>
        </Link>
        
        {isAuthenticated ? (
          <Link to="/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
        ) : (
          <Link to="/signup">
            <Button variant="default" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
