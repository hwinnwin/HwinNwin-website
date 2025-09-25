import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, AlertCircle, Mail, ArrowLeft } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep = 'pin' | 'otp';

export default function PinModal({ isOpen, onClose, onSuccess }: PinModalProps) {
  const [step, setStep] = useState<AuthStep>('pin');
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (pin: string) => apiRequest('POST', '/api/owner/login', { pin }),
    onSuccess: (data: any) => {
      if (data.requiresOTP) {
        // 2FA is enabled - move to OTP step
        setStep('otp');
        setError("");
        setMaskedEmail(data.email || "");
        toast({
          title: "Verification Code Sent",
          description: `Check your email for the 6-digit code`,
        });
      } else {
        // No 2FA - complete login
        handleLoginSuccess();
      }
    },
    onError: (error) => {
      setError(error.message || "Invalid PIN");
      setPin("");
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => apiRequest('POST', '/api/owner/verify-otp', { otp }),
    onSuccess: () => {
      handleLoginSuccess();
    },
    onError: (error) => {
      setError(error.message || "Invalid verification code");
      setOtp("");
    }
  });

  const handleLoginSuccess = () => {
    setPin("");
    setOtp("");
    setError("");
    setStep('pin');
    setMaskedEmail("");
    toast({
      title: "Access Granted",
      description: "Welcome to the owner dashboard",
    });
    onSuccess();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("PIN is required");
      return;
    }
    setError("");
    loginMutation.mutate(pin);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    verifyOtpMutation.mutate(otp);
  };

  const handleClose = () => {
    setPin("");
    setOtp("");
    setError("");
    setStep('pin');
    setMaskedEmail("");
    onClose();
  };

  const handleBackToPin = () => {
    setStep('pin');
    setOtp("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'pin' ? (
                <Lock className="text-2xl text-primary" size={32} />
              ) : (
                <Mail className="text-2xl text-primary" size={32} />
              )}
            </div>
            <DialogTitle className="text-xl font-semibold">
              {step === 'pin' ? 'Owner Access' : 'Email Verification'}
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              {step === 'pin' 
                ? 'Enter your PIN to access the dashboard' 
                : `Enter the 6-digit code sent to ${maskedEmail}`
              }
            </p>
          </div>
        </DialogHeader>
        
        {step === 'pin' ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin-input" className="block text-sm font-medium text-foreground mb-2">
                PIN
              </label>
              <Input
                id="pin-input"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                data-testid="input-owner-pin"
                autoFocus
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel-pin"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={loginMutation.isPending || pin.length < 4}
                data-testid="button-submit-pin"
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2" size={16} />
                    Access
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp-input" className="block text-sm font-medium text-foreground mb-2 text-center">
                Verification Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                  data-testid="input-otp"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBackToPin}
                data-testid="button-back-to-pin"
              >
                <ArrowLeft className="mr-2" size={16} />
                Back
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={verifyOtpMutation.isPending || otp.length !== 6}
                data-testid="button-verify-otp"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2" size={16} />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            {step === 'pin' 
              ? 'Forgot your PIN? Contact system administrator.'
              : 'Code expires in 5 minutes. Check your spam folder if not received.'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
