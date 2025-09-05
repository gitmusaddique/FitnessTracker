import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { useAdminAuth, adminApiRequest } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import type { Gym } from "@shared/schema";
import { useState } from "react";
import { 
  Search,
  Star,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Building
} from "lucide-react";

function GymsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: gyms = [], isLoading } = useQuery<Gym[]>({
    queryKey: ["/admin/api/gyms"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/admin/api/gyms");
      return response.json();
    }
  });

  const deleteGymMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApiRequest("DELETE", `/admin/api/gyms/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/gyms"] });
      toast({ title: "Gym deleted successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete gym" 
      });
    }
  });

  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gym.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  return (
    <AdminLayout title="Manage Gyms" showBackButton>
      <div className="p-4 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gyms</h2>
          <Link href="/admin/gyms/add">
            <Button data-testid="button-add-gym">
              <Plus className="w-4 h-4 mr-2" />
              Add Gym
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search gyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-gyms"
          />
        </div>

        {/* Gyms List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <div className="w-32 h-5 bg-muted rounded mb-2" />
                        <div className="w-24 h-4 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGyms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No gyms found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search terms." : "Get started by adding your first gym."}
                </p>
                <Link href="/admin/gyms/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Gym
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredGyms.map((gym) => (
              <Card key={gym.id} data-testid={`gym-card-${gym.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {gym.photoUrl ? (
                      <img
                        src={gym.photoUrl}
                        alt={gym.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        data-testid={`gym-photo-${gym.id}`}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`gym-name-${gym.id}`}>
                            {gym.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {gym.address}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            {gym.location} • {gym.distance}km away
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(gym.price)}/month
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="w-3 h-3 mr-1" />
                            {gym.rating} ({gym.reviewCount})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-wrap gap-1">
                          {gym.hasPool && <Badge variant="outline">Pool</Badge>}
                          {gym.hasSauna && <Badge variant="outline">Sauna</Badge>}
                          {gym.hasClasses && <Badge variant="outline">Classes</Badge>}
                          {gym.hasPT && <Badge variant="outline">PT</Badge>}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/admin/gyms/edit/${gym.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-edit-gym-${gym.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteGymMutation.mutate(gym.id)}
                            disabled={deleteGymMutation.isPending}
                            data-testid={`button-delete-gym-${gym.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminGymsPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <GymsManagement />;
}