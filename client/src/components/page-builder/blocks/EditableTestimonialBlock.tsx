import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload,
  Star,
  Quote,
  User,
  Building
} from "lucide-react";

interface TestimonialBlock {
  type: 'testimonial';
  quote: string;
  author: string;
  company?: string;
  image?: string;
  rating?: number;
  position?: string;
}

interface EditableTestimonialBlockProps {
  block: TestimonialBlock;
  onUpdate: (updates: Partial<TestimonialBlock>) => void;
  isPreview?: boolean;
}

export default function EditableTestimonialBlock({ block, onUpdate, isPreview }: EditableTestimonialBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateField('image', imageUrl);
    }
  };

  if (isPreview) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-0 shadow-lg bg-background">
            <CardContent className="p-8">
              <div className="text-center">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
                
                {/* Rating */}
                {block.rating && (
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < (block.rating || 0) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <blockquote className="text-lg md:text-xl italic text-foreground mb-6 leading-relaxed">
                  "{block.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center justify-center gap-4">
                  {block.image && (
                    <img 
                      src={block.image} 
                      alt={block.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-foreground">
                      {block.author}
                    </div>
                    {(block.position || block.company) && (
                      <div className="text-sm text-muted-foreground">
                        {[block.position, block.company].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Author Image */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Author Photo (Optional)</label>
              
              {/* Image Preview */}
              <div className="mb-3">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-border bg-muted">
                  {block.image ? (
                    <img 
                      src={block.image} 
                      alt={block.author}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
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
                  className="w-full"
                  data-testid="button-upload-testimonial-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <Input
                  value={block.image || ''}
                  onChange={(e) => updateField('image', e.target.value)}
                  placeholder="Or paste image URL..."
                  data-testid="input-testimonial-image-url"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Star Rating (Optional)</label>
              <Select
                value={block.rating?.toString() || ''}
                onValueChange={(value) => updateField('rating', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger data-testid="select-testimonial-rating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No rating</SelectItem>
                  <SelectItem value="1">⭐ 1 Star</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Columns - Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Quote */}
            <div>
              <label className="text-sm font-medium mb-2 block">Testimonial Quote</label>
              <Textarea
                value={block.quote}
                onChange={(e) => updateField('quote', e.target.value)}
                placeholder="Enter the customer testimonial..."
                rows={4}
                data-testid="textarea-testimonial-quote"
              />
            </div>

            {/* Author Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Author Name</label>
                <Input
                  value={block.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  placeholder="Customer name..."
                  data-testid="input-testimonial-author"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Position (Optional)</label>
                <Input
                  value={block.position || ''}
                  onChange={(e) => updateField('position', e.target.value)}
                  placeholder="e.g., CEO, Manager, Customer"
                  data-testid="input-testimonial-position"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Company (Optional)</label>
              <Input
                value={block.company || ''}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Company or organization name..."
                data-testid="input-testimonial-company"
              />
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Quote className="h-4 w-4 mr-2" />
                Live Preview
              </h4>
              
              <div className="bg-background rounded-lg p-4 border">
                {/* Quote */}
                <blockquote className="text-base italic text-foreground mb-3">
                  "{block.quote || 'Your testimonial will appear here...'}"
                </blockquote>
                
                {/* Rating Preview */}
                {block.rating && (
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < (block.rating || 0) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                )}
                
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  {block.image && (
                    <img 
                      src={block.image} 
                      alt={block.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-sm">
                      {block.author || 'Author Name'}
                    </div>
                    {(block.position || block.company) && (
                      <div className="text-xs text-muted-foreground">
                        {[block.position, block.company].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Testimonial Tips:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Keep quotes authentic and specific</li>
            <li>• Include the customer's full name for credibility</li>
            <li>• Add company info to show social proof</li>
            <li>• Use customer photos when possible (with permission)</li>
            <li>• Star ratings help show satisfaction levels</li>
          </ul>
        </div>

        {/* Preview Badge */}
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Testimonial Block Editor
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}