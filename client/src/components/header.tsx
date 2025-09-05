import { Link } from "wouter";
import ThemeSwitcher from "./theme-switcher";
import logoImage from "@assets/generated_images/Professional_fitness_app_logo_287b061d.png";

export default function Header() {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border p-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="w-9 h-9" /> {/* Spacer for centering */}
        <Link href="/">
          <img 
            src={logoImage} 
            alt="FitTracker Pro" 
            className="h-8 w-auto object-contain"
            data-testid="app-logo"
          />
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}