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
  TrendingUp,
  Star,
  Utensils
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold mb-1" data-testid="text-welcome">
              Hello, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Ready to crush your fitness goals?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 text-primary/60" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary mb-1" data-testid="text-workout-streak">{stats.workoutStreak}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-warning/15 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <Star className="w-4 h-4 text-warning/60" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning mb-1" data-testid="text-personal-records">{stats.personalRecords}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Personal Records</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span>Today's Goals</span>
            </div>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Calories</span>
              </div>
              <span className="text-sm font-bold">
                <span className="text-primary" data-testid="text-calories-today">{stats.todayCaloriesEaten.toLocaleString()}</span>
                <span className="text-muted-foreground"> / {stats.calorieGoal.toLocaleString()}</span>
              </span>
            </div>
            <Progress 
              value={Math.min((stats.todayCaloriesEaten / stats.calorieGoal) * 100, 100)} 
              className="h-2.5"
            />
          </div>

          {/* Today's Workouts */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Workouts</span>
              </div>
              <span className="text-sm font-bold text-primary" data-testid="text-workouts-today">{todayWorkouts.length} / 3</span>
            </div>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2.5 rounded-full transition-colors ${
                    i < todayWorkouts.length ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Stats */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {selectedPeriod === "week" ? "This Week" : "This Month"}
            </CardTitle>
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setSelectedPeriod("week")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === "week" 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod("month")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === "month" 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1" data-testid="text-weekly-workouts">{stats.totalWorkouts}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workouts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{Math.round(stats.totalDuration / 60)}h</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{(stats.totalCalories / 1000).toFixed(1)}k</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <span>Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-28 mb-4 px-2">
            {weeklyData.map((day, index) => {
              const isToday = index === 6;
              return (
                <div key={index} className="flex flex-col items-center space-y-3">
                  <div
                    className={`w-7 rounded-lg min-h-[8px] transition-all ${
                      day.workouts > 0 ? 'bg-primary' : 'bg-muted'
                    } ${isToday ? 'shadow-md' : ''}`}
                    style={{
                      height: `${Math.max((day.workouts / maxWorkouts) * 70, 8)}px`
                    }}
                  />
                  <div className="text-center">
                    <span className={`text-xs font-medium ${
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {day.day}
                    </span>
                    {day.workouts > 0 && (
                      <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>Last 7 days workout frequency</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/workouts">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:shadow-md transition-all duration-200 active:scale-95" data-testid="button-manage-workouts">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-20">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Workouts</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/meals">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-secondary to-secondary/80 hover:shadow-md transition-all duration-200 active:scale-95" data-testid="button-track-meals">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-20">
              <div className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center mb-2">
                <Utensils className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Nutrition</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}