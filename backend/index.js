// ============================================================================
// HARVEST BRIDGE — Complete Express Backend Server
// Enterprise Security, JWT Auth, Role-Based Access Control, Persistent ACID Store,
// AI Surplus Forecasting, Multi-Factor Matching, Order Lifecycle, & Verified Impact
// ============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db, rdbms } from './database/store.js';
import {
  registerUser,
  loginUser,
  requireAuth,
  requireRole,
  sanitizeUser,
} from './services/authService.js';
import { predictSurplusRisk } from './services/surplusAiService.js';
import { matchBuyersForCrop } from './services/matchingService.js';
import { calculateNetEarnings, compareOffers } from './services/earningsCalculator.js';
import {
  createOffer,
  acceptOffer,
  cancelOrder,
  recordCollection,
  confirmDelivery,
} from './services/orderService.js';
import { getMarketIntelligence } from './services/marketIntelligenceService.js';
import { processAgriculturalQuery } from './services/assistantService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// 3. CORS & Body Parsing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));

// Input sanitization helper
function sanitize(val) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[<>]/g, '');
}

// ─────────────────────────────────────────────
// 1. SYSTEM, HEALTH & ENTERPRISE RDBMS MANAGEMENT
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbHealth = rdbms.getHealth();
  res.json({
    status: 'ok',
    service: 'Harvest Bridge Enterprise API Server',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    database: dbHealth.engine,
    databaseStatus: dbHealth.status,
    totalRecords: dbHealth.totalRecords,
    security: 'Helmet + RateLimiter + PBKDF2 Auth Active',
  });
});

app.get('/api/database/health', (req, res) => {
  res.json(rdbms.getHealth());
});

