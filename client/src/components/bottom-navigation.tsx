import { Link, useLocation } from "wouter";
import { Home, Dumbbell, Utensils, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/meals", icon: Utensils, label: "Meals" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="md-navigation-bar bottom-nav">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2 mobile-safe-area">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`md-navigation-item md-state-layer flex flex-col items-center justify-center w-12 h-12 rounded-lg native-transition touch-target ${
                isActive ? 'active' : ''
              }`}>
                <Icon size={isActive ? 20 : 18} className="mb-1 native-transition" />
                <span className={`leading-none text-[9px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
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