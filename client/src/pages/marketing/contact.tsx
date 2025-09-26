import { useQuery, useMutation } from "@tanstack/react-query";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactForm } from "@shared/schema";
import { loadBrandData } from "@/lib/contentLoader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, ArrowRight, Calendar, ExternalLink, CheckCircle, Phone } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const { data: brandData, isLoading } = useQuery({
    queryKey: ["brand-data"],
    queryFn: loadBrandData,
  });

  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      service: "",
      message: "",
      website: "", // Honeypot field
      url: "", // Honeypot field
      honeypot: "" // Honeypot field
    },
  });

  const contactMutation = useMutation({
    mutationFn: (data: ContactForm) => apiRequest('POST', '/api/contact', data),
    onSuccess: (response) => {
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll be in touch within 24 hours.",
        duration: 5000,
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Please try again later.",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  const handleBookCall = () => {
    const bookingLink = brandData?.organization?.booking_link;
    if (bookingLink && bookingLink !== "REPLACE_ME_CAL_COM_LINK") {
      window.open(bookingLink, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        variant: "destructive",
        title: "Booking unavailable",
        description: "Please contact us directly to schedule a call.",
      });
    }
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

            {/* Cal.com Integration Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                onClick={handleBookCall}
                size="lg" 
                className="bg-gold hover:bg-gold/90 text-charcoal font-semibold shadow-lg border-0 px-8 py-3"
                data-testid="book-strategy-call"
                aria-label="Book a strategy call with HwinNwin"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Strategy Call
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground">
                or send us a message below
              </span>
            </div>
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
                {isSubmitted ? (
                  <div className="text-center space-y-4 py-8" data-testid="success-message">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-charcoal dark:text-hwin-white">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      data-testid="send-another-message"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                      {/* Honeypot Fields - Hidden from users */}
                      <div style={{ display: 'none' }} aria-hidden="true">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} tabIndex={-1} autoComplete="off" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <Input {...field} tabIndex={-1} autoComplete="off" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="honeypot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Honeypot</FormLabel>
                              <FormControl>
                                <Input {...field} tabIndex={-1} autoComplete="off" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Name Field */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="name">Full Name *</FormLabel>
                            <FormControl>
                              <Input 
                                id="name"
                                placeholder="Your full name" 
                                {...field}
                                data-testid="input-name"
                                disabled={contactMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email Field */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="email">Email Address *</FormLabel>
                            <FormControl>
                              <Input 
                                id="email"
                                type="email" 
                                placeholder="your.email@company.com" 
                                {...field}
                                data-testid="input-email"
                                disabled={contactMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Company Field */}
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="company">Company</FormLabel>
                            <FormControl>
                              <Input 
                                id="company"
                                placeholder="Your company name" 
                                {...field}
                                data-testid="input-company"
                                disabled={contactMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone Field */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="phone">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                id="phone"
                                type="tel"
                                placeholder="+61 4XX XXX XXX" 
                                {...field}
                                data-testid="input-phone"
                                disabled={contactMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Service Field */}
                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="service">Service of Interest</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={contactMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-service">
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="consulting">Business Consulting</SelectItem>
                                <SelectItem value="strategy">Strategic Planning</SelectItem>
                                <SelectItem value="implementation">Implementation Support</SelectItem>
                                <SelectItem value="custom">Custom Solution</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Message Field */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="message">Message *</FormLabel>
                            <FormControl>
                              <Textarea 
                                id="message"
                                placeholder="Tell us about your business challenges and goals..."
                                rows={5}
                                {...field}
                                data-testid="textarea-message"
                                disabled={contactMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
                        disabled={contactMutation.isPending}
                        data-testid="submit-contact-form"
                      >
                        {contactMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-charcoal mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
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
                      <h3 className="font-semibold text-charcoal dark:text-hwin-white">Melbourne Office</h3>
                      <p className="text-muted-foreground">
                        {brandData?.organization?.hq || "Melbourne, Australia"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Serving businesses across Australia and internationally
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gold mt-1" />
                    <div>
                      <h3 className="font-semibold text-charcoal dark:text-hwin-white">Email Response</h3>
                      <p className="text-muted-foreground">
                        We'll respond within 24 hours
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Most responses happen much sooner
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gold mt-1" />
                    <div>
                      <h3 className="font-semibold text-charcoal dark:text-hwin-white">Strategy Calls</h3>
                      <p className="text-muted-foreground">
                        Book a complimentary consultation
                      </p>
                      <Button 
                        onClick={handleBookCall}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        data-testid="book-call-secondary"
                      >
                        Schedule Now
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us - 3P Check */}
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
                        Confident solutions with strong business impact that drive real results
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-gold font-bold">●</span>
                    <div>
                      <h4 className="font-semibold text-charcoal dark:text-hwin-white">Balance</h4>
                      <p className="text-sm text-muted-foreground">
                        Harmonious approach that works for your entire organization and culture
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-gold font-bold">●</span>
                    <div>
                      <h4 className="font-semibold text-charcoal dark:text-hwin-white">Prosperity</h4>
                      <p className="text-sm text-muted-foreground">
                        Lasting value that grows with your business and creates sustainable success
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Overview */}
              <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/30" data-testid="service-overview">
                <CardHeader>
                  <CardTitle className="text-charcoal dark:text-hwin-white">
                    Our Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">Strategic Business Planning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">Process Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">Leadership Development</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">Custom Solutions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <div className="bg-gold/10 rounded-2xl p-6 text-center border border-gold/20" data-testid="response-time">
                <h3 className="font-semibold text-charcoal dark:text-hwin-white mb-2">
                  Quick Response Guarantee
                </h3>
                <p className="text-sm text-muted-foreground">
                  We respond to all inquiries within 24 hours. 
                  Most responses happen within a few hours during business days.
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <strong>Business Hours:</strong> Mon-Fri 9AM-6PM AEST
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}