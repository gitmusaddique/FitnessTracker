import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMealSchema } from "@shared/schema";
import type { Meal, InsertMeal } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { 
  Plus, 
  X, 
  Camera, 
  Utensils,
  Trash2,
  Target
} from "lucide-react";

export default function MealsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: meals = [], isLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  const form = useForm<InsertMeal>({
    resolver: zodResolver(insertMealSchema),
    defaultValues: {
      userId: user?.id || "",
      name: "",
      calories: 0,
      notes: ""
    }
  });

  const createMealMutation = useMutation({
    mutationFn: async (data: InsertMeal & { file?: File }) => {
      const formData = new FormData();
      formData.append("userId", data.userId);
      formData.append("name", data.name);
      formData.append("calories", data.calories.toString());
      if (data.notes) formData.append("notes", data.notes);
      if (data.file) formData.append("photo", data.file);

      const response = await fetch("/api/meals", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      form.reset();
      setSelectedFile(null);
      setShowAddForm(false);
      toast({
        title: "Meal logged!",
        description: "Your meal has been added successfully."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to log meal",
        description: error.message
      });
    }
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Meal deleted",
        description: "Your meal has been removed."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete meal",
        description: error.message
      });
    }
  });

  const handleSubmit = (data: InsertMeal) => {
    createMealMutation.mutate({
      ...data,
      userId: user?.id || "",
      calories: Number(data.calories),
      file: selectedFile || undefined
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Calculate today's calories
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date!);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === today.getTime();
  });

  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieGoal = 2000;
  const calorieProgress = (todayCalories / calorieGoal) * 100;

  if (showAddForm) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Meal</h2>
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
            <Label>Photo</Label>
            <div className="mt-2">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {selectedFile ? (
                    <div>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected meal"
                        className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                      />
                      <p className="text-primary font-medium">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Tap to add photo</p>
                    </>
                  )}
                </div>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-photo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Meal Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              className="mt-2"
              placeholder="Enter meal name"
              data-testid="input-meal-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              {...form.register("calories", { valueAsNumber: true })}
              className="mt-2"
              placeholder="Enter calories"
              data-testid="input-calories"
            />
            {form.formState.errors.calories && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.calories.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="mt-2 h-24"
              placeholder="Add meal notes..."
              data-testid="textarea-notes"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={createMealMutation.isPending}
            data-testid="button-save-meal"
          >
            {createMealMutation.isPending ? "Saving..." : "Save Meal"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Meals</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:opacity-90"
          data-testid="button-add-meal"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Meal
        </Button>
      </div>

      {/* Daily Calorie Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Calories</h3>
            <span className="text-sm text-muted-foreground">Goal: {calorieGoal.toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Consumed</span>
                <span className="font-semibold" data-testid="text-calories-consumed">
                  {todayCalories.toLocaleString()} cal
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent" data-testid="text-calories-remaining">
                {Math.max(0, calorieGoal - todayCalories).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal History */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg" />
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-muted rounded mb-2" />
                      <div className="w-32 h-3 bg-muted rounded mb-2" />
                      <div className="w-40 h-3 bg-muted rounded" />
                    </div>
                    <div className="w-16 h-4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meals logged</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your nutrition by logging your first meal!
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-primary to-accent"
                data-testid="button-add-first-meal"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} data-testid={`meal-card-${meal.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {meal.photoUrl ? (
                    <img
                      src={meal.photoUrl}
                      alt={meal.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      data-testid={`meal-photo-${meal.id}`}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold" data-testid={`meal-name-${meal.id}`}>
                        {meal.name}
                      </h3>
                      <span className="text-sm text-primary font-semibold" data-testid={`meal-calories-${meal.id}`}>
                        {meal.calories} cal
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2" data-testid={`meal-date-${meal.id}`}>
                      {new Date(meal.date!).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    {meal.notes && (
                      <p className="text-sm text-muted-foreground" data-testid={`meal-notes-${meal.id}`}>
                        {meal.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMealMutation.mutate(meal.id)}
                    disabled={deleteMealMutation.isPending}
                    data-testid={`button-delete-meal-${meal.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
