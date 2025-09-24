import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoUrl from "@assets/small simple logo_1758679347610.png";

export default function MarketingNav() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { href: "/hwin", label: "Home" },
    { href: "/hwin/services", label: "Services" },
    { href: "/hwin/about", label: "About" },
    { href: "/hwin/work", label: "Case Studies" },
    { href: "/hwin/insights", label: "Blog" },
    { href: "/hwin/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/hwin") {
      return location === "/hwin";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="marketing-nav">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/hwin" className="flex items-center space-x-3" data-testid="logo-link">
            <img 
              src={logoUrl} 
              alt="HwinNwin Logo" 
              className="h-8 w-8 opacity-90 transition-opacity hover:opacity-100"
              data-testid="logo-image"
            />
            <span className="text-xl font-medium tracking-tight text-charcoal dark:text-hwin-white">
              HwinNwin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  isActive(item.href)
                    ? "text-gold border-b-2 border-gold"
                    : "text-charcoal dark:text-hwin-white"
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex md:items-center">
            <Button 
              asChild 
              className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
              data-testid="cta-button"
            >
              <Link href="/hwin/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background" data-testid="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-gold bg-gold/10 border-l-4 border-gold"
                      : "text-charcoal dark:text-hwin-white hover:text-gold hover:bg-gold/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Button 
                  asChild 
                  className="w-full bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
                  data-testid="mobile-cta-button"
                >
                  <Link href="/hwin/contact">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}