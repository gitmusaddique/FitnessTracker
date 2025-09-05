import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Building,
  ArrowLeft,
  Clock
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

  const handleDeleteGym = (gym: Gym) => {
    const confirmMessage = `Are you sure you want to delete gym "${gym.name}"?\n\nThis action cannot be undone and will:\n• Remove the gym from the system\n• Cancel any active memberships\n• Delete all gym data\n\nType "DELETE" to confirm this action.`;
    
    const userInput = window.prompt(confirmMessage);
    if (userInput === "DELETE") {
      deleteGymMutation.mutate(gym.id);
    } else if (userInput !== null) {
      toast({
        variant: "destructive",
        title: "Deletion cancelled",
        description: "You must type 'DELETE' to confirm this action"
      });
    }
  };

  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gym.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  return (
    <div className="p-4 pb-20 pt-16 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Gyms</h2>
        </div>
        <Link href="/admin/gyms/add">
          <Button size="sm" data-testid="button-add-gym">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search gyms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-gyms"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading gyms...</div>
        </div>
      )}

      {/* Gyms List */}
      <div className="space-y-4">
        {filteredGyms.map((gym) => (
          <Card key={gym.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                {gym.photoUrl ? (
                  <img
                    src={gym.photoUrl}
                    alt={gym.name}
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{gym.name}</h3>
                      <p className="text-sm text-muted-foreground">{gym.location}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/admin/gyms/edit/${gym.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          data-testid={`button-edit-gym-${gym.id}`}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handleDeleteGym(gym)}
                        disabled={deleteGymMutation.isPending}
                        data-testid={`button-delete-gym-${gym.id}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                      <span>{gym.rating || 0}</span>
                      <span className="text-muted-foreground ml-1">
                        ({gym.reviewCount || 0})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-primary">{formatPrice(gym.price)}</span>
                      <span className="text-muted-foreground ml-1">/mo</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    {gym.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">{gym.address}</span>
                      </div>
                    )}
                    {gym.distance && (
                      <span className="text-xs">{gym.distance}km away</span>
                    )}
                  </div>
                  
                  {gym.hours && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{gym.hours}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-wrap gap-1">
                      {gym.hasPool && (
                        <Badge variant="outline" className="text-xs">Pool</Badge>
                      )}
                      {gym.hasSauna && (
                        <Badge variant="outline" className="text-xs">Sauna</Badge>
                      )}
                      {gym.hasClasses && (
                        <Badge variant="outline" className="text-xs">Classes</Badge>
                      )}
                      {gym.hasPT && (
                        <Badge variant="outline" className="text-xs">PT</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredGyms.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No gyms found" : "No gyms yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "Try adjusting your search terms"
              : "Add your first gym to get started"
            }
          </p>
          {!searchQuery && (
            <Link href="/admin/gyms/add">
              <Button data-testid="button-add-first-gym">
                <Plus className="w-4 h-4 mr-2" />
                Add First Gym
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Total Count */}
      {gyms.length > 0 && (
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {filteredGyms.length} of {gyms.length} gyms
        </div>
      )}
    </div>
  );
}

export default function AdminGymsPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <GymsManagement />;
}