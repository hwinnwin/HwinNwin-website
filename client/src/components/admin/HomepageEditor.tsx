import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { en } from "@/i18n/locales/en";
import { vi } from "@/i18n/locales/vi";
import { zh } from "@/i18n/locales/zh";
import {
  Save,
  Eye,
  Edit3,
  GripVertical,
  Plus,
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Sparkles,
  Globe as GlobeIcon,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { useRef } from "react";

// Types for homepage sections
interface PortalItem {
  name: string;
  tagline: string;
  desc: string;
  url: string;
  icon: string;
  status: "live" | "beta" | "coming";
}

interface PrincipleItem {
  name: string;
  desc: string;
}

interface CodexItem {
  num: number;
  name: string;
  desc: string;
}

interface HomepageContent {
  meta: { title: string; description: string; ogTitle: string; ogDescription: string };
  nav: { ethos: string; codex: string; work: string; tools: string; contact: string };
  hero: { headline: string; subheadline: string; cta: string };
  mission: {
    title: string;
    purpose: { title: string; content: string; note: string };
    coreDefinition: { title: string; content: string; note: string };
    inAction: { title: string; items: string[] };
    principles: { title: string; items: PrincipleItem[] };
    vision: { title: string; content: string; note: string };
  };
  codex: { title: string; items: CodexItem[] };
  cta: { headline: string; content: string; emphasis: string; contentEnd: string; email: string };
  footer: { copyright: string; privacy: string; terms: string; cookies: string };
  portals: {
    title: string;
    subtitle: string;
    items: PortalItem[];
    statusLabels: { live: string; beta: string; coming: string };
  };
}

type LocaleKey = "en" | "vi" | "zh";

const SECTION_ORDER = ["hero", "portals", "mission", "codex", "cta", "meta", "nav", "footer"] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  portals: "Products / Ecosystem",
  mission: "Mission & Ethos",
  codex: "Design Codex",
  cta: "Call to Action",
  meta: "SEO & Meta",
  nav: "Navigation",
  footer: "Footer",
};

const ICON_OPTIONS = ["megaphone", "sparkles", "globe", "chart", "bot", "gamepad", "gauge", "heart"];

