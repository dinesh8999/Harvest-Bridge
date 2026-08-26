// =============================================
// HARVEST BRIDGE — Shared Types
// =============================================

export type UserRole = 'farmer' | 'buyer' | 'admin';
export type Language = 'en' | 'te';
export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type InquiryStatus = 'sent' | 'viewed' | 'accepted' | 'declined';

// ─── User ────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  language: Language;
  location: string;
  district?: string;
  farmSize?: number;        // in acres
  primaryCrops?: string[];
  irrigationType?: string;
  smsAlerts?: boolean;
  riskThreshold?: number;   // 50-90%
  createdAt: string;
}

// ─── Farm ────────────────────────────────────
export interface Farm {
  _id: string;
  farmerId: string;
  village: string;
  district: string;
  latitude: number;
  longitude: number;
}

// ─── Crop ────────────────────────────────────
export interface Crop {
  _id: string;
  farmerId: string;
  farmerName?: string;
  cropName: string;
  quantity: number;       // kg
  expectedHarvestDate: string;
  estimatedPrice: number; // ₹/kg
  cropImage?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

// ─── Prediction ──────────────────────────────
export interface Prediction {
  _id: string;
  cropId: string;
  surplusRisk: number;     // 0-100
  priceRisk: number;       // 0-100
  urgency: UrgencyLevel;
  riskCategory: RiskCategory;
  rescueWindowStart: number; // days from now
  rescueWindowEnd: number;   // days from now
  valueAtRisk: number;       // ₹
  quantityAtRisk: number;    // kg
  reasons: string[];
  recommendation: string;
  confidence: number;        // 0-1
  isDemo: boolean;
  createdAt: string;
}

// ─── Buyer ───────────────────────────────────
export interface Buyer {
  _id: string;
  name: string;
  category: 'processor' | 'retailer' | 'restaurant' | 'wholesaler' | 'institution' | 'ngo' | 'school';
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  cropsWanted: string[];
  capacity: number;         // kg
  preferredPriceMin: number;
  preferredPriceMax: number;
  pickupAvailable: boolean;
  contactName: string;
  phone?: string;
  requiredByDate?: string;
}

// ─── Match ────────────────────────────────────
export interface BuyerMatch {
  buyer: Buyer;
  matchScore: number;       // 0-100
  distance: number;         // km
  scoreBreakdown: {
    quantityCompatibility: number;
    distanceScore: number;
    timingCompatibility: number;
    cropCompatibility: number;
    priceCompatibility: number;
  };
  recommendation: string;
  status: MatchStatus;
  matchId?: string;
}

// ─── Inquiry ─────────────────────────────────
export interface Inquiry {
  _id: string;
  farmerId: string;
  buyerId: string;
  cropId: string;
  quantity: number;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

// ─── Impact Event ────────────────────────────
export interface ImpactEvent {
  _id: string;
  cropId: string;
  quantityRedirected: number;
  estimatedValueProtected: number;
  timestamp: string;
  cropName: string;
  farmerName: string;
  buyerName: string;
}

// ─── API Responses ───────────────────────────
export interface PredictionRequest {
  cropName: string;
  location: string;
  quantity: number;
  expectedHarvestDate: string;
  estimatedPrice: number;
  cropImage?: string;
}

export interface PredictionResponse {
  prediction: Prediction;
  matches: BuyerMatch[];
  rescueWindow: RescueWindow;
  valueAtRisk: ValueAtRisk;
  priceAnalysis: PriceAnalysis;
}

export interface RescueWindow {
  daysUntilHarvest: number;
  planningWindow: { label: string; daysRange: [number, number]; status: 'safe' | 'caution' | 'critical' };
  buyerMatchingWindow: { label: string; daysRange: [number, number]; status: 'safe' | 'caution' | 'critical' };
  rescueWindow: { label: string; daysRange: [number, number]; status: 'safe' | 'caution' | 'critical' };
  harvestDay: { label: string; status: 'safe' | 'caution' | 'critical' };
  postHarvest: { label: string; status: 'spoilage' };
  currentPhase: string;
}

export interface ValueAtRisk {
  totalQuantity: number;
  expectedPrice: number;
  potentialGrossValue: number;
  quantityAtRisk: number;
  estimatedValueAtRisk: number;
  isEstimate: true;
}

export interface PriceAnalysis {
  currentEstimatedMin: number;
  currentEstimatedMax: number;
  expectedMin: number;
  expectedMax: number;
  pressureLevel: RiskCategory;
  trend: 'falling' | 'stable' | 'rising';
}

export interface ImpactSummary {
  totalProduceRedirected: number;  // kg
  totalValueProtected: number;     // ₹
  foodWasteAvoided: number;        // kg
  successfulMatches: number;
  averageMatchDistance: number;    // km
  activeFarmers: number;
  activeBuyers: number;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  language?: Language;
  timestamp: string;
}

export interface WhatIfScenario {
  label: string;
  harvestDate: string;
  quantity: number;
  expectedPrice: number;
  buyerAvailability: 'high' | 'medium' | 'low';
  surplusRisk: number;
  priceRisk: number;
  urgency: UrgencyLevel;
  estimatedValueAtRisk: number;
  buyerCount: number;
}
