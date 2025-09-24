import { ReactNode } from "react";
import MarketingNav from "./MarketingNav";
import Footer from "./Footer";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky Navigation */}
      <MarketingNav />
      
      {/* Main Content Area */}
      <main className="flex-1" data-testid="main-content">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}