import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load glassmorphic colors and apply to CSS
async function loadGlassmorphicColors() {
  try {
    const response = await fetch('/colors.json');
    const colors = await response.json();
    
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const rgbValue = value as string;
      root.style.setProperty(`--${key}`, rgbValue);
    });
  } catch (error) {
    console.error('Failed to load glassmorphic colors:', error);
  }
}

// Load colors and render app
loadGlassmorphicColors().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
