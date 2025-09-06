import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border p-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto flex items-center justify-center">
        <Link href="/">
          <span 
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            data-testid="app-name"
          >
            FitTracker Pro
          </span>
        </Link>
      </div>
    </header>
  );
}