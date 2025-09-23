import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Palette, 
  DollarSign, 
  Shield, 
  Mail,
  CheckCircle,
  AlertTriangle,
  Settings
} from "lucide-react";

const settingsSchema = z.object({
  labourRate: z.number().min(0).max(1000),
  materialsPerPanel: z.number().min(0).max(1000),
  partsMarkup: z.number().min(0).max(1),
  metallicMultiplier: z.number().min(1).max(3),
  pearlescentMultiplier: z.number().min(1).max(3),
  minJob: z.number().min(0).max(10000),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  fromEmail: z.string().email("Must be a valid email address"),
  siteUrl: z.string().url("Must be a valid URL"),
  sendgridApiKey: z.string().optional()
});

const pinChangeSchema = z.object({
  currentPin: z.string().min(4).max(6),
  newPin: z.string().min(4).max(6),
  confirmPin: z.string().min(4).max(6)
}).refine(data => data.newPin === data.confirmPin, {
  message: "PINs don't match",
  path: ["confirmPin"]
});

type SettingsFormData = z.infer<typeof settingsSchema>;
type PinChangeFormData = z.infer<typeof pinChangeSchema>;

interface Settings {
  labourRate: number;
  materialsPerPanel: number;
  partsMarkup: number;
  metallicMultiplier: number;
  pearlescentMultiplier: number;
  minJob: number;
  logoUrl: string;
  primaryColor: string;
  fromEmail: string;
  siteUrl: string;
}

export default function OwnerSettings() {
  const [location, navigate] = useLocation();
  const [showPinChange, setShowPinChange] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('401')) {
        navigate('/');
        return false;
      }
      return failureCount < 3;
    }
  });

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
  });

  const pinForm = useForm<PinChangeFormData>({
    resolver: zodResolver(pinChangeSchema),
    defaultValues: {
      currentPin: "",
      newPin: "",
      confirmPin: ""
    }
  });

  // Update form when settings data loads
  if (settings && !settingsForm.getValues().labourRate) {
    settingsForm.reset(settings);
  }

  const updateSettingsMutation = useMutation({
    mutationFn: (data: SettingsFormData) => 
      apiRequest('PATCH', '/api/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const changePinMutation = useMutation({
    mutationFn: (data: PinChangeFormData) =>
      apiRequest('POST', '/api/owner/change-pin', data),
    onSuccess: () => {
      toast({
        title: "PIN Changed",
        description: "Your PIN has been updated successfully",
      });
      setShowPinChange(false);
      pinForm.reset();
    },
    onError: (error) => {
      toast({
        title: "PIN Change Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSettingsSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  const onPinSubmit = (data: PinChangeFormData) => {
    changePinMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/owner')}
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
                <p className="text-xs text-muted-foreground">Lee Murdok Panels</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Brand & Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2" size={20} />
                Brand & Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={settingsForm.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="/static/lee-logo.png" 
                              {...field} 
                              data-testid="input-logo-url"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Used in quotes and PDFs</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex space-x-2">
                            <input 
                              type="color" 
                              value={field.value} 
                              onChange={field.onChange}
                              className="w-12 h-10 border border-input rounded"
                              data-testid="input-primary-color-picker"
                            />
                            <FormControl>
                              <Input 
                                {...field} 
                                className="flex-1"
                                data-testid="input-primary-color"
                              />
                            </FormControl>
                          </div>
                          <p className="text-xs text-muted-foreground">Applied to buttons and headers</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Default Rates */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <DollarSign className="mr-2" size={20} />
                      Default Rates (AUD)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={settingsForm.control}
                        name="labourRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Labour Rate</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  className="pl-8 pr-12" 
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-labour-rate"
                                />
                              </FormControl>
                              <span className="absolute right-3 top-2 text-muted-foreground">/hr</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="materialsPerPanel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Materials per Panel</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  className="pl-8" 
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-materials-per-panel"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="partsMarkup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parts Markup</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  className="pr-8" 
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-parts-markup"
                                />
                              </FormControl>
                              <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="metallicMultiplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Metallic Multiplier</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.05" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-metallic-multiplier"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="pearlescentMultiplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pearlescent Multiplier</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.05" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-pearlescent-multiplier"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="minJob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Job</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  className="pl-8" 
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-min-job"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Email Configuration */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <Mail className="mr-2" size={20} />
                      Email Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={settingsForm.control}
                        name="sendgridApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SendGrid API Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="SG.xxxxxxxxxxxxx" 
                                {...field} 
                                data-testid="input-sendgrid-api-key"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                {...field} 
                                data-testid="input-from-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={settingsForm.control}
                      name="siteUrl"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Site URL</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              {...field} 
                              data-testid="input-site-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Email Status:</strong> {settings?.sendgridApiKey ? 'Configured' : 'Not configured'}
                        {!settings?.sendgridApiKey && (
                          <span className="block mt-1 text-xs">
                            Quotes will be available for download and manual sharing until email is configured.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => settingsForm.reset(settings)}
                      data-testid="button-reset-settings"
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      data-testid="button-save-settings"
                    >
                      {updateSettingsMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={16} />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2" size={20} />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPinChange ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Change your owner PIN for dashboard access
                  </p>
                  <Button 
                    onClick={() => setShowPinChange(true)}
                    data-testid="button-change-pin"
                  >
                    Change PIN
                  </Button>
                </div>
              ) : (
                <Form {...pinForm}>
                  <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="max-w-md space-y-4">
                    <FormField
                      control={pinForm.control}
                      name="currentPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current PIN</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter current PIN" 
                              {...field} 
                              data-testid="input-current-pin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pinForm.control}
                      name="newPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New PIN (4-6 digits)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter new PIN" 
                              {...field} 
                              data-testid="input-new-pin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pinForm.control}
                      name="confirmPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New PIN</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm new PIN" 
                              {...field} 
                              data-testid="input-confirm-pin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowPinChange(false);
                          pinForm.reset();
                        }}
                        data-testid="button-cancel-pin-change"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={changePinMutation.isPending}
                        data-testid="button-save-pin"
                      >
                        {changePinMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Changing...
                          </>
                        ) : (
                          'Change PIN'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
