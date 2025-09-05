import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth, authManager } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Workout, Meal } from "@shared/schema";
import {
  User,
  Bell,
  Moon,
  Settings,
  LogOut,
  ChevronRight,
  Award,
  Target,
  Flame,
  Clock
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  // Calculate user stats
  const totalWorkouts = workouts.length;
  const totalHours = Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60 * 10) / 10;
  const currentStreak = 7; // This would be calculated based on consecutive days
  const totalPoints = totalWorkouts * 10 + Math.round(totalHours * 5); // Simple points calculation

  const handleLogout = () => {
    authManager.clearAuth();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    setLocation("/auth");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    toast({
      title: "Theme changed",
      description: `Switched to ${theme === "light" ? "dark" : "light"} mode.`
    });
  };

  if (!user) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No user data</h3>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Profile Header */}
      <div className="text-center mb-8">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="User profile"
            className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg mb-4"
            data-testid="img-user-avatar"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg mb-4">
            <User className="w-16 h-16 text-white" />
          </div>
        )}
        <h2 className="text-2xl font-bold" data-testid="text-user-name">
          {user.name}
        </h2>
        <p className="text-muted-foreground" data-testid="text-user-email">
          {user.email}
        </p>
      </div>

      {/* Stats Overview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary" data-testid="text-total-workouts">
                {totalWorkouts}
              </p>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent" data-testid="text-total-hours">
                {totalHours}h
              </p>
              <p className="text-sm text-muted-foreground">Hours Trained</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary" data-testid="text-current-streak">
                {currentStreak}
              </p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning" data-testid="text-total-points">
                {totalPoints.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="space-y-4">
        <Card>
          <Button
            variant="ghost"
            className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors"
            data-testid="button-edit-profile"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Card>

        <Card>
          <Button
            variant="ghost"
            className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors"
            data-testid="button-notifications"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Card>

        <Card>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <Moon className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              data-testid="switch-dark-mode"
            />
          </div>
        </Card>

        <Card>
          <Button
            variant="ghost"
            className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors"
            data-testid="button-settings"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Card>

        <Card>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors text-destructive"
            data-testid="button-logout"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-medium">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
