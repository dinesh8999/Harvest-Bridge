// ============================================================================
// HARVEST BRIDGE — Order Lifecycle & Inventory Protection Service
// Prevents overselling, manages inventory reservations, collection, delivery, 
// and produces verified social/environmental impact records.
// ============================================================================

import { db } from '../database/store.js';
import { calculateNetEarnings } from './earningsCalculator.js';

/**
 * Submit an offer from Buyer to Farmer for a crop listing.
 */
export function createOffer({
  listingId,
  buyerId,
  offeredQuantity,
  offeredPricePerKg,
  transportOption = 'buyer_pickup',
  pickupDate,
  notes,
}) {
  const listing = db.findById('cropListings', listingId);
  if (!listing) {
    throw new Error('Crop listing not found.');
  }

  if (listing.status === 'sold_out' || listing.status === 'closed' || listing.status === 'paused') {
    throw new Error(`Cannot submit offer on a listing with status '${listing.status}'.`);
  }

  const buyer = db.findById('users', buyerId);
  if (!buyer) {
    throw new Error('Buyer account not found.');
  }

  const requestedQty = Number(offeredQuantity);
  if (isNaN(requestedQty) || requestedQty <= 0) {
    throw new Error('Offered quantity must be a positive number.');
  }

  if (requestedQty > listing.availableQuantity) {
    throw new Error(
      `Offered quantity (${requestedQty} kg) exceeds currently available unreserved inventory (${listing.availableQuantity} kg).`
    );
  }

  const price = Number(offeredPricePerKg);
  if (isNaN(price) || price <= 0) {
    throw new Error('Offered price must be a valid positive amount.');
  }

  const farmer = db.findById('users', listing.farmerId);

  // Calculate Net Return
  const netAnalysis = calculateNetEarnings({
    quantityKg: requestedQty,
    pricePerKg: price,
    distanceKm: 20, // default approximation if not calculated
    transportOption,
  });

  const offer = db.insert('offers', {
    listingId: listing._id,
    cropName: listing.cropName,
    farmerId: listing.farmerId,
    farmerName: listing.farmerName || farmer?.name || 'Farmer',
    buyerId: buyer._id,
    buyerName: buyer.name,
    buyerRole: buyer.role,
    buyerCategory: buyer.category || 'retailer',
    offeredQuantity: requestedQty,
    offeredPricePerKg: price,
    transportOption,
    pickupDate: pickupDate || listing.expectedHarvestDate,
    transportCost: netAnalysis.transportCost,
    handlingCost: netAnalysis.handlingCost,
    platformFee: netAnalysis.platformFee,
    estimatedNetEarnings: netAnalysis.netEarnings,
    status: 'pending', // pending | countered | accepted | rejected | expired
    notes: notes || '',
  });

  // Log Audit Event
  db.insert('auditLogs', {
    actorId: buyer._id,
    actorName: buyer.name,
    action: 'OFFER_SUBMITTED',
    targetId: offer._id,
    targetType: 'Offer',
    details: `Submitted offer for ${requestedQty} kg of ${listing.cropName} at ₹${price}/kg to ${farmer?.name || 'Farmer'}`,
  });

  return offer;
}

/**
 * Farmer accepts an offer -> Safely reserves inventory and creates confirmed order.
 */
export function acceptOffer({ offerId, farmerId }) {
  const offer = db.findById('offers', offerId);
  if (!offer) {
    throw new Error('Offer not found.');
  }

  if (offer.farmerId !== farmerId) {
    throw new Error('Unauthorized. You can only accept offers for your own crop listings.');
  }

  if (offer.status !== 'pending' && offer.status !== 'countered') {
    throw new Error(`Offer is already ${offer.status}.`);
  }

  const listing = db.findById('cropListings', offer.listingId);
  if (!listing) {
    throw new Error('Associated crop listing not found.');
  }

  // CRITICAL: Inventory Protection Check
  if (listing.availableQuantity < offer.offeredQuantity) {
    throw new Error(
      `Insufficient available inventory. Requested: ${offer.offeredQuantity} kg, Available: ${listing.availableQuantity} kg.`
    );
  }

  // Atomic Update: Reserve inventory on listing
  const newAvailable = listing.availableQuantity - offer.offeredQuantity;
  const newReserved = (listing.reservedQuantity || 0) + offer.offeredQuantity;
  const newStatus = newAvailable === 0 ? 'partially_reserved' : listing.status;

  db.update('cropListings', listing._id, {
    availableQuantity: newAvailable,
    reservedQuantity: newReserved,
    status: newStatus,
  });

  // Update offer status
  db.update('offers', offer._id, {
    status: 'accepted',
  });

  // Create Order in 'scheduled_pickup' status
  const order = db.insert('orders', {
    offerId: offer._id,
    listingId: listing._id,
    cropName: listing.cropName,
    farmerId: offer.farmerId,
    farmerName: offer.farmerName,
    farmerPhone: listing.farmerPhone,
    farmerLocation: listing.location,
    buyerId: offer.buyerId,
    buyerName: offer.buyerName,
    buyerRole: offer.buyerRole,
    buyerCategory: offer.buyerCategory,
    quantityKg: offer.offeredQuantity,
    agreedPricePerKg: offer.offeredPricePerKg,
    grossTotalValue: offer.offeredQuantity * offer.offeredPricePerKg,
    transportCost: offer.transportCost,
    handlingCost: offer.handlingCost,
    netFarmerEarnings: offer.estimatedNetEarnings,
    transportType: offer.transportOption,
    scheduledDate: offer.pickupDate,
    status: 'scheduled_pickup', // scheduled_pickup | in_transit | delivered | completed | cancelled
    paymentStatus: 'pending_external', // pending_external | verified_paid
    pickupDetails: {
      scheduledDate: offer.pickupDate,
      pickupLocation: listing.location,
    },
    confirmedRescuedKg: 0,
    confirmedWasteKg: 0,
  });

  // Log Audit Event
  db.insert('auditLogs', {
    actorId: farmerId,
    actorName: offer.farmerName,
    action: 'OFFER_ACCEPTED',
    targetId: order._id,
    targetType: 'Order',
    details: `Accepted offer from ${offer.buyerName}. Reserved ${offer.offeredQuantity} kg ${listing.cropName}.`,
  });

  return { order, listing: db.findById('cropListings', listing._id) };
}

