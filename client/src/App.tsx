import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CustomerForm from "@/pages/customer-form";
import OwnerDashboard from "@/pages/owner-dashboard";
import OwnerSettings from "@/pages/owner-settings";
import PublicQuote from "@/pages/public-quote";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerForm} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/settings" component={OwnerSettings} />
      <Route path="/q/:slug" component={PublicQuote} />
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
