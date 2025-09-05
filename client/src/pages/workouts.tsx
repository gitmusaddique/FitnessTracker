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
  MoreHorizontal,
  Trash2
} from "lucide-react";

const workoutTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  running: Target,
  strength: Dumbbell,
  yoga: Target,
  cardio: Flame,
  cycling: Target,
};

export default function WorkoutsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: workouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const form = useForm<InsertWorkout>({
    resolver: zodResolver(insertWorkoutSchema),
    defaultValues: {
      userId: user?.id || "",
      type: "",
      duration: 0,
      calories: 0,
      distance: 0,
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
        title: "Workout logged!",
        description: "Your workout has been added successfully."
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
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete workout",
        description: error.message
      });
    }
  });

  const handleSubmit = (data: InsertWorkout) => {
    createWorkoutMutation.mutate({
      ...data,
      userId: user?.id || "",
      duration: Number(data.duration),
      calories: data.calories ? Number(data.calories) : undefined,
      distance: data.distance ? Number(data.distance) : undefined
    });
  };

  const filteredWorkouts = workouts.filter(workout => {
    if (activeFilter === "all") return true;
    return workout.type === activeFilter;
  });

  const workoutTypes = ["running", "strength", "yoga", "cardio"];

  if (showAddForm) {
    return (
      <div className="p-4 pb-24 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Workout</h2>
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
            <Label htmlFor="type">Workout Type</Label>
            <Select onValueChange={(value) => form.setValue("type", value)}>
              <SelectTrigger className="mt-2" data-testid="select-workout-type">
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="cycling">Cycling</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              className="mt-2"
              placeholder="Enter duration"
              data-testid="input-duration"
            />
            {form.formState.errors.duration && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.duration.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="calories">Calories Burned (optional)</Label>
            <Input
              id="calories"
              type="number"
              {...form.register("calories", { valueAsNumber: true })}
              className="mt-2"
              placeholder="Enter calories burned"
              data-testid="input-calories"
            />
          </div>

          <div>
            <Label htmlFor="distance">Distance (km, optional)</Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              {...form.register("distance", { valueAsNumber: true })}
              className="mt-2"
              placeholder="Enter distance"
              data-testid="input-distance"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="mt-2 h-24"
              placeholder="Add workout notes..."
              data-testid="textarea-notes"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={createWorkoutMutation.isPending}
            data-testid="button-save-workout"
          >
            {createWorkoutMutation.isPending ? "Saving..." : "Save Workout"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div 
      className="p-4 pb-20 max-w-md mx-auto"
      style={{ 
        minHeight: '100vh', 
        paddingBottom: '100px',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Workouts</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:opacity-90"
          data-testid="button-add-workout"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Workout
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 bg-muted/30 p-1 rounded-lg">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "tab-active text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid="filter-all"
        >
          All
        </button>
        {workoutTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === type
                ? "tab-active text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`filter-${type}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Workout History */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div>
                      <div className="w-24 h-4 bg-muted rounded mb-2" />
                      <div className="w-32 h-3 bg-muted rounded" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="text-center">
                      <div className="w-12 h-6 bg-muted rounded mx-auto mb-1" />
                      <div className="w-16 h-3 bg-muted rounded mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your fitness journey by logging your first workout!
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-primary to-accent"
                data-testid="button-add-first-workout"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredWorkouts.map((workout) => {
            const IconComponent = workoutTypeIcons[workout.type] || Dumbbell;
            return (
              <Card key={workout.id} className="workout-card" data-testid={`workout-card-${workout.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize" data-testid={`workout-type-${workout.id}`}>
                          {workout.type.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`workout-date-${workout.id}`}>
                          {new Date(workout.date!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWorkoutMutation.mutate(workout.id)}
                      disabled={deleteWorkoutMutation.isPending}
                      data-testid={`button-delete-workout-${workout.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary" data-testid={`workout-duration-${workout.id}`}>
                        {workout.duration}m
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-accent" data-testid={`workout-distance-${workout.id}`}>
                        {workout.distance ? `${workout.distance}km` : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">Distance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-secondary" data-testid={`workout-calories-${workout.id}`}>
                        {workout.calories || '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                  </div>

                  {workout.notes && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground" data-testid={`workout-notes-${workout.id}`}>
                        {workout.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