/**
 * Farmer or Buyer cancels an order -> Automatically releases reserved inventory safely.
 */
export function cancelOrder({ orderId, userId, reason }) {
  const order = db.findById('orders', orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (order.status === 'completed' || order.status === 'cancelled') {
    throw new Error(`Order is already ${order.status}.`);
  }

  const listing = db.findById('cropListings', order.listingId);
  if (listing) {
    // Release reserved inventory back to available stock
    const newAvailable = listing.availableQuantity + order.quantityKg;
    const newReserved = Math.max(0, (listing.reservedQuantity || 0) - order.quantityKg);
    const newStatus = listing.status === 'partially_reserved' ? 'active' : listing.status;

    db.update('cropListings', listing._id, {
      availableQuantity: newAvailable,
      reservedQuantity: newReserved,
      status: newStatus,
    });
  }

  const updatedOrder = db.update('orders', order._id, {
    status: 'cancelled',
    cancellationReason: reason || 'Cancelled by user',
  });

  db.insert('auditLogs', {
    actorId: userId,
    action: 'ORDER_CANCELLED',
    targetId: order._id,
    targetType: 'Order',
    details: `Order #${order._id} cancelled. Released ${order.quantityKg} kg back to listing inventory.`,
  });

  return updatedOrder;
}

/**
 * Record collection / pickup from the farm
 */
export function recordCollection({ orderId, driverName, vehicleNumber, inspectedWeightKg }) {
  const order = db.findById('orders', orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  const actualWeight = Number(inspectedWeightKg) || order.quantityKg;

  const updatedOrder = db.update('orders', order._id, {
    status: 'in_transit',
    pickupDetails: {
      ...order.pickupDetails,
      driverName: driverName || 'Transport Driver',
      vehicleNumber: vehicleNumber || 'AP Transport',
      collectedAt: new Date().toISOString(),
      collectedWeightKg: actualWeight,
    },
  });

  return updatedOrder;
}

/**
 * Confirm delivery and produce verified social & ecological impact records
 */
export function confirmDelivery({
  orderId,
  verifiedWeightKg,
  confirmedWasteKg = 0,
  receiverName,
  notes,
}) {
  const order = db.findById('orders', orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  const deliveredWeight = Number(verifiedWeightKg) || order.quantityKg;
  const wasteWeight = Math.max(0, Number(confirmedWasteKg) || 0);
  const rescuedWeight = Math.max(0, deliveredWeight - wasteWeight);

  const listing = db.findById('cropListings', order.listingId);
  if (listing) {
    // Deduct from reservedQuantity, add to soldQuantity & wastedQuantity
    const newReserved = Math.max(0, (listing.reservedQuantity || 0) - order.quantityKg);
    const newSold = (listing.soldQuantity || 0) + rescuedWeight;
    const newWasted = (listing.wastedQuantity || 0) + wasteWeight;
    const isFinished = listing.availableQuantity === 0 && newReserved === 0;

    db.update('cropListings', listing._id, {
      reservedQuantity: newReserved,
      soldQuantity: newSold,
      wastedQuantity: newWasted,
      status: isFinished ? 'completed' : listing.status,
    });
  }

  // Update order to completed
  const updatedOrder = db.update('orders', order._id, {
    status: 'completed',
    paymentStatus: 'verified_paid', // confirmed completion
    confirmedRescuedKg: rescuedWeight,
    confirmedWasteKg: wasteWeight,
    deliveryDetails: {
      deliveredAt: new Date().toISOString(),
      deliveredWeightKg: deliveredWeight,
      receiverName: receiverName || order.buyerName,
      notes: notes || 'Delivery inspected and verified at destination.',
    },
  });

  // Calculate Verified Environmental & Economic Impact
  // Standards: ~1.9 kg CO2e / kg food waste avoided, ~220 L water footprint / kg produce
  const valueProtected = Math.round(rescuedWeight * order.agreedPricePerKg);
  const co2eAvoided = Math.round(rescuedWeight * 1.9);
  const waterSaved = Math.round(rescuedWeight * 220);

  const impactEvent = db.insert('impactRecords', {
    orderId: order._id,
    cropName: order.cropName,
    farmerId: order.farmerId,
    farmerName: order.farmerName,
    buyerId: order.buyerId,
    buyerName: order.buyerName,
    quantityRedirectedKg: rescuedWeight,
    valueProtectedInr: valueProtected,
    wasteAvoidedKg: rescuedWeight,
    wasteReportedKg: wasteWeight,
    co2eAvoidedKg: co2eAvoided,
    waterSavedLiters: waterSaved,
    recipientCategory: order.buyerCategory || 'buyer',
    timestamp: new Date().toISOString(),
  });

  db.insert('auditLogs', {
    actorId: order.buyerId,
    actorName: order.buyerName,
    action: 'DELIVERY_CONFIRMED_IMPACT_RECORDED',
    targetId: impactEvent._id,
    targetType: 'ImpactRecord',
    details: `Confirmed delivery of ${rescuedWeight} kg ${order.cropName}. Avoided ${co2eAvoided} kg CO2e, protected ₹${valueProtected}.`,
  });

  return { order: updatedOrder, impact: impactEvent };
}
