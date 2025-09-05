import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth, adminAuthManager } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { useLocation, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { insertTrainerSchema, type InsertTrainer } from "@shared/schema";
import { Camera, Upload, X, ArrowLeft, Save } from "lucide-react";

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
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }
    
    createTrainerMutation.mutate(formData);
  };

  const handleCancel = () => {
    setLocation("/admin/trainers");
  };

  return (
    <div className="p-4 pb-20 pt-16 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin/trainers">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Add Trainer</h2>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Photo Upload */}
        <Card className="p-4">
          <div className="space-y-4">
            <Label>Profile Photo</Label>
            <div className="flex flex-col items-center space-y-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
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
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              
              <Label htmlFor="trainer-photo" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors text-sm">
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
        </Card>

        {/* Basic Info */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
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
              placeholder="john@example.com"
              type="email"
              data-testid="input-email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="specialty">Specialty *</Label>
            <Input
              {...form.register("specialty")}
              placeholder="e.g., Strength Training"
              data-testid="input-specialty"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              {...form.register("bio")}
              placeholder="Brief description about the trainer..."
              rows={3}
              data-testid="input-bio"
            />
          </div>
        </Card>

        {/* Professional Details */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Professional Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price per hour (cents) *</Label>
              <Input
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="5000"
                data-testid="input-price"
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                type="number"
                {...form.register("experience", { valueAsNumber: true })}
                placeholder="5"
                data-testid="input-experience"
              />
            </div>
          </div>

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
              placeholder="Phone or additional email"
              data-testid="input-contact"
            />
          </div>

          <div>
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              {...form.register("certifications")}
              placeholder="e.g., NASM, ACE, ACSM"
              data-testid="input-certifications"
            />
          </div>
        </Card>

        {/* Status Settings */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Status</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
              <p className="text-xs text-muted-foreground">
                Whether the trainer is accepting new clients
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.watch("isActive") === 1}
              onCheckedChange={(checked) => 
                form.setValue("isActive", checked ? 1 : 0)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isVerified" className="text-sm font-medium">Verified</Label>
              <p className="text-xs text-muted-foreground">
                Mark as verified trainer
              </p>
            </div>
            <Switch
              id="isVerified"
              checked={form.watch("isVerified") === 1}
              onCheckedChange={(checked) => 
                form.setValue("isVerified", checked ? 1 : 0)
              }
            />
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
            disabled={createTrainerMutation.isPending}
            className="flex-1"
            data-testid="button-save"
          >
            {createTrainerMutation.isPending ? (
              "Creating..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Trainer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AddTrainerPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AddTrainerForm />;
}