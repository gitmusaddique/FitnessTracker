import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = {
  paper: {
    "background": "255, 255, 255",
    "foreground": "26, 26, 26",
    "card": "248, 249, 250",
    "card-foreground": "26, 26, 26",
    "popover": "255, 255, 255",
    "popover-foreground": "26, 26, 26",
    "primary": "37, 99, 235",
    "primary-foreground": "255, 255, 255",
    "secondary": "100, 116, 139",
    "secondary-foreground": "255, 255, 255",
    "muted": "241, 245, 249",
    "muted-foreground": "100, 116, 139",
    "accent": "14, 165, 233",
    "accent-foreground": "255, 255, 255",
    "destructive": "220, 38, 38",
    "destructive-foreground": "255, 255, 255",
    "border": "226, 232, 240",
    "input": "248, 250, 252",
    "ring": "37, 99, 235",
    "success": "22, 163, 74",
    "warning": "202, 138, 4",
    "info": "14, 165, 233",
    "error": "220, 38, 38"
  },
  dark: {
    "background": "15, 23, 42",
    "foreground": "248, 250, 252",
    "card": "30, 41, 59",
    "card-foreground": "248, 250, 252",
    "popover": "30, 41, 59",
    "popover-foreground": "248, 250, 252",
    "primary": "59, 130, 246",
    "primary-foreground": "255, 255, 255",
    "secondary": "100, 116, 139",
    "secondary-foreground": "255, 255, 255",
    "muted": "51, 65, 85",
    "muted-foreground": "148, 163, 184",
    "accent": "6, 182, 212",
    "accent-foreground": "255, 255, 255",
    "destructive": "239, 68, 68",
    "destructive-foreground": "255, 255, 255",
    "border": "51, 65, 85",
    "input": "30, 41, 59",
    "ring": "59, 130, 246",
    "success": "16, 185, 129",
    "warning": "245, 158, 11",
    "info": "6, 182, 212",
    "error": "239, 68, 68"
  }
};

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // No conversion needed since colors are already in RGB format

  const applyTheme = (themeName: 'paper' | 'dark') => {
    const colors = themes[themeName];
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
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