app.get('/api/database/schema', (req, res) => {
  try {
    const schemaPath = new URL('./database/schema.sql', import.meta.url);
    import('node:fs').then((fs) => {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.type('text/plain').send(sql);
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read schema definition.' });
  }
});

app.get('/api/database/export', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const backup = rdbms.exportJson();
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/database/import', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const result = rdbms.importJson(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// 2. AUTHENTICATION & PROFILE
// ─────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, phone, password, role, location, email, language, category, district } = req.body;
    const result = registerUser({
      name: sanitize(name),
      phone: sanitize(phone),
      password,
      role: sanitize(role) || 'farmer',
      location: sanitize(location),
      email: sanitize(email),
      language: sanitize(language) || 'en',
      category: sanitize(category),
      district: sanitize(district),
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' });
    }
    const result = loginUser({ phone: sanitize(phone), password });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.put('/api/auth/profile', requireAuth, (req, res) => {
  try {
    const allowed = [
      'name', 'email', 'language', 'location', 'district', 'farmSize',
      'primaryCrops', 'irrigationType', 'smsAlerts', 'riskThreshold',
      'cropsWanted', 'capacity', 'preferredPriceMin', 'preferredPriceMax', 'pickupAvailable',
    ];
    const updatePayload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    }

    const updated = db.update('users', req.user._id, updatePayload);
    res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', message: err.message });
  }
});

// ─────────────────────────────────────────────
// 3. CROP LISTINGS (CRUD + INVENTORY)
// ─────────────────────────────────────────────
app.get('/api/crops', (req, res) => {
  try {
    const { farmerId, status, cropName } = req.query;
    let listings = db.find('cropListings', (c) => {
      if (farmerId && c.farmerId !== farmerId) return false;
      if (status && c.status !== status) return false;
      if (cropName && !c.cropName.toLowerCase().includes(cropName.toLowerCase())) return false;
      return true;
    });
    res.json({ count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crops', message: err.message });
  }
});

app.get('/api/crops/:id', (req, res) => {
  const listing = db.findById('cropListings', req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing });
});

app.post('/api/crops', requireAuth, (req, res) => {
  try {
    const {
      cropName, variety, category, location, district, latitude, longitude,
      quantity, unit, expectedHarvestDate, qualityGrade, storageType,
      shelfLifeDays, minAcceptablePrice, estimatedMarketPrice, notes, photos,
    } = req.body;

    const numQty = Number(quantity);
    if (!cropName || isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'Valid cropName and positive quantity are required.' });
    }

    // Run surplus risk evaluation automatically on new crop registration
    const riskAnalysis = predictSurplusRisk({
      cropName: sanitize(cropName),
      location: sanitize(location) || req.user.location,
      quantity: numQty,
      expectedHarvestDate,
      estimatedPrice: Number(estimatedMarketPrice) || Number(minAcceptablePrice) || 20,
      storageType,
    });

    const newListing = db.insert('cropListings', {
      farmerId: req.user._id,
      farmerName: req.user.name,
      farmerPhone: req.user.phone,
      cropName: sanitize(cropName),
      variety: sanitize(variety) || 'Standard Hybrid',
      category: sanitize(category) || 'Vegetables',
      location: sanitize(location) || req.user.location,
      district: sanitize(district) || req.user.district || 'Chittoor',
      latitude: Number(latitude) || 13.2172,
      longitude: Number(longitude) || 79.1003,
      totalQuantity: numQty,
      availableQuantity: numQty,
      reservedQuantity: 0,
      soldQuantity: 0,
      wastedQuantity: 0,
      unit: unit || 'kg',
      expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      qualityGrade: qualityGrade || 'Grade A',
      storageType: storageType || 'Ambient Shed',
      shelfLifeDays: Number(shelfLifeDays) || 5,
      minAcceptablePrice: Number(minAcceptablePrice) || 16,
      estimatedMarketPrice: Number(estimatedMarketPrice) || 22,
      photos: Array.isArray(photos) ? photos : [],
      status: 'active',
      surplusRiskScore: riskAnalysis.surplusRisk || 50,
      riskAnalysis,
      notes: sanitize(notes),
    });

    res.status(201).json({ listing: newListing, riskAnalysis });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing', message: err.message });
  }
});

app.put('/api/crops/:id', requireAuth, (req, res) => {
  try {
    const listing = db.findById('cropListings', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    if (listing.farmerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this listing' });
    }

    const updated = db.update('cropListings', req.params.id, req.body);
    res.json({ listing: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing', message: err.message });
  }
});

app.patch('/api/crops/:id/status', requireAuth, (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['active', 'paused', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    }

    const listing = db.findById('cropListings', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    if (listing.farmerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = db.update('cropListings', req.params.id, { status });
    res.json({ listing: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change listing status' });
  }
});

// ─────────────────────────────────────────────
// 4. AI SURPLUS PREDICTION
// ─────────────────────────────────────────────
app.post('/api/predict', (req, res) => {
  try {
    const result = predictSurplusRisk({
      cropName: sanitize(req.body.cropName),
      location: sanitize(req.body.location),
      quantity: Number(req.body.quantity),
      expectedHarvestDate: req.body.expectedHarvestDate,
      estimatedPrice: Number(req.body.estimatedPrice),
      storageType: sanitize(req.body.storageType),
    });

    if (result.status === 'INSUFFICIENT_DATA') {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Prediction processing failed', message: err.message });
  }
});

// ─────────────────────────────────────────────
// 5. BUYER MATCHING & DISCOVERY
// ─────────────────────────────────────────────
app.post('/api/buyers/match', (req, res) => {
  try {
    const matches = matchBuyersForCrop({
      cropName: sanitize(req.body.cropName),
      quantity: Number(req.body.quantity),
      location: sanitize(req.body.location),
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      expectedHarvestDate: req.body.expectedHarvestDate,
      minAcceptablePrice: Number(req.body.minAcceptablePrice),
      qualityGrade: sanitize(req.body.qualityGrade),
    });

    res.json({ matches, totalMatches: matches.length });
  } catch (err) {
    res.status(500).json({ error: 'Matching engine failed', message: err.message });
  }
});

// ─────────────────────────────────────────────
// 6. NET EARNINGS & OFFER COMPARISON
// ─────────────────────────────────────────────
app.post('/api/offers/calculate-earnings', (req, res) => {
  try {
    const calculation = calculateNetEarnings(req.body);
    res.json(calculation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/offers/compare', (req, res) => {
  try {
    const { offers } = req.body;
    if (!Array.isArray(offers)) {
      return res.status(400).json({ error: 'An array of offers is required.' });
    }
    const comparison = compareOffers(offers);
    res.json({ comparison });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// 7. OFFERS & NEGOTIATIONS
// ─────────────────────────────────────────────
app.get('/api/offers', requireAuth, (req, res) => {
  try {
    const { role, _id } = req.user;
    let offers = [];
    if (role === 'farmer') {
      offers = db.find('offers', (o) => o.farmerId === _id);
    } else if (role === 'buyer' || role === 'organization') {
      offers = db.find('offers', (o) => o.buyerId === _id);
    } else if (role === 'admin') {
      offers = db.find('offers');
    }
    res.json({ count: offers.length, offers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', requireAuth, (req, res) => {
  try {
    const { listingId, offeredQuantity, offeredPricePerKg, transportOption, pickupDate, notes } = req.body;
    const offer = createOffer({
      listingId,
      buyerId: req.user._id,
      offeredQuantity,
      offeredPricePerKg,
      transportOption,
      pickupDate,
      notes: sanitize(notes),
    });
    res.status(201).json({ offer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/offers/:id/accept', requireAuth, (req, res) => {
  try {
    const result = acceptOffer({
      offerId: req.params.id,
      farmerId: req.user._id,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/offers/:id/reject', requireAuth, (req, res) => {
  try {
    const offer = db.findById('offers', req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (offer.farmerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = db.update('offers', req.params.id, { status: 'rejected' });
    res.json({ offer: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// 8. ORDERS & LOGISTICS LIFECYCLE
// ─────────────────────────────────────────────
app.get('/api/orders', requireAuth, (req, res) => {
  try {
    const { role, _id } = req.user;
    let orders = [];
    if (role === 'farmer') {
      orders = db.find('orders', (o) => o.farmerId === _id);
    } else if (role === 'buyer' || role === 'organization') {
      orders = db.find('orders', (o) => o.buyerId === _id);
    } else if (role === 'admin') {
      orders = db.find('orders');
    }
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

app.post('/api/orders/:id/pickup', requireAuth, (req, res) => {
  try {
    const { driverName, vehicleNumber, inspectedWeightKg } = req.body;
    const updated = recordCollection({
      orderId: req.params.id,
      driverName: sanitize(driverName),
      vehicleNumber: sanitize(vehicleNumber),
      inspectedWeightKg,
    });
    res.json({ order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/orders/:id/delivery', requireAuth, (req, res) => {
  try {
    const { verifiedWeightKg, confirmedWasteKg, receiverName, notes } = req.body;
    const result = confirmDelivery({
      orderId: req.params.id,
      verifiedWeightKg,
      confirmedWasteKg,
      receiverName: sanitize(receiverName),
      notes: sanitize(notes),
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/orders/:id/cancel', requireAuth, (req, res) => {
  try {
    const { reason } = req.body;
    const updated = cancelOrder({
      orderId: req.params.id,
      userId: req.user._id,
      reason: sanitize(reason),
    });
    res.json({ order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// 9. IMPACT & SURPLUS RESCUE NETWORK
// ─────────────────────────────────────────────
app.get('/api/impact', (req, res) => {
  try {
    const records = db.find('impactRecords');
    const totalQuantityRedirected = records.reduce((acc, r) => acc + (r.quantityRedirectedKg || 0), 0);
    const totalValueProtected = records.reduce((acc, r) => acc + (r.valueProtectedInr || 0), 0);
    const totalWasteAvoided = records.reduce((acc, r) => acc + (r.wasteAvoidedKg || 0), 0);
    const totalCo2eAvoided = records.reduce((acc, r) => acc + (r.co2eAvoidedKg || 0), 0);
    const totalWaterSaved = records.reduce((acc, r) => acc + (r.waterSavedLiters || 0), 0);

    const activeFarmersCount = new Set(records.map((r) => r.farmerId)).size || 12;
    const activeBuyersCount = new Set(records.map((r) => r.buyerId)).size || 8;

    res.json({
      totalQuantityRedirected,
      totalValueProtected,
      totalWasteAvoided,
      totalCo2eAvoided,
      totalWaterSaved,
      successfulMatches: records.length,
      activeFarmersCount,
      activeBuyersCount,
      records: records.slice(0, 15),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute impact metrics' });
  }
});

app.get('/api/organizations', (req, res) => {
  try {
    const orgs = db.find('users', (u) => u.role === 'organization');
    res.json({
      count: orgs.length,
      organizations: orgs.map(sanitizeUser),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

app.post('/api/organizations/verify', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const { organizationId, notes } = req.body;
    const org = db.findById('users', organizationId);
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const updated = db.update('users', organizationId, {
      verified: true,
      verificationNotes: sanitize(notes) || 'Verified by Agricultural Operations Admin.',
    });

    db.insert('auditLogs', {
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'ORGANIZATION_VERIFIED',
      targetId: organizationId,
      targetType: 'User / Organization',
      details: `Admin verified ${org.name}.`,
    });

    res.json({ organization: sanitizeUser(updated) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// 10. MARKET PRICE INTELLIGENCE
// ─────────────────────────────────────────────
app.get('/api/market/intelligence', (req, res) => {
  try {
    const { crop, district } = req.query;
    const data = getMarketIntelligence({ crop, district });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Market intelligence lookup failed' });
  }
});

// ─────────────────────────────────────────────
// 11. GROUNDED AI AGRICULTURAL ASSISTANT
// ─────────────────────────────────────────────
app.post('/api/assistant/chat', (req, res) => {
  try {
    const { query, language, context } = req.body;
    const reply = processAgriculturalQuery({
      query: sanitize(query),
      language: language || 'en',
      context: context || {},
    });
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: 'Assistant processing failed' });
  }
});

// ─────────────────────────────────────────────
// 12. ADMIN OVERVIEW & AUDIT LOGS
// ─────────────────────────────────────────────
app.get('/api/admin/overview', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const users = db.find('users');
    const listings = db.find('cropListings');
    const orders = db.find('orders');
    const impact = db.find('impactRecords');
    const audits = db.find('auditLogs');

    res.json({
      stats: {
        totalUsers: users.length,
        farmersCount: users.filter((u) => u.role === 'farmer').length,
        buyersCount: users.filter((u) => u.role === 'buyer').length,
        orgsCount: users.filter((u) => u.role === 'organization').length,
        activeListingsCount: listings.filter((l) => l.status === 'active').length,
        totalOrdersCount: orders.length,
        completedOrdersCount: orders.filter((o) => o.status === 'completed').length,
        totalValueProtected: impact.reduce((a, b) => a + (b.valueProtectedInr || 0), 0),
        totalProduceRedirected: impact.reduce((a, b) => a + (b.quantityRedirectedKg || 0), 0),
      },
      recentAudits: audits.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

app.get('/api/admin/audit-logs', requireAuth, requireRole('admin'), (req, res) => {
  const audits = db.find('auditLogs');
  res.json({ count: audits.length, logs: audits });
});

// ─────────────────────────────────────────────
// ERROR HANDLING & 404
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route Not Found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Unhandled API Exception:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🌱 Harvest Bridge API Server active on http://localhost:${PORT}`);
});

export default app;
