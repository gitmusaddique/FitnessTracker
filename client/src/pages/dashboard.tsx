import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import type { Workout, Meal, User } from "@shared/schema";
import { 
  Play,
  ArrowRight,
  Star,
  Clock,
  Users,
  MapPin,
  Footprints,
  Target,
  Flame,
  Trophy,
  Activity,
  Heart,
  Apple,
  Dumbbell,
  Zap,
  Eye,
  MoreHorizontal
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  // Calculate basic stats
  const todayWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date!);
    const today = new Date();
    return workoutDate.toDateString() === today.toDateString();
  });

  const stats = {
    workoutStreak: user?.workoutStreak || 7,
    todayWorkouts: todayWorkouts.length,
    weeklyWorkouts: workouts.filter(w => {
      const workoutDate = new Date(w.date!);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return workoutDate >= weekAgo;
    }).length,
    totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header Profile Section */}
      <div className="flex items-center justify-between mb-8 pt-12">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
            <AvatarImage src="/api/placeholder/user-avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
              {user?.name?.charAt(0) || 'J'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Profile</p>
            <p className="font-bold text-lg">{user?.name?.split(' ')[0] || 'Julian'} Austin</p>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                Premium ⭐
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-black text-white">
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Greeting Card */}
      <Card className="card-blue mb-6 p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1" data-testid="text-welcome">
                Hello, Julian.
              </h1>
              <p className="text-gray-600">Ready for a challenge?</p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src="/api/placeholder/user-avatar" />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white">
                J
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
        </div>
      </Card>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Dark Stats Card */}
        <Card className="card-dark relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                75%
              </Badge>
              <MoreHorizontal className="w-4 h-4 text-white/60" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalCalories}</p>
                <p className="text-white/60 text-sm">Your Journey</p>
              </div>
              {/* Simple chart visualization */}
              <div className="h-16 flex items-end space-x-1">
                {[40, 65, 30, 85, 45, 70, 55].map((height, i) => (
                  <div 
                    key={i}
                    className="bg-white/30 rounded-t flex-1"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <div className="space-y-4">
          <Card className="card-green">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">☁️</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.workoutStreak}</p>
              <p className="text-sm text-gray-600">Days</p>
              <div className="flex justify-center mt-2">
                <Badge variant="outline" className="bg-black text-white border-black text-xs">
                  120.5%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-yellow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">2720</p>
              <p className="text-sm text-gray-600">Steps today</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout Cards Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Your Workout</h3>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {/* Weight Lifting Card */}
          <Card className="card-yellow relative overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💪</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Weight Lifting</p>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500 text-white text-xs">5 Sets</Badge>
                      <span className="text-yellow-600 text-sm">⚡ 1000</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rope Skipping Card */}
          <Card className="card-blue relative overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🏃</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Rope Skipping</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trainer Cards */}
      <div className="space-y-4">
        {/* Andy Hansen Trainer Card */}
        <Card className="card-peach relative overflow-hidden">
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

        {/* Join Andy Card */}
        <Card className="card-blue relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Badge className="bg-black text-white text-xs px-3 mb-3">Cardio</Badge>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold">4.4</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Join Andy</h3>
                <p className="text-sm text-gray-600 mb-3">2pm - 3pm</p>
                
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <Avatar className="w-6 h-6 border-2 border-white">
                      <AvatarFallback className="bg-purple-400 text-white text-xs">M</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-6 h-6 border-2 border-white">
                      <AvatarFallback className="bg-blue-400 text-white text-xs">S</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs text-gray-600">Join the group</span>
                </div>
              </div>
              
              <div className="w-20 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/api/placeholder/trainer-2')] bg-cover bg-center" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-8" />
    </div>
  );
}