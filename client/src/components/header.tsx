import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { authManager } from "@/lib/auth";
import { LogOut, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const handleSignOut = () => {
    authManager.clearAuth();
  };

  return (
    <header className="bg-background border-b border-border p-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-lg font-bold text-foreground">FitTracker Pro</h1>
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Hello, {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <Button variant="default" size="sm">
              <LogIn className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}