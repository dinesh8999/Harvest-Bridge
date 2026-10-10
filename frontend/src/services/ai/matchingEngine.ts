// =============================================
// HARVEST BRIDGE — AI Buyer Matching Engine
// Weighted scoring with explainability
// =============================================

import type { Buyer, BuyerMatch, ScoreBreakdown } from '../../types';
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

// Default crop coordinates for demo
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
      buyerId: buyer._id,
      buyerName: buyer.name,
      buyerRole: 'buyer',
      category: buyer.category,
      location: buyer.location,
      distanceKm: Math.round(distance),
      pickupAvailable: buyer.pickupAvailable,
      capacityKg: buyer.capacity,
      preferredPriceRange: `₹${buyer.preferredPriceMin} – ₹${buyer.preferredPriceMax}/kg`,
      indicativePricePerKg: (buyer.preferredPriceMin + buyer.preferredPriceMax) / 2,
      buyer,
      matchScore: Math.round(matchScore),
      distance: Math.round(distance),
      scoreBreakdown: breakdown,
      recommendation: buildMatchRecommendation(buyer, matchScore, distance, input),
      status: 'pending',
      verified: true,
    };
  });

  return scored
    .filter((m) => m.scoreBreakdown.cropCompatibility > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

function calculateBreakdown(
  input: MatchInput,
  buyer: Buyer,
  distance: number,
  daysUntilHarvest: number
): ScoreBreakdown {
  const cropCompatibility = buyer.cropsWanted.some(
    (c: string) => c.toLowerCase() === (input.cropName || '').toLowerCase()
  ) ? 100 : 0;

  const qRatio = Math.min(input.quantity, buyer.capacity) / Math.max(input.quantity, buyer.capacity);
  const quantityCompatibility = Math.round(qRatio * 100);

  const distanceScore = Math.max(10, Math.round(100 - (distance / 100) * 90));

  let timingCompatibility = 80;
  if (buyer.requiredByDate) {
    const buyerNeedDays = getDaysUntilHarvest(buyer.requiredByDate);
    const diff = Math.abs(buyerNeedDays - daysUntilHarvest);
    timingCompatibility = Math.max(30, Math.round(100 - diff * 12));
  }

  const priceCompatibility = calculatePriceCompatibility(
    input.estimatedPrice,
    buyer.preferredPriceMin,
    buyer.preferredPriceMax
  );

  return {
    cropCompatibility,
    quantityCompatibility,
    quantityFit: quantityCompatibility,
    distanceScore,
    logisticsProximity: distanceScore,
    timingCompatibility,
    timingAlignment: timingCompatibility,
    priceCompatibility,
    priceFeasibility: priceCompatibility,
  };
}

function calculateWeightedScore(breakdown: ScoreBreakdown): number {
  const q = breakdown.quantityCompatibility ?? breakdown.quantityFit ?? 80;
  const d = breakdown.distanceScore ?? breakdown.logisticsProximity ?? 80;
  const t = breakdown.timingCompatibility ?? breakdown.timingAlignment ?? 80;
  const c = breakdown.cropCompatibility ?? 100;
  const p = breakdown.priceCompatibility ?? breakdown.priceFeasibility ?? 80;

  return (
    q * WEIGHTS.quantity +
    d * WEIGHTS.distance +
    t * WEIGHTS.timing +
    c * WEIGHTS.cropCompatibility +
    p * WEIGHTS.price
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
  const diff = farmerPrice - buyerMax;
  return Math.max(0, Math.round(100 - (diff / farmerPrice) * 100));
}

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
  return key ? LOCATION_COORDS[key] : [13.2172, 79.1003];
}

function calculateDistance([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
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
