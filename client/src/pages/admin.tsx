import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { adminAuthManager, useAdminAuth } from "@/lib/admin-auth";
import { adminLoginSchema } from "@shared/admin-schema";
import { insertTrainerSchema, insertGymSchema } from "@shared/schema";
import type { AdminLoginData } from "@shared/admin-schema";
import type { User, Trainer, Gym, InsertTrainer, InsertGym } from "@shared/schema";
import { 
  Shield, 
  Users, 
  Dumbbell, 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";

// Admin API request function
async function adminApiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: HeadersInit = {
    ...adminAuthManager.getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

// Login Component
function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginData) => {
      const response = await fetch("/admin/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      adminAuthManager.setAuth(data.token, data.admin);
      toast({
        title: "Welcome Administrator",
        description: "Successfully logged into admin panel."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message
      });
    }
  });

  const handleSubmit = (data: AdminLoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <p className="text-muted-foreground">
            Enter your admin credentials to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...form.register("username")}
                className="mt-2"
                placeholder="Enter admin username"
                data-testid="input-admin-username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="Enter password"
                  data-testid="input-admin-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Admin Dashboard
function AdminDashboard() {
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/admin/api/stats"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/admin/api/stats");
      return res.json();
    }
  });

  // Users data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/admin/api/users"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/admin/api/users");
      return res.json();
    }
  });

  // Trainers data
  const { data: trainers = [] } = useQuery<Trainer[]>({
    queryKey: ["/admin/api/trainers"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/admin/api/trainers");
      return res.json();
    }
  });

  // Gyms data
  const { data: gyms = [] } = useQuery<Gym[]>({
    queryKey: ["/admin/api/gyms"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/admin/api/gyms");
      return res.json();
    }
  });

  // Delete mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApiRequest("DELETE", `/admin/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/admin/api/stats"] });
      toast({ title: "User deleted successfully" });
    }
  });

  const deleteTrainerMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApiRequest("DELETE", `/admin/api/trainers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      toast({ title: "Trainer deleted successfully" });
    }
  });

  const deleteGymMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApiRequest("DELETE", `/admin/api/gyms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/gyms"] });
      toast({ title: "Gym deleted successfully" });
    }
  });

  const handleLogout = () => {
    adminAuthManager.clearAuth();
    toast({
      title: "Logged out",
      description: "Successfully logged out of admin panel."
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {admin?.username}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTrainers}</p>
                    <p className="text-muted-foreground">Trainers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalGyms}</p>
                    <p className="text-muted-foreground">Gyms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeBookings}</p>
                    <p className="text-muted-foreground">Active Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="gyms">Gyms</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUserMutation.mutate(user.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers">
            <TrainerManagement 
              trainers={trainers} 
              onDelete={(id) => deleteTrainerMutation.mutate(id)} 
            />
          </TabsContent>

          {/* Gyms Tab */}
          <TabsContent value="gyms">
            <GymManagement 
              gyms={gyms} 
              onDelete={(id) => deleteGymMutation.mutate(id)} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Trainer Management Component
function TrainerManagement({ trainers, onDelete }: { trainers: Trainer[], onDelete: (id: string) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTrainer>({
    resolver: zodResolver(insertTrainerSchema),
    defaultValues: {
      name: "",
      email: "",
      specialty: "",
      bio: "",
      price: 0,
      rating: 0,
      reviewCount: 0,
      location: "",
      contact: ""
    }
  });

  const createTrainerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/admin/api/trainers", {
        method: "POST",
        headers: adminAuthManager.getAuthHeaders(),
        body: data
      });
      if (!response.ok) throw new Error("Failed to create trainer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      form.reset();
      setShowAddForm(false);
      setEditingTrainer(null);
      toast({ title: "Trainer created successfully" });
    }
  });

  const updateTrainerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: FormData }) => {
      const response = await fetch(`/admin/api/trainers/${id}`, {
        method: "PUT",
        headers: adminAuthManager.getAuthHeaders(),
        body: data
      });
      if (!response.ok) throw new Error("Failed to update trainer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      form.reset();
      setShowAddForm(false);
      setEditingTrainer(null);
      toast({ title: "Trainer updated successfully" });
    }
  });

  const handleSubmit = (data: InsertTrainer) => {
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add photo if selected
    const photoInput = document.getElementById('trainer-photo') as HTMLInputElement;
    if (photoInput?.files?.[0]) {
      formData.append('photo', photoInput.files[0]);
    }
    
    if (editingTrainer) {
      updateTrainerMutation.mutate({ id: editingTrainer.id, data: formData });
    } else {
      createTrainerMutation.mutate(formData);
    }
  };
  
  const startEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setShowAddForm(true);
    form.reset({
      name: trainer.name,
      email: trainer.email,
      specialty: trainer.specialty,
      bio: trainer.bio || "",
      price: trainer.price,
      rating: trainer.rating || 0,
      reviewCount: trainer.reviewCount || 0,
      location: trainer.location || "",
      contact: trainer.contact || "",
      experience: trainer.experience || 0,
      certifications: trainer.certifications || "",
      isVerified: trainer.isVerified || 0,
      isActive: trainer.isActive || 0
    });
  };
  
  const cancelEdit = () => {
    setEditingTrainer(null);
    setShowAddForm(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trainer Management</CardTitle>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Trainer
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input {...form.register("name")} placeholder="Trainer Name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...form.register("email")} placeholder="email@example.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input {...form.register("specialty")} placeholder="e.g., Strength Training" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea {...form.register("bio")} placeholder="Trainer bio..." />
            </div>
            <div>
              <Label htmlFor="trainer-photo">Photo</Label>
              <Input 
                id="trainer-photo"
                type="file" 
                accept="image/*"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (cents)</Label>
                <Input type="number" {...form.register("price", { valueAsNumber: true })} placeholder="5000" />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input type="number" step="0.1" {...form.register("rating", { valueAsNumber: true })} placeholder="4.5" />
              </div>
              <div>
                <Label htmlFor="reviewCount">Review Count</Label>
                <Input type="number" {...form.register("reviewCount", { valueAsNumber: true })} placeholder="10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input {...form.register("location")} placeholder="Downtown Gym" />
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input {...form.register("contact")} placeholder="contact@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Experience (years)</Label>
                <Input type="number" {...form.register("experience", { valueAsNumber: true })} placeholder="5" />
              </div>
              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Input {...form.register("certifications")} placeholder="NASM, ACE" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={createTrainerMutation.isPending || updateTrainerMutation.isPending}>
                {createTrainerMutation.isPending || updateTrainerMutation.isPending 
                  ? (editingTrainer ? "Updating..." : "Creating...") 
                  : (editingTrainer ? "Update Trainer" : "Create Trainer")}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-4 flex-1">
                {trainer.photoUrl && (
                  <img 
                    src={trainer.photoUrl} 
                    alt={trainer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{trainer.name}</h3>
                  <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                  <p className="text-sm">{trainer.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary">${(trainer.price / 100).toFixed(0)}/hr</Badge>
                    <Badge variant="outline">⭐ {trainer.rating}</Badge>
                    <span className="text-xs text-muted-foreground">{trainer.reviewCount} reviews</span>
                    {trainer.experience && <span className="text-xs text-muted-foreground">{trainer.experience}y exp</span>}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(trainer)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(trainer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Gym Management Component
function GymManagement({ gyms, onDelete }: { gyms: Gym[], onDelete: (id: string) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertGym>({
    resolver: zodResolver(insertGymSchema),
    defaultValues: {
      name: "",
      location: "",
      address: "",
      price: 0,
      rating: 0,
      reviewCount: 0,
      amenities: "",
      hours: "",
      distance: 0
    }
  });

  const createGymMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/admin/api/gyms", {
        method: "POST",
        headers: adminAuthManager.getAuthHeaders(),
        body: data
      });
      if (!response.ok) throw new Error("Failed to create gym");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/gyms"] });
      form.reset();
      setShowAddForm(false);
      setEditingGym(null);
      toast({ title: "Gym created successfully" });
    }
  });

  const updateGymMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: FormData }) => {
      const response = await fetch(`/admin/api/gyms/${id}`, {
        method: "PUT",
        headers: adminAuthManager.getAuthHeaders(),
        body: data
      });
      if (!response.ok) throw new Error("Failed to update gym");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/gyms"] });
      form.reset();
      setShowAddForm(false);
      setEditingGym(null);
      toast({ title: "Gym updated successfully" });
    }
  });

  const handleSubmit = (data: InsertGym) => {
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add photo if selected
    const photoInput = document.getElementById('gym-photo') as HTMLInputElement;
    if (photoInput?.files?.[0]) {
      formData.append('photo', photoInput.files[0]);
    }
    
    if (editingGym) {
      updateGymMutation.mutate({ id: editingGym.id, data: formData });
    } else {
      createGymMutation.mutate(formData);
    }
  };
  
  const startEdit = (gym: Gym) => {
    setEditingGym(gym);
    setShowAddForm(true);
    form.reset({
      name: gym.name,
      location: gym.location,
      address: gym.address,
      price: gym.price,
      rating: gym.rating || 0,
      reviewCount: gym.reviewCount || 0,
      amenities: gym.amenities || "",
      hours: gym.hours || "",
      distance: gym.distance || 0,
      email: gym.email || "",
      phone: gym.phone || "",
      website: gym.website || ""
    });
  };
  
  const cancelEdit = () => {
    setEditingGym(null);
    setShowAddForm(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gym Management</CardTitle>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gym
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input {...form.register("name")} placeholder="Gym Name" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input {...form.register("location")} placeholder="Downtown" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input {...form.register("address")} placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price">Price (cents)</Label>
                <Input type="number" {...form.register("price", { valueAsNumber: true })} placeholder="4900" />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input type="number" step="0.1" {...form.register("rating", { valueAsNumber: true })} placeholder="4.5" />
              </div>
              <div>
                <Label htmlFor="reviewCount">Reviews</Label>
                <Input type="number" {...form.register("reviewCount", { valueAsNumber: true })} placeholder="100" />
              </div>
              <div>
                <Label htmlFor="distance">Distance (km)</Label>
                <Input type="number" step="0.1" {...form.register("distance", { valueAsNumber: true })} placeholder="1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="amenities">Amenities (JSON array)</Label>
              <Input {...form.register("amenities")} placeholder='["Pool", "Sauna", "Gym"]' />
            </div>
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input {...form.register("hours")} placeholder="6 AM - 11 PM" />
            </div>
            <div>
              <Label htmlFor="gym-photo">Photo</Label>
              <Input 
                id="gym-photo"
                type="file" 
                accept="image/*"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...form.register("email")} placeholder="info@gym.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input {...form.register("phone")} placeholder="+1234567890" />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input {...form.register("website")} placeholder="https://gym.com" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={createGymMutation.isPending || updateGymMutation.isPending}>
                {createGymMutation.isPending || updateGymMutation.isPending 
                  ? (editingGym ? "Updating..." : "Creating...") 
                  : (editingGym ? "Update Gym" : "Create Gym")}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {gyms.map((gym) => (
            <div key={gym.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-4 flex-1">
                {gym.photoUrl && (
                  <img 
                    src={gym.photoUrl} 
                    alt={gym.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{gym.name}</h3>
                  <p className="text-sm text-muted-foreground">{gym.address}</p>
                  <p className="text-sm">{gym.location}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary">${(gym.price / 100).toFixed(0)}/month</Badge>
                    <Badge variant="outline">⭐ {gym.rating}</Badge>
                    <span className="text-xs text-muted-foreground">{gym.reviewCount} reviews</span>
                    <span className="text-xs text-muted-foreground">{gym.distance}km away</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(gym)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(gym.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Export AdminLogin for use in other admin pages
export { AdminLogin };

// Main Admin Component
export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}