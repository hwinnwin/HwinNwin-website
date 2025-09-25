import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Info, User, Car, Camera, Wrench } from "lucide-react";
import PhotoUpload from "./photo-upload";
import DamageAssessment from "./damage-assessment";
import type { DamageItem } from "@shared/schema";

const customerFormSchema = z.object({
  customerFirstName: z.string().min(1, "First name is required"),
  customerLastName: z.string().min(1, "Last name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email("Valid email is required"),
  vehicleRego: z.string().min(1, "Registration is required"),
  vehicleMake: z.string().min(1, "Make is required"),
  vehicleModel: z.string().min(1, "Model is required"),
  vehicleYear: z.string().min(4, "Year is required"),
  vehiclePaint: z.enum(["solid", "metallic", "pearlescent"]),
  items: z.array(z.object({
    panel: z.string().min(1),
    severity: z.enum(["minor", "moderate", "severe"]),
    partsCost: z.number().min(0).default(0),
    blend: z.boolean().default(false)
  })).min(1, "At least one damage item is required"),
  photosRepresentativeConfirmed: z.boolean().refine(val => val === true, "You must confirm photos are representative"),
  provisionalEstimateConfirmed: z.boolean().refine(val => val === true, "You must accept the provisional estimate terms")
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface QuoteFormProps {
  onSubmitted: (result: { quoteId: string; emailSent: boolean }) => void;
}

export default function QuoteForm({ onSubmitted }: QuoteFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [damageItems, setDamageItems] = useState<DamageItem[]>([
    { panel: "Front Bumper", severity: "moderate", partsCost: 0, blend: true }
  ]);
  
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerFirstName: "",
      customerLastName: "",
      customerPhone: "",
      customerEmail: "",
      vehicleRego: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehiclePaint: "metallic",
      items: damageItems,
      photosRepresentativeConfirmed: false,
      provisionalEstimateConfirmed: false
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      // Validate that we have required data
      if (!data.customerFirstName || !data.customerLastName || !data.customerEmail) {
        throw new Error('Required form fields are missing');
      }
      
      if (!data.items || data.items.length === 0) {
        throw new Error('At least one damage item is required');
      }
      
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'items') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // Add photos
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await apiRequest('POST', '/api/quote', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote Submitted",
        description: "Your quote request has been submitted successfully",
      });
      onSubmitted({
        quoteId: data.quoteId,
        emailSent: data.emailSent
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CustomerFormData) => {
    // Update items in form data
    const updatedData = { ...data, items: damageItems };
    submitMutation.mutate(updatedData);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <Card className="shadow-lg border border-border">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Get Your Auto Damage Quote</h2>
            <p className="text-muted-foreground">Upload photos and details for a professional assessment</p>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Provisional estimate only. Final price may change after physical inspection.
              </AlertDescription>
            </Alert>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Customer Information */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <User className="text-primary mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} data-testid="input-customer-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} data-testid="input-customer-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0400 123 456" {...field} data-testid="input-customer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-customer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Car className="text-primary mr-2" />
                  Vehicle Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleRego"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC123" {...field} data-testid="input-vehicle-rego" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-vehicle-make">
                              <SelectValue placeholder="Select Make" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Toyota">Toyota</SelectItem>
                            <SelectItem value="Ford">Ford</SelectItem>
                            <SelectItem value="Holden">Holden</SelectItem>
                            <SelectItem value="BMW">BMW</SelectItem>
                            <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                            <SelectItem value="Audi">Audi</SelectItem>
                            <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                            <SelectItem value="Mazda">Mazda</SelectItem>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Nissan">Nissan</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <FormControl>
                          <Input placeholder="Camry" {...field} data-testid="input-vehicle-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-vehicle-year">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 25 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehiclePaint"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Paint Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="solid" id="solid" data-testid="radio-paint-solid" />
                              <label htmlFor="solid" className="text-sm">Solid</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="metallic" id="metallic" data-testid="radio-paint-metallic" />
                              <label htmlFor="metallic" className="text-sm">Metallic</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pearlescent" id="pearlescent" data-testid="radio-paint-pearlescent" />
                              <label htmlFor="pearlescent" className="text-sm">Pearlescent</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Camera className="text-primary mr-2" />
                  Damage Photos
                </h3>
                <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
              </div>

              {/* Damage Assessment */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Wrench className="text-primary mr-2" />
                  Damage Assessment
                </h3>
                <DamageAssessment items={damageItems} onItemsChange={setDamageItems} />
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="photosRepresentativeConfirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-photos-representative"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I confirm that the uploaded photos are representative of the actual damage and vehicle condition. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provisionalEstimateConfirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-provisional-estimate"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I understand this is a provisional estimate only. The final price may change after physical inspection. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-accent text-accent-foreground px-8 py-3 hover:bg-accent/90"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-quote"
                >
                  {submitMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Submit Quote Request
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  You'll receive a confirmation email shortly. Our team will review and provide your quote within 24 hours.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
