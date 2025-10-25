import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Mail,
  AlertCircle
} from "lucide-react";
import { useOwnerAuth } from "@/hooks/use-owner-auth";

interface RecentSubmission {
  name: string;
  email: string;
  date: string;
  message: string;
}

interface InsightsData {
  totalContacts: number;
  last7Days: number;
  last30Days: number;
  recentSubmissions: RecentSubmission[];
}

export default function InsightsPanel() {
  const { shouldMakeApiCalls } = useOwnerAuth();
  
  const { data: insights, isLoading, isError } = useQuery<InsightsData>({
    queryKey: ['/api/owner/insights'],
    enabled: shouldMakeApiCalls,
  });

  // Not authenticated - don't show loading or make API calls
  if (!shouldMakeApiCalls) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contact Insights</h2>
          <p className="text-muted-foreground">Track and monitor contact form submissions</p>
        </div>
        
        <Alert data-testid="alert-auth-required">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please authenticate to view insights.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contact Insights</h2>
          <p className="text-muted-foreground">Track and monitor contact form submissions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contact Insights</h2>
          <p className="text-muted-foreground">Track and monitor contact form submissions</p>
        </div>
        
        <Alert variant="destructive" data-testid="alert-insights-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load contact insights. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Contact Insights</h2>
        <p className="text-muted-foreground">Track and monitor contact form submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Contacts */}
        <Card data-testid="card-total-contacts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold text-foreground mt-2" data-testid="text-total-contacts">
                  {insights?.totalContacts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">All time submissions</p>
          </CardContent>
        </Card>

        {/* Last 7 Days */}
        <Card data-testid="card-last-7-days">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 7 Days</p>
                <p className="text-2xl font-bold text-foreground mt-2" data-testid="text-last-7-days">
                  {insights?.last7Days || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Recent activity</p>
          </CardContent>
        </Card>

        {/* Last 30 Days */}
        <Card data-testid="card-last-30-days">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 30 Days</p>
                <p className="text-2xl font-bold text-foreground mt-2" data-testid="text-last-30-days">
                  {insights?.last30Days || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Monthly trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions Table */}
      <Card data-testid="card-recent-submissions">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Mail className="mr-2" size={20} />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {insights?.recentSubmissions && insights.recentSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insights.recentSubmissions.map((submission, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-muted/50"
                      data-testid={`row-submission-${index}`}
                    >
                      <TableCell className="font-medium" data-testid={`text-name-${index}`}>
                        {submission.name}
                      </TableCell>
                      <TableCell data-testid={`text-email-${index}`}>
                        <a 
                          href={`mailto:${submission.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {submission.email}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`text-message-${index}`}>
                        {submission.message}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-date-${index}`}>
                        {formatDate(submission.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 px-4" data-testid="text-no-submissions">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                No contact submissions yet. Submissions will appear here when customers reach out.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
