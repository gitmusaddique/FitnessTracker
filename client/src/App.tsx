import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { authManager } from "@/lib/auth";
import { useEffect, useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import Header from "@/components/header";

// Pages
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import WorkoutsPage from "@/pages/workouts";
import MealsPage from "@/pages/meals";
import GymsPage from "@/pages/gyms";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import AdminUsersPage from "@/pages/admin/users";
import AdminTrainersPage from "@/pages/admin/trainers";
import AdminAddTrainerPage from "@/pages/admin/add-trainer";
import AdminEditTrainerPage from "@/pages/admin/edit-trainer";
import AdminGymsPage from "@/pages/admin/gyms";
import AdminAddGymPage from "@/pages/admin/add-gym";
import AdminEditGymPage from "@/pages/admin/edit-gym";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.getState().isAuthenticated);

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
    return unsubscribe;
  }, []);

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <Header />
      <div className="pb-20">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.getState().isAuthenticated);

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
    return unsubscribe;
  }, []);

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      </Route>
      
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/workouts">
        <ProtectedRoute>
          <WorkoutsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/meals">
        <ProtectedRoute>
          <MealsPage />
        </ProtectedRoute>
      </Route>
      
      
      <Route path="/gyms">
        <ProtectedRoute>
          <GymsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      
      {/* Admin routes - accessible via URL only */}
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/trainers" component={AdminTrainersPage} />
      <Route path="/admin/trainers/add" component={AdminAddTrainerPage} />
      <Route path="/admin/trainers/edit/:id" component={AdminEditTrainerPage} />
      <Route path="/admin/gyms" component={AdminGymsPage} />
      <Route path="/admin/gyms/add" component={AdminAddGymPage} />
      <Route path="/admin/gyms/edit/:id" component={AdminEditGymPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="fitness-app-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
