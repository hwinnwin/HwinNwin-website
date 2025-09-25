import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { loadSiteData } from "@/lib/contentLoader";
import { ArrowRight, CheckCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";
import PinModal from "@/components/pin-modal";

export default function HomePage() {
  const [location, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  // Secret key sequence: ArrowUp, ArrowUp, ArrowDown, ArrowDown, o, w, n, e, r
  const secretSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'o', 'w', 'n', 'e', 'r'];
  
  const { data: siteData, isLoading } = useQuery({
    queryKey: ["site-data"],
    queryFn: loadSiteData,
  });
  
  // Handle multi-tap mobile trigger
  const handleLogoTap = () => {
    const now = Date.now();
    const tapWindow = 2000; // 2 second window for taps
    
    if (now - lastTapTime > tapWindow) {
      // Reset if too much time has passed
      setTapCount(1);
    } else {
      setTapCount(prev => prev + 1);
    }
    
    setLastTapTime(now);
    
    // Trigger after 7 rapid taps
    if (tapCount >= 6) { // 6 previous + 1 current = 7
      setShowPinModal(true);
      setTapCount(0);
    }
  };
  
  // Listen for secret key sequence (desktop only, suppress in inputs)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Suppress if focused on an input, textarea, or contenteditable element
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      )) {
        return;
      }
      
      const key = event.key;
      
      setKeySequence(prev => {
        const newSequence = [...prev, key].slice(-secretSequence.length);
        
        // Check if the sequence matches
        if (newSequence.length === secretSequence.length &&
            newSequence.every((k, i) => k === secretSequence[i])) {
          // Secret sequence detected
          setShowPinModal(true);
          return [];
        }
        
        return newSequence;
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handlePinSuccess = () => {
    setShowPinModal(false);
    navigate('/owner');
  };

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gold">Loading...</div>
        </div>
      </MarketingLayout>
    );
  }

  // Add safety checks for content data
  if (!siteData || !siteData.home || !siteData.brand) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Content not available</div>
        </div>
      </MarketingLayout>
    );
  }

  const homeData = siteData.home;
  const brandData = siteData.brand;

  // Structured Data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HwinNwin",
    "legalName": "HwinNwin Pty Ltd",
    "url": SITE_CONFIG.baseUrl,
    "logo": `${SITE_CONFIG.baseUrl}/logo.png`,
    "description": "Helping Businesses Scale with Structure, Mindset, and Excellence. We deliver powerful AI automation and creative systems solutions.",
    "slogan": "Helping Businesses Scale with Structure, Mindset, and Excellence",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Melbourne",
        "addressRegion": "Victoria",
        "addressCountry": "AU"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Melbourne",
      "addressRegion": "Victoria", 
      "addressCountry": "AU"
    },
    "areaServed": "AU",
    "knowsAbout": ["Business Consulting", "AI Automation", "Creative Systems", "Strategic Planning", "Implementation Support"],
    "sameAs": []
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "HwinNwin",
    "url": SITE_CONFIG.baseUrl,
    "description": "Professional business solutions including AI automation, creative systems, consulting, and training to help your business scale with structure, mindset, and excellence.",
    "publisher": {
      "@type": "Organization",
      "name": "HwinNwin"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_CONFIG.baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <MarketingLayout>
      {/* SEO */}
      <SeoHead 
        title="HwinNwin - AI Automation & Creative Ecosystems"
        description="Scale your business with AI automation and creative ecosystems. We deliver powerful solutions with balanced approach for lasting prosperity in Melbourne, Australia."
        ogTitle="HwinNwin - AI Automation & Creative Ecosystems"
        ogDescription="Professional business solutions including AI automation, creative systems, consulting, and strategic planning to help Australian businesses thrive."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/hwin`}
        keywords={["AI automation", "creative ecosystems", "business scaling", "Melbourne business consulting", "strategic planning", "implementation support"]}
      />
      <JsonLd json={organizationSchema} />
      <JsonLd json={websiteSchema} />
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="hero-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 
              className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight cursor-default select-none" 
              data-testid="hero-headline"
              onClick={handleLogoTap}
            >
              {homeData?.hero.headline || "Helping Businesses Scale with Structure, Mindset, and Excellence"}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="hero-subtitle">
              {homeData?.hero.sub || "We deliver powerful solutions with balanced approach for lasting prosperity."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
                data-testid="hero-primary-cta"
              >
                <Link href="/hwin/contact">
                  {homeData?.hero.primary_cta || "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                data-testid="hero-secondary-cta"
              >
                <Link href="/hwin/work">
                  {homeData?.hero.secondary_cta || "View Our Work"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3P Check Section */}
      <section className="py-16 lg:py-24" data-testid="three-p-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white mb-4">
              The 3P Check
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every solution we create passes our rigorous 3P Check for lasting business success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(homeData?.threeP?.items ?? []).map((item, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-soft transition-shadow" data-testid={`three-p-item-${index}`}>
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gold/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-gold">●</span>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal dark:text-hwin-white">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.text}
                  </p>
                  <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                    {item.metric}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="process-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white mb-4">
                Our Process
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple steps. Powerful results.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(homeData?.process ?? []).map((step, index) => (
                <div key={index} className="flex items-start space-x-3" data-testid={`process-step-${index}`}>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-charcoal">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <CheckCircle className="h-4 w-4 text-gold mb-2" />
                    <p className="text-sm text-charcoal dark:text-hwin-white">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24" data-testid="cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Ready to Scale Your Business?
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's discuss how we can help you achieve sustainable growth.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
              data-testid="bottom-cta-button"
            >
              <Link href="/hwin/contact">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePinSuccess} 
      />
    </MarketingLayout>
  );
}