import { useQuery } from "@tanstack/react-query";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { loadServicesData } from "@/lib/contentLoader";
import { ArrowRight, CheckCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";

export default function ServicesPage() {
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services-data"],
    queryFn: loadServicesData,
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

  // Structured Data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HwinNwin",
    "legalName": "HwinNwin Pty Ltd",
    "url": SITE_CONFIG.baseUrl,
    "description": "Comprehensive business solutions designed to scale your business with structure, mindset, and excellence.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Melbourne",
      "addressRegion": "Victoria", 
      "addressCountry": "AU"
    },
    "areaServed": "AU"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Business Consulting",
    "provider": {
      "@type": "Organization",
      "name": "HwinNwin"
    },
    "areaServed": "AU",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Business Solutions",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Automation",
            "description": "Streamline operations with intelligent automation solutions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Creative Systems",
            "description": "Build sustainable creative ecosystems for your business"
          }
        }
      ]
    }
  };

  return (
    <MarketingLayout>
      {/* SEO */}
      <SeoHead 
        title="Our Services - HwinNwin"
        description="Comprehensive AI automation and creative systems solutions designed to scale your business with structure, mindset, and excellence. Professional consulting services in Melbourne, Australia."
        ogTitle="Our Services - HwinNwin"
        ogDescription="From AI automation to creative systems implementation, we offer comprehensive business solutions starting from AUD 5,000. Melbourne-based consulting."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/hwin/services`}
        keywords={["AI automation services", "creative systems", "business consulting Melbourne", "strategic planning", "implementation support", "custom solutions"]}
      />
      <JsonLd json={organizationSchema} />
      <JsonLd json={serviceSchema} />
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="services-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="services-headline">
              Our Services
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="services-subtitle">
              Comprehensive solutions designed to scale your business with structure, mindset, and excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24" data-testid="services-grid">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {servicesData?.items.map((service, index) => (
              <Card key={index} className="hover:shadow-soft transition-shadow group" data-testid={`service-card-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-charcoal dark:text-hwin-white group-hover:text-gold transition-colors">
                      {service.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                      From AUD {service.from_aud.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    {service.promise}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-charcoal dark:text-hwin-white">Key Outcomes:</h4>
                    <ul className="space-y-2">
                      {service.outcomes.map((outcome, outcomeIndex) => (
                        <li key={outcomeIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    asChild 
                    className="w-full bg-gold hover:bg-gold/90 text-charcoal font-medium"
                    data-testid={`service-cta-${index}`}
                  >
                    <Link href="/hwin/contact">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="services-cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Need a Custom Solution?
            </h2>
            <p className="text-lg text-muted-foreground">
              Every business is unique. Let's create a tailored approach for your specific needs.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
              data-testid="custom-solution-cta"
            >
              <Link href="/hwin/contact">
                Discuss Custom Solutions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}