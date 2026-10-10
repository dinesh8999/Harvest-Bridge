// =============================================
// HARVEST BRIDGE — Complete Shared Types
// Fully aligned with backend models & frontend views
// =============================================

export type UserRole = 'farmer' | 'buyer' | 'organization' | 'admin';
export type Language = 'en' | 'te';
export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ListingStatus = 'active' | 'partially_reserved' | 'sold_out' | 'paused' | 'completed' | 'closed';
export type OfferStatus = 'pending' | 'countered' | 'accepted' | 'rejected' | 'expired';
export type OrderStatus = 'confirmed' | 'scheduled_pickup' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending_external' | 'verified_paid';
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type InquiryStatus = 'sent' | 'viewed' | 'accepted' | 'declined';

// ─── User ────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  category?: 'processor' | 'retailer' | 'restaurant' | 'wholesaler' | 'institution' | 'ngo' | 'school';
  language: Language;
  location: string;
  district?: string;
  farmSize?: number;        // in acres
  primaryCrops?: string[];
  irrigationType?: string;
  smsAlerts?: boolean;
  riskThreshold?: number;   // 50-90%
  verified?: boolean;
  verificationNotes?: string;
  cropsWanted?: string[];
  capacity?: number;
  preferredPriceMin?: number;
  preferredPriceMax?: number;
  pickupAvailable?: boolean;
  createdAt: string;
}

// ─── Buyer (For discovery, matching, and map) ──
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
  contactName?: string;
  phone?: string;
  requiredByDate?: string;
}

// ─── Crop Listing ────────────────────────────
export interface CropListing {
  _id: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  cropName: string;
  variety?: string;
  category?: string;
  location: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  quantity?: number; // legacy alias
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  wastedQuantity: number;
  unit: string;
  expectedHarvestDate: string;
  qualityGrade: string;
  storageType: string;
  shelfLifeDays: number;
  minAcceptablePrice: number;
  estimatedPrice?: number; // legacy alias
  estimatedMarketPrice: number;
  photos: string[];
  status: ListingStatus;
  surplusRiskScore: number;
  riskAnalysis?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy alias
export type Crop = CropListing;

// ─── Offer ───────────────────────────────────
export interface Offer {
  _id: string;
  listingId: string;
  cropName?: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  buyerRole: string;
  buyerCategory: string;
  offeredQuantity: number;
  offeredPricePerKg: number;
  transportOption: 'buyer_pickup' | 'farmer_delivery';
  pickupDate: string;
  estimatedDistanceKm?: number;
  transportCost: number;
  handlingCost: number;
  platformFee: number;
  estimatedNetEarnings: number;
  counterPrice?: number | null;
  status: OfferStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ───────────────────────────────────
export interface Order {
  _id: string;
  offerId: string;
  listingId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerLocation: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  buyerLocation: string;
  quantityKg: number;
  agreedPricePerKg: number;
  grossTotalValue: number;
  transportCost: number;
  handlingCost: number;
  netFarmerEarnings: number;
  transportType: 'buyer_pickup' | 'farmer_delivery';
  scheduledDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  pickupDetails?: {
    driverName?: string;
    vehicleNumber?: string;
    collectedAt?: string;
    collectedWeightKg?: number;
  };
  deliveryDetails?: {
    deliveredAt?: string;
    deliveredWeightKg?: number;
    receiverName?: string;
    notes?: string;
  };
  confirmedRescuedKg: number;
  confirmedWasteKg: number;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Buyer Match ─────────────────────────────
export interface ScoreBreakdown {
  cropCompatibility: number;
  quantityCompatibility?: number;
  quantityFit?: number;
  distanceScore?: number;
  logisticsProximity?: number;
  timingCompatibility?: number;
  timingAlignment?: number;
  priceCompatibility?: number;
  priceFeasibility?: number;
}

export interface BuyerMatch {
  buyerId?: string;
  buyerName?: string;
  buyerRole?: string;
  category?: string;
  location?: string;
  distanceKm?: number;
  pickupAvailable?: boolean;
  capacityKg?: number;
  preferredPriceRange?: string;
  indicativePricePerKg?: number;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  netAnalysis?: NetEarningsAnalysis;
  reasons?: string[];
  verified?: boolean;
  buyer: Buyer;
  distance: number;
  recommendation: string;
  status: MatchStatus | string;
  matchId?: string;
}

// ─── Net Earnings Analysis ───────────────────
export interface NetEarningsAnalysis {
  quantityKg: number;
  grossPricePerKg: number;
  grossRevenue: number;
  transportOption: 'buyer_pickup' | 'farmer_delivery';
  transportCost: number;
  handlingCost: number;
  platformFee: number;
  totalDeductions: number;
  netEarnings: number;
  effectiveNetPricePerKg: number;
  assumptions: string[];
}

// ─── Market Observation ──────────────────────
export interface MarketObservation {
  marketId: string;
  marketName: string;
  district: string;
  state: string;
  crop: string;
  variety: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  dailyArrivalsQuintals: number;
  historicalPriceTrend: { date: string; price: number; arrivals: number }[];
  trend: 'rising' | 'stable' | 'falling';
  changePercent: number;
  dataSource: string;
  isLiveVerified: boolean;
  lastUpdated: string;
}

// ─── Impact Record ───────────────────────────
export interface ImpactRecord {
  _id: string;
  orderId?: string;
  cropName: string;
  farmerId?: string;
  farmerName: string;
  buyerId?: string;
  buyerName: string;
  quantityRedirectedKg?: number;
  quantityRedirected?: number;
  valueProtectedInr?: number;
  estimatedValueProtected?: number;
  wasteAvoidedKg?: number;
  co2eAvoidedKg?: number;
  waterSavedLiters?: number;
  recipientCategory?: string;
  timestamp: string;
}

export type ImpactEvent = ImpactRecord;

// ─── Prediction Request / Response ───────────
export interface PredictionRequest {
  cropName: string;
  location: string;
  quantity: number;
  expectedHarvestDate: string;
  estimatedPrice: number;
  cropImage?: string;
}

export interface Prediction {
  _id?: string;
  cropId?: string;
  cropName?: string;
  location?: string;
  quantity?: number;
  surplusRisk: number;
  priceRisk: number;
  urgency: UrgencyLevel;
  riskCategory: RiskCategory;
  rescueWindowStart: number;
  rescueWindowEnd: number;
  valueAtRisk: number;
  quantityAtRisk: number;
  reasons: string[];
  recommendation: string;
  confidence?: number;
  confidenceScore?: number;
  isDemo?: boolean;
  createdAt: string;
}

export interface ValueAtRisk {
  totalQuantity: number;
  expectedPrice: number;
  potentialGrossValue: number;
  quantityAtRisk: number;
  estimatedValueAtRisk: number;
  isEstimate: true;
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

export interface PriceAnalysis {
  currentEstimatedMin: number;
  currentEstimatedMax: number;
  expectedMin: number;
  expectedMax: number;
  pressureLevel: RiskCategory;
  trend: 'falling' | 'stable' | 'rising';
}

export interface PredictionResponse {
  prediction: Prediction;
  matches: BuyerMatch[];
  rescueWindow: RescueWindow;
  valueAtRisk: ValueAtRisk;
  priceAnalysis: PriceAnalysis;
}

// ─── AI Assistant Message ────────────────────
export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  language?: Language;
  topic?: string;
  sources?: string[];
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
