import { ReactNode } from "react";
import TopNavigation from "../TopNavigation";
import { SkipNav } from "./SkipNav";

interface TopNavigationLayoutProps {
  children: ReactNode;
}

export default function TopNavigationLayout({ children }: TopNavigationLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Skip to Content Link */}
      <SkipNav />
      
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content Area */}
      <main id="main-content" className="flex-1" data-testid="main-content">
        {children}
      </main>
    </div>
  );
}