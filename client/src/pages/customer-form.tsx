import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuoteForm from "@/components/quote-form";
import { CheckCircle, Clock, AlertCircle, Mail } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-b from-[#0A0D1A] via-[#0E1330] to-[#0A0D1A]">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D1A]/80 border-b border-slate-700/30">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-serif font-bold text-slate-100 hover:text-[#B4FFE7] transition-colors">
              hwinnwin
            </a>
            <nav className="hidden md:flex gap-8 text-sm" aria-label="Main navigation">
              <a href="/#ethos" className="text-slate-300 hover:text-slate-100 transition-colors">Ethos</a>
              <a href="/#codex" className="text-slate-300 hover:text-slate-100 transition-colors">Codex</a>
              <a href="/hwin" className="text-slate-300 hover:text-slate-100 transition-colors">Work</a>
              <a href="/panel-quote" className="text-slate-100 font-medium">Tools</a>
            </nav>
            <a href="mailto:hello@hwinnwin.com">
              <Button 
                variant="outline" 
                className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Contact us via email"
              >
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                Contact
              </Button>
            </a>
          </div>
        </header>

        {/* Submission Success */}
        <section className="container mx-auto px-6 py-16 max-w-2xl">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B4FFE7]/10 border border-[#B4FFE7]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-[#B4FFE7]" size={32} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-100 mb-3">Quote Request Submitted</h2>
              <p className="text-lg text-slate-300 mb-8">Your request has been received and is being reviewed.</p>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-[#A7B6FF]/10 border border-[#A7B6FF]/30 rounded-full flex items-center justify-center mr-3">
                    <Clock className="text-[#A7B6FF]" size={20} />
                  </div>
                  <span className="font-semibold text-slate-200">Awaiting Review</span>
                </div>
                <p className="text-sm text-slate-400">You'll receive confirmation and pricing details via email within 24 hours.</p>
              </div>

              <div className="space-y-3 text-slate-300">
                <p className="flex items-center justify-center">
                  <span className="text-slate-400 mr-2">Reference:</span>
                  <Badge variant="secondary" className="font-mono bg-slate-800 text-[#B4FFE7] border-slate-700">
                    {submissionState.quoteId?.slice(0, 8)}
                  </Badge>
                </p>
                {submissionState.emailSent && (
                  <div className="flex items-center justify-center text-[#B4FFE7]">
                    <CheckCircle className="mr-2" size={16} />
                    <span className="text-sm">Confirmation email sent</span>
                  </div>
                )}
                {!submissionState.emailSent && (
                  <div className="flex items-center justify-center text-[#A7B6FF]">
                    <AlertCircle className="mr-2" size={16} />
                    <span className="text-sm">Please save this reference number</span>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => setSubmissionState({ isSubmitted: false })} 
                className="mt-8 bg-[#A7B6FF] text-[#0A0D1A] hover:bg-[#B4FFE7] font-semibold px-6 py-3"
                data-testid="button-submit-another"
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700/30 bg-[#0A0D1A] mt-16">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <div>© 2025 hwinnwin. All frequencies reserved.</div>
              <div className="flex gap-6">
                <a href="/legal/privacy" className="hover:text-slate-200 transition-colors">Privacy</a>
                <a href="/legal/terms" className="hover:text-slate-200 transition-colors">Terms</a>
                <button 
                  onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                  className="hover:text-slate-200 transition-colors"
                >
                  Manage Cookies
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D1A] via-[#0E1330] to-[#0A0D1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D1A]/80 border-b border-slate-700/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-serif font-bold text-slate-100 hover:text-[#B4FFE7] transition-colors">
            hwinnwin
          </a>
          <nav className="hidden md:flex gap-8 text-sm" aria-label="Main navigation">
            <a href="/#ethos" className="text-slate-300 hover:text-slate-100 transition-colors">Ethos</a>
            <a href="/#codex" className="text-slate-300 hover:text-slate-100 transition-colors">Codex</a>
            <a href="/hwin" className="text-slate-300 hover:text-slate-100 transition-colors">Work</a>
            <a href="/panel-quote" className="text-slate-100 font-medium">Tools</a>
          </nav>
          <a href="mailto:hello@hwinnwin.com">
            <Button 
              variant="outline" 
              className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-slate-100"
              aria-label="Contact us via email"
            >
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
              Contact
            </Button>
          </a>
        </div>
      </header>

      {/* Quote Form */}
      <QuoteForm onSubmitted={handleQuoteSubmitted} />

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-[#0A0D1A] mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div>© 2025 hwinnwin. All frequencies reserved.</div>
            <div className="flex gap-6">
              <a href="/legal/privacy" className="hover:text-slate-200 transition-colors">Privacy</a>
              <a href="/legal/terms" className="hover:text-slate-200 transition-colors">Terms</a>
              <button 
                onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                className="hover:text-slate-200 transition-colors"
              >
                Manage Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
