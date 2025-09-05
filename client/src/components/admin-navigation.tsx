import { Link, useLocation } from "wouter";
import { Home, Users, MapPin, Settings, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { adminAuthManager } from "@/lib/admin-auth";

interface AdminNavigationProps {
  showBackButton?: boolean;
  backPath?: string;
  title?: string;
}

export default function AdminNavigation({ showBackButton = false, backPath = "/admin", title }: AdminNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/admin", icon: Home, label: "Dashboard" },
    { path: "/admin/trainers", icon: Users, label: "Trainers" },
    { path: "/admin/gyms", icon: MapPin, label: "Gyms" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    adminAuthManager.clearAuth();
    window.location.href = '/admin';
  };

  return (
    <>
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border p-4 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {showBackButton ? (
            <Link href={backPath}>
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <div className="w-9 h-9" />
          )}
          
          <h1 className="font-semibold text-lg">
            {title || "Admin Panel"}
          </h1>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
            Logout
          </Button>
        </div>
      </header>

      {/* Bottom Navigation */}
      <div className="md-navigation-bar bottom-nav">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4 mobile-safe-area">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`md-navigation-item md-state-layer flex flex-col items-center justify-center w-14 h-14 rounded-xl native-transition touch-target ${
                  isActive ? 'active' : ''
                }`} style={{ 
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <Icon size={isActive ? 32 : 28} className="mb-0.5 native-transition" />
                  <span className={`md-label-medium leading-none text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}