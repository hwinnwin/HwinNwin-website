import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Eye,
  Edit3
} from "lucide-react";

interface TextBlock {
  type: 'text';
  content: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface EditableTextBlockProps {
  block: TextBlock;
  onUpdate: (updates: Partial<TextBlock>) => void;
  isPreview?: boolean;
}

export default function EditableTextBlock({ block, onUpdate, isPreview }: EditableTextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const getSizeClass = (size: string = 'md') => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getAlignmentClass = (alignment: string = 'left') => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = 
      textarea.value.substring(0, start) +
      before + selectedText + after +
      textarea.value.substring(end);
    
    updateField('content', newText);
    
    // Reset cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', before: '<strong>', after: '</strong>' },
    { icon: Italic, label: 'Italic', before: '<em>', after: '</em>' },
    { icon: Underline, label: 'Underline', before: '<u>', after: '</u>' },
  ];

  if (isPreview) {
    return (
      <section className="py-8">
        <div className={`max-w-4xl mx-auto px-4 ${getAlignmentClass(block.alignment)}`}>
          <div 
            className={`prose prose-lg max-w-none ${getSizeClass(block.size)}`}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      </section>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          {/* Formatting Buttons */}
          <div className="flex items-center gap-1 mr-4">
            {formatButtons.map((button, index) => {
              const IconComponent = button.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting(button.before, button.after)}
                  title={button.label}
                  data-testid={`button-format-${button.label.toLowerCase()}`}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant={block.alignment === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('alignment', 'left')}
              title="Align Left"
              data-testid="button-align-left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={block.alignment === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('alignment', 'center')}
              title="Align Center"
              data-testid="button-align-center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={block.alignment === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField('alignment', 'right')}
              title="Align Right"
              data-testid="button-align-right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Size */}
          <Select
            value={block.size || 'md'}
            onValueChange={(value) => updateField('size', value)}
          >
            <SelectTrigger className="w-32" data-testid="select-text-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>

          {/* Quick Insert Buttons */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('<ul><li>', '</li></ul>')}
              title="Bullet List"
              data-testid="button-bullet-list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('<ol><li>', '</li></ol>')}
              title="Numbered List"
              data-testid="button-numbered-list"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('<a href="#" target="_blank">', '</a>')}
              title="Add Link"
              data-testid="button-add-link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content</label>
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Start typing your content here. Use HTML for formatting or the toolbar above..."
              rows={8}
              className="font-mono text-sm"
              data-testid="textarea-text-content"
            />
          </div>

          {/* Live Preview */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Live Preview
            </label>
            <div className={`min-h-[100px] p-4 border rounded-lg bg-background ${getAlignmentClass(block.alignment)}`}>
              <div 
                className={`prose prose-sm max-w-none ${getSizeClass(block.size)}`}
                dangerouslySetInnerHTML={{ __html: block.content || '<p class="text-muted-foreground">Start typing to see preview...</p>' }}
              />
            </div>
          </div>
        </div>

        {/* Helper Tips */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Formatting Tips:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use the toolbar buttons to format selected text</li>
            <li>• HTML tags are supported: &lt;p&gt;, &lt;h1-h6&gt;, &lt;strong&gt;, &lt;em&gt;, etc.</li>
            <li>• Add links: &lt;a href="url"&gt;link text&lt;/a&gt;</li>
            <li>• Create lists with &lt;ul&gt; or &lt;ol&gt; tags</li>
          </ul>
        </div>

        {/* Preview Badge */}
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Text Block Editor
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}