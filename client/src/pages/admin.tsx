import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminAuthManager, useAdminAuth } from "@/lib/admin-auth";
import { adminLoginSchema } from "@shared/admin-schema";
import type { AdminLoginData } from "@shared/admin-schema";
import type { Trainer, Gym } from "@shared/schema";
import { Link } from "wouter";
import { 
  Shield, 
  Users, 
  Building, 
  Plus, 
  LogOut,
  Eye,
  EyeOff,
  ChevronRight
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

  // Dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/admin/api/stats"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/admin/api/stats");
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

  // Users data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/admin/api/users"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/admin/api/users");
      return res.json();
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
    <div className="p-4 pb-20 pt-16 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {admin?.username}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="button-admin-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{trainers.length}</p>
            <p className="text-xs text-muted-foreground">Trainers</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{gyms.length}</p>
            <p className="text-xs text-muted-foreground">Gyms</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats?.activeBookings || 0}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="space-y-3">
        <Card>
          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors"
              data-testid="button-manage-users"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">Manage Users</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
        </Card>

        <Card>
          <Link href="/admin/trainers">
            <Button
              variant="ghost"
              className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors"
              data-testid="button-manage-trainers"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">Manage Trainers</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
        </Card>

        <Card>
          <Link href="/admin/gyms">
            <Button
              variant="ghost"
              className="w-full p-4 h-auto justify-between hover:bg-muted/50 transition-colors"
              data-testid="button-manage-gyms"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-accent" />
                </div>
                <span className="font-medium">Manage Gyms</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Quick Add Actions */}
      <div className="mt-6 space-y-3">
        <Link href="/admin/trainers/add">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-add-trainer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Trainer
          </Button>
        </Link>
        <Link href="/admin/gyms/add">
          <Button
            variant="outline"
            className="w-full"
            data-testid="button-add-gym"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Gym
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      {trainers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trainers</h3>
          <div className="space-y-3">
            {trainers.slice(0, 3).map((trainer) => (
              <Card key={trainer.id} className="p-3">
                <div className="flex items-center space-x-3">
                  {trainer.photoUrl ? (
                    <img
                      src={trainer.photoUrl}
                      alt={trainer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{trainer.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{trainer.specialty}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={trainer.isActive ? "default" : "secondary"} className="text-xs">
                      {trainer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main export component
export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}

// Export login component for other pages
export { AdminLogin };