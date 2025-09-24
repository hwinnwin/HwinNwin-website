import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { loadLegalContent, loadBrandData } from "@/lib/contentLoader";
import ReactMarkdown from "react-markdown";
import NotFound from "@/pages/not-found";

export default function LegalPage() {
  const { type } = useParams<{ type: string }>();
  
  // Validate legal type
  const validTypes = ['privacy', 'terms', 'cookies'];
  const legalType = type as 'privacy' | 'terms' | 'cookies';
  
  if (!type || !validTypes.includes(type)) {
    return <NotFound />;
  }

  const { data: legalContent, isLoading: contentLoading } = useQuery({
    queryKey: ["legal-content", legalType],
    queryFn: () => loadLegalContent(legalType),
  });

  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ["brand-data"],
    queryFn: loadBrandData,
  });

  if (contentLoading || brandLoading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gold">Loading...</div>
        </div>
      </MarketingLayout>
    );
  }

  // Get the page title based on type
  const getPageTitle = (type: string) => {
    switch (type) {
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms of Service';
      case 'cookies':
        return 'Cookie Policy';
      default:
        return 'Legal';
    }
  };

  const pageTitle = getPageTitle(legalType);

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid={`legal-${legalType}-hero`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid={`legal-${legalType}-title`}>
              {pageTitle}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid={`legal-${legalType}-subtitle`}>
              {brandData?.organization?.legal_name || "HwinNwin Pty Ltd"}
            </p>
          </div>
        </div>
      </section>

      {/* Legal Content */}
      <section className="py-16 lg:py-24" data-testid={`legal-${legalType}-content`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none dark:prose-invert" data-testid={`legal-${legalType}-text`}>
              <ReactMarkdown
                components={{
                  // Style headings with HwinNwin design
                  h1: ({ children }) => (
                    <h1 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white mb-8">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl lg:text-3xl font-semibold text-charcoal dark:text-hwin-white mt-12 mb-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl lg:text-2xl font-semibold text-charcoal dark:text-hwin-white mt-8 mb-4">
                      {children}
                    </h3>
                  ),
                  // Style paragraphs
                  p: ({ children }) => (
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                  // Style lists
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-6">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground flex items-start space-x-2">
                      <span className="text-gold">●</span>
                      <span>{children}</span>
                    </li>
                  ),
                  // Style links
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      className="text-gold hover:text-gold/80 transition-colors font-medium"
                      data-testid={`legal-${legalType}-link`}
                    >
                      {children}
                    </a>
                  ),
                  // Style strong text
                  strong: ({ children }) => (
                    <strong className="text-charcoal dark:text-hwin-white font-semibold">
                      {children}
                    </strong>
                  ),
                }}
              >
                {legalContent || `# ${pageTitle}\n\nContent not available.`}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home CTA */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid={`legal-${legalType}-cta-section`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Questions About Our Policies?
            </h2>
            <p className="text-lg text-muted-foreground">
              We're happy to clarify any aspect of our legal documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/hwin/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-charcoal font-medium rounded-lg transition-colors shadow-soft border-0"
                data-testid={`legal-${legalType}-contact-button`}
              >
                Contact Us
              </a>
              <a
                href="/hwin"
                className="inline-flex items-center justify-center px-6 py-3 bg-background hover:bg-muted text-charcoal dark:text-hwin-white font-medium rounded-lg transition-colors border border-muted-foreground/20"
                data-testid={`legal-${legalType}-home-button`}
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}