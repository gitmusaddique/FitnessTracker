import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { 
  Dumbbell, 
  Utensils, 
  Users, 
  MapPin, 
  Plus,
  Activity,
  Flame,
  Target,
  Award,
  Clock
} from "lucide-react";
import type { Workout, Meal } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date!);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });

  const todayMeals = meals.filter(m => {
    const mealDate = new Date(m.date!);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === today.getTime();
  });

  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const weeklyWorkouts = workouts.filter(w => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(w.date!) > weekAgo;
  }).length;

  const recentActivities = [
    ...workouts.slice(0, 2).map(w => ({
      id: w.id,
      type: 'workout' as const,
      title: w.type.charAt(0).toUpperCase() + w.type.slice(1),
      subtitle: `${w.duration} min`,
      time: new Date(w.date!).toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      icon: Dumbbell,
      color: 'text-primary'
    })),
    ...meals.slice(0, 1).map(m => ({
      id: m.id,
      type: 'meal' as const,
      title: 'Meal Logged',
      subtitle: `${m.name} • ${m.calories} calories`,
      time: new Date(m.date!).toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      icon: Utensils,
      color: 'text-secondary'
    }))
  ].sort((a, b) => {
    const aWorkout = workouts.find(w => w.id === a.id);
    const aMeal = meals.find(m => m.id === a.id);
    const bWorkout = workouts.find(w => w.id === b.id);
    const bMeal = meals.find(m => m.id === b.id);
    
    const aDate = aWorkout?.date || aMeal?.date || new Date(0);
    const bDate = bWorkout?.date || bMeal?.date || new Date(0);
    
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground mb-6 slide-up">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-welcome">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="opacity-90 mt-1">Ready to crush your goals today?</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Workouts</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-workouts-today">
                  {todayWorkouts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calories Today</p>
                <p className="text-2xl font-bold text-accent" data-testid="text-calories-today">
                  {todayCalories}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weekly Progress</h3>
            <span className="text-sm text-accent font-medium">
              {Math.round((weeklyWorkouts / 6) * 100)}% Complete
            </span>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  className="progress-ring-circle"
                  strokeLinecap="round"
                  strokeDasharray={`${(weeklyWorkouts / 6) * 339} 339`}
                  strokeDashoffset="0"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "hsl(18 100% 60%)", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "hsl(166 76% 37%)", stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold" data-testid="text-weekly-workouts">
                  {weeklyWorkouts}/6
                </span>
                <span className="text-sm text-muted-foreground">Workouts</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-primary">{weeklyWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-accent">
                {Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60 * 10) / 10}h
              </p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-secondary">7</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg"
                    data-testid={`activity-${activity.type}`}
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/workouts">
              <Button
                variant="ghost"
                className="flex flex-col items-center p-4 h-auto bg-primary/10 hover:bg-primary/20 transition-colors"
                data-testid="button-log-workout"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Log Workout</span>
              </Button>
            </Link>

            <Link href="/meals">
              <Button
                variant="ghost"
                className="flex flex-col items-center p-4 h-auto bg-accent/10 hover:bg-accent/20 transition-colors"
                data-testid="button-log-meal"
              >
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-2">
                  <Utensils className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium">Log Meal</span>
              </Button>
            </Link>

            <Link href="/trainers">
              <Button
                variant="ghost"
                className="flex flex-col items-center p-4 h-auto bg-secondary/10 hover:bg-secondary/20 transition-colors"
                data-testid="button-find-trainer"
              >
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <span className="text-sm font-medium">Find Trainer</span>
              </Button>
            </Link>

            <Link href="/gyms">
              <Button
                variant="ghost"
                className="flex flex-col items-center p-4 h-auto bg-warning/10 hover:bg-warning/20 transition-colors"
                data-testid="button-find-gym"
              >
                <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">Find Gym</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        className="floating-btn w-14 h-14 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
        asChild
        data-testid="button-floating-add"
      >
        <Link href="/workouts">
          <Plus className="w-6 h-6" />
        </Link>
      </Button>
    </div>
  );
}
