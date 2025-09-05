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
    mutationFn: async (data: InsertTrainer) => {
      const response = await adminApiRequest("POST", "/admin/api/trainers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      form.reset();
      setShowAddForm(false);
      toast({ title: "Trainer created successfully" });
    }
  });

  const handleSubmit = (data: InsertTrainer) => {
    createTrainerMutation.mutate({
      ...data,
      price: Number(data.price),
      rating: Number(data.rating),
      reviewCount: Number(data.reviewCount)
    });
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
            <div className="flex space-x-2">
              <Button type="submit" disabled={createTrainerMutation.isPending}>
                {createTrainerMutation.isPending ? "Creating..." : "Create Trainer"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{trainer.name}</h3>
                <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                <p className="text-sm">{trainer.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary">${(trainer.price / 100).toFixed(0)}/hr</Badge>
                  <Badge variant="outline">⭐ {trainer.rating}</Badge>
                  <span className="text-xs text-muted-foreground">{trainer.reviewCount} reviews</span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(trainer.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
    mutationFn: async (data: InsertGym) => {
      const response = await adminApiRequest("POST", "/admin/api/gyms", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/gyms"] });
      form.reset();
      setShowAddForm(false);
      toast({ title: "Gym created successfully" });
    }
  });

  const handleSubmit = (data: InsertGym) => {
    createGymMutation.mutate({
      ...data,
      price: Number(data.price),
      rating: Number(data.rating),
      reviewCount: Number(data.reviewCount),
      distance: Number(data.distance)
    });
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
            <div className="flex space-x-2">
              <Button type="submit" disabled={createGymMutation.isPending}>
                {createGymMutation.isPending ? "Creating..." : "Create Gym"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {gyms.map((gym) => (
            <div key={gym.id} className="flex items-center justify-between p-4 border rounded-lg">
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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(gym.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Admin Component
export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}