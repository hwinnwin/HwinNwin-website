import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QuoteReviewModal from "@/components/quote-review-modal";
import { 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Settings, 
  LogOut, 
  Filter, 
  Download,
  Eye,
  Edit,
  File,
  Share,
  TrendingUp
} from "lucide-react";

interface Quote {
  id: string;
  status: 'new' | 'approved' | 'sent';
  createdAt: string;
  customerName: string;
  customerEmail: string;
  vehicleRego: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  calculation: {
    totalIncGST: number;
    confidence: 'high' | 'low';
  };
  items: Array<{
    panel: string;
    severity: string;
  }>;
}

interface Analytics {
  totalQuotes: number;
  approvedQuotes: number;
  averageTotal: number;
  pendingReview: number;
  last7Days: number;
  conversionRate: number;
}

export default function OwnerDashboard() {
  const [location, navigate] = useLocation();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        navigate('/');
        return false;
      }
      return failureCount < 3;
    }
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        navigate('/');
        return false;
      }
      return failureCount < 3;
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/owner/logout'),
    onSuccess: () => {
      queryClient.clear();
      navigate('/');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'sent':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    return confidence === 'high' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">High</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-800">Low</Badge>;
  };

  if (analyticsLoading || quotesLoading) {
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-car text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Lee Murdok Panels</h1>
                <p className="text-xs text-muted-foreground">Owner Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/owner/content')}
                data-testid="button-content-editor"
              >
                <Edit className="mr-2" size={16} />
                Content Editor
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/owner/settings')}
                data-testid="button-settings"
              >
                <Settings className="mr-2" size={16} />
                Settings
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manage quotes, settings, and analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-quotes">
                    {analytics?.totalQuotes || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary" size={20} />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp className="mr-1" size={12} />
                +{analytics?.last7Days || 0} this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved Quotes</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-approved-quotes">
                    {analytics?.approvedQuotes || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {analytics?.conversionRate || 0}% approval rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Quote</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-average-quote">
                    AUD ${(analytics?.averageTotal || 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-accent" size={20} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-pending-review">
                    {analytics?.pendingReview || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={20} />
                </div>
              </div>
              {(analytics?.pendingReview || 0) > 0 && (
                <p className="text-xs text-yellow-600 mt-2">Requires attention</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quotes Management Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Recent Quotes</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" data-testid="button-filter">
                  <Filter className="mr-1" size={16} />
                  Filter
                </Button>
                <Button variant="outline" size="sm" data-testid="button-export">
                  <Download className="mr-1" size={16} />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Total (AUD)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes?.map((quote) => (
                    <TableRow key={quote.id} className="hover:bg-muted/50" data-testid={`row-quote-${quote.id}`}>
                      <TableCell className="font-mono text-sm">{quote.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{quote.customerName}</div>
                          <div className="text-sm text-muted-foreground">{quote.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{quote.vehicleYear} {quote.vehicleMake} {quote.vehicleModel}</div>
                          <div className="text-sm text-muted-foreground">{quote.vehicleRego}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>{getConfidenceBadge(quote.calculation.confidence)}</TableCell>
                      <TableCell className="font-semibold">
                        {quote.status === 'new' ? '-' : `$${quote.calculation.totalIncGST.toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedQuoteId(quote.id)}
                            data-testid={`button-review-${quote.id}`}
                          >
                            {quote.status === 'new' ? (
                              <>
                                <Eye className="mr-1" size={16} />
                                Review
                              </>
                            ) : (
                              <>
                                <Edit className="mr-1" size={16} />
                                Edit
                              </>
                            )}
                          </Button>
                          {(quote.status === 'approved' || quote.status === 'sent') && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/api/quote/${quote.id}/pdf`, '_blank')}
                                data-testid={`button-pdf-${quote.id}`}
                              >
                                <File className="mr-1" size={16} />
                                PDF
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/q/${quote.id}`, '_blank')}
                                data-testid={`button-share-${quote.id}`}
                              >
                                <Share className="mr-1" size={16} />
                                Share
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {(!quotes || quotes.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No quotes found. Quotes will appear here as customers submit them.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Review Modal */}
      {selectedQuoteId && (
        <QuoteReviewModal
          quoteId={selectedQuoteId}
          isOpen={!!selectedQuoteId}
          onClose={() => setSelectedQuoteId(null)}
        />
      )}
    </div>
  );
}
