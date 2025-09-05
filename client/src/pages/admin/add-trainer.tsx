import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { useAdminAuth, adminAuthManager } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { insertTrainerSchema, type InsertTrainer } from "@shared/schema";
import { Camera, Upload, X } from "lucide-react";

function AddTrainerForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<InsertTrainer>({
    resolver: zodResolver(insertTrainerSchema),
    defaultValues: {
      name: "",
      email: "",
      specialty: "",
      bio: "",
      price: 5000,
      rating: 0,
      reviewCount: 0,
      location: "",
      contact: "",
      experience: 0,
      certifications: "",
      isVerified: 0,
      isActive: 1
    }
  });

  const createTrainerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/admin/api/trainers", {
        method: "POST",
        headers: adminAuthManager.getAuthHeaders(),
        body: data
      });
      if (!response.ok) throw new Error("Failed to create trainer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      toast({ title: "Trainer created successfully" });
      setLocation("/admin/trainers");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create trainer",
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
    const input = document.getElementById('trainer-photo') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSubmit = (data: InsertTrainer) => {
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
    
    createTrainerMutation.mutate(formData);
  };

  return (
    <AdminLayout title="Add Trainer" showBackButton backPath="/admin/trainers">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Trainer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-4">
                <Label>Profile Photo</Label>
                <div className="flex flex-col items-center space-y-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-border"
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
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <Label htmlFor="trainer-photo" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                    </div>
                    <Input
                      id="trainer-photo"
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="specialty">Specialty *</Label>
                <Input
                  {...form.register("specialty")}
                  placeholder="Strength Training, Yoga, etc."
                  data-testid="input-specialty"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  {...form.register("bio")}
                  placeholder="Tell us about the trainer..."
                  className="min-h-[100px]"
                  data-testid="input-bio"
                />
              </div>

              {/* Pricing & Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price per Hour (cents) *</Label>
                  <Input
                    {...form.register("price", { valueAsNumber: true })}
                    type="number"
                    placeholder="5000"
                    data-testid="input-price"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter price in cents (e.g., 5000 = $50.00)
                  </p>
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    {...form.register("experience", { valueAsNumber: true })}
                    type="number"
                    placeholder="5"
                    data-testid="input-experience"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    {...form.register("location")}
                    placeholder="Downtown Gym"
                    data-testid="input-location"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    {...form.register("contact")}
                    placeholder="Phone or email"
                    data-testid="input-contact"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Input
                  {...form.register("certifications")}
                  placeholder="NASM, ACE, ACSM, etc."
                  data-testid="input-certifications"
                />
              </div>

              {/* Status Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Active trainers appear in the app
                    </p>
                  </div>
                  <Switch
                    {...form.register("isActive")}
                    defaultChecked={true}
                    data-testid="switch-active"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isVerified">Verified</Label>
                    <p className="text-sm text-muted-foreground">
                      Verified trainers get a badge
                    </p>
                  </div>
                  <Switch
                    {...form.register("isVerified")}
                    data-testid="switch-verified"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={createTrainerMutation.isPending}
                  className="flex-1"
                  data-testid="button-create-trainer"
                >
                  {createTrainerMutation.isPending ? "Creating..." : "Create Trainer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/trainers")}
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

export default function AdminAddTrainerPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AddTrainerForm />;
}