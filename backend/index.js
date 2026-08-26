// =============================================
// HARVEST BRIDGE — Express Backend API Server
// =============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Seed data
const DEMO_BUYERS = [
  {
    _id: 'buyer-001',
    name: 'Andhra Pradesh School Nutrition Programme',
    category: 'school',
    cropsWanted: ['Tomato', 'Leafy Greens', 'Potato', 'Onion'],
    capacity: 2000,
    district: 'Chittoor',
    preferredPriceMin: 18,
    preferredPriceMax: 24,
    pickupAvailable: true,
    latitude: 13.21,
    longitude: 78.76,
  },
  {
    _id: 'buyer-002',
    name: 'Chittoor Tomato Processing Co.',
    category: 'processor',
    cropsWanted: ['Tomato'],
    capacity: 5000,
    district: 'Chittoor',
    preferredPriceMin: 14,
    preferredPriceMax: 20,
    pickupAvailable: true,
    latitude: 13.22,
    longitude: 78.75,
  },
  {
    _id: 'buyer-003',
    name: "Rayan's Fresh Direct Retail",
    category: 'retailer',
    cropsWanted: ['Tomato', 'Chilli', 'Brinjal', 'Capsicum'],
    capacity: 800,
    district: 'Chittoor',
    preferredPriceMin: 22,
    preferredPriceMax: 28,
    pickupAvailable: false,
    latitude: 13.18,
    longitude: 78.82,
  },
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Harvest Bridge API Server',
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString(),
  });
});

// Predict Surplus Risk Endpoint
app.post('/api/predict', (req, res) => {
  const { cropName, quantity, estimatedPrice, expectedHarvestDate, location } = req.body;

  if (!cropName || !quantity) {
    return res.status(400).json({ error: 'Missing required crop fields' });
  }

  // Deterministic risk logic
  const daysUntilHarvest = Math.max(0, Math.ceil(
    (new Date(expectedHarvestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  let surplusRisk = cropName === 'Tomato' ? 86 : 64;
  let priceRisk = Math.min(surplusRisk + 5, 92);
  let urgency = daysUntilHarvest <= 3 ? 'CRITICAL' : daysUntilHarvest <= 7 ? 'HIGH' : 'MEDIUM';

  const quantityAtRisk = Math.round(quantity * (surplusRisk / 100) * 0.6);
  const valueAtRisk = Math.round(quantityAtRisk * estimatedPrice);

  res.json({
    surplusRisk,
    priceRisk,
    urgency,
    quantityAtRisk,
    valueAtRisk,
    recommendation: `Start contacting alternative buyers now — you have approximately ${daysUntilHarvest} days before harvest.`,
    reasons: [
      `Perishable crop (${cropName}) with short shelf-life post harvest`,
      `Peak regional harvest window increases local supply in ${location || 'district'}`,
      `Price drops historically observed during harvest month`,
    ],
  });
});

// Buyer Matching Endpoint
app.post('/api/buyers/match', (req, res) => {
  const { cropName } = req.body;

  const matches = DEMO_BUYERS.map((buyer, idx) => ({
    buyer,
    matchScore: idx === 0 ? 97 : idx === 1 ? 83 : 74,
    distance: idx === 0 ? 1.2 : idx === 1 ? 0.5 : 8.4,
    scoreBreakdown: {
      cropCompatibility: 100,
      quantityCompatibility: 95,
      distanceScore: 90,
      timingCompatibility: 85,
      priceCompatibility: 80,
    },
    recommendation: `Strong match. Buyer accepts ${cropName} within target price range.`,
  }));

  res.json({ matches });
});

// Impact Metrics Endpoint
app.get('/api/impact', (req, res) => {
  res.json({
    totalQuantityRedirected: 9900,
    totalValueProtected: 202800,
    successfulMatches: 18,
    avgDistanceKm: 14,
  });
});

app.listen(PORT, () => {
  console.log(`🌱 Harvest Bridge Backend API Server running on port ${PORT}`);
});
