import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'paper';
    const isDarkTheme = savedTheme === 'dark';
    setIsDark(isDarkTheme);
    loadTheme(savedTheme);
  }, []);

  const loadTheme = async (themeName: string) => {
    try {
      const response = await fetch(`/themes/${themeName}.json`);
      const colors = await response.json();
      
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        const hex = value as string;
        const hsl = hexToHsl(hex);
        root.style.setProperty(`--${key}`, hsl);
      });
      
      // Update body class for theme-specific styles
      document.body.className = themeName === 'dark' ? 'dark' : '';
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

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

  const toggleTheme = () => {
    const newTheme = isDark ? 'paper' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    loadTheme(newTheme);
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