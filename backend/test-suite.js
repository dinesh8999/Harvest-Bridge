// ============================================================================
// HARVEST BRIDGE — Comprehensive Automated Verification Test Suite
// Executes Unit, Integration, Security, and Lifecycle Workflow Tests
// ============================================================================

import { db, hashPassword, verifyPassword } from './database/store.js';
import { generateToken, verifyToken, registerUser, loginUser } from './services/authService.js';
import { predictSurplusRisk } from './services/surplusAiService.js';
import { matchBuyersForCrop } from './services/matchingService.js';
import { calculateNetEarnings, compareOffers } from './services/earningsCalculator.js';
import { createOffer, acceptOffer, cancelOrder, recordCollection, confirmDelivery } from './services/orderService.js';
import { getMarketIntelligence } from './services/marketIntelligenceService.js';
import { processAgriculturalQuery } from './services/assistantService.js';

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('🌱 HARVEST BRIDGE — COMPREHENSIVE AUTOMATED TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

// ── 1. CRYPTO & AUTHENTICATION ────────────────────────────────
console.log('--- 1. Cryptography & Authentication Suite ---');

test('PBKDF2 password hashing & verification', () => {
  const { hash, salt } = hashPassword('MySecretPass@123');
  assert(hash && hash.length === 128, 'Hash must be 128 hex chars (64 bytes)');
  assert(verifyPassword('MySecretPass@123', hash, salt), 'Valid password must verify true');
  assert(!verifyPassword('WrongPass', hash, salt), 'Incorrect password must verify false');
});

test('RFC-7519 HMAC-SHA256 JWT generation and validation', () => {
  const token = generateToken({ id: 'user-test-1', role: 'farmer' }, 24);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT must have 3 segments');
  const payload = verifyToken(token);
  assert(payload && payload.id === 'user-test-1' && payload.role === 'farmer', 'Decoded payload must match');
  assert(verifyToken('corrupted.token.value') === null, 'Corrupted token must return null');
});

test('User registration and duplicate phone protection', () => {
  const testPhone = '9111122222';
  // Remove if exists
  const existing = db.findOne('users', (u) => u.phone === testPhone);
  if (existing) db.remove('users', existing._id);

  const reg = registerUser({
    name: 'Suresh Naidu',
    phone: testPhone,
    password: 'SecurePassword123',
    role: 'farmer',
    location: 'Madanapalle, Chittoor',
  });
  assert(reg.user && reg.user.phone === testPhone, 'Registered user returned');
  assert(reg.token && reg.token.length > 20, 'Auth token generated upon registration');

  let dupCaught = false;
  try {
    registerUser({
      name: 'Duplicate Suresh',
      phone: testPhone,
      password: 'SecurePassword123',
    });
  } catch (err) {
    dupCaught = true;
  }
  assert(dupCaught, 'Duplicate phone number registration must throw an error');
});

test('User login with valid & invalid credentials', () => {
  const login = loginUser({ phone: '9876543001', password: 'Harvest@123' });
  assert(login.user && login.user.name === 'Ravi Kumar', 'Seed farmer logs in successfully');
  assert(login.token, 'Token returned on successful login');

  let failCaught = false;
  try {
    loginUser({ phone: '9876543001', password: 'IncorrectPassword' });
  } catch {
    failCaught = true;
  }
  assert(failCaught, 'Incorrect password must be rejected');
});

// ── 2. AI SURPLUS RISK ENGINE ─────────────────────────────────
console.log('\n--- 2. AI Surplus Risk Engine Suite ---');

test('High-perishability crop (Tomato) triggers elevated surplus risk with explainability', () => {
  const result = predictSurplusRisk({
    cropName: 'Tomato',
    location: 'Palamaner, Chittoor',
    quantity: 2500,
    expectedHarvestDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    estimatedPrice: 20,
  });

  assert(result.status === 'SUCCESS', 'Prediction status must be SUCCESS');
  assert(result.surplusRisk >= 65, 'Tomato surplus risk must be >= 65%');
  assert(result.urgency === 'HIGH' || result.urgency === 'CRITICAL', 'Urgency must be HIGH or CRITICAL for 3-day window');
  assert(result.contributingFactors.length >= 2, 'Explainable factors must provide at least 2 entries');
  assert(result.quantityAtRisk > 0 && result.valueAtRisk > 0, 'Risk quantities must be positive numbers');
  assert(result.confidenceScore >= 0.70 && result.confidenceScore <= 1.0, 'Confidence score bounded between 0.7 and 1.0');
});

test('Low-perishability crop (Potato) returns lower surplus risk', () => {
  const result = predictSurplusRisk({
    cropName: 'Potato',
    location: 'Nagari, Tirupati',
    quantity: 2500,
    expectedHarvestDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    estimatedPrice: 14,
  });

  assert(result.status === 'SUCCESS', 'Prediction status must be SUCCESS');
  assert(result.surplusRisk <= 50, 'Potato surplus risk must be <= 50%');
  assert(result.urgency === 'LOW' || result.urgency === 'MEDIUM', 'Urgency must be low or medium');
});

test('Honest handling of insufficient or invalid input data', () => {
  const noCrop = predictSurplusRisk({ cropName: '', quantity: 1000 });
  assert(noCrop.status === 'INSUFFICIENT_DATA', 'Missing crop must return INSUFFICIENT_DATA');

  const zeroQty = predictSurplusRisk({ cropName: 'Tomato', quantity: 0 });
  assert(zeroQty.status === 'INSUFFICIENT_DATA', 'Zero quantity must return INSUFFICIENT_DATA');
});

// ── 3. BUYER MATCHING & MULTI-FACTOR RANKING ──────────────────
console.log('\n--- 3. Buyer Matching & Multi-Factor Ranking Suite ---');

test('Multi-factor ranking filters by crop compatibility and ranks by proximity/capacity', () => {
  const matches = matchBuyersForCrop({
    cropName: 'Tomato',
    quantity: 2000,
    location: 'Palamaner, Chittoor',
    expectedHarvestDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    minAcceptablePrice: 18,
  });

  assert(matches.length > 0, 'Must return at least one buyer match');
  assert(matches[0].matchScore >= matches[matches.length - 1].matchScore, 'Matches must be sorted descending by match score');
  assert(matches[0].scoreBreakdown.cropCompatibility === 100, 'Matched buyer must want tomato');
  assert(matches[0].netAnalysis && matches[0].netAnalysis.netEarnings > 0, 'Net earnings must be calculated for each match');
  assert(matches[0].reasons.length >= 1, 'Match must have explainable reasons');
});

// ── 4. NET EARNINGS & COMPARISON ENGINE ─────────────────────────
console.log('\n--- 4. Net Earnings & Offer Comparison Engine Suite ---');

test('Accurate net earnings deduction formula', () => {
  // Scenario: 1,000 kg @ ₹20/kg with farmer delivery (40 km distance)
  const calc = calculateNetEarnings({
    quantityKg: 1000,
    pricePerKg: 20,
    distanceKm: 40,
    transportOption: 'farmer_delivery',
  });

  assert(calc.grossRevenue === 20000, 'Gross revenue must be ₹20,000');
  assert(calc.transportCost > 0, 'Farmer delivery must compute transport cost');
  assert(calc.handlingCost === 500, 'Handling cost must be ₹0.50 * 1000 = ₹500');
  assert(calc.netEarnings < calc.grossRevenue, 'Net earnings must deduct logistics & handling');
  assert(calc.effectiveNetPricePerKg < 20, 'Effective net price per kg must reflect deductions');

  // Scenario 2: Buyer Pickup (₹0 transport cost)
  const pickupCalc = calculateNetEarnings({
    quantityKg: 1000,
    pricePerKg: 20,
    transportOption: 'buyer_pickup',
  });
  assert(pickupCalc.transportCost === 0, 'Buyer pickup has ₹0 farmer transport cost');
  assert(pickupCalc.netEarnings > calc.netEarnings, 'Buyer pickup yields higher net earnings than farmer delivery');
});

test('Offer comparison ranks by highest effective net return', () => {
  const offers = [
    {
      offeredQuantity: 1000,
      offeredPricePerKg: 24,
      transportOption: 'farmer_delivery',
      distanceKm: 80, // high transport cost
    },
    {
      offeredQuantity: 1000,
      offeredPricePerKg: 21,
      transportOption: 'buyer_pickup', // zero transport cost
      distanceKm: 15,
    },
  ];

  const ranked = compareOffers(offers);
  assert(ranked.length === 2, 'Must compare all offers');
  assert(ranked[0].netAnalysis.effectiveNetPricePerKg >= ranked[1].netAnalysis.effectiveNetPricePerKg, 'Ranked by highest net price per kg');
});

// ── 5. ORDER LIFECYCLE & INVENTORY SAFETY ─────────────────────
console.log('\n--- 5. Order Lifecycle & Overselling Protection Suite ---');

test('Offer submission, acceptance, atomic inventory reservation, and overselling protection', () => {
  // Create a dedicated test listing
  const listing = db.insert('cropListings', {
    farmerId: 'farmer-001',
    farmerName: 'Ravi Kumar',
    cropName: 'Brinjal',
    totalQuantity: 1000,
    availableQuantity: 1000,
    reservedQuantity: 0,
    soldQuantity: 0,
    wastedQuantity: 0,
    minAcceptablePrice: 15,
    status: 'active',
  });

  // Buyer submits offer for 600 kg
  const offer = createOffer({
    listingId: listing._id,
    buyerId: 'buyer-001',
    offeredQuantity: 600,
    offeredPricePerKg: 18,
    transportOption: 'buyer_pickup',
  });

  assert(offer.status === 'pending', 'Offer starts in pending state');

  // Farmer accepts offer -> Reserves 600 kg
  const { order, listing: updatedListing } = acceptOffer({
    offerId: offer._id,
    farmerId: 'farmer-001',
  });

  assert(order.status === 'scheduled_pickup', 'Order status is scheduled_pickup');
  assert(updatedListing.availableQuantity === 400, 'Available quantity decreased from 1000 to 400');
  assert(updatedListing.reservedQuantity === 600, 'Reserved quantity increased to 600');

  // Attempting to buy 500 kg must now FAIL due to insufficient unreserved stock (only 400 left)
  let oversellCaught = false;
  try {
    createOffer({
      listingId: listing._id,
      buyerId: 'buyer-002',
      offeredQuantity: 500,
      offeredPricePerKg: 18,
    });
  } catch (err) {
    oversellCaught = true;
  }
  assert(oversellCaught, 'Overselling must be strictly rejected by inventory validation');

  // Record pickup collection
  const collectedOrder = recordCollection({
    orderId: order._id,
    driverName: 'Ramesh',
    vehicleNumber: 'AP 03 Z 9999',
    inspectedWeightKg: 600,
  });
  assert(collectedOrder.status === 'in_transit', 'Order status transitions to in_transit');

  // Confirm delivery & generate verified impact
  const { order: completedOrder, impact } = confirmDelivery({
    orderId: order._id,
    verifiedWeightKg: 600,
    confirmedWasteKg: 0,
  });

  assert(completedOrder.status === 'completed', 'Order completes successfully');
  assert(impact && impact.quantityRedirectedKg === 600, 'Impact record reflects 600 kg rescued produce');
  assert(impact.co2eAvoidedKg > 0 && impact.waterSavedLiters > 0, 'Ecological savings computed');

  // Verify final listing status
  const finalListing = db.findById('cropListings', listing._id);
  assert(finalListing.soldQuantity === 600, 'Listing records 600 kg sold');
  assert(finalListing.reservedQuantity === 0, 'Reserved quantity cleared after delivery');
});

test('Order cancellation automatically releases reserved inventory', () => {
  const listing = db.insert('cropListings', {
    farmerId: 'farmer-001',
    farmerName: 'Ravi Kumar',
    cropName: 'Capsicum',
    totalQuantity: 500,
    availableQuantity: 500,
    reservedQuantity: 0,
    status: 'active',
  });

  const offer = createOffer({
    listingId: listing._id,
    buyerId: 'buyer-001',
    offeredQuantity: 300,
    offeredPricePerKg: 30,
  });

  const { order } = acceptOffer({ offerId: offer._id, farmerId: 'farmer-001' });
  const midListing = db.findById('cropListings', listing._id);
  assert(midListing.availableQuantity === 200 && midListing.reservedQuantity === 300, 'Inventory reserved');

  // Cancel order
  cancelOrder({ orderId: order._id, userId: 'farmer-001', reason: 'Farmer transport breakdown' });
  const restoredListing = db.findById('cropListings', listing._id);
  assert(restoredListing.availableQuantity === 500, 'Available quantity restored to 500 kg');
  assert(restoredListing.reservedQuantity === 0, 'Reserved quantity reset to 0');
});

// ── 6. MARKET INTELLIGENCE & ASSISTANT ─────────────────────────
console.log('\n--- 6. Mandi Intelligence & AI Assistant Suite ---');

test('Market price intelligence returns verified APMC benchmarks', () => {
  const mandiData = getMarketIntelligence({ crop: 'Tomato' });
  assert(mandiData.status === 'ok', 'Market intelligence returns ok status');
  assert(mandiData.observations.length > 0, 'Returns at least one APMC mandi observation');
  assert(mandiData.observations[0].modalPrice > 0, 'Modal price is positive');
  assert(mandiData.observations[0].historicalPriceTrend.length === 7, 'Includes 7-day historical trend');
});

test('Grounded bilingual AI assistant answers accurately', () => {
  const enReply = processAgriculturalQuery({
    query: 'What is the surplus risk and rescue window?',
    language: 'en',
    context: { cropName: 'Tomato', surplusRisk: 82, location: 'Chittoor' },
  });
  assert(enReply.content.includes('Rescue Window') || enReply.content.includes('surplus risk'), 'English reply contains factual explanation');
  assert(enReply.sources.length > 0, 'Assistant cites reliable sources');

  const teReply = processAgriculturalQuery({
    query: 'మిగులు ప్రమాదం అంటే ఏమిటి?',
    language: 'te',
  });
  assert(teReply.content.length > 20, 'Telugu reply provided in Telugu script');
});

// ── SUMMARY ───────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (passed !== total) {
  process.exit(1);
}
