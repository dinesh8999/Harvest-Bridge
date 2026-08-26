// =============================================
// HARVEST BRIDGE — AI Surplus Risk Engine
// Deterministic demo engine (replaceable)
// =============================================

import type { RiskCategory, UrgencyLevel } from '../../types';
import { CROP_PERISHABILITY, CROP_SEASONAL_PRESSURE } from '../../data/demoData';

export interface SurplusRiskInput {
  cropName: string;
  location: string;
  quantity: number;
  expectedHarvestDate: string;
  estimatedPrice: number;
}

export interface SurplusRiskOutput {
  surplusRisk: number;       // 0-100
  priceRisk: number;         // 0-100
  urgency: UrgencyLevel;
  riskCategory: RiskCategory;
  reasons: string[];
  recommendation: string;
  confidence: number;
  quantityAtRisk: number;
  valueAtRisk: number;
  rescueWindowStart: number; // days
  rescueWindowEnd: number;   // days
}

// ─── Core Risk Calculation ──────────────────
export function calculateSurplusRisk(input: SurplusRiskInput): SurplusRiskOutput {
  const daysUntilHarvest = getDaysUntilHarvest(input.expectedHarvestDate);
  const perishability = CROP_PERISHABILITY[input.cropName] ?? 0.5;
  const seasonalPressure = CROP_SEASONAL_PRESSURE[input.cropName] ?? 0.45;

  // ── Surplus Risk Calculation ─────────────
  // Weighted combination of seasonal pressure + perishability + quantity factor + timing
  const quantityFactor = Math.min(input.quantity / 1000, 1.0) * 0.15;
  const timingFactor = daysUntilHarvest <= 3 ? 0.20 : daysUntilHarvest <= 7 ? 0.12 : 0.05;
  
  // Base surplus from seasonal + crop-specific patterns
  let surplusBase = (seasonalPressure * 0.50) + (perishability * 0.25) + quantityFactor + timingFactor;
  
  // Adjust for price signal — price above typical = more supply likely
  const typicalPrice = getTypicalPrice(input.cropName);
  if (input.estimatedPrice < typicalPrice * 0.8) {
    surplusBase += 0.08; // Low price already = signs of surplus
  }

  const surplusRisk = Math.min(Math.round(surplusBase * 100), 95);

  // ── Price Risk Calculation ───────────────
  let priceRisk = Math.round(
    (seasonalPressure * 0.45 + perishability * 0.30 + timingFactor * 1.5) * 100
  );
  if (daysUntilHarvest <= 3) priceRisk = Math.min(priceRisk + 12, 92);
  priceRisk = Math.min(priceRisk, 92);

  // ── Urgency ──────────────────────────────
  const urgency = calculateUrgency(daysUntilHarvest, surplusRisk, perishability);

  // ── Risk Category ─────────────────────────
  const riskCategory: RiskCategory = 
    surplusRisk >= 70 ? 'HIGH' :
    surplusRisk >= 50 ? 'MEDIUM' :
    surplusRisk >= 30 ? 'LOW' : 'LOW';

  // ── Reasons (Explainable AI) ─────────────
  const reasons = buildReasons(input, daysUntilHarvest, perishability, seasonalPressure, surplusRisk);

  // ── Recommendation ────────────────────────
  const recommendation = buildRecommendation(urgency, daysUntilHarvest);

  // ── Value & Quantity at Risk ─────────────
  const atRiskFraction = surplusRisk / 100 * 0.6; // Conservatively ~60% of risk materialises
  const quantityAtRisk = Math.round(input.quantity * atRiskFraction);
  const valueAtRisk = Math.round(quantityAtRisk * input.estimatedPrice);

  // ── Rescue Window ─────────────────────────
  const rescueWindowStart = Math.max(daysUntilHarvest - 4, 1);
  const rescueWindowEnd = Math.max(daysUntilHarvest - 1, 1);

  return {
    surplusRisk,
    priceRisk,
    urgency,
    riskCategory,
    reasons,
    recommendation,
    confidence: 0.72 + (Math.random() * 0.08), // Simulated model confidence
    quantityAtRisk,
    valueAtRisk,
    rescueWindowStart,
    rescueWindowEnd,
  };
}

// ─── Sub-functions ───────────────────────────

function getDaysUntilHarvest(dateStr: string): number {
  const harvest = new Date(dateStr);
  const today = new Date();
  const diff = Math.ceil((harvest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

function getTypicalPrice(cropName: string): number {
  const prices: Record<string, number> = {
    'Tomato': 20, 'Onion': 18, 'Chilli': 40, 'Potato': 14,
    'Brinjal': 16, 'Capsicum': 32, 'Leafy Greens': 10,
  };
  return prices[cropName] ?? 20;
}

function calculateUrgency(days: number, risk: number, perishability: number): UrgencyLevel {
  if (days <= 1 || (days <= 3 && risk >= 70)) return 'CRITICAL';
  if (days <= 3 || (days <= 5 && risk >= 65 && perishability > 0.7)) return 'HIGH';
  if (days <= 7 || risk >= 60) return 'MEDIUM';
  return 'LOW';
}

function buildReasons(
  input: SurplusRiskInput,
  days: number,
  perishability: number,
  seasonalPressure: number,
  risk: number
): string[] {
  const reasons: string[] = [];

  if (seasonalPressure > 0.6) {
    reasons.push(`Seasonal supply pressure is elevated for ${input.cropName} in this period`);
  }
  if (perishability > 0.7) {
    reasons.push(`${input.cropName} is highly perishable — selling window is narrow`);
  }
  if (days <= 5) {
    reasons.push(`Harvest is approaching within ${days} days, reducing time to find buyers`);
  }
  if (input.quantity >= 1500) {
    reasons.push(`Large quantity (${input.quantity.toLocaleString()} kg) increases market impact risk`);
  }
  if (risk >= 70) {
    reasons.push(`Historical patterns show similar timing often leads to price pressure in ${input.location.split(',')[0]}`);
  }

  // Always add a demand-side reason
  reasons.push(`Local demand estimates suggest stable-to-lower absorption around harvest window`);

  return reasons.slice(0, 5); // Max 5 reasons for clarity
}

function buildRecommendation(urgency: UrgencyLevel, days: number): string {
  if (urgency === 'CRITICAL') {
    return 'Act immediately — contact top matched buyers today. Your crop\'s sellable window is closing fast.';
  }
  if (urgency === 'HIGH') {
    return `Start contacting alternative buyers now — you have approximately ${days} days before harvest. Send inquiries to your top 2–3 matches immediately.`;
  }
  if (urgency === 'MEDIUM') {
    return `Consider reaching out to matched buyers within the next 2 days. Review your Rescue Window to plan next steps.`;
  }
  return 'Monitor price trends. Begin buyer outreach if risk rises above 50% or harvest date is less than 7 days away.';
}
