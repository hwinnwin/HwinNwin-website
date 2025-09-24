import { useQuery } from "@tanstack/react-query";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { getAllCaseStudies } from "@/lib/contentLoader";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";

export default function CaseStudiesPage() {
  const { data: caseStudies, isLoading } = useQuery({
    queryKey: ["case-studies"],
    queryFn: getAllCaseStudies,
  });

  if (isLoading) {
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
      {/* SEO */}
      <SeoHead 
        title="Case Studies - Real Results | HwinNwin"
        description="Real results from real businesses. See how HwinNwin has helped companies scale with AI automation, creative systems, and strategic consulting in Melbourne, Australia."
        ogTitle="Case Studies - Real Business Results | HwinNwin"
        ogDescription="Discover client success stories: From operations optimization to content automation. Real case studies with measurable results."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/hwin/work`}
        keywords={['case studies', 'business results', 'client success', 'AI automation', 'Melbourne consulting', 'implementation', 'ROI']}
      />
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="case-studies-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="case-studies-headline">
              Case Studies
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="case-studies-subtitle">
              Real results from real businesses. See how we've helped companies scale with structure, mindset, and excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 lg:py-24" data-testid="case-studies-grid">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {caseStudies?.map((caseStudy, index) => {
              const slug = caseStudy.slug;
              
              return (
                <Card key={index} className="hover:shadow-soft transition-shadow group" data-testid={`case-study-card-${index}`}>
                  <CardHeader>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20 w-fit">
                        {caseStudy.frontmatter.client}
                      </Badge>
                      <CardTitle className="text-xl text-charcoal dark:text-hwin-white group-hover:text-gold transition-colors">
                        {caseStudy.frontmatter.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Tech Stack */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-charcoal dark:text-hwin-white">Technology Stack:</h4>
                      <div className="flex flex-wrap gap-1">
                        {caseStudy.frontmatter.stack.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Key Results */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-charcoal dark:text-hwin-white">Key Results:</h4>
                      <ul className="space-y-1">
                        {caseStudy.frontmatter.results.slice(0, 3).map((result, resultIndex) => (
                          <li key={resultIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-gold text-xs">●</span>
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full group-hover:bg-gold group-hover:text-charcoal transition-colors"
                      data-testid={`case-study-link-${index}`}
                    >
                      <Link href={`/hwin/work/${slug}`}>
                        Read Full Case Study
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            }) || []}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="case-studies-cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Ready to Be Our Next Success Story?
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's discuss how we can achieve similar results for your business.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
              data-testid="case-studies-cta-button"
            >
              <Link href="/hwin/contact">
                Start Your Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}