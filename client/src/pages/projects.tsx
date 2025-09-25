import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ExternalLink, Calculator, TrendingUp } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";
import TopNavigation from "@/components/TopNavigation";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <SeoHead 
        title="Projects - Tools & Applications | HwinNwin"
        description="Explore our portfolio of business tools and applications designed to streamline operations and improve efficiency."
        ogTitle="Projects - Business Tools & Applications"
        ogDescription="Discover innovative tools and applications we've built to help businesses automate processes and improve productivity."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/projects`}
        keywords={["projects", "business tools", "applications", "automation", "productivity", "software solutions"]}
      />
      
      {/* Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="main-content">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="projects-headline">
            Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="projects-subtitle">
            Tools and applications designed to streamline business operations and improve efficiency.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Auto Quoter Tool */}
            <Card className="hover:shadow-soft transition-shadow group border-2 hover:border-primary/20" data-testid="auto-quoter-project">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Live Tool
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl text-charcoal dark:text-hwin-white group-hover:text-primary transition-colors">
                  Auto Quoter Tool
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Automated panel repair quotation system with photo-based damage assessment, 
                  real-time calculations, and customer-friendly quote generation.
                </p>
                
                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-charcoal dark:text-hwin-white">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Photo-based damage assessment</li>
                    <li>• Real-time quote calculations</li>
                    <li>• Customer portal for quotes</li>
                    <li>• Owner dashboard for approvals</li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">75%</div>
                    <div className="text-xs text-muted-foreground">Time Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">90%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1" data-testid="try-tool-button">
                    <Link href="/panel-quote">
                      Try Tool
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" data-testid="view-case-study-button">
                    <Link href="/hwin/work/auto-quoter">
                      Case Study
                      <TrendingUp className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for future projects */}
            <Card className="opacity-60 border-dashed" data-testid="future-project-placeholder">
              <CardHeader>
                <CardTitle className="text-muted-foreground">More Projects Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  We're constantly building new tools and applications to help businesses scale with automation and efficiency.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}