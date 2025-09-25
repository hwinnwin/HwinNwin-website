import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { VEHICLE_PANELS, DAMAGE_SEVERITIES } from "@/lib/constants";
import type { DamageItem } from "@shared/schema";

interface DamageAssessmentProps {
  items: DamageItem[];
  onItemsChange: (items: DamageItem[]) => void;
}

export default function DamageAssessment({ items, onItemsChange }: DamageAssessmentProps) {
  const updateItem = (index: number, updates: Partial<DamageItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onItemsChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const addItem = () => {
    const newItem: DamageItem = {
      panel: "Front Bumper",
      severity: "minor",
      partsCost: 0,
      blend: false
    };
    onItemsChange([...items, newItem]);
  };

  const getSeverityDescription = (severity: string) => {
    const descriptions = {
      minor: "scratches, small dents",
      moderate: "deep scratches, medium dents",
      severe: "cracks, large dents, replacement needed"
    };
    return descriptions[severity as keyof typeof descriptions] || "";
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={index} className="bg-muted/30 border border-border">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-foreground">Damage Item #{index + 1}</h4>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                  data-testid={`button-remove-item-${index}`}
                >
                  <Trash2 className="mr-1" size={16} />
                  Remove
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2">Panel/Area *</Label>
                <Select 
                  value={item.panel} 
                  onValueChange={(value) => updateItem(index, { panel: value })}
                >
                  <SelectTrigger data-testid={`select-panel-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_PANELS.map(panel => (
                      <SelectItem key={panel} value={panel}>{panel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-foreground mb-2">Damage Severity *</Label>
                <Select 
                  value={item.severity} 
                  onValueChange={(value) => updateItem(index, { severity: value as DamageItem['severity'] })}
                >
                  <SelectTrigger data-testid={`select-severity-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAMAGE_SEVERITIES.map(severity => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.label} ({getSeverityDescription(severity.value)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`blend-${index}`}
                  checked={item.blend}
                  onCheckedChange={(checked) => updateItem(index, { blend: !!checked })}
                  data-testid={`checkbox-blend-${index}`}
                />
                <Label htmlFor={`blend-${index}`} className="text-sm text-foreground">
                  Blending required (adjacent panels need painting for color match)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button
        type="button"
        variant="secondary"
        onClick={addItem}
        data-testid="button-add-damage-item"
      >
        <Plus className="mr-2" size={16} />
        Add Another Damage Item
      </Button>
    </div>
  );
}
