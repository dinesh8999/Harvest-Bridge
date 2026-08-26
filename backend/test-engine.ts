// =============================================
// HARVEST BRIDGE — Comprehensive AI & API Engine Test Suite
// Standard Unit, Integration, & Security Tests
// =============================================

import { calculateSurplusRisk } from '../frontend/src/services/ai/surplusEngine.ts';
import { findBuyerMatches } from '../frontend/src/services/ai/matchingEngine.ts';
import { DEMO_CROPS, DEMO_BUYERS } from '../frontend/src/data/demoData.ts';

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('🌱 Starting Harvest Bridge Comprehensive Test Suite...\n');

// ── 1. Surplus Risk Engine Tests ──
console.log('--- 1. Surplus Risk Engine Unit Tests ---');

const highRiskCrop = DEMO_CROPS[0] as any; // Tomato
const riskInput = {
  cropName: highRiskCrop.cropName || 'Tomato',
  location: highRiskCrop.location,
  quantity: highRiskCrop.quantity,
  expectedHarvestDate: highRiskCrop.expectedHarvestDate,
  estimatedPrice: highRiskCrop.estimatedPrice,
};
const riskResult = calculateSurplusRisk(riskInput);
assert(riskResult.surplusRisk >= 70, 'High-perishable crop (Tomato) yields elevated surplus risk (>=70%)');
assert(riskResult.priceRisk >= 70, 'High-perishable crop yields elevated price risk (>=70%)');
assert(riskResult.urgency === 'CRITICAL' || riskResult.urgency === 'HIGH', 'High-perishable crop urgency is HIGH or CRITICAL');
assert(riskResult.reasons.length >= 2, 'Risk calculation provides at least 2 explainable reasons');
assert(riskResult.quantityAtRisk > 0 && riskResult.valueAtRisk > 0, 'Quantity and Financial Value at Risk are non-zero positive integers');

const lowPerishableCrop = {
  ...riskInput,
  cropName: 'Potato',
};
const lowRiskResult = calculateSurplusRisk(lowPerishableCrop);
assert(lowRiskResult.surplusRisk < riskResult.surplusRisk, 'Low perishability crop (Potato) yields lower surplus risk than Tomato');

// Boundary Condition Tests
const zeroQtyCrop = { ...riskInput, quantity: 0 };
const zeroRiskResult = calculateSurplusRisk(zeroQtyCrop);
assert(zeroRiskResult.valueAtRisk === 0, 'Zero quantity crop returns zero financial value at risk');

// ── 2. Micro-Logistics Rescue Window Tests ──
console.log('\n--- 2. Micro-Logistics Rescue Window Tests ---');

assert(riskResult.rescueWindowStart >= 1, 'Rescue window start day is bounded >= 1');
assert(riskResult.rescueWindowEnd >= riskResult.rescueWindowStart, 'Rescue window end day is >= start day');

// ── 3. Multi-Factor Buyer Matching Engine Tests ──
console.log('\n--- 3. Buyer Matching Engine Unit Tests ---');

const matches = findBuyerMatches(
  {
    cropName: riskInput.cropName,
    quantity: riskInput.quantity,
    location: riskInput.location,
    estimatedPrice: riskInput.estimatedPrice,
  },
  DEMO_BUYERS
);
assert(matches.length > 0, 'Buyer matching engine returns at least one match');
assert(matches[0].matchScore >= matches[matches.length - 1].matchScore, 'Matches are sorted descending by match score');

const topMatch = matches[0];
assert(topMatch.scoreBreakdown.cropCompatibility >= 0 && topMatch.scoreBreakdown.cropCompatibility <= 100, 'Crop compatibility score is bounded between 0 and 100');
assert(topMatch.scoreBreakdown.quantityCompatibility >= 0 && topMatch.scoreBreakdown.quantityCompatibility <= 100, 'Quantity compatibility score is bounded between 0 and 100');
assert(topMatch.scoreBreakdown.distanceScore >= 0 && topMatch.scoreBreakdown.distanceScore <= 100, 'Distance score is bounded between 0 and 100');
assert(topMatch.scoreBreakdown.timingCompatibility >= 0 && topMatch.scoreBreakdown.timingCompatibility <= 100, 'Timing compatibility score is bounded between 0 and 100');
assert(topMatch.scoreBreakdown.priceCompatibility >= 0 && topMatch.scoreBreakdown.priceCompatibility <= 100, 'Price compatibility score is bounded between 0 and 100');

// ── 4. Security & Validation Endpoint Data Format Tests ──
console.log('\n--- 4. Data Format & Validation Tests ---');

assert(typeof highRiskCrop._id === 'string' && highRiskCrop._id.length > 0, 'Crop object has non-empty string ID');
assert(typeof highRiskCrop.location === 'string' && highRiskCrop.location.length > 0, 'Crop location is a valid string');
assert(Array.isArray(DEMO_BUYERS) && DEMO_BUYERS.length >= 3, 'Demo buyer dataset contains at least 3 verified buyers');

console.log(`\n📊 Test Summary: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
}
