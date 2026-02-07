import { Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import BalanceIndicator from './BalanceIndicator';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/assets/generated/booster-background.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <BalanceIndicator />
      <div className="relative z-10">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
