import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Crown,
  Play,
  ArrowRight,
  Eye,
  MoreHorizontal
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
    workoutStreak: user?.workoutStreak || 7,
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
    <div className="min-h-screen p-4 pb-24">
      {/* Profile Header in Floating Layout */}
      <div className="relative mb-8 pt-12">
        {/* Profile Card - Top Left */}
        <div className="absolute top-0 left-0 z-10">
          <Card className="w-32 card-white shadow-soft">
            <CardContent className="p-4 text-center">
              <Avatar className="w-12 h-12 mx-auto mb-2 avatar-border">
                <AvatarImage src="/api/placeholder/user-avatar" />
                <AvatarFallback className="avatar-gradient text-white font-bold">
                  {user?.name?.charAt(0) || 'J'}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-gray-600">Profile</p>
              <p className="font-bold text-sm">{user?.name?.split(' ')[0] || 'Julian'} Austin</p>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs mt-1">
                Premium ⭐
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Greeting Card - Center */}
        <div className="ml-40 mr-8">
          <Card className="card-blue relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1" data-testid="text-welcome">
                    Hello, {user?.name?.split(' ')[0] || 'Julian'}.
                  </h1>
                  <p className="text-gray-600">Ready for a challenge?</p>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/api/placeholder/user-avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white">
                    {user?.name?.charAt(0) || 'J'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Daily Challenge */}
              <div className="bg-white/50 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">New Challenge</p>
                    <p className="font-bold text-gray-800">4000 Steps</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Stats Layout */}
      <div className="relative mb-12">
        {/* Dark Journey Card - Left */}
        <div className="absolute left-0 top-0 z-10">
          <Card className="w-48 card-dark">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                  75%
                </Badge>
                <MoreHorizontal className="w-4 h-4 text-white/60" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-white" data-testid="text-total-workouts">{stats.totalWorkouts}</p>
                  <p className="text-white/60 text-sm">Your Journey</p>
                </div>
                {/* Simple chart visualization */}
                <div className="h-16 flex items-end space-x-1">
                  {weeklyData.map((day, i) => (
                    <div 
                      key={i}
                      className="bg-white/30 rounded-t flex-1"
                      style={{ height: `${(day.workouts / maxWorkouts) * 60}%` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Cards - Right */}
        <div className="ml-56 space-y-4">
          {/* Daily Streak Card */}
          <Card className="w-32 card-green">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">☁️</span>
              </div>
              <p className="text-2xl font-bold text-gray-800" data-testid="text-workout-streak">{stats.workoutStreak}</p>
              <p className="text-sm text-gray-600">Days</p>
              <div className="flex justify-center mt-2">
                <Badge variant="outline" className="bg-black text-white border-black text-xs">
                  120.5%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Steps Card */}
          <Card className="w-32 card-yellow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">2720</p>
              <p className="text-sm text-gray-600">Steps today</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout Cards Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Your Workout</h3>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {/* Weight Lifting Card */}
          <Card className="card-yellow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💪</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Weight Lifting</p>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500 text-white text-xs">5 Sets</Badge>
                    <span className="text-yellow-600 text-sm">⚡ 1000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rope Skipping Card */}
          <Card className="card-blue">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏃</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">Rope Skipping</p>
                  <span className="text-blue-600 text-sm">⚡ 1000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* Trainer Card - Floating Style */}
      <Card className="card-peach relative overflow-hidden mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Badge className="bg-black text-white text-xs px-3">Cardio</Badge>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold">4.4</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Andy</h3>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hansen</h3>
              <p className="text-sm text-gray-600 mb-3">2pm - 3pm</p>
              
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex -space-x-2">
                  <Avatar className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="bg-blue-400 text-white text-xs">A</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="bg-pink-400 text-white text-xs">B</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="bg-green-400 text-white text-xs">C</AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">5+</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Joining Andy</p>
              
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
                Buy $30
              </Button>
            </div>
            
            {/* Profile Image Area */}
            <div className="w-24 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/api/placeholder/trainer-1')] bg-cover bg-center" />
              <div className="absolute bottom-2 right-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-gray-600" />
                </div>
              </div>
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

      {/* Personal Records */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Trophy className="w-5 h-5 mr-2" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground" data-testid="text-personal-records">{stats.personalRecords}</p>
            <p className="text-sm text-muted-foreground">This {selectedPeriod}</p>
          </div>
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
                  index < 2 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                }`}
              >
                <div className="text-2xl mb-1">{<badge.icon className="w-6 h-6 mx-auto" />}</div>
                <h4 className="font-medium text-xs mb-1">{badge.title}</h4>
                {index < 2 && (
                  <CheckCircle2 className="w-4 h-4 text-foreground mx-auto" />
                )}
              </div>
            ))}
          </div>
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
              <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center">
                <Apple className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{meal.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {meal.calories} cal • {new Date(meal.date!).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}