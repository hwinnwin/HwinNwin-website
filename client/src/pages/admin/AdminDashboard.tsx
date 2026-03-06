import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useOwnerAuth } from "@/hooks/use-owner-auth";
import PinModal from "@/components/pin-modal";
import { apiRequest } from "@/lib/queryClient";
import HomepageEditor from "@/components/admin/HomepageEditor";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboard() {
  const { isAuthenticated, showPinModal, onPinSuccess, onPinModalClose } = useOwnerAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("homepage");

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/owner/logout");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  if (!isAuthenticated) {
    return (
      <PinModal
        isOpen={showPinModal}
        onSuccess={onPinSuccess}
        onClose={onPinModalClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D1A]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D1A]/90 border-b border-slate-700/30">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-serif font-bold text-slate-100">
              hwinnwin <span className="text-[#A7B6FF] text-sm font-sans font-normal">admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-slate-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50 mb-8">
            <TabsTrigger value="homepage" className="data-[state=active]:bg-[#A7B6FF] data-[state=active]:text-[#0A0D1A]">
              <Globe className="w-4 h-4 mr-2" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-[#A7B6FF] data-[state=active]:text-[#0A0D1A]">
              <FileText className="w-4 h-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#A7B6FF] data-[state=active]:text-[#0A0D1A]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="homepage">
            <HomepageEditor />
          </TabsContent>

          <TabsContent value="pages">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Custom Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Use the page builder to create custom pages. Go to{" "}
                  <a href="/owner/content" className="text-[#A7B6FF] hover:underline">
                    Content Editor
                  </a>{" "}
                  to manage pages with the drag-and-drop builder.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Site Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Manage your site settings in the{" "}
                  <a href="/owner/settings" className="text-[#A7B6FF] hover:underline">
                    Owner Settings
                  </a>{" "}
                  panel.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}