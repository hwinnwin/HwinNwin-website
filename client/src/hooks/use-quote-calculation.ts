import { useMemo } from "react";
import type { DamageItem } from "@shared/schema";

interface SeverityConfig {
  repairHrs: number;
  paintHrs: number;
  replace: boolean;
  blendDefault: boolean;
}

interface RatesConfig {
  labourRate: number;
  materialsPerPanel: number;
  partsMarkup: number;
  metallicMultiplier: number;
  pearlescentMultiplier: number;
  minJob: number;
}

interface QuoteCalculation {
  repairHrs: number;
  paintHrs: number;
  labour: number;
  materials: number;
  parts: number;
  subtotalExGST: number;
  gst: number;
  totalIncGST: number;
  blendPanels: number;
  confidence: 'high' | 'low';
}

const severityTable: Record<string, SeverityConfig> = {
  minor: { repairHrs: 1.5, paintHrs: 0.8, replace: false, blendDefault: false },
  moderate: { repairHrs: 3.0, paintHrs: 1.6, replace: false, blendDefault: true },
  severe: { repairHrs: 0.0, paintHrs: 2.2, replace: true, blendDefault: true }
};

export function useQuoteCalculation(
  items: DamageItem[], 
  paintType: "solid" | "metallic" | "pearlescent", 
  rates: RatesConfig,
  hasRequiredPhotos: boolean = true
): QuoteCalculation {
  return useMemo(() => {
    let repairHrs = 0;
    let paintHrs = 0;
    let materials = 0;
    let parts = 0;
    let blendPanels = 0;

    const paintMultiplier = 
      paintType === 'metallic' ? rates.metallicMultiplier :
      paintType === 'pearlescent' ? rates.pearlescentMultiplier : 1;

    for (const item of items) {
      const severity = severityTable[item.severity] || severityTable.minor;
      
      const itemRepairHrs = severity.replace ? 0 : severity.repairHrs;
      const itemPaintHrs = severity.paintHrs * paintMultiplier;
      
      repairHrs += itemRepairHrs;
      paintHrs += itemPaintHrs;
      materials += rates.materialsPerPanel;
      parts += (item.partsCost || 0) * (1 + rates.partsMarkup);
      
      if (item.blend || severity.blendDefault) {
        blendPanels += 1;
      }
    }

    // Add blending time and materials
    paintHrs += blendPanels * 0.6;
    materials += blendPanels * (rates.materialsPerPanel * 0.5);

    const labour = (repairHrs + paintHrs) * rates.labourRate;
    const subtotalExGST = Math.max(labour + materials + parts, rates.minJob);
    const gst = Math.round(subtotalExGST * 0.10 * 100) / 100;
    const totalIncGST = Math.round((subtotalExGST + gst) * 100) / 100;

    // Confidence calculation
    const hasSevere = items.some(item => item.severity === 'severe');
    const multiplePanels = items.length > 2;
    const confidence = (hasSevere || multiplePanels || !hasRequiredPhotos) ? 'low' : 'high';

    return {
      repairHrs: Math.round(repairHrs * 10) / 10,
      paintHrs: Math.round(paintHrs * 10) / 10,
      labour: Math.round(labour * 100) / 100,
      materials: Math.round(materials * 100) / 100,
      parts: Math.round(parts * 100) / 100,
      subtotalExGST: Math.round(subtotalExGST * 100) / 100,
      gst,
      totalIncGST,
      blendPanels,
      confidence
    };
  }, [items, paintType, rates, hasRequiredPhotos]);
}
