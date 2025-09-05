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
    <div className="md-navigation-bar">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`md-navigation-item md-state-layer flex flex-col items-center justify-center w-16 h-16 rounded-2xl md-transition-standard ${
                isActive ? 'active' : ''
              }`}>
                <Icon size={24} className="mb-1" />
                <span className="md-label-medium leading-none">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}