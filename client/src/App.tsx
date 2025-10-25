import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsentBanner } from "@/components/cookie-consent";
import { ConditionalAnalytics } from "@/components/ConditionalAnalytics";
import NotFound from "@/pages/not-found";
import CustomerForm from "@/pages/customer-form";
import OwnerDashboard from "@/pages/owner-dashboard";
import OwnerSettings from "@/pages/owner-settings";
import ContentEditor from "@/pages/content-editor";
import PublicQuote from "@/pages/public-quote";

// Codex Homepage
import Codex from "@/pages/Codex";

// Marketing Pages
import HomePage from "@/pages/marketing/home";
import ServicesPage from "@/pages/marketing/services";
import AboutPage from "@/pages/marketing/about";
import CaseStudiesPage from "@/pages/marketing/case-studies";
import CaseStudyPage from "@/pages/marketing/case-study";
import BlogPage from "@/pages/marketing/blog";
import BlogPostPage from "@/pages/marketing/blog-post";
import MarketingContactPage from "@/pages/marketing/contact";
import LegalPage from "@/pages/marketing/legal";
import DynamicPage from "@/pages/dynamic-page";
import ProjectsPage from "@/pages/projects";

// Lazy-loaded Blog Pages (Consciousness Bridging) - Code Splitting
const BlogIndex = lazy(() => import("@/pages/blog/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/blog/BlogPost"));

// Lazy-loaded Contact Page - Code Splitting
const ContactPage = lazy(() => import("@/pages/Contact"));

function Router() {
  return (
    <Switch>
      {/* Codex/Ethos Homepage */}
      <Route path="/" component={Codex} />
      
      {/* Projects Page */}
      <Route path="/projects" component={ProjectsPage} />
      
      {/* Blog Routes (Consciousness Bridging) - Lazy Loaded */}
      <Route path="/blog">
        <Suspense fallback={<div data-testid="loading-blog" className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <BlogIndex />
        </Suspense>
      </Route>
      <Route path="/blog/:slug">
        <Suspense fallback={<div data-testid="loading-blog-post" className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <BlogPost />
        </Suspense>
      </Route>
      
      {/* Existing Automotive App Routes - moved to dedicated paths */}
      <Route path="/panel-quote" component={CustomerForm} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/settings" component={OwnerSettings} />
      <Route path="/owner/content" component={ContentEditor} />
      <Route path="/q/:slug" component={PublicQuote} />
      
      {/* Marketing Website Routes */}
      <Route path="/hwin" component={HomePage} />
      <Route path="/hwin/services" component={ServicesPage} />
      <Route path="/hwin/about" component={AboutPage} />
      <Route path="/hwin/work" component={CaseStudiesPage} />
      <Route path="/hwin/work/:slug" component={CaseStudyPage} />
      <Route path="/hwin/insights" component={BlogPage} />
      <Route path="/hwin/insights/:slug" component={BlogPostPage} />
      <Route path="/hwin/contact" component={MarketingContactPage} />
      
      {/* Simple Contact Form - Lazy Loaded */}
      <Route path="/contact">
        <Suspense fallback={<div data-testid="loading-contact" className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ContactPage />
        </Suspense>
      </Route>
      
      {/* Legal Pages */}
      <Route path="/legal/:type" component={LegalPage} />
      
      {/* Dynamic Custom Pages - Must come after all specific routes */}
      <Route path="/:slug" component={DynamicPage} />
      
      {/* 404 Handler */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log("🚀 App component rendering...");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <Router />
            <CookieConsentBanner />
            <ConditionalAnalytics />
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
