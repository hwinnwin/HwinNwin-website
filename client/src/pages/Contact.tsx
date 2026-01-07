import ContactForm from "@/components/forms/ContactForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Clock } from "lucide-react";
import { SEO } from "@/lib/seo/meta";
import { SITE_CONFIG } from "@/lib/constants";

export default function ContactPage() {
  return (
    <>
      <SEO 
        title="Get In Touch - Contact Us | HwinNwin"
        description="Have a question or want to work together? Send us a message and we'll respond within 24 hours. Based in Melbourne, Australia."
        ogTitle="Contact HwinNwin - Let's Build Together"
        ogDescription="Connect with our team to discuss your project. Fast response times, personalized service, and expert guidance."
        ogType="website"
        canonical={`${SITE_CONFIG.baseUrl}/contact`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="py-20 lg:py-32" data-testid="hero-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 
                className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight"
                data-testid="heading-main"
              >
                Get In Touch
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-subtitle">
                Have a question or want to work together? Send us a message and we'll respond within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="pb-20 lg:pb-32" data-testid="contact-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              
              {/* Contact Form Card */}
              <Card className="shadow-lg" data-testid="card-contact-form">
                <CardHeader>
                  <CardTitle className="text-2xl text-charcoal dark:text-hwin-white">
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8" data-testid="contact-info">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal dark:text-hwin-white mb-6">
                    Contact Information
                  </h2>
                  
                  <div className="space-y-6">
                    
                    {/* Email */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-gold" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal dark:text-hwin-white mb-1">
                          Email
                        </h3>
                        <p className="text-muted-foreground">
                          We'll respond within 24 hours
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Most responses happen much sooner
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-gold" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal dark:text-hwin-white mb-1">
                          Location
                        </h3>
                        <p className="text-muted-foreground">
                          Melbourne, Australia
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Serving businesses across Australia
                        </p>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-gold" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal dark:text-hwin-white mb-1">
                          Response Time
                        </h3>
                        <p className="text-muted-foreground">
                          Within 24 hours
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Business hours: Mon-Fri 9AM-6PM AEST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info Card */}
                <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/30">
                  <CardHeader>
                    <CardTitle className="text-charcoal dark:text-hwin-white">
                      Why Work With Us?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-charcoal dark:text-hwin-white">Fast Response:</strong> We reply to all messages within 24 hours
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-charcoal dark:text-hwin-white">Personalized Service:</strong> Every inquiry gets individual attention
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-charcoal dark:text-hwin-white">Expert Guidance:</strong> Get advice from experienced professionals
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
