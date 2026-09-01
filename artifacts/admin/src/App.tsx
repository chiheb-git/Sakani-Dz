import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import VendorsPage from '@/pages/vendors';
import VendorDetailPage from '@/pages/vendor-detail';
import PropertiesPage from '@/pages/properties';
import SitesPage from '@/pages/sites';
import TouristSpotsPage from '@/pages/tourist-spots';
import SubscriptionsPage from '@/pages/subscriptions';
import PermissionsPage from '@/pages/permissions';
import PasswordResetsPage from '@/pages/password-resets';
import ReportsPage from '@/pages/reports';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/vendors">
        <ProtectedRoute>
          <AppLayout>
            <VendorsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/vendors/:id">
        <ProtectedRoute>
          <AppLayout>
            <VendorDetailPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/properties">
        <ProtectedRoute>
          <AppLayout>
            <PropertiesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/sites">
        <ProtectedRoute>
          <AppLayout>
            <SitesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tourist-spots">
        <ProtectedRoute>
          <AppLayout>
            <TouristSpotsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/subscriptions">
        <ProtectedRoute>
          <AppLayout>
            <SubscriptionsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/permissions">
        <ProtectedRoute>
          <AppLayout>
            <PermissionsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/password-resets">
        <ProtectedRoute>
          <AppLayout>
            <PasswordResetsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <AppLayout>
            <ReportsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
