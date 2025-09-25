import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  X, 
  Upload, 
  ExternalLink,
  ShoppingCart,
  Star,
  Check,
  Edit3
} from "lucide-react";

interface ProductBlock {
  type: 'product';
  title: string;
  description: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  checkoutUrl: string;
  features?: string[];
  badge?: string;
  buttonText?: string;
  rating?: number;
  reviews?: number;
}

interface EditableProductBlockProps {
  block: ProductBlock;
  onUpdate: (updates: Partial<ProductBlock>) => void;
  isPreview?: boolean;
}

export default function EditableProductBlock({ block, onUpdate, isPreview }: EditableProductBlockProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const addFeature = () => {
    const newFeatures = [...(block.features || []), 'New feature'];
    updateField('features', newFeatures);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(block.features || [])];
    newFeatures[index] = value;
    updateField('features', newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = (block.features || []).filter((_, i) => i !== index);
    updateField('features', newFeatures);
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
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Product Image */}
              {block.image && (
                <div className="relative">
                  <img 
                    src={block.image} 
                    alt={block.title}
                    className="w-full h-full object-cover"
                  />
                  {block.badge && (
                    <Badge className="absolute top-4 left-4 bg-primary">
                      {block.badge}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Product Info */}
              <div className="p-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {block.title}
                  </h2>
                  
                  {/* Rating */}
                  {block.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
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
                      {block.reviews && (
                        <span className="text-sm text-muted-foreground">
                          ({block.reviews} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-6">
                  {block.description}
                </p>

                {/* Features */}
                {block.features && block.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">Features:</h3>
                    <ul className="space-y-2">
                      {block.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    {block.price && (
                      <span className="text-3xl font-bold text-foreground">
                        {block.price}
                      </span>
                    )}
                    {block.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {block.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open(block.checkoutUrl, '_blank')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {block.buttonText || 'Buy Now'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-6">
        {/* Advanced Settings Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            data-testid="button-product-advanced"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Basic' : 'Advanced'}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product Image</label>
              
              {/* Image Preview */}
              <div className="mb-3">
                <img 
                  src={block.image || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Product+Image'} 
                  alt={block.title}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>

              {/* Upload Controls */}
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
                  data-testid="button-upload-product-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Input
                  value={block.image || ''}
                  onChange={(e) => updateField('image', e.target.value)}
                  placeholder="Or paste image URL..."
                  className="flex-1"
                  data-testid="input-product-image-url"
                />
              </div>
            </div>

            {showAdvanced && (
              <div>
                <label className="text-sm font-medium mb-2 block">Product Badge (Optional)</label>
                <Input
                  value={block.badge || ''}
                  onChange={(e) => updateField('badge', e.target.value)}
                  placeholder="e.g., Best Seller, New, Sale"
                  data-testid="input-product-badge"
                />
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Product Title</label>
              <Input
                value={block.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter product title..."
                data-testid="input-product-title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={block.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your product..."
                rows={3}
                data-testid="textarea-product-description"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  value={block.price || ''}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="$99"
                  data-testid="input-product-price"
                />
              </div>
              {showAdvanced && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Original Price</label>
                  <Input
                    value={block.originalPrice || ''}
                    onChange={(e) => updateField('originalPrice', e.target.value)}
                    placeholder="$149"
                    data-testid="input-product-original-price"
                  />
                </div>
              )}
            </div>

            {/* Button and URL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Button Text</label>
                <Input
                  value={block.buttonText || 'Buy Now'}
                  onChange={(e) => updateField('buttonText', e.target.value)}
                  placeholder="Buy Now"
                  data-testid="input-product-button-text"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Checkout URL</label>
                <Input
                  value={block.checkoutUrl}
                  onChange={(e) => updateField('checkoutUrl', e.target.value)}
                  placeholder="https://..."
                  data-testid="input-product-checkout-url"
                />
              </div>
            </div>

            {/* Rating (Advanced) */}
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating (1-5)</label>
                  <Select
                    value={block.rating?.toString() || ''}
                    onValueChange={(value) => updateField('rating', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger data-testid="select-product-rating">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No rating</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Review Count</label>
                  <Input
                    type="number"
                    value={block.reviews || ''}
                    onChange={(e) => updateField('reviews', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="123"
                    data-testid="input-product-reviews"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Product Features</label>
            <Button
              variant="outline"
              size="sm"
              onClick={addFeature}
              data-testid="button-add-product-feature"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>
          
          <div className="space-y-2">
            {(block.features || []).map((feature, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <Input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder="Enter feature..."
                  className="flex-1"
                  data-testid={`input-product-feature-${index}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  data-testid={`button-remove-product-feature-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Badge */}
        <div className="mt-6 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Product Showcase Editor
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}