export default function HomepageEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("en");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["hero", "portals"]));
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load content from the API (or fall back to static locale files)
  const { data: savedContent, isLoading } = useQuery({
    queryKey: ["/api/homepage-content"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/homepage-content");
        if (res.ok) return await res.json();
      } catch {}
      // Fall back to static locale files
      return null;
    },
  });

  // Initialize content from saved data or static locale files
  const [content, setContent] = useState<Record<LocaleKey, HomepageContent>>(() => {
    const initial = savedContent || {
      en: structuredClone(en),
      vi: structuredClone(vi),
      zh: structuredClone(zh),
    };
    return initial as Record<LocaleKey, HomepageContent>;
  });

  const currentContent = content[activeLocale];

  const updateField = useCallback(
    (path: string, value: any) => {
      setContent((prev) => {
        const next = { ...prev };
        const locale = { ...next[activeLocale] } as any;

        // Navigate the path and set the value
        const parts = path.split(".");
        let obj = locale;
        for (let i = 0; i < parts.length - 1; i++) {
          if (Array.isArray(obj[parts[i]])) {
            obj[parts[i]] = [...obj[parts[i]]];
          } else {
            obj[parts[i]] = { ...obj[parts[i]] };
          }
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;

        next[activeLocale] = locale;
        return next;
      });
      setHasChanges(true);
    },
    [activeLocale]
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Record<LocaleKey, HomepageContent>) => {
      const res = await apiRequest("PUT", "/api/homepage-content", data);
      return res.json();
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({ title: "Saved!", description: "Homepage content updated successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(content);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">Homepage Editor</h2>
          <p className="text-sm text-slate-400 mt-1">Edit your homepage content across all languages</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
              Unsaved changes
            </Badge>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </a>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="bg-[#A7B6FF] text-[#0A0D1A] hover:bg-[#B4FFE7]"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Language Tabs */}
      <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as LocaleKey)}>
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="en" className="data-[state=active]:bg-[#A7B6FF] data-[state=active]:text-[#0A0D1A]">
            English
          </TabsTrigger>
          <TabsTrigger value="vi" className="data-[state=active]:bg-[#A7B6FF] data-[state=active]:text-[#0A0D1A]">
            Tiếng Việt
          </TabsTrigger>
          <TabsTrigger value="zh" className="data-[state=active]:bg-[#A7B6FF] data-[state=active]:text-[#0A0D1A]">
            中文
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sections */}
      <div className="space-y-4">
        {SECTION_ORDER.map((sectionKey) => {
          const isExpanded = expandedSections.has(sectionKey);
          return (
            <Card key={sectionKey} className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                onClick={() => toggleSection(sectionKey)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-100">{SECTION_LABELS[sectionKey]}</h3>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    {activeLocale.toUpperCase()}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <CardContent className="px-6 pb-6 pt-0">
                  <Separator className="mb-6 bg-slate-700/30" />
                  <SectionEditor
                    sectionKey={sectionKey}
                    content={currentContent}
                    updateField={updateField}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Section Editor - renders form fields based on section type
function SectionEditor({
  sectionKey,
  content,
  updateField,
}: {
  sectionKey: string;
  content: HomepageContent;
  updateField: (path: string, value: any) => void;
}) {
  switch (sectionKey) {
    case "hero":
      return <HeroEditor content={content.hero} updateField={updateField} />;
    case "portals":
      return <PortalsEditor content={content.portals} updateField={updateField} />;
    case "mission":
      return <MissionEditor content={content.mission} updateField={updateField} />;
    case "codex":
      return <CodexEditor content={content.codex} updateField={updateField} />;
    case "cta":
      return <CTAEditor content={content.cta} updateField={updateField} />;
    case "meta":
      return <MetaEditor content={content.meta} updateField={updateField} />;
    case "nav":
      return <NavEditor content={content.nav} updateField={updateField} />;
    case "footer":
      return <FooterEditor content={content.footer} updateField={updateField} />;
    default:
      return null;
  }
}

// --- Individual Section Editors ---

function HeroEditor({ content, updateField }: { content: HomepageContent["hero"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Headline" value={content.headline} onChange={(v) => updateField("hero.headline", v)} />
      <FieldInput label="Subheadline" value={content.subheadline} onChange={(v) => updateField("hero.subheadline", v)} multiline />
      <FieldInput label="CTA Button Text" value={content.cta} onChange={(v) => updateField("hero.cta", v)} />
    </div>
  );
}

function PortalsEditor({ content, updateField }: { content: HomepageContent["portals"]; updateField: (path: string, value: any) => void }) {
  const addPortal = () => {
    const newItems = [
      ...content.items,
      { name: "New Product", tagline: "Tagline", desc: "Description", url: "https://", icon: "globe", status: "coming" as const },
    ];
    updateField("portals.items", newItems);
  };

  const removePortal = (index: number) => {
    const newItems = content.items.filter((_, i) => i !== index);
    updateField("portals.items", newItems);
  };

  const updatePortal = (index: number, field: string, value: string) => {
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("portals.items", newItems);
  };

  return (
    <div className="space-y-6">
      <FieldInput label="Section Title" value={content.title} onChange={(v) => updateField("portals.title", v)} />
      <FieldInput label="Subtitle" value={content.subtitle} onChange={(v) => updateField("portals.subtitle", v)} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-slate-200 text-sm font-medium">Products</Label>
          <Button onClick={addPortal} size="sm" variant="outline" className="border-slate-600 text-slate-300">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>

        {content.items.map((item, index) => (
          <Card key={index} className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    item.status === "live"
                      ? "border-emerald-500/50 text-emerald-400"
                      : item.status === "beta"
                      ? "border-amber-500/50 text-amber-400"
                      : "border-slate-500/50 text-slate-400"
                  }
                >
                  {item.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePortal(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Name" value={item.name} onChange={(v) => updatePortal(index, "name", v)} />
                <FieldInput label="Tagline" value={item.tagline} onChange={(v) => updatePortal(index, "tagline", v)} />
              </div>
              <FieldInput label="Description" value={item.desc} onChange={(v) => updatePortal(index, "desc", v)} multiline />
              <div className="grid grid-cols-3 gap-3">
                <FieldInput label="URL" value={item.url} onChange={(v) => updatePortal(index, "url", v)} />
                <div>
                  <Label className="text-xs text-slate-400 mb-1 block">Icon</Label>
                  <Select value={item.icon} onValueChange={(v) => updatePortal(index, "icon", v)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-400 mb-1 block">Status</Label>
                  <Select value={item.status} onValueChange={(v) => updatePortal(index, "status", v)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="coming">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MissionEditor({ content, updateField }: { content: HomepageContent["mission"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <FieldInput label="Section Title" value={content.title} onChange={(v) => updateField("mission.title", v)} />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-300">Purpose</h4>
        <FieldInput label="Title" value={content.purpose.title} onChange={(v) => updateField("mission.purpose.title", v)} />
        <FieldInput label="Content" value={content.purpose.content} onChange={(v) => updateField("mission.purpose.content", v)} multiline />
        <FieldInput label="Note" value={content.purpose.note} onChange={(v) => updateField("mission.purpose.note", v)} multiline />
      </div>

      <Separator className="bg-slate-700/30" />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-300">Core Definition</h4>
        <FieldInput label="Title" value={content.coreDefinition.title} onChange={(v) => updateField("mission.coreDefinition.title", v)} />
        <FieldInput label="Content" value={content.coreDefinition.content} onChange={(v) => updateField("mission.coreDefinition.content", v)} />
        <FieldInput label="Note" value={content.coreDefinition.note} onChange={(v) => updateField("mission.coreDefinition.note", v)} />
      </div>

      <Separator className="bg-slate-700/30" />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-300">Mission in Action</h4>
        <FieldInput label="Title" value={content.inAction.title} onChange={(v) => updateField("mission.inAction.title", v)} />
        {content.inAction.items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <FieldInput
              label={`Item ${i + 1}`}
              value={item}
              onChange={(v) => {
                const newItems = [...content.inAction.items];
                newItems[i] = v;
                updateField("mission.inAction.items", newItems);
              }}
              multiline
            />
          </div>
        ))}
      </div>

      <Separator className="bg-slate-700/30" />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-300">Guiding Principles</h4>
        <FieldInput label="Title" value={content.principles.title} onChange={(v) => updateField("mission.principles.title", v)} />
        {content.principles.items.map((item, i) => (
          <div key={i} className="grid grid-cols-3 gap-3">
            <FieldInput
              label={`Principle ${i + 1} Name`}
              value={item.name}
              onChange={(v) => {
                const newItems = [...content.principles.items];
                newItems[i] = { ...newItems[i], name: v };
                updateField("mission.principles.items", newItems);
              }}
            />
            <div className="col-span-2">
              <FieldInput
                label="Description"
                value={item.desc}
                onChange={(v) => {
                  const newItems = [...content.principles.items];
                  newItems[i] = { ...newItems[i], desc: v };
                  updateField("mission.principles.items", newItems);
                }}
                multiline
              />
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-slate-700/30" />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-300">Vision</h4>
        <FieldInput label="Title" value={content.vision.title} onChange={(v) => updateField("mission.vision.title", v)} />
        <FieldInput label="Content" value={content.vision.content} onChange={(v) => updateField("mission.vision.content", v)} multiline />
        <FieldInput label="Note" value={content.vision.note} onChange={(v) => updateField("mission.vision.note", v)} multiline />
      </div>
    </div>
  );
}

function CodexEditor({ content, updateField }: { content: HomepageContent["codex"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Section Title" value={content.title} onChange={(v) => updateField("codex.title", v)} />
      {content.items.map((item, i) => (
        <div key={i} className="grid grid-cols-4 gap-3">
          <FieldInput
            label={`#${item.num} Name`}
            value={item.name}
            onChange={(v) => {
              const newItems = [...content.items];
              newItems[i] = { ...newItems[i], name: v };
              updateField("codex.items", newItems);
            }}
          />
          <div className="col-span-3">
            <FieldInput
              label="Description"
              value={item.desc}
              onChange={(v) => {
                const newItems = [...content.items];
                newItems[i] = { ...newItems[i], desc: v };
                updateField("codex.items", newItems);
              }}
              multiline
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CTAEditor({ content, updateField }: { content: HomepageContent["cta"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Headline" value={content.headline} onChange={(v) => updateField("cta.headline", v)} />
      <div className="grid grid-cols-3 gap-3">
        <FieldInput label="Content (before emphasis)" value={content.content} onChange={(v) => updateField("cta.content", v)} />
        <FieldInput label="Emphasis text" value={content.emphasis} onChange={(v) => updateField("cta.emphasis", v)} />
        <FieldInput label="Content (after emphasis)" value={content.contentEnd} onChange={(v) => updateField("cta.contentEnd", v)} />
      </div>
      <FieldInput label="Email" value={content.email} onChange={(v) => updateField("cta.email", v)} />
    </div>
  );
}

function MetaEditor({ content, updateField }: { content: HomepageContent["meta"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Page Title" value={content.title} onChange={(v) => updateField("meta.title", v)} />
      <FieldInput label="Meta Description" value={content.description} onChange={(v) => updateField("meta.description", v)} multiline />
      <FieldInput label="OG Title" value={content.ogTitle} onChange={(v) => updateField("meta.ogTitle", v)} />
      <FieldInput label="OG Description" value={content.ogDescription} onChange={(v) => updateField("meta.ogDescription", v)} multiline />
    </div>
  );
}

function NavEditor({ content, updateField }: { content: HomepageContent["nav"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      <FieldInput label="Ethos" value={content.ethos} onChange={(v) => updateField("nav.ethos", v)} />
      <FieldInput label="Codex" value={content.codex} onChange={(v) => updateField("nav.codex", v)} />
      <FieldInput label="Work" value={content.work} onChange={(v) => updateField("nav.work", v)} />
      <FieldInput label="Tools" value={content.tools} onChange={(v) => updateField("nav.tools", v)} />
      <FieldInput label="Contact" value={content.contact} onChange={(v) => updateField("nav.contact", v)} />
    </div>
  );
}

function FooterEditor({ content, updateField }: { content: HomepageContent["footer"]; updateField: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Copyright" value={content.copyright} onChange={(v) => updateField("footer.copyright", v)} />
      <div className="grid grid-cols-3 gap-3">
        <FieldInput label="Privacy Label" value={content.privacy} onChange={(v) => updateField("footer.privacy", v)} />
        <FieldInput label="Terms Label" value={content.terms} onChange={(v) => updateField("footer.terms", v)} />
        <FieldInput label="Cookies Label" value={content.cookies} onChange={(v) => updateField("footer.cookies", v)} />
      </div>
    </div>
  );
}

// Reusable Field Input Component
function FieldInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-400">{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500 min-h-[80px] resize-y"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
        />
      )}
    </div>
  );
}