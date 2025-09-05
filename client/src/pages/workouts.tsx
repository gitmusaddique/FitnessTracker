import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertWorkoutSchema } from "@shared/schema";
import type { Workout, InsertWorkout } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { 
  Plus, 
  X, 
  Dumbbell, 
  Clock, 
  Target, 
  Flame,
  Trash2,
  Timer,
  Weight,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  Repeat,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";

const workoutTypeData = {
  strength: { icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500/10" },
  cardio: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
  yoga: { icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
  sports: { icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
  hiit: { icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
  flexibility: { icon: RotateCcw, color: "text-pink-500", bg: "bg-pink-500/10" }
};

const intensityLevels = {
  low: { color: "text-green-500", label: "Low" },
  moderate: { color: "text-orange-400", label: "Moderate" },
  high: { color: "text-red-500", label: "High" }
};

export default function WorkoutsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: workouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const form = useForm<InsertWorkout>({
    resolver: zodResolver(insertWorkoutSchema),
    defaultValues: {
      userId: user?.id || "",
      name: "",
      type: "",
      category: "",
      duration: 0,
      calories: 0,
      distance: 0,
      intensity: "moderate",
      personalRecord: 0,
      notes: ""
    }
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: InsertWorkout) => {
      const response = await apiRequest("POST", "/api/workouts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      form.reset();
      setShowAddForm(false);
      toast({
        title: "Workout completed!",
        description: "Great job! Your workout has been logged successfully."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to log workout",
        description: error.message
      });
    }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout deleted",
        description: "Your workout has been removed."
      });
    }
  });

  const handleSubmit = (data: InsertWorkout) => {
    createWorkoutMutation.mutate({
      ...data,
      userId: user?.id || "",
      duration: Number(data.duration),
      calories: data.calories ? Number(data.calories) : undefined,
      distance: data.distance ? Number(data.distance) : undefined,
      personalRecord: data.personalRecord ? 1 : 0
    });
  };

  // Calculate stats
  const todayWorkouts = workouts.filter(w => {
    const today = new Date();
    const workoutDate = new Date(w.date!);
    return workoutDate.toDateString() === today.toDateString();
  });

  const weeklyWorkouts = workouts.filter(w => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(w.date!) > weekAgo;
  });

  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const personalRecords = workouts.filter(w => w.personalRecord).length;

  const filteredWorkouts = workouts.filter(workout => {
    if (activeFilter === "all") return true;
    return workout.type === activeFilter;
  });

  const workoutTypes = ["strength", "cardio", "yoga", "sports", "hiit", "flexibility"];

  if (showAddForm) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Log Workout</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAddForm(false)}
            data-testid="button-close-form"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              className="mt-2"
              placeholder="e.g. Morning Push Day"
              data-testid="input-workout-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(value) => form.setValue("type", value)}>
                <SelectTrigger className="mt-2" data-testid="select-workout-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="intensity">Intensity</Label>
              <Select onValueChange={(value) => form.setValue("intensity", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                {...form.register("duration", { valueAsNumber: true })}
                className="mt-2"
                placeholder="45"
                data-testid="input-duration"
              />
            </div>
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                {...form.register("calories", { valueAsNumber: true })}
                className="mt-2"
                placeholder="350"
                data-testid="input-calories"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Select onValueChange={(value) => form.setValue("category", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upper">Upper Body</SelectItem>
                <SelectItem value="lower">Lower Body</SelectItem>
                <SelectItem value="full-body">Full Body</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="pull">Pull</SelectItem>
                <SelectItem value="core">Core</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="distance">Distance (km, optional)</Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              {...form.register("distance", { valueAsNumber: true })}
              className="mt-2"
              placeholder="5.0"
              data-testid="input-distance"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="personalRecord"
              type="checkbox"
              {...form.register("personalRecord")}
              className="rounded"
            />
            <Label htmlFor="personalRecord" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>Personal Record</span>
            </Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="mt-2 h-24"
              placeholder="How did it go? Any notes about the workout..."
              data-testid="textarea-notes"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
            disabled={createWorkoutMutation.isPending}
            data-testid="button-save-workout"
          >
            {createWorkoutMutation.isPending ? "Logging..." : "Complete Workout"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Workouts</h2>
          <p className="text-sm text-muted-foreground">
            {todayWorkouts.length} workout{todayWorkouts.length !== 1 ? 's' : ''} today
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
          data-testid="button-add-workout"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{weeklyWorkouts.length}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{Math.round(totalDuration / 60)}h</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{personalRecords}</p>
            <p className="text-xs text-muted-foreground">PRs</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "all"
              ? "bg-blue-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          data-testid="filter-all"
        >
          All
        </button>
        {workoutTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              activeFilter === type
                ? "bg-blue-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-testid={`filter-${type}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Workout History */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="w-32 h-4 bg-muted rounded" />
                      <div className="w-24 h-3 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
              <p className="text-muted-foreground mb-6">
                Ready to start your fitness journey? Log your first workout!
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
                data-testid="button-add-first-workout"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredWorkouts.map((workout) => {
            const typeData = workoutTypeData[workout.type as keyof typeof workoutTypeData] || workoutTypeData.strength;
            const intensityData = intensityLevels[workout.intensity as keyof typeof intensityLevels];
            const IconComponent = typeData.icon;
            
            return (
              <Card key={workout.id} className="overflow-hidden" data-testid={`workout-card-${workout.id}`}>
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeData.bg}`}>
                          <IconComponent className={`w-6 h-6 ${typeData.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold" data-testid={`workout-name-${workout.id}`}>
                              {workout.name || workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                            </h3>
                            {workout.personalRecord && (
                              <Trophy className="w-4 h-4 text-cyan-400" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{new Date(workout.date!).toLocaleDateString()}</span>
                            {workout.category && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{workout.category}</span>
                              </>
                            )}
                            {workout.intensity && (
                              <>
                                <span>•</span>
                                <span className={intensityData?.color}>
                                  {intensityData?.label}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkoutMutation.mutate(workout.id)}
                        disabled={deleteWorkoutMutation.isPending}
                        data-testid={`button-delete-workout-${workout.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold" data-testid={`workout-duration-${workout.id}`}>
                          {workout.duration}m
                        </p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Flame className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold text-orange-500" data-testid={`workout-calories-${workout.id}`}>
                          {workout.calories || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Target className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold text-blue-500" data-testid={`workout-distance-${workout.id}`}>
                          {workout.distance ? `${workout.distance}km` : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">Distance</p>
                      </div>
                    </div>

                    {workout.notes && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm" data-testid={`workout-notes-${workout.id}`}>
                          {workout.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}