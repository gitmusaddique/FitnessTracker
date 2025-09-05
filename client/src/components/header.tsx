import { Link } from "wouter";
import ThemeSwitcher from "./theme-switcher";

export default function Header() {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border p-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="w-9 h-9" /> {/* Spacer for centering */}
        <Link href="/">
          <span 
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            data-testid="app-name"
          >
            FitTracker Pro
          </span>
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}