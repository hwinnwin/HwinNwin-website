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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, AlertCircle } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinModal({ isOpen, onClose, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (pin: string) => apiRequest('POST', '/api/owner/login', { pin }),
    onSuccess: () => {
      setPin("");
      setError("");
      toast({
        title: "Access Granted",
        description: "Welcome to the owner dashboard",
      });
      onSuccess();
    },
    onError: (error) => {
      setError(error.message || "Invalid PIN");
      setPin("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }
    setError("");
    loginMutation.mutate(pin);
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-2xl text-primary" size={32} />
            </div>
            <DialogTitle className="text-xl font-semibold">Owner Access</DialogTitle>
            <p className="text-muted-foreground mt-2">Enter your PIN to access the dashboard</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  <i className="fas fa-spinner fa-spin mr-2"></i>
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
        
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Forgot your PIN? Contact system administrator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
