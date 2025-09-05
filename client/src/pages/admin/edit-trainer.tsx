import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { useAdminAuth, adminAuthManager, adminApiRequest } from "@/lib/admin-auth";
import { AdminLogin } from "../admin";
import { useLocation, useParams } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { insertTrainerSchema, type InsertTrainer, type Trainer } from "@shared/schema";
import { Camera, Upload, X, Loader2 } from "lucide-react";

function EditTrainerForm() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: trainer, isLoading } = useQuery<Trainer>({
    queryKey: ["/admin/api/trainers", id],
    queryFn: async () => {
      const response = await adminApiRequest("GET", `/admin/api/trainers/${id}`);
      return response.json();
    },
    enabled: !!id
  });

  const form = useForm<InsertTrainer>({
    resolver: zodResolver(insertTrainerSchema.partial()),
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

  useEffect(() => {
    if (trainer) {
      form.reset({
        name: trainer.name,
        email: trainer.email,
        specialty: trainer.specialty,
        bio: trainer.bio || "",
        price: trainer.price,
        rating: trainer.rating || 0,
        reviewCount: trainer.reviewCount || 0,
        location: trainer.location || "",
        contact: trainer.contact || "",
        experience: trainer.experience || 0,
        certifications: trainer.certifications || "",
        isVerified: trainer.isVerified || 0,
        isActive: trainer.isActive || 1
      });
      
      if (trainer.photoUrl) {
        setPhotoPreview(trainer.photoUrl);
      }
    }
  }, [trainer, form]);

  const updateTrainerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/admin/api/trainers/${id}`, {
        method: "PUT",
        headers: adminAuthManager.getAuthHeaders(),
        body: data
      });
      if (!response.ok) throw new Error("Failed to update trainer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/trainers"] });
      toast({ title: "Trainer updated successfully" });
      setLocation("/admin/trainers");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update trainer",
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
    setPhotoPreview(trainer?.photoUrl || null);
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
    
    updateTrainerMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Trainer" showBackButton backPath="/admin/trainers">
        <div className="p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading trainer...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!trainer) {
    return (
      <AdminLayout title="Edit Trainer" showBackButton backPath="/admin/trainers">
        <div className="p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Trainer not found</h3>
              <p className="text-muted-foreground">The trainer you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Trainer" showBackButton backPath="/admin/trainers">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Trainer: {trainer.name}</CardTitle>
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
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <Label htmlFor="trainer-photo" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors">
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

              {/* Form fields - same as add trainer but with current values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price per Hour (cents) *</Label>
                  <Input
                    {...form.register("price", { valueAsNumber: true })}
                    type="number"
                    placeholder="5000"
                    data-testid="input-price"
                  />
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
                    checked={form.watch("isActive") === 1}
                    onCheckedChange={(checked) => form.setValue("isActive", checked ? 1 : 0)}
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
                    checked={form.watch("isVerified") === 1}
                    onCheckedChange={(checked) => form.setValue("isVerified", checked ? 1 : 0)}
                    data-testid="switch-verified"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={updateTrainerMutation.isPending}
                  className="flex-1"
                  data-testid="button-update-trainer"
                >
                  {updateTrainerMutation.isPending ? "Updating..." : "Update Trainer"}
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

export default function AdminEditTrainerPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <EditTrainerForm />;
}