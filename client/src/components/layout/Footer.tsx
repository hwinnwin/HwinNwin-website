import { Link } from "wouter";
import { Mail, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { loadBrandData } from "@/lib/contentLoader";
import logoUrl from "@assets/small simple logo_1758679347610.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { data: brandData } = useQuery({
    queryKey: ["brand-data"],
    queryFn: loadBrandData,
  });

  const footerSections = [
    {
      title: "Services",
      links: [
        { href: "/hwin/services", label: "All Services" },
        { href: "/hwin/services#consulting", label: "Business Consulting" },
        { href: "/hwin/services#strategy", label: "Strategic Planning" },
        { href: "/hwin/services#implementation", label: "Implementation" },
      ]
    },
    {
      title: "Company",
      links: [
        { href: "/hwin/about", label: "About Us" },
        { href: "/hwin/work", label: "Case Studies" },
        { href: "/hwin/insights", label: "Insights" },
        { href: "/hwin/contact", label: "Contact" },
      ]
    },
    {
      title: "Legal",
      links: [
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/terms", label: "Terms of Service" },
        { href: "/legal/cookies", label: "Cookie Policy" },
      ]
    }
  ];

  return (
    <footer className="bg-charcoal text-hwin-white border-t border-charcoal-2" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/hwin" className="flex items-center space-x-3" data-testid="footer-logo-link">
              <img 
                src={logoUrl} 
                alt="HwinNwin Logo" 
                className="h-8 w-8 opacity-90"
                data-testid="footer-logo-image"
              />
              <span className="text-xl font-medium tracking-tight">
                HwinNwin
              </span>
            </Link>
            
            <p className="text-hwin-white/80 text-sm leading-relaxed max-w-md">
              Helping businesses scale with structure, mindset, and excellence. 
              We deliver <span className="text-gold">powerful</span> solutions 
              with <span className="text-gold">balanced</span> approach for 
              lasting <span className="text-gold">prosperity</span>.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-hwin-white/80">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Melbourne, Australia</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-hwin-white/80">
                <Mail className="h-4 w-4 text-gold" />
                <Link 
                  href={`mailto:${brandData?.organization?.email_public || 'hello@hwinnwin.com'}`} 
                  className="hover:text-gold transition-colors"
                  data-testid="footer-email-link"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-base font-medium text-hwin-white" data-testid={`footer-section-${section.title.toLowerCase()}`}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-hwin-white/80 hover:text-gold transition-colors"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-charcoal-2">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-hwin-white/60" data-testid="footer-copyright">
              © {currentYear} HwinNwin Pty Ltd. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6">
              <p className="text-xs text-hwin-white/40">
                Built with <span className="text-gold">●</span> Power 
                <span className="text-gold">●</span> Balance 
                <span className="text-gold">●</span> Prosperity
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}