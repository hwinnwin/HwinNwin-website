import { useQuery } from "@tanstack/react-query";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { loadAboutContent, loadBrandData } from "@/lib/contentLoader";
import { ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AboutPage() {
  const { data: aboutContent, isLoading: aboutLoading } = useQuery({
    queryKey: ["about-content"],
    queryFn: loadAboutContent,
  });

  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ["brand-data"],
    queryFn: loadBrandData,
  });

  if (aboutLoading || brandLoading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gold">Loading...</div>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="about-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="about-headline">
              About HwinNwin
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="about-subtitle">
              {brandData?.tagline || "Helping Businesses Scale with Structure, Mindset, and Excellence"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24" data-testid="about-content">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* About Content */}
            <div className="prose prose-lg max-w-none" data-testid="about-text">
              <ReactMarkdown>
                {aboutContent || "We are HwinNwin, dedicated to helping businesses achieve sustainable growth through proven methodologies and strategic excellence."}
              </ReactMarkdown>
            </div>

            {/* Brand Pillars */}
            {brandData?.pillars && (
              <div className="space-y-8" data-testid="brand-pillars">
                <h2 className="text-3xl font-bold text-charcoal dark:text-hwin-white text-center">
                  Our Core Pillars
                </h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {brandData.pillars.map((pillar, index) => (
                    <Card key={index} className="text-center p-8 hover:shadow-soft transition-shadow" data-testid={`pillar-${pillar.toLowerCase()}`}>
                      <CardContent className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gold/10 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-gold">●</span>
                        </div>
                        <h3 className="text-xl font-semibold text-charcoal dark:text-hwin-white">
                          {pillar}
                        </h3>
                        <p className="text-muted-foreground">
                          {pillar === "Power" && "Confident contrast and strong framing in everything we deliver."}
                          {pillar === "Balance" && "Symmetrical approaches with centered, harmonious solutions."}
                          {pillar === "Prosperity" && "Gold-standard outcomes that create lasting value."}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Voice & Tone */}
            {brandData?.voice && (
              <div className="bg-muted/20 rounded-2xl p-8 space-y-6" data-testid="voice-section">
                <h2 className="text-2xl font-bold text-charcoal dark:text-hwin-white">
                  Our Voice
                </h2>
                <p className="text-lg text-muted-foreground">
                  {brandData.voice.tone}
                </p>
                <ul className="space-y-2">
                  {brandData.voice.rules.map((rule, index) => (
                    <li key={index} className="text-muted-foreground flex items-start space-x-2">
                      <span className="text-gold">●</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Organization Info */}
            {brandData?.organization && (
              <div className="text-center space-y-4" data-testid="organization-info">
                <h3 className="text-xl font-semibold text-charcoal dark:text-hwin-white">
                  {brandData.organization.legal_name}
                </h3>
                <p className="text-muted-foreground">
                  Headquartered in {brandData.organization.hq}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="about-cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Ready to Work Together?
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's discuss how our approach can benefit your business.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
              data-testid="about-cta-button"
            >
              <Link href="/hwin/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}