import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, Settings } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookieSettingsModal } from './CookieSettingsModal';

export function CookieConsentBanner() {
  const { hasConsented, acceptAll, rejectOptional } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);

  // Don't show banner if user has already consented
  if (hasConsented) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t border-border">
        <Card className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Cookie Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-2" data-testid="cookie-banner-title">
                Cookie Preferences
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to provide a better experience, analyze site traffic, and remember your preferences. 
                You can customize your cookie settings below or accept our recommended settings.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={acceptAll}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="cookie-accept-all"
                >
                  Accept All
                </Button>
                
                <Button
                  onClick={rejectOptional}
                  variant="outline"
                  data-testid="cookie-reject-optional"
                >
                  Essential Only
                </Button>
                
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="gap-2"
                  data-testid="cookie-customize"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cookie Settings Modal */}
      <CookieSettingsModal 
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}