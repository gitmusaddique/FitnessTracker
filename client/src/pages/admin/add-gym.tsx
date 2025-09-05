import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth, adminAuthManager } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { useLocation, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { insertGymSchema, type InsertGym } from "@shared/schema";
import { Camera, Upload, X, ArrowLeft, Save } from "lucide-react";

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
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }
    
    createGymMutation.mutate(formData);
  };

  const handleCancel = () => {
    setLocation("/admin/gyms");
  };

  return (
    <div className="p-4 pb-20 pt-16 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin/gyms">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Add Gym</h2>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Photo Upload */}
        <Card className="p-4">
          <div className="space-y-4">
            <Label>Gym Photo</Label>
            <div className="flex flex-col items-center space-y-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-18 rounded-lg object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                    onClick={removePhoto}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-18 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              
              <Label htmlFor="gym-photo" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors text-sm">
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
        </Card>

        {/* Basic Info */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
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

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              {...form.register("address")}
              placeholder="123 Main Street"
              data-testid="input-address"
            />
          </div>

          <div>
            <Label htmlFor="hours">Hours</Label>
            <Input
              {...form.register("hours")}
              placeholder="6am-10pm"
              data-testid="input-hours"
            />
          </div>
        </Card>

        {/* Pricing & Contact */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Pricing & Contact</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Monthly Price (cents) *</Label>
              <Input
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="4900"
                data-testid="input-price"
              />
            </div>
            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                type="number"
                step="0.1"
                {...form.register("distance", { valueAsNumber: true })}
                placeholder="2.5"
                data-testid="input-distance"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              {...form.register("email")}
              placeholder="info@gym.com"
              type="email"
              data-testid="input-email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              {...form.register("phone")}
              placeholder="(555) 123-4567"
              data-testid="input-phone"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              {...form.register("website")}
              placeholder="https://gym.com"
              data-testid="input-website"
            />
          </div>
        </Card>

        {/* Amenities */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Amenities</h3>
          
          <div>
            <Label htmlFor="amenities">Amenities Description</Label>
            <Textarea
              {...form.register("amenities")}
              placeholder="Free weights, cardio equipment, locker rooms..."
              rows={3}
              data-testid="input-amenities"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPool"
                checked={form.watch("hasPool") === 1}
                onCheckedChange={(checked) => 
                  form.setValue("hasPool", checked ? 1 : 0)
                }
              />
              <Label htmlFor="hasPool" className="text-sm font-medium">
                Swimming Pool
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSauna"
                checked={form.watch("hasSauna") === 1}
                onCheckedChange={(checked) => 
                  form.setValue("hasSauna", checked ? 1 : 0)
                }
              />
              <Label htmlFor="hasSauna" className="text-sm font-medium">
                Sauna
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasClasses"
                checked={form.watch("hasClasses") === 1}
                onCheckedChange={(checked) => 
                  form.setValue("hasClasses", checked ? 1 : 0)
                }
              />
              <Label htmlFor="hasClasses" className="text-sm font-medium">
                Group Classes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPT"
                checked={form.watch("hasPT") === 1}
                onCheckedChange={(checked) => 
                  form.setValue("hasPT", checked ? 1 : 0)
                }
              />
              <Label htmlFor="hasPT" className="text-sm font-medium">
                Personal Training
              </Label>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createGymMutation.isPending}
            className="flex-1"
            data-testid="button-save"
          >
            {createGymMutation.isPending ? (
              "Creating..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Gym
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AddGymPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AddGymForm />;
}