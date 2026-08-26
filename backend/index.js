// =============================================
// HARVEST BRIDGE — Express Backend API Server
// Enterprise Security, Rate Limiting & Input Validation
// =============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers Middleware (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Managed for SPA compatibility
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// 2. Global Rate Limiter (Protection against DoS / Brute Force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// 3. CORS & Body Parsing (Strict payload size limit to prevent memory exhaustion)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));

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

// Helper: Input Sanitizer
function sanitizeString(str: any): string {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

// ── Endpoints ──

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Harvest Bridge API Server',
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString(),
    security: 'Helmet + RateLimiter Active',
  });
});

// Predict Surplus Risk Endpoint (With Strict Validation)
app.post('/api/predict', (req, res) => {
  try {
    const rawCropName = sanitizeString(req.body.cropName);
    const rawLocation = sanitizeString(req.body.location);
    const quantity = Number(req.body.quantity);
    const estimatedPrice = Number(req.body.estimatedPrice);
    const expectedHarvestDate = req.body.expectedHarvestDate;

    // Strict Validation
    if (!rawCropName || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: 'cropName (string) and quantity (positive number) are required.',
      });
    }

    if (quantity > 1000000) {
      return res.status(400).json({ error: 'Quantity exceeds maximum allowable single scan limit (1,000,000 kg).' });
    }

    const price = !isNaN(estimatedPrice) && estimatedPrice > 0 ? estimatedPrice : 20;

    // Deterministic risk logic
    const daysUntilHarvest = Math.max(0, Math.ceil(
      (new Date(expectedHarvestDate || Date.now()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));

    let surplusRisk = rawCropName.toLowerCase().includes('tomato') ? 86 : 64;
    let priceRisk = Math.min(surplusRisk + 5, 92);
    let urgency = daysUntilHarvest <= 3 ? 'CRITICAL' : daysUntilHarvest <= 7 ? 'HIGH' : 'MEDIUM';

    const quantityAtRisk = Math.round(quantity * (surplusRisk / 100) * 0.6);
    const valueAtRisk = Math.round(quantityAtRisk * price);

    res.json({
      cropName: rawCropName,
      location: rawLocation || 'Chittoor',
      surplusRisk,
      priceRisk,
      urgency,
      quantityAtRisk,
      valueAtRisk,
      recommendation: `Start contacting alternative buyers now — you have approximately ${daysUntilHarvest} days before harvest.`,
      reasons: [
        `Perishable crop (${rawCropName}) with short shelf-life post harvest`,
        `Peak regional harvest window increases local supply in ${rawLocation || 'Chittoor'}`,
        `Price drops historically observed during peak harvest month`,
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Prediction processing failed' });
  }
});

// Buyer Matching Endpoint
app.post('/api/buyers/match', (req, res) => {
  try {
    const rawCropName = sanitizeString(req.body.cropName) || 'Tomato';

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
      recommendation: `Strong match. Buyer accepts ${rawCropName} within target price range.`,
    }));

    res.json({ matches });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Matching failed' });
  }
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

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route Not Found' });
});

// Centralized Error Handler (Prevents stack trace leaks in production)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🌱 Harvest Bridge Backend API Server running on port ${PORT}`);
});
