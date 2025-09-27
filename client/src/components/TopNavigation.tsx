import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { MAIN_NAV_ITEMS, isActiveRoute } from "@/config/navigation";

export default function TopNavigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="top-navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-3" data-testid="brand-link">
            <span className="text-xl font-bold tracking-tight text-foreground">
              HwinNwin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8 justify-center flex-1">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded-md ${
                  isActiveRoute(location, item.href)
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-haspopup="menu"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div 
            id="mobile-navigation-menu"
            className="md:hidden border-t border-border/40 bg-background" 
            role="menu"
            data-testid="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {MAIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors rounded-md ${
                    isActiveRoute(location, item.href)
                      ? "text-primary bg-primary/10 border-l-4 border-primary"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}