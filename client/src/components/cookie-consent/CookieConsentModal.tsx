import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getConsent, setConsent, acceptAll, rejectAll, checkDoNotTrack, CookiePreferences } from "@/lib/cookies/consent";

interface CookieConsentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CookieConsentModal({ open, onClose }: CookieConsentModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    preferences: false,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
    version: 1
  });

  const isDNT = checkDoNotTrack();

  useEffect(() => {
    const current = getConsent();
    if (current) {
      setPreferences(current);
    }
  }, [open]);

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === 'essential' || category === 'timestamp' || category === 'version') return;
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = () => {
    setConsent(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleRejectAll = () => {
    rejectAll();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-cookie-consent">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cookie Preferences</DialogTitle>
          <DialogDescription>
            We use cookies to enhance your experience. You can customize your preferences below.
            {isDNT && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
                <strong>Do Not Track detected:</strong> We've disabled non-essential cookies by default.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Essential Cookies */}
          <div className="space-y-2" data-testid="cookie-category-essential">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Essential Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function properly. These cannot be disabled.
                </p>
              </div>
              <Switch
                checked={true}
                disabled={true}
                data-testid="switch-essential"
              />
            </div>
          </div>

          {/* Preferences Cookies */}
          <div className="space-y-2" data-testid="cookie-category-preferences">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Preference Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Remember your settings and preferences (e.g., language, theme).
                </p>
              </div>
              <Switch
                checked={preferences.preferences}
                onCheckedChange={() => handleToggle('preferences')}
                data-testid="switch-preferences"
              />
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="space-y-2" data-testid="cookie-category-analytics">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Analytics Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website (privacy-focused analytics).
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={() => handleToggle('analytics')}
                data-testid="switch-analytics"
              />
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="space-y-2" data-testid="cookie-category-marketing">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Marketing Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Used to deliver personalized advertising and track campaign performance.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={() => handleToggle('marketing')}
                data-testid="switch-marketing"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleRejectAll}
            data-testid="button-reject-all"
          >
            Reject All
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            data-testid="button-save-preferences"
          >
            Save Preferences
          </Button>
          <Button
            onClick={handleAcceptAll}
            data-testid="button-accept-all"
          >
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
