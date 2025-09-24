import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CustomerForm from "@/pages/customer-form";
import OwnerDashboard from "@/pages/owner-dashboard";
import OwnerSettings from "@/pages/owner-settings";
import PublicQuote from "@/pages/public-quote";

// Marketing Pages
import HomePage from "@/pages/marketing/home";
import ServicesPage from "@/pages/marketing/services";
import AboutPage from "@/pages/marketing/about";
import CaseStudiesPage from "@/pages/marketing/case-studies";
import CaseStudyPage from "@/pages/marketing/case-study";
import BlogPage from "@/pages/marketing/blog";
import BlogPostPage from "@/pages/marketing/blog-post";
import ContactPage from "@/pages/marketing/contact";
import LegalPage from "@/pages/marketing/legal";

function Router() {
  return (
    <Switch>
      {/* Redirect root to HwinNwin marketing site */}
      <Route path="/">
        <Redirect to="/hwin" />
      </Route>
      
      {/* Existing Automotive App Routes - moved to dedicated paths */}
      <Route path="/panel-quote" component={CustomerForm} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/settings" component={OwnerSettings} />
      <Route path="/q/:slug" component={PublicQuote} />
      
      {/* Marketing Website Routes */}
      <Route path="/hwin" component={HomePage} />
      <Route path="/hwin/services" component={ServicesPage} />
      <Route path="/hwin/about" component={AboutPage} />
      <Route path="/hwin/work" component={CaseStudiesPage} />
      <Route path="/hwin/work/:slug" component={CaseStudyPage} />
      <Route path="/hwin/insights" component={BlogPage} />
      <Route path="/hwin/insights/:slug" component={BlogPostPage} />
      <Route path="/hwin/contact" component={ContactPage} />
      
      {/* Legal Pages */}
      <Route path="/legal/:type" component={LegalPage} />
      
      {/* 404 Handler */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
