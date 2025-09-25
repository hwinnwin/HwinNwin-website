import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, TrendingUp, Clock, DollarSign } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";
import TopNavigation from "@/components/TopNavigation";

export default function AutoQuoterCaseStudy() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <SeoHead 
        title="Auto Quoter Case Study - Panel Repair & Quoting Solution"
        description="Discover how our automated panel repair quotation system streamlines quote generation and improves customer experience for panel repair businesses."
        ogTitle="Auto Quoter Case Study - Streamlined Panel Repair Quotes"
        ogDescription="See how our automated quotation system transforms panel repair quote generation with real-time calculations and customer-friendly interfaces."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/auto-quoter-case-study`}
        keywords={["auto quoter", "panel repair", "automated quotes", "case study", "repair quotes", "customer experience"]}
      />
      
      {/* Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="main-content">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button asChild variant="ghost" data-testid="back-navigation">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="project-type">
              Case Study
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="page-title">
              Auto Quoter System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="project-description">
              Automated panel repair quotation system that streamlines the quote generation process 
              and improves customer experience through real-time calculations and photo-based assessments.
            </p>
          </div>

          {/* Project Overview */}
          <Card data-testid="project-overview">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Project Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Auto Quoter system revolutionizes how panel repair businesses generate quotes by combining 
                automated calculations, photo-based damage assessment, and customer-friendly interfaces to 
                create an efficient end-to-end quotation process.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Time Reduction</h3>
                  <p className="text-2xl font-bold text-primary">75%</p>
                  <p className="text-sm text-muted-foreground">Faster quote generation</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Accuracy</h3>
                  <p className="text-2xl font-bold text-primary">98%</p>
                  <p className="text-sm text-muted-foreground">Quote accuracy rate</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Approval Rate</h3>
                  <p className="text-2xl font-bold text-primary">85%</p>
                  <p className="text-sm text-muted-foreground">Customer quote approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card data-testid="tech-stack">
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["TypeScript", "React", "Wouter", "Tailwind CSS", "Node.js", "Express", "SQLite", "Drizzle ORM", "Image Processing", "PDF Generation"].map((tech) => (
                  <Badge key={tech} variant="outline" data-testid={`tech-${tech.toLowerCase().replace(/\s+/g, "-")}`}>
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card data-testid="key-features">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Customer Experience</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Photo-based damage assessment</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Real-time quote generation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Mobile-optimized interface</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">PDF quote generation</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Business Management</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Owner dashboard with analytics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Configurable pricing models</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Quote approval workflow</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Email notifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Try the System */}
          <Card className="text-center" data-testid="cta-card">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Experience the Auto Quoter</h3>
              <p className="text-muted-foreground mb-6">
                Try our automated panel repair quotation system and see how it can transform your business.
              </p>
              <Button asChild size="lg" data-testid="cta-button">
                <Link href="/panel-quote">
                  Get Your Quote Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}