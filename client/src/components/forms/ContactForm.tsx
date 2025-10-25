import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { simpleContactFormSchema, type SimpleContactForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CheckCircle, Send, AlertCircle } from "lucide-react";

interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
}

export default function ContactForm({ onSuccess, className = "" }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SimpleContactForm>({
    resolver: zodResolver(simpleContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      consent: false,
      website: "" // Honeypot field - should stay empty
    },
  });

  const contactMutation = useMutation({
    mutationFn: (data: SimpleContactForm) => apiRequest('POST', '/api/contact', data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
        duration: 5000,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Please try again later.",
      });
    },
  });

  const onSubmit = (data: SimpleContactForm) => {
    contactMutation.mutate(data);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    contactMutation.reset();
  };

  if (isSubmitted && !contactMutation.isError) {
    return (
      <div className={`text-center space-y-4 py-8 ${className}`} data-testid="success-state">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-semibold text-charcoal dark:text-hwin-white">
          Message Sent Successfully!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <Button 
          onClick={handleRetry}
          variant="outline"
          data-testid="button-send-another"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
          
          {/* Honeypot Field - Hidden from users */}
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
          </div>

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="contact-name">Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    id="contact-name"
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
                <FormLabel htmlFor="contact-email">Email Address *</FormLabel>
                <FormControl>
                  <Input 
                    id="contact-email"
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field}
                    data-testid="input-email"
                    disabled={contactMutation.isPending}
                  />
                </FormControl>
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
                <FormLabel htmlFor="contact-message">Message *</FormLabel>
                <FormControl>
                  <Textarea 
                    id="contact-message"
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    {...field}
                    data-testid="textarea-message"
                    disabled={contactMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Minimum 10 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Consent Checkbox */}
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={contactMutation.isPending}
                    data-testid="checkbox-consent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to be contacted about my inquiry *
                  </FormLabel>
                  <FormDescription>
                    We respect your privacy and will only contact you regarding your message.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Error Display */}
          {contactMutation.isError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3" data-testid="error-message">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">
                  Failed to send message
                </p>
                <p className="text-sm text-muted-foreground">
                  {(contactMutation.error as any)?.message || "Something went wrong. Please try again."}
                </p>
              </div>
              <Button 
                onClick={handleRetry}
                variant="outline"
                size="sm"
                data-testid="button-retry"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
            disabled={contactMutation.isPending}
            data-testid="button-submit"
          >
            {contactMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-charcoal mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
