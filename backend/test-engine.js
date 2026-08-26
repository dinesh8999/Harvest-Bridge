// =============================================
// HARVEST BRIDGE — Core Engine Unit Tests
// Tests Surplus Risk Engine & Buyer Matching Engine
// =============================================

import assert from 'node:assert';
import { calculateSurplusRisk } from '../frontend/src/services/ai/surplusEngine.ts';
import { findBuyerMatches } from '../frontend/src/services/ai/matchingEngine.ts';

console.log('🌱 Starting Harvest Bridge Engine Tests...\n');

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
    console.error(`     ${err.message}`);
  }
}

// ── Test 1: High-Perishable Tomato Risk Calculation ──
test('High-perishable crop (Tomato) yields elevated risk and urgent rescue window', () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  
  const result = calculateSurplusRisk({
    cropName: 'Tomato',
    location: 'Chittoor',
    quantity: 2000,
    expectedHarvestDate: d.toISOString().split('T')[0],
    estimatedPrice: 20,
  });

  assert.ok(result.surplusRisk >= 50, `Expected surplusRisk >= 50, got ${result.surplusRisk}`);
  assert.ok(['HIGH', 'CRITICAL', 'MEDIUM'].includes(result.urgency), `Unexpected urgency ${result.urgency}`);
  assert.ok(result.quantityAtRisk > 0, 'Expected quantityAtRisk > 0');
  assert.ok(result.valueAtRisk > 0, 'Expected valueAtRisk > 0');
  assert.ok(Array.isArray(result.reasons) && result.reasons.length > 0, 'Expected explainable reasons');
});

// ── Test 2: Buyer Matching Engine Returns Score & Breakdown ──
test('Buyer matching engine returns ranked matches with valid score breakdown', () => {
  const matches = findBuyerMatches({
    cropName: 'Tomato',
    quantity: 2000,
    estimatedPrice: 20,
    location: 'Chittoor',
  });

  assert.ok(Array.isArray(matches) && matches.length > 0, 'Expected at least 1 match');

  const topMatch = matches[0];
  assert.ok(topMatch.matchScore >= 50 && topMatch.matchScore <= 100, `Match score out of bounds: ${topMatch.matchScore}`);

  const breakdown = topMatch.scoreBreakdown;
  assert.ok(breakdown && typeof breakdown.distanceScore === 'number', 'Missing or invalid score breakdown');
});

// ── Test 3: Rescue Window Bounds ──
test('Rescue window start/end dates are correctly bounded', () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);

  const result = calculateSurplusRisk({
    cropName: 'Onion',
    location: 'Palamaner',
    quantity: 1000,
    expectedHarvestDate: d.toISOString().split('T')[0],
    estimatedPrice: 18,
  });

  assert.ok(result.rescueWindowStart >= 1, 'rescueWindowStart should be >= 1');
  assert.ok(result.rescueWindowEnd >= result.rescueWindowStart, 'rescueWindowEnd should be >= rescueWindowStart');
});

console.log(`\n📊 Test Summary: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
}
