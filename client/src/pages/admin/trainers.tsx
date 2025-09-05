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
import type { Trainer } from "@shared/schema";
import { useState } from "react";
import { 
  Search,
  Filter,
  Star,
  Users,
  Plus,
  Edit,
  Trash2,
  MapPin
} from "lucide-react";

function TrainersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: trainers = [], isLoading } = useQuery<Trainer[]>({
    queryKey: ["/admin/api/trainers"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/admin/api/trainers");
      return response.json();
    }
  });

  const deleteTrainerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApiRequest("DELETE", `/admin/api/trainers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      toast({ title: "Trainer deleted successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete trainer" 
      });
    }
  });

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  return (
    <AdminLayout title="Manage Trainers" showBackButton>
      <div className="p-4 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trainers</h2>
          <Link href="/admin/trainers/add">
            <Button data-testid="button-add-trainer">
              <Plus className="w-4 h-4 mr-2" />
              Add Trainer
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-trainers"
          />
        </div>

        {/* Trainers List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-muted rounded-full" />
                      <div className="flex-1">
                        <div className="w-32 h-5 bg-muted rounded mb-2" />
                        <div className="w-24 h-4 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTrainers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search terms." : "Get started by adding your first trainer."}
                </p>
                <Link href="/admin/trainers/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Trainer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredTrainers.map((trainer) => (
              <Card key={trainer.id} data-testid={`trainer-card-${trainer.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {trainer.photoUrl ? (
                      <img
                        src={trainer.photoUrl}
                        alt={trainer.name}
                        className="w-16 h-16 rounded-full object-cover"
                        data-testid={`trainer-photo-${trainer.id}`}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`trainer-name-${trainer.id}`}>
                            {trainer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {trainer.specialty}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {trainer.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(trainer.price)}/hr
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="w-3 h-3 mr-1" />
                            {trainer.rating} ({trainer.reviewCount})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={trainer.isActive ? "default" : "secondary"}>
                            {trainer.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {trainer.isVerified && (
                            <Badge variant="outline">Verified</Badge>
                          )}
                          {trainer.location && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {trainer.location}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/admin/trainers/edit/${trainer.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-edit-trainer-${trainer.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTrainerMutation.mutate(trainer.id)}
                            disabled={deleteTrainerMutation.isPending}
                            data-testid={`button-delete-trainer-${trainer.id}`}
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

export default function AdminTrainersPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <TrainersManagement />;
}