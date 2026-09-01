import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useListAdminVendors } from '@workspace/api-client-react';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  MapPin, 
  CreditCard, 
  Key, 
  LockKeyhole, 
  Flag,
  Building2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  
  const { data: pendingVendorsData } = useListAdminVendors({ status: 'pending', limit: 1 });
  const pendingCount = pendingVendorsData?.pagination.total || 0;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/vendors', icon: Users, label: 'Vendeurs', badge: pendingCount > 0 ? pendingCount : undefined },
    { path: '/properties', icon: Home, label: 'Propriétés' },
    { path: '/sites', icon: Building2, label: 'Sites' },
    { path: '/tourist-spots', icon: MapPin, label: 'Lieux touristiques' },
    { path: '/subscriptions', icon: CreditCard, label: 'Abonnements' },
    { path: '/permissions', icon: Key, label: 'La Clé' },
    { path: '/password-resets', icon: LockKeyhole, label: 'Réinit. mot de passe' },
    { path: '/reports', icon: Flag, label: 'Signalements' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">
            Sakani Dz Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
                data-testid={`nav-link-${item.path.slice(1) || 'dashboard'}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 min-w-[20px] justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
