import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { CookieSettingsModal } from '@/components/cookie-consent/CookieSettingsModal';

interface CookiePreferencesLinkProps {
  variant?: 'link' | 'button';
  className?: string;
}

export function CookiePreferencesLink({ 
  variant = 'link',
  className = ''
}: CookiePreferencesLinkProps) {
  const [showSettings, setShowSettings] = useState(false);

  if (variant === 'button') {
    return (
      <>
        <Button
          onClick={() => setShowSettings(true)}
          variant="outline"
          size="sm"
          className={`gap-2 ${className}`}
          data-testid="cookie-preferences-button"
        >
          <Settings className="w-4 h-4" />
          Cookie Preferences
        </Button>

        <CookieSettingsModal 
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className={`text-sm text-muted-foreground hover:text-foreground transition-colors underline ${className}`}
        data-testid="cookie-preferences-link"
      >
        Cookie Preferences
      </button>

      <CookieSettingsModal 
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}