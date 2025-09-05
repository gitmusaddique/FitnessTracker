import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Gym } from "@shared/schema";
import { 
  Search,
  Map,
  Star,
  MapPin,
  Clock,
  Dumbbell
} from "lucide-react";

export default function GymsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: gyms = [], isLoading } = useQuery<Gym[]>({
    queryKey: ["/api/gyms", { search: searchQuery || undefined }],
  });

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
        <h2 className="text-2xl font-bold">Find Gyms</h2>
        <Button variant="ghost" size="icon" data-testid="button-map-view">
          <Map className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search gyms near you..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-gyms"
        />
      </div>

      {/* Gym Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="w-32 h-5 bg-muted rounded mb-2" />
                      <div className="w-40 h-4 bg-muted rounded" />
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-5 bg-muted rounded mb-1" />
                      <div className="w-20 h-3 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="w-40 h-4 bg-muted rounded mb-3" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="w-20 h-6 bg-muted rounded-full" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-4 bg-muted rounded" />
                    <div className="w-24 h-8 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gyms.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No gyms found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms." : "No gyms available in your area."}
              </p>
            </CardContent>
          </Card>
        ) : (
          gyms.map((gym) => (
            <Card key={gym.id} className="overflow-hidden" data-testid={`gym-card-${gym.id}`}>
              {gym.photoUrl && (
                <img
                  src={gym.photoUrl}
                  alt={gym.name}
                  className="w-full h-48 object-cover"
                  data-testid={`gym-photo-${gym.id}`}
                />
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold" data-testid={`gym-name-${gym.id}`}>
                      {gym.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center" data-testid={`gym-location-${gym.id}`}>
                      <MapPin className="w-4 h-4 mr-1" />
                      {gym.distance && `${gym.distance} km away • `}{gym.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary" data-testid={`gym-price-${gym.id}`}>
                      {formatPrice(gym.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex mr-2">
                    {renderStars(gym.rating || 0)}
                  </div>
                  <span className="text-sm text-muted-foreground" data-testid={`gym-rating-${gym.id}`}>
                    {gym.rating?.toFixed(1)} ({gym.reviewCount} reviews)
                  </span>
                </div>

                {gym.amenities && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gym.amenities.split(',').slice(0, 3).map((amenity: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`gym-amenity-${gym.id}-${index}`}
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {gym.amenities.split(',').length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{gym.amenities.split(',').length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {gym.hours && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span data-testid={`gym-hours-${gym.id}`}>{gym.hours}</span>
                      </span>
                    )}
                    <span className="text-sm text-success font-medium flex items-center">
                      <div className="w-2 h-2 bg-success rounded-full mr-2" />
                      Currently Open
                    </span>
                  </div>
                  <Button
                    variant="default"
                    className="bg-primary hover:opacity-90"
                    data-testid={`button-view-gym-${gym.id}`}
                  >
                    View Details
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
