import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, 
  Plus, 
  X, 
  Upload,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

interface HeroBlock {
  type: 'hero';
  title: string;
  subtitle?: string;
  description?: string;
  buttons?: Array<{
    text: string;
    link: string;
    variant: 'default' | 'secondary' | 'outline';
  }>;
  backgroundImage?: string;
}

interface EditableHeroBlockProps {
  block: HeroBlock;
  onUpdate: (updates: Partial<HeroBlock>) => void;
  isPreview?: boolean;
}

export default function EditableHeroBlock({ block, onUpdate, isPreview }: EditableHeroBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const addButton = () => {
    const newButtons = [...(block.buttons || []), {
      text: 'New Button',
      link: '#',
      variant: 'default' as const
    }];
    updateField('buttons', newButtons);
  };

  const updateButton = (index: number, updates: Partial<NonNullable<typeof block.buttons>[0]>) => {
    const newButtons = [...(block.buttons || [])];
    newButtons[index] = { ...newButtons[index], ...updates };
    updateField('buttons', newButtons);
  };

  const removeButton = (index: number) => {
    const newButtons = (block.buttons || []).filter((_, i) => i !== index);
    updateField('buttons', newButtons);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to your server/cloud storage
      const imageUrl = URL.createObjectURL(file);
      updateField('backgroundImage', imageUrl);
    }
  };

  if (isPreview) {
    return (
      <section 
        className={`relative py-20 lg:py-32 ${
          block.backgroundImage 
            ? 'bg-cover bg-center' 
            : 'bg-gradient-to-br from-primary/5 to-secondary/5'
        }`}
        style={block.backgroundImage ? { backgroundImage: `url(${block.backgroundImage})` } : {}}
      >
        {block.backgroundImage && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              block.backgroundImage ? 'text-white' : 'text-foreground'
            }`}>
              {block.title}
            </h1>
            {block.subtitle && (
              <h2 className={`text-xl md:text-2xl mb-6 ${
                block.backgroundImage ? 'text-white/90' : 'text-muted-foreground'
              }`}>
                {block.subtitle}
              </h2>
            )}
            {block.description && (
              <p className={`text-lg mb-8 max-w-2xl mx-auto ${
                block.backgroundImage ? 'text-white/80' : 'text-muted-foreground'
              }`}>
                {block.description}
              </p>
            )}
            {block.buttons && block.buttons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {block.buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant={button.variant}
                    size="lg"
                  >
                    {button.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Background Image Preview */}
      {block.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${block.backgroundImage})` }}
        />
      )}
      
      <CardContent className="relative p-6">
        {/* Settings Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-hero-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
            {showSettings ? <EyeOff className="h-4 w-4 ml-2" /> : <Eye className="h-4 w-4 ml-2" />}
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Background Image</label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-hero-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                {block.backgroundImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateField('backgroundImage', undefined)}
                    data-testid="button-remove-hero-image"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Hero Title</label>
            <Input
              value={block.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter hero title..."
              className="text-lg font-bold"
              data-testid="input-hero-title"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-sm font-medium mb-2 block">Subtitle (Optional)</label>
            <Input
              value={block.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Enter subtitle..."
              data-testid="input-hero-subtitle"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
            <Textarea
              value={block.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Enter description..."
              rows={3}
              data-testid="textarea-hero-description"
            />
          </div>

          {/* Buttons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Call-to-Action Buttons</label>
              <Button
                variant="outline"
                size="sm"
                onClick={addButton}
                data-testid="button-add-hero-cta"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Button
              </Button>
            </div>
            
            <div className="space-y-3">
              {(block.buttons || []).map((button, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={button.text}
                      onChange={(e) => updateButton(index, { text: e.target.value })}
                      placeholder="Button text..."
                      data-testid={`input-hero-button-text-${index}`}
                    />
                    <Input
                      value={button.link}
                      onChange={(e) => updateButton(index, { link: e.target.value })}
                      placeholder="Button link..."
                      data-testid={`input-hero-button-link-${index}`}
                    />
                    <Select
                      value={button.variant}
                      onValueChange={(value) => updateButton(index, { variant: value as any })}
                    >
                      <SelectTrigger data-testid={`select-hero-button-variant-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeButton(index)}
                    data-testid={`button-remove-hero-button-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Badge */}
        <div className="mt-6 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Hero Section Preview
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}