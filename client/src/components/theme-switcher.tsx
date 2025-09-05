import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = {
  paper: {
    "background": "#ffffff",
    "foreground": "#1a1a1a",
    "card": "#f8f9fa",
    "card-foreground": "#1a1a1a",
    "popover": "#ffffff",
    "popover-foreground": "#1a1a1a",
    "primary": "#2563eb",
    "primary-foreground": "#ffffff",
    "secondary": "#64748b",
    "secondary-foreground": "#ffffff",
    "muted": "#f1f5f9",
    "muted-foreground": "#64748b",
    "accent": "#0ea5e9",
    "accent-foreground": "#ffffff",
    "destructive": "#dc2626",
    "destructive-foreground": "#ffffff",
    "border": "#e2e8f0",
    "input": "#f8fafc",
    "ring": "#2563eb",
    "success": "#16a34a",
    "warning": "#ca8a04",
    "info": "#0ea5e9",
    "error": "#dc2626"
  },
  dark: {
    "background": "#0f172a",
    "foreground": "#f8fafc",
    "card": "#1e293b",
    "card-foreground": "#f8fafc",
    "popover": "#1e293b",
    "popover-foreground": "#f8fafc",
    "primary": "#3b82f6",
    "primary-foreground": "#ffffff",
    "secondary": "#64748b",
    "secondary-foreground": "#ffffff",
    "muted": "#334155",
    "muted-foreground": "#94a3b8",
    "accent": "#06b6d4",
    "accent-foreground": "#ffffff",
    "destructive": "#ef4444",
    "destructive-foreground": "#ffffff",
    "border": "#334155",
    "input": "#1e293b",
    "ring": "#3b82f6",
    "success": "#10b981",
    "warning": "#f59e0b",
    "info": "#06b6d4",
    "error": "#ef4444"
  }
};

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyTheme = (themeName: 'paper' | 'dark') => {
    const colors = themes[themeName];
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      const hsl = hexToHsl(value);
      root.style.setProperty(`--${key}`, hsl);
    });
    
    document.body.className = themeName === 'dark' ? 'dark' : '';
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'paper' | 'dark' || 'paper';
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'paper' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      data-testid="theme-toggle"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}