// ============================================================================
// HARVEST BRIDGE — Net Earnings & Offer Comparison Engine
// Transparent Calculation:
// Net Earnings = (Quantity × Agreed Price) - Transport Costs - Handling Costs - Platform Fees
// ============================================================================

export const DEFAULT_LOGISTICS_RATES = {
  // ₹ per km per quintal (100 kg) for mini trucks / tempos in rural Andhra Pradesh
  tempoRatePerKmPerQuintal: 1.25, 
  // Minimum base logistics charge if distance > 0
  baseLogisticsCharge: 350,
  // Standard loading & bagging handling charge in ₹/kg
  handlingRatePerKg: 0.50,
  // Platform fee for farmers (0% guaranteed)
  platformFeePercent: 0.0,
};

/**
 * Calculate transparent estimated net earnings for an offer
 */
export function calculateNetEarnings({
  quantityKg,
  pricePerKg,
  distanceKm = 0,
  transportOption = 'buyer_pickup', // buyer_pickup | farmer_delivery
  customTransportCost,
  customHandlingCost,
  customPlatformFee,
}) {
  const qty = Number(quantityKg) || 0;
  const price = Number(pricePerKg) || 0;
  const dist = Number(distanceKm) || 0;

  // 1. Gross Revenue
  const grossRevenue = Math.round(qty * price);

  // 2. Transport Cost
  let transportCost = 0;
  if (customTransportCost !== undefined && customTransportCost !== null) {
    transportCost = Math.max(0, Number(customTransportCost));
  } else if (transportOption === 'farmer_delivery' && dist > 0) {
    const quintals = qty / 100;
    const variableCost = dist * quintals * DEFAULT_LOGISTICS_RATES.tempoRatePerKmPerQuintal;
    transportCost = Math.round(Math.max(DEFAULT_LOGISTICS_RATES.baseLogisticsCharge, variableCost));
  } else {
    transportCost = 0; // Buyer is picking up from the farm gate
  }

  // 3. Handling & Packaging Cost
  let handlingCost = 0;
  if (customHandlingCost !== undefined && customHandlingCost !== null) {
    handlingCost = Math.max(0, Number(customHandlingCost));
  } else {
    handlingCost = Math.round(qty * DEFAULT_LOGISTICS_RATES.handlingRatePerKg);
  }

  // 4. Platform Fee
  let platformFee = 0;
  if (customPlatformFee !== undefined && customPlatformFee !== null) {
    platformFee = Math.max(0, Number(customPlatformFee));
  } else {
    platformFee = Math.round(grossRevenue * (DEFAULT_LOGISTICS_RATES.platformFeePercent / 100));
  }

  // 5. Net Farmer Earnings
  const totalDeductions = transportCost + handlingCost + platformFee;
  const netEarnings = Math.max(0, grossRevenue - totalDeductions);
  const effectiveNetPricePerKg = qty > 0 ? Number((netEarnings / qty).toFixed(2)) : 0;

  return {
    quantityKg: qty,
    grossPricePerKg: price,
    grossRevenue,
    transportOption,
    transportCost,
    handlingCost,
    platformFee,
    totalDeductions,
    netEarnings,
    effectiveNetPricePerKg,
    assumptions: [
      transportOption === 'buyer_pickup'
        ? 'Buyer covers collection logistics (₹0 farmer transport cost).'
        : `Farmer arranges delivery (${dist} km distance @ standard local tempo rates).`,
      `Handling & on-farm packing estimated at ₹${DEFAULT_LOGISTICS_RATES.handlingRatePerKg}/kg.`,
      '0% Harvest Bridge platform commission on direct agricultural transactions.',
    ],
  };
}

/**
 * Compare multiple buyer offers and rank by Net Return
 */
export function compareOffers(offersList) {
  const analyzed = offersList.map((offer) => {
    const calculation = calculateNetEarnings({
      quantityKg: offer.offeredQuantity || offer.quantityKg,
      pricePerKg: offer.offeredPricePerKg || offer.agreedPricePerKg,
      distanceKm: offer.estimatedDistanceKm || offer.distanceKm || 0,
      transportOption: offer.transportOption || 'buyer_pickup',
      customTransportCost: offer.transportCost,
      customHandlingCost: offer.handlingCost,
    });

    return {
      ...offer,
      netAnalysis: calculation,
    };
  });

  // Rank by effective net price per kg descending
  return analyzed.sort((a, b) => b.netAnalysis.effectiveNetPricePerKg - a.netAnalysis.effectiveNetPricePerKg);
}
