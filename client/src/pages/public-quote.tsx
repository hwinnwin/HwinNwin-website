import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Car,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface PublicQuote {
  id: string;
  status: string;
  createdAt: string;
  customerName: string;
  vehicleRego: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePaint: string;
  items: Array<{
    panel: string;
    severity: string;
    blend: boolean;
    partsCost: number;
  }>;
  calculation: {
    repairHrs: number;
    paintHrs: number;
    labour: number;
    materials: number;
    parts: number;
    subtotalExGST: number;
    gst: number;
    totalIncGST: number;
    confidence: 'high' | 'low';
  };
  photos: string[];
}

export default function PublicQuote() {
  const [match, params] = useRoute("/q/:slug");
  const slug = params?.slug;

  const { data: quote, isLoading, error } = useQuery<PublicQuote>({
    queryKey: ['/q', slug],
    enabled: !!slug,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-32 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">Quote Not Found</h1>
              <p className="text-muted-foreground mb-4">
                This quote may not exist or is not yet available for viewing.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getValidUntilDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Card className="max-w-4xl mx-auto shadow-lg border border-border overflow-hidden">
        {/* Quote Header */}
        <div className="bg-primary text-primary-foreground px-6 py-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center mr-3">
              <Car className="text-primary-foreground text-xl" size={24} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">Auto Panel Repair</h1>
              <p className="text-primary-foreground/80">Professional Auto Damage Assessment</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold">Vehicle Damage Quote</h2>
          <p className="text-primary-foreground/90">Quote ID: {quote.id.slice(0, 8)}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Quote Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Vehicle Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Registration:</span> {quote.vehicleRego}</p>
                  <p><span className="text-muted-foreground">Make & Model:</span> {quote.vehicleYear} {quote.vehicleMake} {quote.vehicleModel}</p>
                  <p><span className="text-muted-foreground">Paint Type:</span> {quote.vehiclePaint.charAt(0).toUpperCase() + quote.vehiclePaint.slice(1)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Quote Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Date:</span> {formatDate(quote.createdAt)}</p>
                  <p>
                    <span className="text-muted-foreground">Status:</span> 
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Approved</Badge>
                  </p>
                  <p><span className="text-muted-foreground">Valid Until:</span> {getValidUntilDate(quote.createdAt)}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-muted-foreground mr-2">Confidence:</span>
                    <Badge 
                      variant="secondary" 
                      className={quote.calculation.confidence === 'high' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {quote.calculation.confidence.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Damage Photos */}
          {quote.photos && quote.photos.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Damage Assessment Photos</h3>
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

          {/* Damage Items */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Damage Assessment</h3>
            <div className="space-y-3">
              {quote.items.map((item, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.panel}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({item.severity} damage{item.blend ? ', blending required' : ''})
                        </span>
                        {item.partsCost > 0 && (
                          <span className="text-sm text-muted-foreground ml-2">
                            + AUD ${item.partsCost.toFixed(2)} parts
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quote Totals */}
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 text-center">Quote Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Labour ({quote.calculation.repairHrs + quote.calculation.paintHrs} hours @ AUD $120/hr):
                  </span>
                  <span>AUD ${quote.calculation.labour.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Materials ({quote.items.length} panels):
                  </span>
                  <span>AUD ${quote.calculation.materials.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parts & Components:</span>
                  <span>AUD ${quote.calculation.parts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-border pt-3">
                  <span>Subtotal (ex-GST):</span>
                  <span>AUD ${quote.calculation.subtotalExGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (10%):</span>
                  <span>AUD ${quote.calculation.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                  <span>Total (inc-GST):</span>
                  <span data-testid="text-total-amount">AUD ${quote.calculation.totalIncGST.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <h4 className="font-medium mb-2">Important Information</h4>
              <ul className="text-sm space-y-1">
                <li>• This is a provisional estimate based on photos provided</li>
                <li>• Final pricing may change after physical vehicle inspection</li>
                <li>• Quote valid for 30 days from issue date</li>
                <li>• All work covered by our quality guarantee</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Contact Information */}
          <Card className="bg-muted/30 text-center">
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Ready to proceed?</h4>
              <p className="text-muted-foreground mb-4">Contact us to schedule your repair</p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                <div className="flex items-center">
                  <Phone className="text-primary mr-2" size={16} />
                  <span>(03) 9123 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-primary mr-2" size={16} />
                  <span>quotes@leemurdokpanels.com.au</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-primary mr-2" size={16} />
                  <span>Melbourne, VIC</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.open(`/api/quote/${quote.id}/pdf`, '_blank')}
              data-testid="button-download-pdf"
            >
              <Download className="mr-2" size={16} />
              Download PDF
            </Button>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => window.open('tel:(03)91234567')}
              data-testid="button-call-to-book"
            >
              <Phone className="mr-2" size={16} />
              Call to Book
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-muted-foreground">
        <p>&copy; 2024 Auto Panel Repair. All rights reserved. | Licensed Motor Vehicle Trader</p>
        <p className="mt-1">Generated on {new Date().toLocaleDateString('en-AU')} at {new Date().toLocaleTimeString('en-AU')}</p>
      </footer>
    </div>
  );
}
