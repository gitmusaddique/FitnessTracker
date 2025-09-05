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
import { insertMealSchema } from "@shared/schema";
import type { Meal, InsertMeal } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { 
  Plus, 
  X, 
  Camera, 
  Utensils,
  Trash2,
  Target,
  Apple,
  Coffee,
  Sandwich,
  Cookie,
  Zap,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Flame,
  Droplets,
  Wheat,
  Fish,
  ChefHat,
  Search,
  Heart
} from "lucide-react";

const mealTypeData = {
  breakfast: { icon: Coffee, color: "text-warning", bg: "bg-warning/10", label: "Breakfast" },
  lunch: { icon: Sandwich, color: "text-success", bg: "bg-success/10", label: "Lunch" },
  dinner: { icon: ChefHat, color: "text-primary", bg: "bg-primary-container", label: "Dinner" },
  snack: { icon: Cookie, color: "text-tertiary", bg: "bg-tertiary-container", label: "Snack" }
};

const macroColors = {
  protein: "text-error",
  carbs: "text-primary", 
  fat: "text-surface-variant",
  fiber: "text-success"
};

export default function MealsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
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
      mealType: "breakfast",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      notes: ""
    }
  });

  const createMealMutation = useMutation({
    mutationFn: async (data: InsertMeal & { file?: File }) => {
      const formData = new FormData();
      formData.append("userId", data.userId);
      formData.append("name", data.name);
      formData.append("mealType", data.mealType || "breakfast");
      formData.append("calories", data.calories.toString());
      if (data.protein) formData.append("protein", data.protein.toString());
      if (data.carbs) formData.append("carbs", data.carbs.toString());
      if (data.fat) formData.append("fat", data.fat.toString());
      if (data.fiber) formData.append("fiber", data.fiber.toString());
      if (data.sugar) formData.append("sugar", data.sugar.toString());
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
        description: "Your nutrition data has been recorded successfully."
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
    }
  });

  const handleSubmit = (data: InsertMeal) => {
    createMealMutation.mutate({
      ...data,
      userId: user?.id || "",
      calories: Number(data.calories),
      protein: data.protein ? Number(data.protein) : undefined,
      carbs: data.carbs ? Number(data.carbs) : undefined,
      fat: data.fat ? Number(data.fat) : undefined,
      fiber: data.fiber ? Number(data.fiber) : undefined,
      sugar: data.sugar ? Number(data.sugar) : undefined,
      file: selectedFile || undefined
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Calculate today's nutrition stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date!);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === today.getTime();
  });

  const todayStats = todayMeals.reduce((stats, meal) => ({
    calories: stats.calories + meal.calories,
    protein: stats.protein + (meal.protein || 0),
    carbs: stats.carbs + (meal.carbs || 0),
    fat: stats.fat + (meal.fat || 0),
    fiber: stats.fiber + (meal.fiber || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  // Goals (could be from user profile in real app)
  const goals = {
    calories: user?.dailyCalorieGoal || 2000,
    protein: 150, // grams
    carbs: 250,   // grams
    fat: 65,      // grams
    fiber: 25     // grams
  };

  const filteredMeals = meals.filter(meal => {
    if (activeFilter === "all") return true;
    return meal.mealType === activeFilter;
  });

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  if (showAddForm) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Log Meal</h2>
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
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors">
                  {selectedFile ? (
                    <div>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected meal"
                        className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                      />
                      <p className="text-primary font-medium text-sm">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Add photo of your meal</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Meal Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                className="mt-2"
                placeholder="e.g. Grilled Chicken Salad"
                data-testid="input-meal-name"
              />
            </div>
            <div>
              <Label htmlFor="mealType">Meal Type</Label>
              <Select onValueChange={(value) => form.setValue("mealType", value)}>
                <SelectTrigger className="mt-2" data-testid="select-meal-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Macronutrients (optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="protein" className="text-sm">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  {...form.register("protein", { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="carbs" className="text-sm">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  {...form.register("carbs", { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="fat" className="text-sm">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  {...form.register("fat", { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="fiber" className="text-sm">Fiber (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.1"
                  {...form.register("fiber", { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="mt-2 h-20"
              placeholder="How was it? Any notes about the meal..."
              data-testid="textarea-notes"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createMealMutation.isPending}
            data-testid="button-save-meal"
          >
            {createMealMutation.isPending ? "Logging..." : "Log Meal"}
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
          <h2 className="text-2xl font-bold">Nutrition</h2>
          <p className="text-sm text-muted-foreground">
            {todayMeals.length} meal{todayMeals.length !== 1 ? 's' : ''} logged today
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-add-meal"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Meal
        </Button>
      </div>

      {/* Daily Nutrition Summary */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-muted/10 pb-3">
          <CardTitle className="flex items-center text-lg">
            <Target className="w-5 h-5 mr-2" />
            Today's Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm">
                <span className="font-bold text-lg">{todayStats.calories.toLocaleString()}</span>
                <span className="text-muted-foreground"> / {goals.calories.toLocaleString()}</span>
              </span>
            </div>
            <Progress 
              value={(todayStats.calories / goals.calories) * 100} 
              className="h-2"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Protein</span>
                <span className="text-xs font-medium">{Math.round(todayStats.protein)}g / {goals.protein}g</span>
              </div>
              <Progress 
                value={(todayStats.protein / goals.protein) * 100} 
                className="h-1"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Carbs</span>
                <span className="text-xs font-medium">{Math.round(todayStats.carbs)}g / {goals.carbs}g</span>
              </div>
              <Progress 
                value={(todayStats.carbs / goals.carbs) * 100} 
                className="h-1"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Fat</span>
                <span className="text-xs font-medium">{Math.round(todayStats.fat)}g / {goals.fat}g</span>
              </div>
              <Progress 
                value={(todayStats.fat / goals.fat) * 100} 
                className="h-1"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Fiber</span>
                <span className="text-xs font-medium">{Math.round(todayStats.fiber)}g / {goals.fiber}g</span>
              </div>
              <Progress 
                value={(todayStats.fiber / goals.fiber) * 100} 
                className="h-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Type Filters */}
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
          All Meals
        </button>
        {mealTypes.map((type) => (
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
            {mealTypeData[type as keyof typeof mealTypeData]?.label || type}
          </button>
        ))}
      </div>

      {/* Meal History */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="w-32 h-4 bg-muted rounded" />
                      <div className="w-24 h-3 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMeals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meals logged</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your nutrition by logging your first meal!
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground"
                data-testid="button-add-first-meal"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredMeals.map((meal) => {
            const typeData = mealTypeData[meal.mealType as keyof typeof mealTypeData] || mealTypeData.breakfast;
            const IconComponent = typeData.icon;
            
            return (
              <Card key={meal.id} className="overflow-hidden" data-testid={`meal-card-${meal.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {meal.photoUrl ? (
                        <img
                          src={meal.photoUrl}
                          alt={meal.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${typeData.bg}`}>
                          <IconComponent className={`w-8 h-8 ${typeData.color}`} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold" data-testid={`meal-name-${meal.id}`}>
                            {meal.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {typeData.label}
                            </Badge>
                            <span>{new Date(meal.date!).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMealMutation.mutate(meal.id)}
                          disabled={deleteMealMutation.isPending}
                          data-testid={`button-delete-meal-${meal.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center mb-3">
                        <div>
                          <p className="text-lg font-bold text-foreground">{meal.calories}</p>
                          <p className="text-xs text-muted-foreground">cal</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{Math.round(meal.protein || 0)}g</p>
                          <p className="text-xs text-muted-foreground">protein</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{Math.round(meal.carbs || 0)}g</p>
                          <p className="text-xs text-muted-foreground">carbs</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{Math.round(meal.fat || 0)}g</p>
                          <p className="text-xs text-muted-foreground">fat</p>
                        </div>
                      </div>

                      {meal.notes && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-sm" data-testid={`meal-notes-${meal.id}`}>
                          {meal.notes}
                        </div>
                      )}
                    </div>
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