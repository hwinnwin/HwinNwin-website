import { ReactNode } from "react";
import TopNavigation from "../TopNavigation";

interface TopNavigationLayoutProps {
  children: ReactNode;
}

export default function TopNavigationLayout({ children }: TopNavigationLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content Area */}
      <main className="flex-1" data-testid="main-content">
        {children}
      </main>
    </div>
  );
}