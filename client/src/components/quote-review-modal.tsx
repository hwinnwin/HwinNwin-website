import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuoteCalculation } from "@/hooks/use-quote-calculation";
import { VEHICLE_PANELS, DAMAGE_SEVERITIES } from "@/lib/constants";
import { 
  X, 
  Save, 
  Check, 
  Trash2, 
  Plus,
  AlertTriangle,
  ExternalLink,
  Download
} from "lucide-react";
import type { DamageItem } from "@shared/schema";

interface QuoteReviewModalProps {
  quoteId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Quote {
  id: string;
  status: 'new' | 'approved' | 'sent';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleRego: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePaint: 'solid' | 'metallic' | 'pearlescent';
  items: DamageItem[];
  rates: {
    labourRate: number;
    materialsPerPanel: number;
    partsMarkup: number;
    metallicMultiplier: number;
    pearlescentMultiplier: number;
    minJob: number;
  };
  calculation: {
    repairHrs: number;
    paintHrs: number;
    labour: number;
    materials: number;
    parts: number;
    subtotalExGST: number;
    gst: number;
    totalIncGST: number;
    blendPanels: number;
    confidence: 'high' | 'low';
  };
  photos: string[];
  ownerNotes: string;
  estimatedHours: number;
  customerLinkSlug: string;
}

const reviewSchema = z.object({
  items: z.array(z.object({
    panel: z.string().min(1),
    severity: z.enum(["minor", "moderate", "severe"]),
    partsCost: z.number().min(0),
    blend: z.boolean()
  })),
  rates: z.object({
    labourRate: z.number().min(0),
    materialsPerPanel: z.number().min(0),
    partsMarkup: z.number().min(0),
    metallicMultiplier: z.number().min(1),
    pearlescentMultiplier: z.number().min(1),
    minJob: z.number().min(0)
  }),
  estimatedHours: z.number().min(0).optional(),
  ownerNotes: z.string().optional()
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function QuoteReviewModal({ quoteId, isOpen, onClose }: QuoteReviewModalProps) {
  const [items, setItems] = useState<DamageItem[]>([]);
  const [useManualHours, setUseManualHours] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ['/api/quote', quoteId],
    enabled: isOpen && !!quoteId
  });

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      items: [],
      rates: {
        labourRate: 120,
        materialsPerPanel: 85,
        partsMarkup: 0.15,
        metallicMultiplier: 1.15,
        pearlescentMultiplier: 1.25,
        minJob: 220
      },
      estimatedHours: 0,
      ownerNotes: ""
    }
  });

  useEffect(() => {
    if (quote) {
      setItems(quote.items);
      form.reset({
        items: quote.items,
        rates: quote.rates,
        estimatedHours: quote.estimatedHours || 0,
        ownerNotes: quote.ownerNotes || ""
      });
      setUseManualHours(quote.estimatedHours > 0);
    }
  }, [quote, form]);

  const rates = form.watch('rates');
  const estimatedHours = form.watch('estimatedHours');
  const manualHours = useManualHours && estimatedHours ? estimatedHours : null;
  const calculation = useQuoteCalculation(items, quote?.vehiclePaint || 'metallic', rates, true, manualHours);

  const updateMutation = useMutation({
    mutationFn: (data: ReviewFormData) =>
      apiRequest('PATCH', `/api/quote/${quoteId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Quote Updated",
        description: "Changes have been saved successfully",
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

  const approveMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/quote/${quoteId}/approve`),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Quote Approved",
        description: "Quote has been approved and sent to customer",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/quote/${quoteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Quote Deleted",
        description: "Quote has been deleted successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateItem = (index: number, updates: Partial<DamageItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const addItem = () => {
    const newItem: DamageItem = {
      panel: "Front Bumper",
      severity: "minor",
      partsCost: 0,
      blend: false
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const onSubmit = (data: ReviewFormData) => {
    const updatedData = { ...data, items };
    updateMutation.mutate(updatedData);
  };

  const handleApprove = () => {
    // Save changes first, then approve
    const formData = form.getValues();
    const updatedData = { ...formData, items };
    
    updateMutation.mutate(updatedData, {
      onSuccess: () => {
        approveMutation.mutate();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Review Quote: {quoteId?.slice(0, 8)}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        ) : !quote ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Quote not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {quote.customerName}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {quote.customerPhone}</p>
                    <p><span className="text-muted-foreground">Email:</span> {quote.customerEmail}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">Vehicle Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Registration:</span> {quote.vehicleRego}</p>
                    <p><span className="text-muted-foreground">Vehicle:</span> {quote.vehicleYear} {quote.vehicleMake} {quote.vehicleModel}</p>
                    <p><span className="text-muted-foreground">Paint:</span> {quote.vehiclePaint.charAt(0).toUpperCase() + quote.vehiclePaint.slice(1)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Confidence Badge */}
            {calculation.confidence === 'low' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-medium">Low Confidence Assessment</h4>
                      <p className="text-sm mt-1">Multiple panels affected or missing key photos. Physical inspection recommended.</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Uploaded Photos */}
            {quote.photos && quote.photos.length > 0 && (
              <div>
                <h3 className="font-medium text-foreground mb-3">Uploaded Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quote.photos.map((photo, index) => (
                    <img 
                      key={index}
                      src={`/uploads/${photo}`} 
                      alt={`Damage photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90"
                      onClick={() => window.open(`/uploads/${photo}`, '_blank')}
                      data-testid={`photo-${index}`}
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Editable Rates Section */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground mb-3">Current Rates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <FormField
                        control={form.control}
                        name="rates.labourRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Labour Rate</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-labour-rate"
                              />
                            </FormControl>
                            <span className="text-xs text-muted-foreground">AUD/hr</span>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rates.materialsPerPanel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Materials/Panel</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-materials-per-panel"
                              />
                            </FormControl>
                            <span className="text-xs text-muted-foreground">AUD</span>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rates.partsMarkup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Parts Markup</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-parts-markup"
                              />
                            </FormControl>
                            <span className="text-xs text-muted-foreground">%</span>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rates.metallicMultiplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Metallic Mult.</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.05"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-metallic-multiplier"
                              />
                            </FormControl>
                            <span className="text-xs text-muted-foreground">x</span>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Damage Items */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Damage Assessment & Pricing</h3>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <Card key={index} className="border">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <FormLabel className="text-sm text-muted-foreground mb-1">Panel</FormLabel>
                              <Select 
                                value={item.panel} 
                                onValueChange={(value) => updateItem(index, { panel: value })}
                              >
                                <SelectTrigger data-testid={`select-panel-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VEHICLE_PANELS.map(panel => (
                                    <SelectItem key={panel} value={panel}>{panel}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <FormLabel className="text-sm text-muted-foreground mb-1">Severity</FormLabel>
                              <Select 
                                value={item.severity} 
                                onValueChange={(value) => updateItem(index, { severity: value as DamageItem['severity'] })}
                              >
                                <SelectTrigger data-testid={`select-severity-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DAMAGE_SEVERITIES.map(severity => (
                                    <SelectItem key={severity.value} value={severity.value}>
                                      {severity.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <FormLabel className="text-sm text-muted-foreground mb-1">Parts Cost (AUD)</FormLabel>
                              <Input 
                                type="number" 
                                value={item.partsCost}
                                onChange={(e) => updateItem(index, { partsCost: parseFloat(e.target.value) || 0 })}
                                data-testid={`input-parts-cost-${index}`}
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={item.blend}
                                  onCheckedChange={(checked) => updateItem(index, { blend: !!checked })}
                                  data-testid={`checkbox-blend-${index}`}
                                />
                                <FormLabel className="text-sm">Blend</FormLabel>
                              </div>
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="ml-2"
                                  data-testid={`button-remove-item-${index}`}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      data-testid="button-add-item"
                    >
                      <Plus className="mr-2" size={16} />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Manual Hours Override */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">Manual Hours Override (Testing)</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={useManualHours} 
                          onCheckedChange={(checked) => setUseManualHours(checked === true)}
                          data-testid="checkbox-use-manual-hours"
                        />
                        <label className="text-sm text-muted-foreground">Enable Override</label>
                      </div>
                    </div>
                    
                    {useManualHours && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="estimatedHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm text-muted-foreground">Estimated Hours</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  min="0"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-estimated-hours"
                                  placeholder="Enter total labor hours"
                                />
                              </FormControl>
                              <span className="text-xs text-muted-foreground">Total labor hours for this job</span>
                            </FormItem>
                          )}
                        />
                        <div className="flex items-end">
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Trigger recalculation by forcing re-render
                              form.setValue('estimatedHours', form.getValues('estimatedHours'));
                            }}
                            data-testid="button-recalculate"
                          >
                            🧮 Recalculate
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {useManualHours && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Manual hours override is active. Labor costs will be calculated using {estimatedHours || 0} hours instead of auto-calculated hours ({(calculation.repairHrs + calculation.paintHrs).toFixed(1)} hrs).
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Quote Calculation */}
                <Card className="bg-primary/5">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground mb-3">Quote Calculation {useManualHours ? '(Manual Hours)' : '(Auto-Calculated)'}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Repair Hours:</span>
                        <div className="font-medium">{calculation.repairHrs} hrs</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paint Hours:</span>
                        <div className="font-medium">{calculation.paintHrs} hrs</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Labour:</span>
                        <div className="font-medium">AUD ${calculation.labour.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Materials:</span>
                        <div className="font-medium">AUD ${calculation.materials.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal (ex-GST):</span>
                          <span className="font-medium">AUD ${calculation.subtotalExGST.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST (10%):</span>
                          <span className="font-medium">AUD ${calculation.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                          <span>Total (inc-GST):</span>
                          <span data-testid="text-total-amount">AUD ${calculation.totalIncGST.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Owner Notes */}
                <FormField
                  control={form.control}
                  name="ownerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Owner Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="Add notes for internal reference..."
                          data-testid="textarea-owner-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <div className="flex space-x-3">
                    <Button 
                      type="submit"
                      variant="secondary"
                      disabled={updateMutation.isPending}
                      data-testid="button-save-changes"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={16} />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      data-testid="button-delete-quote"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2" size={16} />
                          Delete Quote
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    {quote.status === 'new' && (
                      <Button 
                        type="button"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending || updateMutation.isPending}
                        data-testid="button-approve-quote"
                      >
                        {(approveMutation.isPending || updateMutation.isPending) ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2" size={16} />
                            Approve & Send Quote
                          </>
                        )}
                      </Button>
                    )}
                    {(quote.status === 'approved' || quote.status === 'sent') && (
                      <div className="flex space-x-2">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => window.open(`/api/quote/${quote.id}/pdf`, '_blank')}
                          data-testid="button-download-pdf"
                        >
                          <Download className="mr-2" size={16} />
                          PDF
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => window.open(`/q/${quote.customerLinkSlug}`, '_blank')}
                          data-testid="button-view-public"
                        >
                          <ExternalLink className="mr-2" size={16} />
                          Public Link
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
