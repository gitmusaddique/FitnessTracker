interface ThemeColors {
  [key: string]: string;
}

interface Theme {
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
}

class ThemeManager {
  private currentTheme: Theme | null = null;
  private themes: Map<string, Theme> = new Map();

  async loadTheme(themeName: string): Promise<void> {
    try {
      const response = await fetch(`/src/themes/${themeName}.json`);
      const theme: Theme = await response.json();
      this.themes.set(themeName, theme);
      this.currentTheme = theme;
      this.applyTheme(theme);
    } catch (error) {
      console.error(`Failed to load theme: ${themeName}`, error);
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add theme type class
    root.classList.add(theme.type);
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key}`;
      const hslValue = this.hexToHsl(value);
      root.style.setProperty(cssVar, hslValue);
    });
  }

  private hexToHsl(hex: string): string {
    // Convert hex to RGB
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
  }

  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  switchTheme(themeName: string): void {
    if (this.themes.has(themeName)) {
      const theme = this.themes.get(themeName)!;
      this.currentTheme = theme;
      this.applyTheme(theme);
      localStorage.setItem('preferred-theme', themeName);
    }
  }

  async initialize(): Promise<void> {
    // Load default themes
    await Promise.all([
      this.loadTheme('dracula'),
      this.loadTheme('material')
    ]);

    // Apply saved theme or default
    const savedTheme = localStorage.getItem('preferred-theme') || 'dracula';
    this.switchTheme(savedTheme);
  }
}

export const themeManager = new ThemeManager();
export type { Theme, ThemeColors };