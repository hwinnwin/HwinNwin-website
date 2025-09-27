import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, BarChart3, Settings, Megaphone } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { COOKIE_CATEGORIES, CookieCategory, CookieConsent, DEFAULT_CONSENT } from '@/types/cookies';

interface CookieSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_ICONS: Record<CookieCategory, React.ReactNode> = {
  essential: <Shield className="w-5 h-5 text-green-600" />,
  analytics: <BarChart3 className="w-5 h-5 text-blue-600" />,
  functional: <Settings className="w-5 h-5 text-purple-600" />,
  marketing: <Megaphone className="w-5 h-5 text-orange-600" />
};

export function CookieSettingsModal({ open, onOpenChange }: CookieSettingsModalProps) {
  const { consent, updateConsent, acceptAll, rejectOptional } = useCookieConsent();
  const [localConsent, setLocalConsent] = useState<CookieConsent>(consent || DEFAULT_CONSENT);

  // Update local state when consent changes
  useEffect(() => {
    if (consent) {
      setLocalConsent(consent);
    }
  }, [consent]);

  const handleCategoryToggle = (category: CookieCategory, enabled: boolean) => {
    setLocalConsent(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const handleSave = () => {
    updateConsent(localConsent);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    onOpenChange(false);
  };

  const handleRejectOptional = () => {
    rejectOptional();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle data-testid="cookie-settings-title">
            Cookie Settings
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
            Essential cookies cannot be disabled as they are required for the website to function.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-6">
          <div className="space-y-6">
            {Object.entries(COOKIE_CATEGORIES).map(([category, info]) => {
              const categoryKey = category as CookieCategory;
              const isEnabled = localConsent[categoryKey];
              const isRequired = info.required;

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {CATEGORY_ICONS[categoryKey]}
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {info.name}
                          {isRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </h4>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(enabled) => handleCategoryToggle(categoryKey, enabled)}
                      disabled={isRequired}
                      data-testid={`cookie-toggle-${category}`}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground pl-8">
                    {info.description}
                  </p>

                  <div className="pl-8">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Examples: </span>
                      {info.examples.join(', ')}
                    </div>
                  </div>

                  <Separator className="my-4" />
                </div>
              );
            })}

            {/* Additional Information */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h5 className="font-medium text-sm">Your Privacy Rights</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• You can change these settings at any time via the cookie preferences link</li>
                <li>• We do not sell your personal information to third parties</li>
                <li>• Essential cookies are necessary for basic website functionality</li>
                <li>• Analytics cookies help us improve our website experience</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleRejectOptional}
              variant="outline"
              data-testid="cookie-modal-reject"
            >
              Essential Only
            </Button>
            <Button
              onClick={handleAcceptAll}
              variant="outline"
              data-testid="cookie-modal-accept-all"
            >
              Accept All
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground"
              data-testid="cookie-modal-save"
            >
              Save Preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}