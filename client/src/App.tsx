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
import TrainersPage from "@/pages/trainers";
import GymsPage from "@/pages/gyms";
import ProfilePage from "@/pages/profile";
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
      
      <Route path="/trainers">
        <ProtectedRoute>
          <TrainersPage />
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
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="fitness-app-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
