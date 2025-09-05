import { Link, useLocation } from "wouter";
import { Home, Dumbbell, Utensils, Users, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/meals", icon: Utensils, label: "Meals" },
    { path: "/trainers", icon: Users, label: "Trainers" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav 
      style={{
        position: 'fixed',
        bottom: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '448px',
        zIndex: 999999,
        backgroundColor: 'var(--card)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path} data-testid={`nav-${item.label.toLowerCase()}`}>
              <button
                className={`flex flex-col items-center p-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
