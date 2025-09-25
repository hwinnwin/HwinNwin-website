import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import QuoteForm from "@/components/quote-form";
import { CheckCircle, Clock, Phone, Mail, MapPin, AlertCircle } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";

export default function CustomerForm() {
  const [submissionState, setSubmissionState] = useState<{
    isSubmitted: boolean;
    quoteId?: string;
    emailSent?: boolean;
  }>({ isSubmitted: false });

  const handleQuoteSubmitted = (result: { quoteId: string; emailSent: boolean }) => {
    setSubmissionState({
      isSubmitted: true,
      quoteId: result.quoteId,
      emailSent: result.emailSent
    });
  };


  if (submissionState.isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Navigation Header */}
        <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-car text-primary-foreground text-lg"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Auto Panel Repair</h1>
                  <p className="text-xs text-muted-foreground">Professional Auto Damage Assessment</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-sm text-muted-foreground">Need help? Call: (03) 9123 4567</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Submission Success */}
        <section className="max-w-2xl mx-auto px-4 py-8">
          <Card className="shadow-lg border border-border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-2xl text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Quote Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">Thank you for your submission. We're reviewing your damage assessment and will have your quote ready soon.</p>
              
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                  <span className="font-medium text-foreground">Awaiting Owner Approval</span>
                </div>
                <p className="text-sm text-muted-foreground">Your quote is being reviewed by our specialists. You'll receive an email with pricing details once approved.</p>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Reference ID:</strong> <Badge variant="secondary" className="font-mono">{submissionState.quoteId?.slice(0, 8)}</Badge></p>
                <p><strong>Estimated Response:</strong> Within 24 hours</p>
                {submissionState.emailSent && (
                  <div className="flex items-center justify-center mt-2">
                    <CheckCircle className="text-green-600 mr-1" size={16} />
                    <span className="text-green-600">Confirmation email sent</span>
                  </div>
                )}
                {!submissionState.emailSent && (
                  <div className="flex items-center justify-center mt-2">
                    <AlertCircle className="text-yellow-600 mr-1" size={16} />
                    <span className="text-yellow-600">Email service unavailable - please save this reference</span>
                  </div>
                )}
                <p><strong>Need help?</strong> Call us at (03) 9123 4567</p>
              </div>

              <Button 
                onClick={() => setSubmissionState({ isSubmitted: false })} 
                className="mt-6"
                data-testid="button-submit-another"
              >
                Submit Another Quote
              </Button>
            </CardContent>
          </Card>
        </section>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-car text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Lee Murdok Panels</h1>
                <p className="text-xs text-muted-foreground">Professional Auto Damage Assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">Need help? Call: (03) 9123 4567</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Quote Form */}
      <QuoteForm onSubmitted={handleQuoteSubmitted} />

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <i className="fas fa-car text-primary-foreground"></i>
              </div>
              <span className="font-semibold text-foreground">Lee Murdok Panels</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Professional automotive damage assessment and repair services</p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <span className="flex items-center"><Phone className="mr-1" size={16} />(03) 9123 4567</span>
              <span className="flex items-center"><Mail className="mr-1" size={16} />info@leemurdokpanels.com.au</span>
              <span className="flex items-center"><MapPin className="mr-1" size={16} />Melbourne, VIC</span>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>&copy; 2024 Lee Murdok Panels. All rights reserved. | Licensed Motor Vehicle Trader</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
