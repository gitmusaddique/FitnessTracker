import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { useAdminAuth, adminAuthManager, adminApiRequest } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { useLocation, useParams } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { insertGymSchema, type InsertGym, type Gym } from "@shared/schema";
import { Camera, Upload, X, Loader2 } from "lucide-react";

function EditGymForm() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: gym, isLoading } = useQuery<Gym>({
    queryKey: ["/admin/api/gyms", id],
    queryFn: async () => {
      const response = await adminApiRequest("GET", `/admin/api/gyms/${id}`);
      return response.json();
    },
    enabled: !!id
  });

  const form = useForm<InsertGym>({
    resolver: zodResolver(insertGymSchema.partial()),
    defaultValues: {
      name: "",
      location: "",
      address: "",
      price: 4900,
      rating: 0,
      reviewCount: 0,
      amenities: "",
      hours: "",
      distance: 0,
      hasPool: 0,
      hasSauna: 0,
      hasClasses: 0,
      hasPT: 0,
      email: "",
      phone: "",
      website: ""
    }
  });

  useEffect(() => {
    if (gym) {
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
        hasPool: gym.hasPool || 0,
        hasSauna: gym.hasSauna || 0,
        hasClasses: gym.hasClasses || 0,
        hasPT: gym.hasPT || 0,
        email: gym.email || "",
        phone: gym.phone || "",
        website: gym.website || ""
      });
      
      if (gym.photoUrl) {
        setPhotoPreview(gym.photoUrl);
      }
    }
  }, [gym, form]);

  const updateGymMutation = useMutation({
    mutationFn: async (data: FormData) => {
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
      toast({ title: "Gym updated successfully" });
      setLocation("/admin/gyms");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update gym",
        description: error.message
      });
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setPhotoPreview(gym?.photoUrl || null);
    const input = document.getElementById('gym-photo') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSubmit = (data: InsertGym) => {
    const formData = new FormData();
    
    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add photo if selected
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }
    
    updateGymMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Gym" showBackButton backPath="/admin/gyms">
        <div className="p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading gym...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!gym) {
    return (
      <AdminLayout title="Edit Gym" showBackButton backPath="/admin/gyms">
        <div className="p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Gym not found</h3>
              <p className="text-muted-foreground">The gym you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Gym" showBackButton backPath="/admin/gyms">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Gym: {gym.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-4">
                <Label>Gym Photo</Label>
                <div className="flex flex-col items-center space-y-4">
                  {photoPreview ? (
                    <div className="relative w-full">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-32 rounded-lg object-cover border-4 border-border"
                      />
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                          onClick={removePhoto}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <Label htmlFor="gym-photo" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                    </div>
                    <Input
                      id="gym-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>

              {/* Same form fields as add gym but with current values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="FitLife Gym"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    {...form.register("location")}
                    placeholder="Downtown"
                    data-testid="input-location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  {...form.register("address")}
                  placeholder="123 Main Street, City, State"
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Price (cents) *</Label>
                  <Input
                    {...form.register("price", { valueAsNumber: true })}
                    type="number"
                    placeholder="4900"
                    data-testid="input-price"
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    {...form.register("distance", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    placeholder="1.5"
                    data-testid="input-distance"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hours">Operating Hours</Label>
                <Input
                  {...form.register("hours")}
                  placeholder="Mon-Fri: 6 AM - 11 PM, Weekends: 7 AM - 10 PM"
                  data-testid="input-hours"
                />
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (JSON array)</Label>
                <Textarea
                  {...form.register("amenities")}
                  placeholder='["Pool", "Sauna", "Free WiFi", "Parking"]'
                  className="min-h-[80px]"
                  data-testid="input-amenities"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="info@fitlifegym.com"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    {...form.register("phone")}
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    {...form.register("website")}
                    placeholder="https://fitlifegym.com"
                    data-testid="input-website"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPool"
                      checked={form.watch("hasPool") === 1}
                      onCheckedChange={(checked) => form.setValue("hasPool", checked ? 1 : 0)}
                      data-testid="checkbox-pool"
                    />
                    <Label htmlFor="hasPool">Swimming Pool</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSauna"
                      checked={form.watch("hasSauna") === 1}
                      onCheckedChange={(checked) => form.setValue("hasSauna", checked ? 1 : 0)}
                      data-testid="checkbox-sauna"
                    />
                    <Label htmlFor="hasSauna">Sauna</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasClasses"
                      checked={form.watch("hasClasses") === 1}
                      onCheckedChange={(checked) => form.setValue("hasClasses", checked ? 1 : 0)}
                      data-testid="checkbox-classes"
                    />
                    <Label htmlFor="hasClasses">Group Classes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPT"
                      checked={form.watch("hasPT") === 1}
                      onCheckedChange={(checked) => form.setValue("hasPT", checked ? 1 : 0)}
                      data-testid="checkbox-pt"
                    />
                    <Label htmlFor="hasPT">Personal Training</Label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={updateGymMutation.isPending}
                  className="flex-1"
                  data-testid="button-update-gym"
                >
                  {updateGymMutation.isPending ? "Updating..." : "Update Gym"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/gyms")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminEditGymPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <EditGymForm />;
}