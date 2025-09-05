import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin-layout";
import { useAdminAuth, adminApiRequest } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { Link } from "wouter";
import type { Trainer, Gym } from "@shared/schema";
import { 
  Users, 
  MapPin, 
  Plus, 
  TrendingUp, 
  Calendar,
  Star,
  Activity
} from "lucide-react";

function AdminDashboard() {
  const { data: trainers = [] } = useQuery<Trainer[]>({
    queryKey: ["/admin/api/trainers"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/admin/api/trainers");
      return response.json();
    }
  });

  const { data: gyms = [] } = useQuery<Gym[]>({
    queryKey: ["/admin/api/gyms"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/admin/api/gyms");
      return response.json();
    }
  });

  const stats = {
    totalTrainers: trainers.length,
    activeTrainers: trainers.filter(t => t.isActive).length,
    totalGyms: gyms.length,
    avgTrainerRating: trainers.length > 0 ? 
      trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length : 0
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-muted-foreground">Manage your fitness platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalTrainers}</div>
              <div className="text-xs text-muted-foreground">Total Trainers</div>
              <Badge variant="secondary" className="mt-1">
                {stats.activeTrainers} active
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalGyms}</div>
              <div className="text-xs text-muted-foreground">Total Gyms</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.avgTrainerRating.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {trainers.reduce((sum, t) => sum + (t.reviewCount || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Link href="/admin/trainers/add">
                <Button className="w-full justify-start" data-testid="button-add-trainer">
                  <Users className="w-4 h-4 mr-2" />
                  Add New Trainer
                </Button>
              </Link>
              <Link href="/admin/gyms/add">
                <Button className="w-full justify-start" variant="outline" data-testid="button-add-gym">
                  <MapPin className="w-4 h-4 mr-2" />
                  Add New Gym
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainers.slice(0, 3).map((trainer) => (
              <div key={trainer.id} className="flex items-center space-x-3 py-2">
                {trainer.photoUrl ? (
                  <img
                    src={trainer.photoUrl}
                    alt={trainer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">{trainer.name}</div>
                  <div className="text-sm text-muted-foreground">{trainer.specialty}</div>
                </div>
                <Badge variant={trainer.isActive ? "default" : "secondary"}>
                  {trainer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
            {trainers.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No trainers yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}