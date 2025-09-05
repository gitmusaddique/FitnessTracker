import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Trainer } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Users,
  Calendar
} from "lucide-react";

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: trainers = [], isLoading } = useQuery<Trainer[]>({
    queryKey: searchQuery ? ["/api/trainers", "search", searchQuery] : ["/api/trainers"],
  });

  const bookTrainerMutation = useMutation({
    mutationFn: async (trainerId: string) => {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 1); // Book for tomorrow
      
      const response = await apiRequest("POST", "/api/bookings", {
        trainerId,
        date: bookingDate.toISOString(),
        status: "pending",
        notes: ""
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking request sent!",
        description: "The trainer will be notified of your booking request."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message
      });
    }
  });

  const handleBookTrainer = (trainerId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book a trainer session."
      });
      return;
    }
    bookTrainerMutation.mutate(trainerId);
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-white text-white" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-white/50 text-white" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-outline-variant" />);
    }

    return stars;
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Find Trainers</h2>
        <Button variant="ghost" size="icon" data-testid="button-filter">
          <Filter className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
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

      {/* Trainer Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="w-32 h-5 bg-muted rounded mb-2" />
                      <div className="w-24 h-4 bg-muted rounded mb-2" />
                      <div className="w-40 h-4 bg-muted rounded" />
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-5 bg-muted rounded mb-1" />
                      <div className="w-20 h-3 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="w-full h-16 bg-muted rounded mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-4 bg-muted rounded" />
                    <div className="w-24 h-8 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms." : "No trainers available at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          trainers.map((trainer) => (
            <Card key={trainer.id} data-testid={`trainer-card-${trainer.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
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
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" data-testid={`trainer-name-${trainer.id}`}>
                      {trainer.name}
                    </h3>
                    <p className="text-primary font-medium" data-testid={`trainer-specialty-${trainer.id}`}>
                      {trainer.specialty}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex mr-2">
                        {renderStars(trainer.rating || 0)}
                      </div>
                      <span className="text-sm text-muted-foreground" data-testid={`trainer-rating-${trainer.id}`}>
                        {trainer.rating?.toFixed(1)} ({trainer.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" data-testid={`trainer-price-${trainer.id}`}>
                      {formatPrice(trainer.price)}/hr
                    </p>
                    <p className="text-sm text-muted-foreground">per session</p>
                  </div>
                </div>

                {trainer.bio && (
                  <p className="text-sm text-muted-foreground mb-4" data-testid={`trainer-bio-${trainer.id}`}>
                    {trainer.bio}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {trainer.location && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span data-testid={`trainer-location-${trainer.id}`}>{trainer.location}</span>
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Available Today
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBookTrainer(trainer.id)}
                    disabled={bookTrainerMutation.isPending}
                    className="bg-primary hover:opacity-90"
                    data-testid={`button-book-trainer-${trainer.id}`}
                  >
                    {bookTrainerMutation.isPending ? "Booking..." : "Book Session"}
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
