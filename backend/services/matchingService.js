// ============================================================================
// HARVEST BRIDGE — Multi-Factor AI Buyer Matching & Ranking Service
// Evaluates Crop Compatibility, Capacity, Distance, Timing, Price Reserve, and Verification
// ============================================================================

import { db } from '../database/store.js';
import { calculateNetEarnings } from './earningsCalculator.js';

// Haversine Distance Formula in Kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 15; // default fallback 15km
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Known coordinates for AP & Southern Mandis
const KNOWN_COORDS = {
  'palamaner': { lat: 13.2000, lng: 78.7500 },
  'chittoor': { lat: 13.2172, lng: 79.1003 },
  'kuppam': { lat: 12.7463, lng: 78.3455 },
  'madanapalle': { lat: 13.5559, lng: 78.5040 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'puttur': { lat: 13.4439, lng: 79.5510 },
  'nagari': { lat: 13.3200, lng: 79.5800 },
  'srikalahasti': { lat: 13.7500, lng: 79.7000 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
};

function getCoordinates(location, defaultLat = 13.2172, defaultLng = 79.1003) {
  if (!location) return { lat: defaultLat, lng: defaultLng };
  const locLower = location.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_COORDS)) {
    if (locLower.includes(key)) return coords;
  }
  return { lat: defaultLat, lng: defaultLng };
}

export function matchBuyersForCrop(cropInput) {
  const {
    cropName,
    quantity,
    location,
    latitude,
    longitude,
    expectedHarvestDate,
    minAcceptablePrice = 18,
    qualityGrade = 'Grade A',
  } = cropInput;

  const targetCrop = (cropName || 'Tomato').trim();
  const targetQty = Number(quantity) || 1000;
  const reservePrice = Number(minAcceptablePrice) || 16;
  const farmCoords =
    latitude && longitude
      ? { lat: Number(latitude), lng: Number(longitude) }
      : getCoordinates(location);

  // Fetch all registered buyers and verified organizations
  const allBuyers = db.find('users', (u) => u.role === 'buyer' || u.role === 'organization');

  const matches = allBuyers
    .filter((b) => {
      // Must have requested crops list that includes this crop
      const wanted = b.cropsWanted || [];
      return wanted.some((w) => w.toLowerCase() === targetCrop.toLowerCase());
    })
    .map((buyer) => {
      const buyerCoords =
        buyer.latitude && buyer.longitude
          ? { lat: buyer.latitude, lng: buyer.longitude }
          : getCoordinates(buyer.location || buyer.district);

      const distanceKm = calculateHaversineDistance(
        farmCoords.lat,
        farmCoords.lng,
        buyerCoords.lat,
        buyerCoords.lng
      );

      // 1. Crop Compatibility (100% since already filtered)
      const cropCompatibilityScore = 100;

      // 2. Quantity Fit Score
      const buyerCapacity = buyer.capacity || 1000;
      const qRatio = Math.min(targetQty, buyerCapacity) / Math.max(targetQty, buyerCapacity);
      const quantityCompatibilityScore = Math.round(qRatio * 100);

      // 3. Proximity / Logistics Score (100 at 0km, decays to 20 at 100km)
      const distanceScore = Math.max(15, Math.round(100 - (distanceKm / 100) * 85));

      // 4. Timing Alignment
      const daysUntilHarvest = expectedHarvestDate
        ? Math.max(0, Math.ceil((new Date(expectedHarvestDate).getTime() - Date.now()) / 86400000))
        : 5;
      const timingScore = daysUntilHarvest <= 7 ? 90 : 75;

      // 5. Price & Financial Feasibility Score
      const buyerMin = buyer.preferredPriceMin || 14;
      const buyerMax = buyer.preferredPriceMax || 24;
      let priceCompatibilityScore = 70;
      if (reservePrice <= buyerMax && reservePrice >= buyerMin) {
        priceCompatibilityScore = 95;
      } else if (reservePrice < buyerMin) {
        priceCompatibilityScore = 100; // Farmer is very competitive
      } else {
        const gap = reservePrice - buyerMax;
        priceCompatibilityScore = Math.max(20, Math.round(100 - (gap / reservePrice) * 100));
      }

      // 6. Organization / Verification Bonus
      const verificationBonus = buyer.verified ? 5 : 0;

      // Multi-Factor Synthesis
      const compositeScore = Math.min(
        100,
        Math.round(
          cropCompatibilityScore * 0.25 +
          quantityCompatibilityScore * 0.20 +
          distanceScore * 0.25 +
          timingScore * 0.15 +
          priceCompatibilityScore * 0.15 +
          verificationBonus
        )
      );

      // Indicative Offer & Net Return Calculation
      const indicativePrice = Math.round(((buyerMin + buyerMax) / 2) * 10) / 10;
      const transportOption = buyer.pickupAvailable ? 'buyer_pickup' : 'farmer_delivery';
      const netAnalysis = calculateNetEarnings({
        quantityKg: Math.min(targetQty, buyerCapacity),
        pricePerKg: indicativePrice,
        distanceKm,
        transportOption,
      });

      // Explainable Matching Rationale
      const reasons = [];
      reasons.push(
        buyer.pickupAvailable
          ? `Buyer provides direct on-farm pickup (${distanceKm} km away, ₹0 farmer transport cost).`
          : `Farmer delivery required to ${buyer.location} (${distanceKm} km).`
      );
      reasons.push(
        `Buyer capacity of ${buyerCapacity.toLocaleString()} kg can absorb ${Math.min(
          100,
          Math.round((buyerCapacity / targetQty) * 100)
        )}% of your listing.`
      );
      if (buyer.verified) {
        reasons.push(`Verified ${buyer.category || buyer.role} with verified operational credentials.`);
      }

      return {
        buyerId: buyer._id,
        buyerName: buyer.name,
        buyerRole: buyer.role,
        category: buyer.category || (buyer.role === 'organization' ? 'ngo' : 'retailer'),
        location: buyer.location || buyer.district,
        distanceKm,
        pickupAvailable: !!buyer.pickupAvailable,
        capacityKg: buyerCapacity,
        preferredPriceRange: `₹${buyerMin} – ₹${buyerMax}/kg`,
        indicativePricePerKg: indicativePrice,
        matchScore: compositeScore,
        scoreBreakdown: {
          cropCompatibility: cropCompatibilityScore,
          quantityFit: quantityCompatibilityScore,
          logisticsProximity: distanceScore,
          timingAlignment: timingScore,
          priceFeasibility: priceCompatibilityScore,
        },
        netAnalysis,
        reasons,
        verified: !!buyer.verified,
      };
    });

  // Sort descending by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
