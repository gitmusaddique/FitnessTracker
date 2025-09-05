import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load colors from JSON and apply to CSS
async function loadColors() {
  try {
    const response = await fetch('/colors.json');
    const colors = await response.json();
    
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const hex = value as string;
      const hsl = hexToHsl(hex);
      root.style.setProperty(`--${key}`, hsl);
    });
  } catch (error) {
    console.error('Failed to load colors:', error);
  }
}

function hexToHsl(hex: string): string {
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

// Load colors then render app
loadColors().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
