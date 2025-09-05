import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import type { Workout, Meal, User } from "@shared/schema";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Flame, 
  Dumbbell, 
  Clock,
  Trophy,
  Zap,
  Activity,
  Apple,
  Heart,
  BarChart3,
  Star,
  Award,
  ChevronRight,
  Timer,
  MapPin,
  Users,
  PlayCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Utensils,
  Footprints,
  Sunrise,
  Crown
} from "lucide-react";

const achievementBadges = [
  { id: "first_workout", title: "First Steps", icon: Footprints, description: "Complete your first workout" },
  { id: "week_streak", title: "Week Warrior", icon: Flame, description: "7-day workout streak" },
  { id: "month_streak", title: "Monthly Master", icon: Calendar, description: "30-day workout streak" },
  { id: "early_bird", title: "Early Bird", icon: Sunrise, description: "5 AM workout completed" },
  { id: "calorie_crusher", title: "Calorie Crusher", icon: Dumbbell, description: "Burn 500+ calories in one workout" },
  { id: "consistency_king", title: "Consistency King", icon: Crown, description: "Workout 20 days this month" },
];

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
  const periodMeals = filterByPeriod(meals);
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
    averageIntensity: periodWorkouts.length > 0 ? 
      periodWorkouts.filter(w => w.intensity === "high").length / periodWorkouts.length * 100 : 0,
    personalRecords: periodWorkouts.filter(w => w.personalRecord).length,
    workoutStreak: user?.workoutStreak || 0,
    todayCaloriesEaten: todayMeals.reduce((sum, m) => sum + m.calories, 0),
    calorieGoal: user?.dailyCalorieGoal || 2000
  };

  // Get recent activity
  const recentWorkouts = workouts.slice(0, 3);
  const recentMeals = meals.slice(0, 3);

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

  // Mock challenges (in real app, these would come from API)
  const activeChallenges = [
    { id: 1, title: "January Fitness Challenge", progress: 65, target: "Work out 20 times", icon: Target },
    { id: 2, title: "10K Steps Daily", progress: 80, target: "7 days in a row", icon: Footprints },
    { id: 3, title: "Strength Builder", progress: 45, target: "Complete 15 strength workouts", icon: Dumbbell }
  ];

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="md-headline-medium mb-2" data-testid="text-welcome">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="md-body-medium" style={{ color: 'hsl(var(--md-sys-color-on-surface-variant))' }}>
          Ready to crush your fitness goals today?
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="workout-card md-elevation-1">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 mr-1" style={{ color: 'hsl(var(--md-custom-workout))' }} />
              <span className="md-label-small" style={{ color: 'hsl(var(--md-sys-color-on-surface-variant))' }}>Streak</span>
            </div>
            <p className="md-display-small" style={{ color: 'hsl(var(--md-custom-workout))' }}>{stats.workoutStreak}</p>
            <p className="md-body-small" style={{ color: 'hsl(var(--md-sys-color-on-surface-variant))' }}>Days</p>
          </CardContent>
        </Card>
        <Card className="achievement-card md-elevation-1">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 mr-1" style={{ color: 'hsl(var(--md-custom-achievement))' }} />
              <span className="md-label-small" style={{ color: 'hsl(var(--md-sys-color-on-surface-variant))' }}>PRs</span>
            </div>
            <p className="md-display-small" style={{ color: 'hsl(var(--md-custom-achievement))' }}>{stats.personalRecords}</p>
            <p className="md-body-small" style={{ color: 'hsl(var(--md-sys-color-on-surface-variant))' }}>This {selectedPeriod}</p>
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
                    i < todayWorkouts.length ? 'bg-success' : 'bg-muted'
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
              <p className="text-2xl font-bold text-primary" data-testid="text-weekly-workouts">{stats.totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{Math.round(stats.totalDuration / 60)}h</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{(stats.totalCalories / 1000).toFixed(1)}k</p>
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
                  className="w-6 bg-primary rounded-t min-h-[4px] transition-all"
                  style={{
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

      {/* Active Challenges */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Award className="w-5 h-5 mr-2" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeChallenges.map((challenge) => (
            <div key={challenge.id} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <challenge.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground">{challenge.target}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">{challenge.progress}%</span>
              </div>
              <Progress value={challenge.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>


      {/* Achievements */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Star className="w-5 h-5 mr-2" />
              Achievements
            </CardTitle>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {achievementBadges.slice(0, 6).map((badge, index) => (
              <div
                key={badge.id}
                className={`p-3 rounded-xl text-center native-transition ${
                  index < 2 ? 'bg-white/10 border border-white/20' : 'bg-muted/30'
                }`}
              >
                <div className="text-2xl mb-1">{<badge.icon className="w-6 h-6 mx-auto" />}</div>
                <h4 className="font-medium text-xs mb-1">{badge.title}</h4>
                {index < 2 && (
                  <CheckCircle2 className="w-4 h-4 text-white mx-auto" />
                )}
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-3 text-sm">
            View All Achievements
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentWorkouts.slice(0, 2).map((workout) => (
            <div key={workout.id} className="flex items-center space-x-3 p-2 bg-muted/20 rounded-lg" data-testid="activity-workout">
              <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{workout.name || workout.type}</h4>
                <p className="text-xs text-muted-foreground">
                  {workout.duration}min • {workout.calories || 0} cal • {new Date(workout.date!).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {recentMeals.slice(0, 1).map((meal) => (
            <div key={meal.id} className="flex items-center space-x-3 p-2 bg-muted/20 rounded-lg" data-testid="activity-meal">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Apple className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{meal.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {meal.calories} cal • {new Date(meal.date!).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-sm">
            View All Activity
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
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