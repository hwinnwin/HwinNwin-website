import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  X, 
  Mail,
  MessageSquare,
  Settings,
  Eye
} from "lucide-react";

interface ContactFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

interface ContactBlock {
  type: 'contact';
  title: string;
  description?: string;
  fields: ContactFormField[];
  submitButtonText?: string;
  successMessage?: string;
}

interface EditableContactBlockProps {
  block: ContactBlock;
  onUpdate: (updates: Partial<ContactBlock>) => void;
  isPreview?: boolean;
}

export default function EditableContactBlock({ block, onUpdate, isPreview }: EditableContactBlockProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const addFormField = () => {
    const newField: ContactFormField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false
    };
    const newFields = [...block.fields, newField];
    updateField('fields', newFields);
  };

  const updateFormField = (index: number, updates: Partial<ContactFormField>) => {
    const newFields = [...block.fields];
    newFields[index] = { ...newFields[index], ...updates };
    updateField('fields', newFields);
  };

  const removeFormField = (index: number) => {
    const newFields = block.fields.filter((_, i) => i !== index);
    updateField('fields', newFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...block.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      updateField('fields', newFields);
    }
  };

  if (isPreview) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {block.title}
            </h2>
            {block.description && (
              <p className="text-muted-foreground">
                {block.description}
              </p>
            )}
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <form className="space-y-4">
                {block.fields.map((field, index) => (
                  <div key={index}>
                    <label className="text-sm font-medium mb-2 block">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map((option, optIndex) => (
                            <SelectItem key={optIndex} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
                
                <Button type="submit" size="lg" className="w-full">
                  {block.submitButtonText || 'Send Message'}
                </Button>
              </form>
            </CardContent>
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
            data-testid="button-contact-advanced"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Basic' : 'Advanced'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Header Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Form Title</label>
              <Input
                value={block.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter form title..."
                data-testid="input-contact-title"
              />
            </div>
            
            {showAdvanced && (
              <div>
                <label className="text-sm font-medium mb-2 block">Button Text</label>
                <Input
                  value={block.submitButtonText || 'Send Message'}
                  onChange={(e) => updateField('submitButtonText', e.target.value)}
                  placeholder="Send Message"
                  data-testid="input-contact-button-text"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
            <Textarea
              value={block.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Add a description for your contact form..."
              rows={2}
              data-testid="textarea-contact-description"
            />
          </div>

          {showAdvanced && (
            <div>
              <label className="text-sm font-medium mb-2 block">Success Message</label>
              <Input
                value={block.successMessage || ''}
                onChange={(e) => updateField('successMessage', e.target.value)}
                placeholder="Thank you for your message! We'll get back to you soon."
                data-testid="input-contact-success-message"
              />
            </div>
          )}

          {/* Form Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Form Fields</label>
              <Button
                variant="outline"
                size="sm"
                onClick={addFormField}
                data-testid="button-add-contact-field"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {block.fields.map((field, index) => (
                <Card key={index} className="p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Field {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          data-testid={`button-move-field-up-${index}`}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === block.fields.length - 1}
                          data-testid={`button-move-field-down-${index}`}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFormField(index)}
                          data-testid={`button-remove-contact-field-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Field Name</label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateFormField(index, { name: e.target.value })}
                          placeholder="field_name"
                          data-testid={`input-contact-field-name-${index}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Label</label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateFormField(index, { label: e.target.value })}
                          placeholder="Field Label"
                          data-testid={`input-contact-field-label-${index}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Field Type</label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateFormField(index, { type: value as any })}
                        >
                          <SelectTrigger data-testid={`select-contact-field-type-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${index}`}
                            checked={field.required}
                            onCheckedChange={(checked) => 
                              updateFormField(index, { required: !!checked })
                            }
                            data-testid={`checkbox-contact-field-required-${index}`}
                          />
                          <label 
                            htmlFor={`required-${index}`}
                            className="text-xs font-medium"
                          >
                            Required
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Options for select fields */}
                    {field.type === 'select' && (
                      <div>
                        <label className="text-xs font-medium mb-1 block">Options (one per line)</label>
                        <Textarea
                          value={(field.options || []).join('\n')}
                          onChange={(e) => updateFormField(index, { 
                            options: e.target.value.split('\n').filter(opt => opt.trim()) 
                          })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={3}
                          data-testid={`textarea-contact-field-options-${index}`}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Form Preview */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Form Preview
            </h4>
            
            <div className="bg-background rounded-lg p-4 border">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  {block.title || 'Contact Form'}
                </h3>
                {block.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {block.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {block.fields.map((field, index) => (
                  <div key={index}>
                    <label className="text-xs font-medium mb-1 block">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <div className="w-full h-16 bg-muted/50 border rounded px-2 py-1 text-xs text-muted-foreground flex items-center">
                        {field.label} textarea...
                      </div>
                    ) : field.type === 'select' ? (
                      <div className="w-full h-8 bg-muted/50 border rounded px-2 py-1 text-xs text-muted-foreground flex items-center">
                        Select {field.label.toLowerCase()}...
                      </div>
                    ) : (
                      <div className="w-full h-8 bg-muted/50 border rounded px-2 py-1 text-xs text-muted-foreground flex items-center">
                        {field.label} input...
                      </div>
                    )}
                  </div>
                ))}
                
                <Button size="sm" className="w-full mt-4">
                  {block.submitButtonText || 'Send Message'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Badge */}
        <div className="mt-6 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Contact Form Editor
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}