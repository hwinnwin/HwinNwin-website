// Stable navigation configuration to prevent navigation items from disappearing
// This centralized config ensures consistency across all navigation components

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

// Main site navigation - these should remain stable
export const MAIN_NAV_ITEMS: NavItem[] = [
  { 
    href: "/hwin/services", 
    label: "Services",
    description: "Business services and solutions"
  },
  { 
    href: "/hwin/about", 
    label: "About",
    description: "About HwinNwin"
  },
  { 
    href: "/hwin/work", 
    label: "Case Studies",
    description: "Portfolio and case studies"
  },
  { 
    href: "/panel-quote", 
    label: "Auto Quoter",
    description: "Panel repair quotation tool"
  },
  { 
    href: "/hwin/insights", 
    label: "Blog",
    description: "Insights and articles"
  }
];

// Owner/admin navigation items
export const OWNER_NAV_ITEMS: NavItem[] = [
  { 
    href: "/owner", 
    label: "Dashboard",
    description: "Owner dashboard for quote management"
  },
  { 
    href: "/owner/settings", 
    label: "Settings",
    description: "System settings and configuration"
  },
  { 
    href: "/owner/content", 
    label: "Content Editor",
    description: "Edit website content and pages"
  }
];

// Utility function to check if a route is active
export function isActiveRoute(currentPath: string, targetHref: string): boolean {
  if (targetHref === "/") {
    return currentPath === "/";
  }
  return currentPath === targetHref || currentPath.startsWith(targetHref);
}