import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { useAdminAuth, adminAuthManager } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { insertGymSchema, type InsertGym } from "@shared/schema";
import { Camera, Upload, X } from "lucide-react";

function AddGymForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<InsertGym>({
    resolver: zodResolver(insertGymSchema),
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
      toast({ title: "Gym created successfully" });
      setLocation("/admin/gyms");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create gym",
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
    setPhotoPreview(null);
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
    
    createGymMutation.mutate(formData);
  };

  return (
    <AdminLayout title="Add Gym" showBackButton backPath="/admin/gyms">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Gym</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-4">
                <Label>Gym Photo</Label>
                <div className="flex flex-col items-center space-y-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-32 rounded-lg object-cover border-4 border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={removePhoto}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <Label htmlFor="gym-photo" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors">
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

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="FitLife Gym"
                    data-testid="input-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
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

              {/* Pricing & Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Price (cents) *</Label>
                  <Input
                    {...form.register("price", { valueAsNumber: true })}
                    type="number"
                    placeholder="4900"
                    data-testid="input-price"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter price in cents (e.g., 4900 = $49.00)
                  </p>
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

              {/* Contact Info */}
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

              {/* Amenities Checkboxes */}
              <div className="space-y-4">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPool"
                      {...form.register("hasPool")}
                      onCheckedChange={(checked) => form.setValue("hasPool", checked ? 1 : 0)}
                      data-testid="checkbox-pool"
                    />
                    <Label htmlFor="hasPool">Swimming Pool</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSauna"
                      {...form.register("hasSauna")}
                      onCheckedChange={(checked) => form.setValue("hasSauna", checked ? 1 : 0)}
                      data-testid="checkbox-sauna"
                    />
                    <Label htmlFor="hasSauna">Sauna</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasClasses"
                      {...form.register("hasClasses")}
                      onCheckedChange={(checked) => form.setValue("hasClasses", checked ? 1 : 0)}
                      data-testid="checkbox-classes"
                    />
                    <Label htmlFor="hasClasses">Group Classes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPT"
                      {...form.register("hasPT")}
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
                  disabled={createGymMutation.isPending}
                  className="flex-1"
                  data-testid="button-create-gym"
                >
                  {createGymMutation.isPending ? "Creating..." : "Create Gym"}
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

export default function AdminAddGymPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AddGymForm />;
}