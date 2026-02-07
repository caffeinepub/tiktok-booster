import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Copy, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUrl } from '@/hooks/useCurrentUrl';

export default function AppFooter() {
  const currentUrl = useCurrentUrl();

  const handleCopyUrl = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      toast.success('URL copied to clipboard!', {
        description: 'Share it to earn 20% referral bonus',
      });
    }
  };

  return (
    <footer className="container mx-auto px-4 py-12 mt-20">
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Share & Earn</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Share your referral link and earn 20% commission on all orders
            </p>
            {currentUrl && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <code className="text-xs bg-muted px-3 py-2 rounded-lg text-muted-foreground break-all max-w-md">
                  {currentUrl}
                </code>
                <Button onClick={handleCopyUrl} size="sm" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
              © 2026. Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
            <div className="mt-2">
              <Link to="/credits" className="text-sm text-primary hover:underline">
                Credits & Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
