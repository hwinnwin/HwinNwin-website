import { useQuery } from "@tanstack/react-query";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { loadBrandData } from "@/lib/contentLoader";
import { Mail, MapPin, ArrowRight } from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export default function ContactPage() {
  const { data: brandData, isLoading } = useQuery({
    queryKey: ["brand-data"],
    queryFn: loadBrandData,
  });

  const { register, handleSubmit, setValue, watch } = useForm<ContactForm>();
  const selectedService = watch("service");

  const onSubmit = (data: ContactForm) => {
    // In a real implementation, this would send to a backend
    console.log("Contact form submitted:", data);
    // For now, we'll just show an alert
    alert("Thank you for your interest! We'll be in touch soon.");
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

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="contact-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="contact-headline">
              Let's Work Together
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="contact-subtitle">
              Ready to scale your business with structure, mindset, and excellence? Start the conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 lg:py-24" data-testid="contact-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Form */}
            <Card className="shadow-soft" data-testid="contact-form-card">
              <CardHeader>
                <CardTitle className="text-2xl text-charcoal dark:text-hwin-white">
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { required: true })}
                      placeholder="Your full name"
                      data-testid="input-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: true })}
                      placeholder="your.email@company.com"
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...register("company")}
                      placeholder="Your company name"
                      data-testid="input-company"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service">Service of Interest</Label>
                    <Select onValueChange={(value) => setValue("service", value)} data-testid="select-service">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulting">Business Consulting</SelectItem>
                        <SelectItem value="strategy">Strategic Planning</SelectItem>
                        <SelectItem value="implementation">Implementation Support</SelectItem>
                        <SelectItem value="custom">Custom Solution</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      {...register("message", { required: true })}
                      placeholder="Tell us about your business challenges and goals..."
                      rows={5}
                      data-testid="textarea-message"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
                    data-testid="submit-contact-form"
                  >
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8" data-testid="contact-info">
              <div>
                <h2 className="text-2xl font-bold text-charcoal dark:text-hwin-white mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gold mt-1" />
                    <div>
                      <h3 className="font-semibold text-charcoal dark:text-hwin-white">Location</h3>
                      <p className="text-muted-foreground">
                        {brandData?.organization.hq || "Melbourne, Australia"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gold mt-1" />
                    <div>
                      <h3 className="font-semibold text-charcoal dark:text-hwin-white">Email</h3>
                      <p className="text-muted-foreground">
                        We'll respond within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <Card className="bg-muted/20 border-gold/20" data-testid="why-choose-us">
                <CardHeader>
                  <CardTitle className="text-charcoal dark:text-hwin-white">
                    Why Choose HwinNwin?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-gold font-bold">●</span>
                    <div>
                      <h4 className="font-semibold text-charcoal dark:text-hwin-white">Power</h4>
                      <p className="text-sm text-muted-foreground">
                        Confident solutions with strong business impact
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-gold font-bold">●</span>
                    <div>
                      <h4 className="font-semibold text-charcoal dark:text-hwin-white">Balance</h4>
                      <p className="text-sm text-muted-foreground">
                        Harmonious approach that works for your entire organization
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-gold font-bold">●</span>
                    <div>
                      <h4 className="font-semibold text-charcoal dark:text-hwin-white">Prosperity</h4>
                      <p className="text-sm text-muted-foreground">
                        Lasting value that grows with your business
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <div className="bg-gold/10 rounded-2xl p-6 text-center" data-testid="response-time">
                <h3 className="font-semibold text-charcoal dark:text-hwin-white mb-2">
                  Quick Response
                </h3>
                <p className="text-sm text-muted-foreground">
                  We respond to all inquiries within 24 hours. 
                  Most responses happen much sooner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}