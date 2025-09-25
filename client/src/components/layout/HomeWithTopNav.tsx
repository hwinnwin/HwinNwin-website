import { ReactNode } from "react";
import TopNavigation from "../TopNavigation";
import MarketingLayout from "./MarketingLayout";

interface HomeWithTopNavProps {
  children: ReactNode;
}

export default function HomeWithTopNav({ children }: HomeWithTopNavProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation - Appears above marketing navigation */}
      <TopNavigation />
      
      {/* Marketing Layout with its own navigation */}
      <div className="flex-1">
        <MarketingLayout>
          {children}
        </MarketingLayout>
      </div>
    </div>
  );
}