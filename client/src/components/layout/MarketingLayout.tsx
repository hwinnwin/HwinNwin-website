import { ReactNode } from "react";
import MarketingNav from "./MarketingNav";
import Footer from "./Footer";
import { SkipNav } from "./SkipNav";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Skip to Content Link */}
      <SkipNav />
      
      {/* Sticky Navigation */}
      <MarketingNav />
      
      {/* Main Content Area */}
      <main id="main-content" className="flex-1" data-testid="main-content">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}