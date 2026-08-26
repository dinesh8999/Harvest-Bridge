// =============================================
// HARVEST BRIDGE — AI Buyer Matching Engine
// Weighted scoring with explainability
// =============================================

import type { Buyer, BuyerMatch } from '../../types';
import { DEMO_BUYERS } from '../../data/demoData';

export interface MatchInput {
  cropName: string;
  quantity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  estimatedPrice: number;
  expectedHarvestDate?: string;
}

// ─── Default crop coordinates for demo ───────
const LOCATION_COORDS: Record<string, [number, number]> = {
  'Chittoor': [13.2172, 79.1003],
  'Palamaner': [13.2000, 78.7500],
  'Kuppam': [12.7463, 78.3455],
  'Madanapalle': [13.5559, 78.5040],
  'Tirupati': [13.6288, 79.4192],
  'Puttur': [13.4439, 79.5510],
  'Nagari': [13.3200, 79.5800],
  'Bangarupalem': [13.4700, 79.3200],
  'Thamballapalle': [13.6900, 78.8200],
};

// Matching weights (configurable)
const WEIGHTS = {
  quantity: 0.25,
  distance: 0.20,
  timing: 0.20,
  cropCompatibility: 0.20,
  price: 0.15,
};

export function findBuyerMatches(input: MatchInput, buyers?: Buyer[]): BuyerMatch[] {
  const buyerPool = buyers ?? DEMO_BUYERS;
  const farmerCoords = resolveCoords(input.location, input.latitude, input.longitude);
  const daysUntilHarvest = input.expectedHarvestDate ? getDaysUntilHarvest(input.expectedHarvestDate) : 5;

  const scored: BuyerMatch[] = buyerPool.map((buyer) => {
    const distance = calculateDistance(farmerCoords, [buyer.latitude, buyer.longitude]);
    const breakdown = calculateBreakdown(input, buyer, distance, daysUntilHarvest);
    const matchScore = calculateWeightedScore(breakdown);

    return {
      buyer,
      matchScore: Math.round(matchScore),
      distance: Math.round(distance),
      scoreBreakdown: breakdown,
      recommendation: buildMatchRecommendation(buyer, matchScore, distance, input),
      status: 'pending',
    };
  });

  // Filter relevant buyers and sort by score
  return scored
    .filter((m) => m.scoreBreakdown.cropCompatibility > 0) // Must want this crop
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6); // Top 6 matches
}

// ─── Score Breakdown ─────────────────────────
function calculateBreakdown(
  input: MatchInput,
  buyer: Buyer,
  distance: number,
  daysUntilHarvest: number
): BuyerMatch['scoreBreakdown'] {
  // 1. Crop compatibility (binary + partial)
  const cropCompatibility = buyer.cropsWanted.some(
    (c) => c.toLowerCase() === (input.cropName || '').toLowerCase()
  ) ? 100 : 0;

  // 2. Quantity compatibility
  const qRatio = Math.min(input.quantity, buyer.capacity) / Math.max(input.quantity, buyer.capacity);
  const quantityCompatibility = Math.round(qRatio * 100);

  // 3. Distance score (closer = better, ≤10km = 100, ≥100km = 10)
  const distanceScore = Math.max(10, Math.round(100 - (distance / 100) * 90));

  // 4. Timing compatibility
  let timingCompatibility = 80;
  if (buyer.requiredByDate) {
    const buyerNeedDays = getDaysUntilHarvest(buyer.requiredByDate);
    const diff = Math.abs(buyerNeedDays - daysUntilHarvest);
    timingCompatibility = Math.max(30, Math.round(100 - diff * 12));
  }

  // 5. Price compatibility
  const priceCompatibility = calculatePriceCompatibility(
    input.estimatedPrice,
    buyer.preferredPriceMin,
    buyer.preferredPriceMax
  );

  return {
    quantityCompatibility,
    distanceScore,
    timingCompatibility,
    cropCompatibility,
    priceCompatibility,
  };
}

function calculateWeightedScore(breakdown: BuyerMatch['scoreBreakdown']): number {
  return (
    breakdown.quantityCompatibility * WEIGHTS.quantity +
    breakdown.distanceScore * WEIGHTS.distance +
    breakdown.timingCompatibility * WEIGHTS.timing +
    breakdown.cropCompatibility * WEIGHTS.cropCompatibility +
    breakdown.priceCompatibility * WEIGHTS.price
  );
}

function calculatePriceCompatibility(
  farmerPrice: number,
  buyerMin: number,
  buyerMax: number
): number {
  if (farmerPrice >= buyerMin && farmerPrice <= buyerMax) return 100;
  if (farmerPrice < buyerMin) {
    const diff = buyerMin - farmerPrice;
    return Math.max(0, Math.round(100 - (diff / buyerMin) * 100));
  }
  // farmerPrice > buyerMax
  const diff = farmerPrice - buyerMax;
  return Math.max(0, Math.round(100 - (diff / farmerPrice) * 100));
}

// ─── Recommendation Builder ───────────────────
function buildMatchRecommendation(
  buyer: Buyer,
  score: number,
  distance: number,
  input: MatchInput
): string {
  if (score >= 90) {
    return `Excellent match — ${buyer.name} is actively seeking ${input.cropName} and can absorb ${Math.min(buyer.capacity, input.quantity).toLocaleString()} kg. ${buyer.pickupAvailable ? 'Pickup available.' : 'Arrange delivery.'}`;
  }
  if (score >= 75) {
    return `Good match — ${buyer.name} at ${distance} km can take ${Math.min(buyer.capacity, input.quantity).toLocaleString()} kg. Minor coordination needed.`;
  }
  return `Potential match — ${buyer.name} may be interested. Confirm quantities and timing before proceeding.`;
}

// ─── Utilities ───────────────────────────────
function getDaysUntilHarvest(dateStr: string): number {
  const harvest = new Date(dateStr);
  const today = new Date();
  return Math.max(0, Math.ceil((harvest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function resolveCoords(location: string, lat?: number, lng?: number): [number, number] {
  if (lat && lng) return [lat, lng];
  const key = Object.keys(LOCATION_COORDS).find((k) =>
    location.toLowerCase().includes(k.toLowerCase())
  );
  return key ? LOCATION_COORDS[key] : [13.2172, 79.1003]; // Default: Chittoor
}

function calculateDistance([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  // Haversine formula
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
