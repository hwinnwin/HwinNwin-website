import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload,
  X,
  Image as ImageIcon,
  ExternalLink,
  AlignLeft,
  AlignCenter,
  Maximize
} from "lucide-react";

interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: 'full' | 'large' | 'medium' | 'small';
  alignment?: 'left' | 'center' | 'right';
}

interface EditableImageBlockProps {
  block: ImageBlock;
  onUpdate: (updates: Partial<ImageBlock>) => void;
  isPreview?: boolean;
}

export default function EditableImageBlock({ block, onUpdate, isPreview }: EditableImageBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to your server/cloud storage
      const imageUrl = URL.createObjectURL(file);
      updateField('src', imageUrl);
      if (!block.alt) {
        updateField('alt', file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const getWidthClass = (width: string = 'full') => {
    switch (width) {
      case 'small': return 'max-w-sm';
      case 'medium': return 'max-w-md';
      case 'large': return 'max-w-2xl';
      default: return 'w-full';
    }
  };

  const getAlignmentClass = (alignment: string = 'center') => {
    switch (alignment) {
      case 'left': return 'mr-auto';
      case 'right': return 'ml-auto';
      default: return 'mx-auto';
    }
  };

  if (isPreview) {
    return (
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className={`${getWidthClass(block.width)} ${getAlignmentClass(block.alignment)}`}>
            <img 
              src={block.src} 
              alt={block.alt} 
              className="w-full h-auto rounded-lg shadow-lg"
            />
            {block.caption && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {block.caption}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const isPlaceholder = block.src.includes('placeholder') || block.src.includes('via.placeholder');

  return (
    <Card className="relative">
      <CardContent className="p-6">
        {/* Image Display */}
        <div className="mb-6">
          <div className={`${getWidthClass(block.width)} ${getAlignmentClass(block.alignment)} relative`}>
            <img 
              src={block.src} 
              alt={block.alt} 
              className={`w-full h-auto rounded-lg shadow-md border ${
                isPlaceholder ? 'opacity-50 border-dashed' : ''
              }`}
            />
            {isPlaceholder && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <div className="text-center text-white">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Click upload to add image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Image Source</label>
          <div className="flex gap-2 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(block.src, '_blank')}
              disabled={isPlaceholder}
              data-testid="button-view-image"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Size
            </Button>
          </div>
          
          {/* URL Input for direct links */}
          <Input
            value={block.src}
            onChange={(e) => updateField('src', e.target.value)}
            placeholder="Or paste image URL..."
            data-testid="input-image-url"
          />
        </div>

        {/* Image Settings */}
        <div className="space-y-4">
          {/* Alt Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">Alt Text (Required for Accessibility)</label>
            <Input
              value={block.alt}
              onChange={(e) => updateField('alt', e.target.value)}
              placeholder="Describe the image for screen readers..."
              data-testid="input-image-alt"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="text-sm font-medium mb-2 block">Caption (Optional)</label>
            <Textarea
              value={block.caption || ''}
              onChange={(e) => updateField('caption', e.target.value)}
              placeholder="Add a caption that appears below the image..."
              rows={2}
              data-testid="textarea-image-caption"
            />
          </div>

          {/* Width and Alignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Width</label>
              <Select
                value={block.width || 'full'}
                onValueChange={(value) => updateField('width', value)}
              >
                <SelectTrigger data-testid="select-image-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (384px)</SelectItem>
                  <SelectItem value="medium">Medium (512px)</SelectItem>
                  <SelectItem value="large">Large (672px)</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Alignment</label>
              <Select
                value={block.alignment || 'center'}
                onValueChange={(value) => updateField('alignment', value)}
              >
                <SelectTrigger data-testid="select-image-alignment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Alignment Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Quick Align:</span>
            <Button
              variant={block.alignment === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('alignment', 'left')}
              data-testid="button-align-image-left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={block.alignment === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('alignment', 'center')}
              data-testid="button-align-image-center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={block.alignment === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('alignment', 'right')}
              data-testid="button-align-image-right"
            >
              <AlignLeft className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              variant={block.width === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('width', 'full')}
              data-testid="button-full-width-image"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Accessibility Tips */}
        <div className="mt-6 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Accessibility Best Practices:
          </h4>
          <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <li>• Always provide descriptive alt text for images</li>
            <li>• Keep alt text concise but informative</li>
            <li>• Decorative images can have empty alt text (alt="")</li>
            <li>• Use captions to provide additional context</li>
          </ul>
        </div>

        {/* Preview Badge */}
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Image Block Editor
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}