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
import type { User } from "@shared/schema";
import { useState } from "react";
import { 
  Search,
  Users,
  Trash2,
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Mail
} from "lucide-react";

function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/admin/api/users"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/admin/api/users");
      return response.json();
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApiRequest("DELETE", `/admin/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete user" 
      });
    }
  });

  const handleDeleteUser = (user: User) => {
    const confirmMessage = `Are you sure you want to delete user "${user.name}"?\n\nThis action cannot be undone and will:\n• Remove the user account permanently\n• Delete all workout history\n• Delete all meal logs\n• Cancel any active bookings\n\nType "DELETE" to confirm this action.`;
    
    const userInput = window.prompt(confirmMessage);
    if (userInput === "DELETE") {
      deleteUserMutation.mutate(user.id);
    } else if (userInput !== null) {
      toast({
        variant: "destructive",
        title: "Deletion cancelled",
        description: "You must type 'DELETE' to confirm this action"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold">Users</h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-users"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{user.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Mail className="w-4 h-4 mr-1" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => handleDeleteUser(user)}
                      disabled={deleteUserMutation.isPending}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mt-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      User ID: {user.id.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No users found" : "No users yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "Try adjusting your search terms"
              : "Users will appear here once they register for the app"
            }
          </p>
        </div>
      )}

      {/* Total Count */}
      {users.length > 0 && (
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <UsersManagement />;
}