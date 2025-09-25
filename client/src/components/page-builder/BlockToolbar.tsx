import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Type,
  Image as ImageIcon,
  User,
  Target,
  MapPin,
  Layout,
  Plus,
  Zap
} from "lucide-react";

interface BlockToolbarProps {
  onAddBlock: (blockType: 'hero' | 'text' | 'image' | 'product' | 'testimonial' | 'contact') => void;
}

export default function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const blockTypes = [
    {
      type: 'hero' as const,
      name: 'Hero Section',
      description: 'Large banner with title, subtitle, and call-to-action buttons',
      icon: Layout,
      category: 'Layout'
    },
    {
      type: 'text' as const,
      name: 'Text Block',
      description: 'Rich text content with formatting options',
      icon: Type,
      category: 'Content'
    },
    {
      type: 'image' as const,
      name: 'Image',
      description: 'Single image with optional caption',
      icon: ImageIcon,
      category: 'Media'
    },
    {
      type: 'product' as const,
      name: 'Product Showcase',
      description: 'Product display with features, pricing, and buy button',
      icon: Target,
      category: 'E-commerce'
    },
    {
      type: 'testimonial' as const,
      name: 'Testimonial',
      description: 'Customer quote with author information',
      icon: User,
      category: 'Social Proof'
    },
    {
      type: 'contact' as const,
      name: 'Contact Form',
      description: 'Customizable contact form with various field types',
      icon: MapPin,
      category: 'Forms'
    }
  ];

  const categories = Array.from(new Set(blockTypes.map(block => block.category)));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Content Blocks
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag blocks to reorder them on your page
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {categories.map(category => (
            <div key={category}>
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {blockTypes
                  .filter(block => block.category === category)
                  .map(block => {
                    const IconComponent = block.icon;
                    return (
                      <Card 
                        key={block.type}
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-dashed"
                        onClick={() => onAddBlock(block.type)}
                        data-testid={`add-block-${block.type}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground mb-1">
                                {block.name}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {block.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick tips */}
      <div className="p-4 border-t border-border">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-medium text-foreground mb-1">
                Pro Tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Click any block to edit inline</li>
                <li>• Drag the grip icon to reorder</li>
                <li>• Use Preview to see final result</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}