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
  );
}