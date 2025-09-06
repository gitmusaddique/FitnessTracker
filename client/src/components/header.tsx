import { Link } from "wouter";
import { Activity, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 p-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span 
              className="text-lg font-bold text-foreground hover:text-primary transition-colors"
              data-testid="app-name"
            >
              FitTracker
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <Bell className="w-4 h-4" />
          </Button>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <User className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}