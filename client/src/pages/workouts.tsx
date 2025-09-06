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
import type { Workout, InsertWorkout, Exercise } from "@shared/schema";
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
  Star,
  Camera
} from "lucide-react";

const workoutTypeData = {
  strength: { icon: Dumbbell, color: "text-primary", bg: "bg-primary-container" },
  cardio: { icon: Flame, color: "text-error", bg: "bg-error-container" },
  yoga: { icon: Target, color: "text-tertiary", bg: "bg-tertiary-container" },
  sports: { icon: Activity, color: "text-secondary", bg: "bg-secondary-container" },
  hiit: { icon: Zap, color: "text-warning", bg: "bg-warning/10" },
  flexibility: { icon: RotateCcw, color: "text-accent", bg: "bg-accent/10" }
};

const intensityLevels = {
  low: { color: "text-success", label: "Low" },
  moderate: { color: "text-surface-variant", label: "Moderate" },
  high: { color: "text-error", label: "High" }
};

export default function WorkoutsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<{exercise: Exercise, sets: number, reps: number, weight?: number}[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: workouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
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
    mutationFn: async (data: InsertWorkout & { file?: File }) => {
      const formData = new FormData();
      formData.append("userId", data.userId);
      formData.append("name", data.name);
      formData.append("type", data.type || "");
      if (data.category) formData.append("category", data.category);
      formData.append("duration", data.duration.toString());
      if (data.calories) formData.append("calories", data.calories.toString());
      if (data.distance) formData.append("distance", data.distance.toString());
      if (data.intensity) formData.append("intensity", data.intensity);
      if (data.personalRecord) formData.append("personalRecord", "true");
      if (data.notes) formData.append("notes", data.notes);
      if (data.file) formData.append("photo", data.file);

      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      form.reset();
      setSelectedFile(null);
      setSelectedExercises([]);
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
    if (selectedExercises.length === 0) {
      toast({
        variant: "destructive", 
        title: "No Exercises Selected",
        description: "Please select at least one exercise for your workout.",
      });
      return;
    }

    // Generate workout name from exercises
    const exerciseNames = selectedExercises.map(se => se.exercise.name);
    const workoutName = exerciseNames.length > 2 
      ? `${exerciseNames.slice(0, 2).join(', ')} + ${exerciseNames.length - 2} more`
      : exerciseNames.join(', ');

    // Store exercise data as JSON
    const exercisesData = selectedExercises.map(se => ({
      id: se.exercise.id,
      name: se.exercise.name,
      sets: se.sets,
      reps: se.reps,
      weight: se.weight,
      category: se.exercise.category,
      bodyPart: se.exercise.bodyPart
    }));

    createWorkoutMutation.mutate({
      ...data,
      userId: user?.id || "",
      name: workoutName,
      exercises: JSON.stringify(exercisesData),
      duration: Number(data.duration),
      calories: data.calories ? Number(data.calories) : undefined,
      distance: data.distance ? Number(data.distance) : undefined,
      personalRecord: data.personalRecord ? 1 : 0,
      file: selectedFile || undefined
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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
      <div className="p-4 pb-20 pt-20 max-w-md mx-auto">
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
            <Label>Select Exercises</Label>
            <div className="mt-2 space-y-3">
              <Select onValueChange={(exerciseId) => {
                const exercise = exercises.find(e => e.id === exerciseId);
                if (exercise && !selectedExercises.find(se => se.exercise.id === exerciseId)) {
                  setSelectedExercises([...selectedExercises, { exercise, sets: 3, reps: 10 }]);
                }
              }}>
                <SelectTrigger data-testid="select-exercise">
                  <SelectValue placeholder="Choose an exercise to add" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(exercise => (
                    <SelectItem 
                      key={exercise.id} 
                      value={exercise.id}
                      disabled={selectedExercises.some(se => se.exercise.id === exercise.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{exercise.name}</span>
                        <Badge variant="secondary" className="text-xs">{exercise.bodyPart}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedExercises.length > 0 && (
                <div className="space-y-2">
                  {selectedExercises.map((item, index) => (
                    <div key={item.exercise.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.exercise.name}</p>
                        <p className="text-xs text-muted-foreground">{item.exercise.bodyPart} • {item.exercise.difficulty}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Input 
                          type="number" 
                          value={item.sets} 
                          onChange={(e) => {
                            const updated = [...selectedExercises];
                            updated[index].sets = parseInt(e.target.value) || 0;
                            setSelectedExercises(updated);
                          }}
                          className="w-12 h-8 text-center" 
                          min="1"
                        />
                        <span>×</span>
                        <Input 
                          type="number" 
                          value={item.reps} 
                          onChange={(e) => {
                            const updated = [...selectedExercises];
                            updated[index].reps = parseInt(e.target.value) || 0;
                            setSelectedExercises(updated);
                          }}
                          className="w-12 h-8 text-center" 
                          min="1"
                        />
                        {item.exercise.category === 'strength' && (
                          <>
                            <span>@</span>
                            <Input 
                              type="number" 
                              value={item.weight || ''} 
                              onChange={(e) => {
                                const updated = [...selectedExercises];
                                updated[index].weight = parseFloat(e.target.value) || undefined;
                                setSelectedExercises(updated);
                              }}
                              className="w-16 h-8 text-center" 
                              placeholder="kg"
                              min="0"
                              step="0.5"
                            />
                          </>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedExercises(selectedExercises.filter(se => se.exercise.id !== item.exercise.id))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Photo</Label>
            <div className="mt-2">
              <label htmlFor="workout-photo-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors">
                  {selectedFile ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected workout"
                        className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-1/2 translate-x-6 -translate-y-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setSelectedFile(null)}
                        data-testid="button-remove-workout-photo"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <p className="text-primary font-medium text-sm">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Add workout photo</p>
                    </>
                  )}
                </div>
              </label>
              <input
                id="workout-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-workout-photo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(value) => form.setValue("type", value)}>
                <SelectTrigger className="mt-2" data-testid="select-workout-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(workoutTypeData).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
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
                  {Object.entries(intensityLevels).map(([value, data]) => (
                    <SelectItem key={value} value={value}>{data.label}</SelectItem>
                  ))}
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
              <Trophy className="w-4 h-4 text-foreground" />
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

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddForm(false)}
              data-testid="button-cancel-workout"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createWorkoutMutation.isPending}
              data-testid="button-save-workout"
            >
              {createWorkoutMutation.isPending ? "Logging..." : "Complete Workout"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 pt-20 max-w-md mx-auto">
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
          className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            <p className="text-2xl font-bold text-primary">{weeklyWorkouts.length}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{Math.round(totalDuration / 60)}h</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{personalRecords}</p>
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
              ? "bg-primary text-primary-foreground"
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
                ? "bg-primary text-primary-foreground"
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 h-auto text-base font-semibold rounded-lg shadow-lg"
                data-testid="button-add-first-workout"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredWorkouts.map((workout, index) => {
            const typeData = workoutTypeData[workout.type as keyof typeof workoutTypeData] || workoutTypeData.strength;
            const intensityData = intensityLevels[workout.intensity as keyof typeof intensityLevels];
            const IconComponent = typeData.icon;
            const workoutNumber = index + 1;
            
            return (
              <Card key={workout.id} className="overflow-hidden" data-testid={`workout-card-${workout.id}`}>
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {workout.photoUrl ? (
                            <img
                              src={workout.photoUrl}
                              alt={workout.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeData.bg}`}>
                              <IconComponent className={`w-6 h-6 ${typeData.color}`} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold" data-testid={`workout-name-${workout.id}`}>
                              {workoutNumber}. {workout.name || workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                            </h3>
                            {workout.personalRecord && (
                              <Trophy className="w-4 h-4 text-foreground" />
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
                        <p className="text-lg font-bold text-foreground" data-testid={`workout-calories-${workout.id}`}>
                          {workout.calories || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Target className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold text-primary" data-testid={`workout-distance-${workout.id}`}>
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