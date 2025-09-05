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
        backgroundColor: 'hsl(var(--card))',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid hsl(var(--border))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        padding: '0',
        margin: '0'
      }}
    >
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path} data-testid={`nav-${item.label.toLowerCase()}`}>
              <button
                style={{
                  width: '60px',
                  height: '52px',
                  minWidth: '60px',
                  minHeight: '52px',
                  maxWidth: '60px',
                  maxHeight: '52px',
                  padding: '8px',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'var(--foreground)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'var(--muted-foreground)';
                  }
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                }}
              >
                <Icon 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    marginBottom: '4px',
                    flexShrink: 0
                  }} 
                />
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '500',
                    lineHeight: '1',
                    textAlign: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
