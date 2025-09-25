import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { marketingContentSchema, type MarketingContent, type Page, insertPageSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOwnerAuth } from "@/hooks/use-owner-auth";
import PinModal from "@/components/pin-modal";
import { 
  ArrowLeft, 
  Save, 
  ChevronDown,
  ChevronRight,
  Palette, 
  Target,
  CheckCircle,
  Globe,
  HelpCircle,
  Settings,
  Plus,
  X,
  FileText,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  Calendar
} from "lucide-react";
import PageBuilder from "@/components/page-builder/PageBuilder";

type ContentEditorFormData = MarketingContent;

// Stable defaults to prevent form instability
const DEFAULTS: MarketingContent = {
  brand: {
    name: "",
    tagline: "",
    pillars: [],
    voice: {
      tone: "",
      rules: []
    },
    organization: {
      legal_name: "",
      hq: "",
      email_public: "",
      booking_link: ""
    }
  },
  home: {
    hero: {
      headline: "",
      sub: "",
      primary_cta: "",
      secondary_cta: ""
    },
    threeP: {
      items: []
    },
    process: [],
    logos: [],
    faq: []
  },
  services: {
    items: []
  }
};

export default function ContentEditor() {
  const [location, navigate] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['brand']));
  const [activeTab, setActiveTab] = useState<string>("marketing");
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, showPinModal, onPinSuccess, onPinModalClose, handle401Error, shouldMakeApiCalls } = useOwnerAuth();

  // Fetch marketing content only when authenticated
  const { data: content, isLoading, error, refetch } = useQuery<MarketingContent>({
    queryKey: ['/api/content/marketing'],
    enabled: shouldMakeApiCalls,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        handle401Error();
        return false;
      }
      return failureCount < 3;
    }
  });

  // Fetch pages data when authenticated
  const { data: pages, isLoading: pagesLoading, error: pagesError, refetch: refetchPages } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
    enabled: shouldMakeApiCalls,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        handle401Error();
        return false;
      }
      return failureCount < 3;
    }
  });

  const form = useForm<ContentEditorFormData>({
    resolver: zodResolver(marketingContentSchema),
    defaultValues: content ?? DEFAULTS
  });

  // Update form when content data loads - moved to useEffect to avoid render-time state updates
  useEffect(() => {
    if (content) {
      form.reset(content);
    }
  }, [content, form]);

  const updateContentMutation = useMutation({
    mutationFn: (data: ContentEditorFormData) => 
      apiRequest('PUT', '/api/content/marketing', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/marketing'] });
      toast({
        title: "Content Updated",
        description: "Marketing content has been saved successfully",
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

  const onSubmit = (data: ContentEditorFormData) => {
    updateContentMutation.mutate(data);
  };

  // Page creation mutation
  const createPageMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/pages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Page Created",
        description: "Page has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Page update mutation
  const updatePageMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PATCH', `/api/pages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Page Updated",
        description: "Page has been saved successfully",
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

  // Page deletion mutation
  const deletePageMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Page Deleted",
        description: "Page has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreatePage = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setShowPageBuilder(true);
  };

  const handleSavePage = (pageData: any) => {
    if (editingPage) {
      updatePageMutation.mutate({
        id: editingPage.id,
        ...pageData
      });
    }
  };

  const handleClosePage = () => {
    setEditingPage(null);
    setShowPageBuilder(false);
  };

  const handleDeletePage = (page: Page) => {
    if (confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      deletePageMutation.mutate(page.id);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Show loading state while waiting for authentication
  if (!isAuthenticated) {
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-96" />
        </div>
        <PinModal 
          isOpen={showPinModal} 
          onClose={onPinModalClose} 
          onSuccess={onPinSuccess} 
        />
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/owner')}
                  data-testid="button-back-error"
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
                  <h1 className="text-xl font-bold text-foreground">Content Editor</h1>
                  <p className="text-xs text-muted-foreground">Marketing Copy Management</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Content Editor</h1>
            <p className="text-muted-foreground">Manage all marketing copy and content for your website</p>
          </div>

          <Alert variant="destructive" data-testid="alert-content-load-error">
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Failed to load content</strong>
                <br />
                {error instanceof Error ? error.message : 'An unexpected error occurred while loading the marketing content.'}
              </div>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                data-testid="button-retry-content-load"
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
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
                <h1 className="text-xl font-bold text-foreground">Content Editor</h1>
                <p className="text-xs text-muted-foreground">Marketing Copy Management</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Content Editor</h1>
          <p className="text-muted-foreground">Manage all marketing copy and content for your website</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketing" data-testid="tab-marketing">
              <Palette className="mr-2 h-4 w-4" />
              Marketing Content
            </TabsTrigger>
            <TabsTrigger value="pages" data-testid="tab-pages">
              <FileText className="mr-2 h-4 w-4" />
              Pages
            </TabsTrigger>
          </TabsList>

          {/* Marketing Content Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Brand Section */}
                <Card>
              <Collapsible 
                open={expandedSections.has('brand')} 
                onOpenChange={() => toggleSection('brand')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Palette className="mr-2" size={20} />
                        Brand Identity
                      </div>
                      {expandedSections.has('brand') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Brand Name and Tagline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="brand.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your Brand Name" 
                                {...field} 
                                data-testid="input-brand-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brand.tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your brand tagline" 
                                {...field} 
                                data-testid="input-brand-tagline"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Brand Pillars */}
                    <BrandPillarsSection form={form} />

                    {/* Voice Section */}
                    <VoiceSection form={form} />

                    {/* Organization Section */}
                    <OrganizationSection form={form} />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Hero Section */}
            <HeroSection 
              form={form} 
              expandedSections={expandedSections} 
              toggleSection={toggleSection} 
            />

            {/* 3P Check Section */}
            <ThreePSection 
              form={form} 
              expandedSections={expandedSections} 
              toggleSection={toggleSection} 
            />

            {/* Process Section */}
            <ProcessSection 
              form={form} 
              expandedSections={expandedSections} 
              toggleSection={toggleSection} 
            />

            {/* FAQ Section */}
            <FAQSection 
              form={form} 
              expandedSections={expandedSections} 
              toggleSection={toggleSection} 
            />

            {/* Services Section */}
            <ServicesSection 
              form={form} 
              expandedSections={expandedSections} 
              toggleSection={toggleSection} 
            />

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button 
                type="submit" 
                disabled={updateContentMutation.isPending}
                data-testid="button-save-content"
                className="min-w-32"
              >
                {updateContentMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Save Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      {/* Pages Tab */}
      <TabsContent value="pages" className="space-y-6">
        {showPageBuilder ? (
          <PageBuilder
            page={editingPage || undefined}
            onSave={handleSavePage}
            onClose={handleClosePage}
            isLoading={updatePageMutation.isPending}
          />
        ) : (
          <PagesManagement 
            pages={pages || []}
            isLoading={pagesLoading}
            error={pagesError}
            onRefetch={refetchPages}
            onCreatePage={handleCreatePage}
            onEditPage={handleEditPage}
            onDeletePage={handleDeletePage}
          />
        )}
      </TabsContent>

    </Tabs>
  </div>
      
      {/* PIN Modal */}
      <PinModal 
        isOpen={showPinModal} 
        onClose={onPinModalClose} 
        onSuccess={onPinSuccess} 
      />
    </div>
  );
}

// Pages Management Component
interface PagesManagementProps {
  pages: Page[];
  isLoading: boolean;
  error: any;
  onRefetch: () => void;
  onCreatePage: () => void;
  onEditPage: (page: Page) => void;
  onDeletePage: (page: Page) => void;
}

function PagesManagement({ pages, isLoading, error, onRefetch, onCreatePage, onEditPage, onDeletePage }: PagesManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Page creation mutation
  const createPageMutation = useMutation({
    mutationFn: (pageData: any) => apiRequest('POST', '/api/pages', pageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Page Created",
        description: "New page has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Page",
        description: error.message || "An error occurred while creating the page",
        variant: "destructive"
      });
    }
  });

  // Page deletion mutation
  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest('DELETE', `/api/pages/${pageId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Page Deleted",
        description: "Page has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Page",
        description: error.message || "An error occurred while deleting the page",
        variant: "destructive"
      });
    }
  });

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" data-testid="alert-pages-error">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Failed to load pages</strong>
              <br />
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </div>
            <Button onClick={onRefetch} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pages Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pages</h2>
          <p className="text-muted-foreground">Create and manage custom pages for your website</p>
        </div>
        <Button 
          onClick={() => onCreatePage()}
          data-testid="button-create-page"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No pages yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first custom page to get started
            </p>
            <Button onClick={() => onCreatePage()}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <Card key={page.id} data-testid={`page-card-${page.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{page.title}</h3>
                      <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                        {page.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">/{page.slug}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        data-testid={`button-view-${page.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPage(page)}
                      data-testid={`button-edit-${page.id}`}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this page?')) {
                          deletePageMutation.mutate(page.id);
                        }
                      }}
                      disabled={deletePageMutation.isPending}
                      data-testid={`button-delete-${page.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Page Dialog */}
      <CreatePageDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={createPageMutation.mutate}
        isLoading={createPageMutation.isPending}
      />

      {/* Edit Page Dialog */}
      {editingPage && (
        <EditPageDialog
          page={editingPage}
          isOpen={!!editingPage}
          onClose={() => setEditingPage(null)}
        />
      )}
    </div>
  );
}

// Create Page Dialog Component
interface CreatePageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function CreatePageDialog({ isOpen, onClose, onSubmit, isLoading }: CreatePageDialogProps) {
  const form = useForm({
    resolver: zodResolver(insertPageSchema.omit({ content: true }).extend({
      slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
        .refine((slug) => !['admin', 'api', 'hwin', 'panel-quote', 'owner', 'q', 'legal'].includes(slug), 
                "This slug is reserved"),
    })),
    defaultValues: {
      title: "",
      slug: "",
      status: "draft" as const,
      seoTitle: "",
      seoDescription: ""
    }
  });

  const handleSubmit = (data: any) => {
    // Create basic page content structure
    const content = JSON.stringify({
      blocks: [
        {
          type: "hero",
          title: data.title,
          subtitle: "Welcome to " + data.title
        }
      ],
      seo: {
        title: data.seoTitle || data.title,
        description: data.seoDescription
      }
    });

    onSubmit({
      ...data,
      content
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-create-page">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome Page" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug from title
                        const slug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, '')
                          .replace(/\s+/g, '-')
                          .slice(0, 50);
                        form.setValue('slug', slug);
                      }}
                      data-testid="input-page-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="my-awesome-page" 
                      {...field}
                      data-testid="input-page-slug"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Page will be accessible at: /{field.value}
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-page-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-create-page-submit">
                {isLoading ? "Creating..." : "Create Page"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Page Dialog Component  
interface EditPageDialogProps {
  page: Page;
  isOpen: boolean;
  onClose: () => void;
}

function EditPageDialog({ page, isOpen, onClose }: EditPageDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-edit-page">
        <DialogHeader>
          <DialogTitle>Edit Page: {page.title}</DialogTitle>
        </DialogHeader>
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Page Builder Coming Soon</h3>
          <p>Advanced page building functionality will be available soon.</p>
          <p className="text-sm mt-2">For now, you can manage basic page settings and status.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Brand Pillars Component
function BrandPillarsSection({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "brand.pillars"
  });

  return (
    <div>
      <Label className="text-base font-semibold">Brand Pillars</Label>
      <p className="text-sm text-muted-foreground mb-4">Core values and principles that define your brand</p>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`brand.pillars.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Brand pillar" 
                      {...field} 
                      data-testid={`input-brand-pillar-${index}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              data-testid={`button-remove-pillar-${index}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append("")}
          data-testid="button-add-pillar"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Pillar
        </Button>
      </div>
    </div>
  );
}

// Voice Section Component
function VoiceSection({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "brand.voice.rules"
  });

  return (
    <div>
      <Label className="text-base font-semibold">Brand Voice</Label>
      <p className="text-sm text-muted-foreground mb-4">Define how your brand communicates</p>
      
      <FormField
        control={form.control}
        name="brand.voice.tone"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Voice Tone</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Professional yet approachable" 
                {...field} 
                data-testid="input-voice-tone"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Label className="text-sm font-medium">Voice Rules</Label>
        <div className="space-y-3 mt-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`brand.voice.rules.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="Voice rule or guideline" 
                        {...field} 
                        data-testid={`input-voice-rule-${index}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                data-testid={`button-remove-voice-rule-${index}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append("")}
            data-testid="button-add-voice-rule"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>
    </div>
  );
}

// Organization Section Component
function OrganizationSection({ form }: { form: any }) {
  return (
    <div>
      <Label className="text-base font-semibold">Organization Details</Label>
      <p className="text-sm text-muted-foreground mb-4">Company information and contact details</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="brand.organization.legal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Legal company name" 
                  {...field} 
                  data-testid="input-org-legal-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand.organization.hq"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headquarters</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Melbourne, Australia" 
                  {...field} 
                  data-testid="input-org-hq"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand.organization.email_public"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="contact@yourcompany.com" 
                  {...field} 
                  data-testid="input-org-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand.organization.booking_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking Link</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://calendly.com/yourlink" 
                  {...field} 
                  data-testid="input-org-booking-link"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Hero Section Component
function HeroSection({ form, expandedSections, toggleSection }: { form: any; expandedSections: Set<string>; toggleSection: (section: string) => void }) {
  return (
    <Card>
      <Collapsible 
        open={expandedSections.has('hero')} 
        onOpenChange={() => toggleSection('hero')}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="mr-2" size={20} />
                Hero Section
              </div>
              {expandedSections.has('hero') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="home.hero.headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Main headline for your homepage" 
                      {...field} 
                      data-testid="textarea-hero-headline"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="home.hero.sub"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-headline</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Supporting text that expands on your headline" 
                      {...field} 
                      data-testid="textarea-hero-sub"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="home.hero.primary_cta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Call-to-Action</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Get Started" 
                        {...field} 
                        data-testid="input-hero-primary-cta"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="home.hero.secondary_cta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Call-to-Action</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Learn More" 
                        {...field} 
                        data-testid="input-hero-secondary-cta"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// 3P Check Section Component
function ThreePSection({ form, expandedSections, toggleSection }: { form: any; expandedSections: Set<string>; toggleSection: (section: string) => void }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "home.threeP.items"
  });

  return (
    <Card>
      <Collapsible 
        open={expandedSections.has('threeP')} 
        onOpenChange={() => toggleSection('threeP')}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2" size={20} />
                3P Check (Power, Balance, Prosperity)
              </div>
              {expandedSections.has('threeP') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Define your three pillars of value proposition with supporting metrics
            </p>
            {fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Item #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      data-testid={`button-remove-threep-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`home.threeP.items.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Power" 
                            {...field} 
                            data-testid={`input-threep-title-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`home.threeP.items.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe this pillar and how it benefits customers" 
                            {...field} 
                            data-testid={`textarea-threep-text-${index}`}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`home.threeP.items.${index}.metric`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric/Statistic</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 95% Success Rate" 
                            {...field} 
                            data-testid={`input-threep-metric-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ title: "", text: "", metric: "" })}
              data-testid="button-add-threep-item"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add 3P Item
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Process Section Component
function ProcessSection({ form, expandedSections, toggleSection }: { form: any; expandedSections: Set<string>; toggleSection: (section: string) => void }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "home.process"
  });

  return (
    <Card>
      <Collapsible 
        open={expandedSections.has('process')} 
        onOpenChange={() => toggleSection('process')}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="mr-2" size={20} />
                Process Steps
              </div>
              {expandedSections.has('process') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Define your step-by-step process for working with clients
            </p>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <FormField
                  control={form.control}
                  name={`home.process.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Process step description" 
                          {...field} 
                          data-testid={`input-process-step-${index}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  data-testid={`button-remove-process-step-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append("")}
              data-testid="button-add-process-step"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Process Step
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// FAQ Section Component  
function FAQSection({ form, expandedSections, toggleSection }: { form: any; expandedSections: Set<string>; toggleSection: (section: string) => void }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "home.faq"
  });

  return (
    <Card>
      <Collapsible 
        open={expandedSections.has('faq')} 
        onOpenChange={() => toggleSection('faq')}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle className="mr-2" size={20} />
                Frequently Asked Questions
              </div>
              {expandedSections.has('faq') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Add common questions and answers to help your customers
            </p>
            {fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">FAQ #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      data-testid={`button-remove-faq-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`home.faq.${index}.q`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What is your question?" 
                            {...field} 
                            data-testid={`textarea-faq-question-${index}`}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`home.faq.${index}.a`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a helpful answer" 
                            {...field} 
                            data-testid={`textarea-faq-answer-${index}`}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ q: "", a: "" })}
              data-testid="button-add-faq"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Services Section Component
function ServicesSection({ form, expandedSections, toggleSection }: { form: any; expandedSections: Set<string>; toggleSection: (section: string) => void }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services.items"
  });

  return (
    <Card>
      <Collapsible 
        open={expandedSections.has('services')} 
        onOpenChange={() => toggleSection('services')}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="mr-2" size={20} />
                Services
              </div>
              {expandedSections.has('services') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Define the services you offer with outcomes and pricing
            </p>
            {fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Service #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      data-testid={`button-remove-service-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`services.items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Strategic Consulting" 
                              {...field} 
                              data-testid={`input-service-name-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`services.items.${index}.from_aud`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Price (AUD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="5000" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid={`input-service-price-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`services.items.${index}.promise`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Promise</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What you promise to deliver with this service" 
                            {...field} 
                            data-testid={`textarea-service-promise-${index}`}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ServiceOutcomesSection form={form} serviceIndex={index} />
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "", promise: "", outcomes: [], from_aud: 0 })}
              data-testid="button-add-service"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Service Outcomes Component
function ServiceOutcomesSection({ form, serviceIndex }: { form: any; serviceIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `services.items.${serviceIndex}.outcomes`
  });

  return (
    <div>
      <Label className="text-sm font-medium">Expected Outcomes</Label>
      <p className="text-xs text-muted-foreground mb-3">What results can clients expect?</p>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`services.items.${serviceIndex}.outcomes.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Expected outcome or benefit" 
                      {...field} 
                      data-testid={`input-service-outcome-${serviceIndex}-${index}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              data-testid={`button-remove-outcome-${serviceIndex}-${index}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append("")}
          data-testid={`button-add-outcome-${serviceIndex}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Outcome
        </Button>
      </div>
    </div>
  );
}