import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import type { Workout, Meal } from "@shared/schema";
import { 
  Target, 
  Flame, 
  Dumbbell, 
  Trophy,
  Activity,
  BarChart3,
  Plus,
  Calendar,
  Clock,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { user } = useAuth();

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  // Calculate date ranges
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const getDateRange = () => {
    switch (selectedPeriod) {
      case "week": return weekAgo;
      case "month": return monthAgo;
      default: return weekAgo;
    }
  };

  const filterByPeriod = (items: any[]) => {
    const startDate = getDateRange();
    return items.filter(item => new Date(item.date!) >= startDate);
  };

  // Calculate stats
  const periodWorkouts = filterByPeriod(workouts);
  const todayWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date!);
    return workoutDate.toDateString() === today.toDateString();
  });
  const todayMeals = meals.filter(m => {
    const mealDate = new Date(m.date!);
    return mealDate.toDateString() === today.toDateString();
  });

  const stats = {
    totalWorkouts: periodWorkouts.length,
    totalDuration: periodWorkouts.reduce((sum, w) => sum + w.duration, 0),
    totalCalories: periodWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
    personalRecords: periodWorkouts.filter(w => w.personalRecord).length,
    workoutStreak: user?.workoutStreak || 7,
    todayCaloriesEaten: todayMeals.reduce((sum, m) => sum + m.calories, 0),
    calorieGoal: user?.dailyCalorieGoal || 2000
  };

  // Calculate weekly progress
  const getWeeklyData = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date!);
        return workoutDate.toDateString() === date.toDateString();
      });
      weekData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        duration: dayWorkouts.reduce((sum, w) => sum + w.duration, 0)
      });
    }
    return weekData;
  };

  const weeklyData = getWeeklyData();
  const maxWorkouts = Math.max(...weeklyData.map(d => d.workouts), 1);

  return (
    <div className="p-4 pb-20 pt-24 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">
          Hello, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Ready to track your workouts today?
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 mr-1" style={{ color: 'rgb(var(--primary))' }} />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }} data-testid="text-workout-streak">{stats.workoutStreak}</p>
            <p className="text-sm text-muted-foreground">Days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 mr-1" style={{ color: 'rgb(var(--primary))' }} />
              <span className="text-sm text-muted-foreground">PRs</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }} data-testid="text-personal-records">{stats.personalRecords}</p>
            <p className="text-sm text-muted-foreground">This {selectedPeriod}</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Target className="w-5 h-5 mr-2" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Calories Consumed</span>
              <span className="text-sm">
                <span className="font-bold" data-testid="text-calories-today">{stats.todayCaloriesEaten.toLocaleString()}</span>
                <span className="text-muted-foreground"> / {stats.calorieGoal.toLocaleString()}</span>
              </span>
            </div>
            <Progress 
              value={(stats.todayCaloriesEaten / stats.calorieGoal) * 100} 
              className="h-2"
            />
          </div>

          {/* Today's Workouts */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Workouts Completed</span>
              <span className="text-sm font-bold" data-testid="text-workouts-today">{todayWorkouts.length}</span>
            </div>
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded ${
                    i < todayWorkouts.length ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Stats */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedPeriod === "week" ? "This Week" : "This Month"}
            </CardTitle>
            <div className="flex space-x-1">
              <Button
                variant={selectedPeriod === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("week")}
                className="text-xs"
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("month")}
                className="text-xs"
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-weekly-workouts">{stats.totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{Math.round(stats.totalDuration / 60)}h</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{(stats.totalCalories / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="w-5 h-5 mr-2" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-24 mb-3">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div
                  className="w-6 rounded-t min-h-[4px] transition-all"
                  style={{
                    backgroundColor: 'rgb(var(--primary)),',
                    height: `${(day.workouts / maxWorkouts) * 60}px`,
                    opacity: day.workouts > 0 ? 1 : 0.3
                  }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Workout frequency over the last 7 days
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/workouts">
          <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1" data-testid="button-manage-workouts">
            <Dumbbell className="w-6 h-6" />
            <span className="text-sm">Manage Workouts</span>
          </Button>
        </Link>
        
        <Link href="/meals">
          <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1" data-testid="button-track-meals">
            <Target className="w-6 h-6" />
            <span className="text-sm">Track Meals</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}