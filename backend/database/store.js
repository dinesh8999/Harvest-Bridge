// ============================================================================
// HARVEST BRIDGE — Persistent JSON / File-Backed ACID Transactional Store
// Supports indexing, CRUD operations, atomic persistence, and data integrity.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data_storage');
const DB_FILE = path.join(DATA_DIR, 'harvest_bridge_db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password Hashing Helper
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Initial Seed Data Generator
function generateInitialData() {
  const defaultSalt = 'a1b2c3d4e5f67890';
  const defaultPw = hashPassword('Harvest@123', defaultSalt);

  const users = [
    {
      _id: 'farmer-001',
      name: 'Ravi Kumar',
      phone: '9876543001',
      email: 'ravi.kumar@harvestbridge.org',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'farmer',
      language: 'te',
      location: 'Palamaner, Chittoor',
      district: 'Chittoor',
      farmSize: 4.5,
      primaryCrops: ['Tomato', 'Chilli', 'Brinjal'],
      irrigationType: 'Drip Irrigation',
      smsAlerts: true,
      riskThreshold: 70,
      verified: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      _id: 'farmer-002',
      name: 'Anitha Devi',
      phone: '9876543002',
      email: 'anitha.devi@harvestbridge.org',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'farmer',
      language: 'te',
      location: 'Kuppam, Chittoor',
      district: 'Chittoor',
      farmSize: 3.0,
      primaryCrops: ['Tomato', 'Leafy Greens'],
      irrigationType: 'Borewell',
      smsAlerts: true,
      riskThreshold: 65,
      verified: true,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      _id: 'buyer-001',
      name: 'Chittoor Tomato Processing Co.',
      phone: '9876543210',
      email: 'procurement@chittoorprocessing.com',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'buyer',
      category: 'processor',
      language: 'en',
      location: 'Chittoor Industrial Area',
      district: 'Chittoor',
      latitude: 13.2172,
      longitude: 79.1003,
      cropsWanted: ['Tomato', 'Onion'],
      capacity: 5000,
      preferredPriceMin: 14,
      preferredPriceMax: 22,
      pickupAvailable: true,
      contactName: 'Suresh Reddy',
      verified: true,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      _id: 'buyer-002',
      name: 'FreshMart Retail Chain',
      phone: '9876543220',
      email: 'supply@freshmart.in',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'buyer',
      category: 'retailer',
      language: 'en',
      location: 'Kuppam',
      district: 'Chittoor',
      latitude: 12.7463,
      longitude: 78.3455,
      cropsWanted: ['Tomato', 'Capsicum', 'Leafy Greens'],
      capacity: 1500,
      preferredPriceMin: 18,
      preferredPriceMax: 28,
      pickupAvailable: true,
      contactName: 'Venkat Sharma',
      verified: true,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      _id: 'org-001',
      name: 'Sri Venkateswara Community Kitchen',
      phone: '9876543300',
      email: 'annadanam@svkitchen.org',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'organization',
      category: 'institution',
      language: 'te',
      location: 'Tirupati',
      district: 'Tirupati',
      latitude: 13.6288,
      longitude: 79.4192,
      cropsWanted: ['Tomato', 'Onion', 'Chilli', 'Brinjal', 'Potato'],
      capacity: 800,
      preferredPriceMin: 8,
      preferredPriceMax: 18,
      pickupAvailable: false,
      contactName: 'Lakshmi Naidu',
      verified: true,
      verificationNotes: 'Registered Non-Profit Community Kitchen serving 2,500 meals daily.',
      createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    },
    {
      _id: 'org-002',
      name: 'Akshaya Patra Foundation — Tirupati Hub',
      phone: '9876543310',
      email: 'tirupati@akshayapatra.org',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'organization',
      category: 'ngo',
      language: 'en',
      location: 'Tirupati',
      district: 'Tirupati',
      latitude: 13.6500,
      longitude: 79.4100,
      cropsWanted: ['Tomato', 'Onion', 'Potato', 'Leafy Greens'],
      capacity: 2000,
      preferredPriceMin: 6,
      preferredPriceMax: 16,
      pickupAvailable: true,
      contactName: 'Operations Lead',
      verified: true,
      verificationNotes: 'Mid-Day Meal partner organization verified by Department of Education.',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      _id: 'admin-001',
      name: 'Agricultural Operations Administrator',
      phone: '9876543999',
      email: 'admin@harvestbridge.org',
      passwordHash: defaultPw.hash,
      passwordSalt: defaultPw.salt,
      role: 'admin',
      language: 'en',
      location: 'State APMC HQ, Vijayawada',
      verified: true,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  ];

  const cropListings = [
    {
      _id: 'listing-001',
      farmerId: 'farmer-001',
      farmerName: 'Ravi Kumar',
      farmerPhone: '9876543001',
      cropName: 'Tomato',
      variety: 'Hybrid Sahu (US 440)',
      category: 'Solanaceous Vegetables',
      location: 'Palamaner, Chittoor',
      district: 'Chittoor',
      latitude: 13.2000,
      longitude: 78.7500,
      totalQuantity: 2000,
      availableQuantity: 800,
      reservedQuantity: 1200,
      soldQuantity: 0,
      wastedQuantity: 0,
      unit: 'kg',
      expectedHarvestDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      qualityGrade: 'Grade A',
      storageType: 'Ambient Farm Shed',
      shelfLifeDays: 5,
      minAcceptablePrice: 16,
      estimatedMarketPrice: 22,
      photos: [],
      status: 'active',
      surplusRiskScore: 78,
      notes: 'Firm red tomatoes ready for harvest in 4 days. Micro-sprinkler irrigated.',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      _id: 'listing-002',
      farmerId: 'farmer-001',
      farmerName: 'Ravi Kumar',
      farmerPhone: '9876543001',
      cropName: 'Onion',
      variety: 'Nashik Red',
      category: 'Alliums',
      location: 'Palamaner, Chittoor',
      district: 'Chittoor',
      latitude: 13.2000,
      longitude: 78.7500,
      totalQuantity: 800,
      availableQuantity: 800,
      reservedQuantity: 0,
      soldQuantity: 0,
      wastedQuantity: 0,
      unit: 'kg',
      expectedHarvestDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
      qualityGrade: 'Grade A',
      storageType: 'Dry Well-Ventilated Store',
      shelfLifeDays: 30,
      minAcceptablePrice: 15,
      estimatedMarketPrice: 19,
      photos: [],
      status: 'active',
      surplusRiskScore: 46,
      notes: 'Medium bulb size, well dried skin.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      _id: 'listing-003',
      farmerId: 'farmer-002',
      farmerName: 'Anitha Devi',
      farmerPhone: '9876543002',
      cropName: 'Chilli',
      variety: 'Guntur Sannam',
      category: 'Spices & Condiments',
      location: 'Kuppam, Chittoor',
      district: 'Chittoor',
      latitude: 12.7463,
      longitude: 78.3455,
      totalQuantity: 600,
      availableQuantity: 0,
      reservedQuantity: 0,
      soldQuantity: 600,
      wastedQuantity: 0,
      unit: 'kg',
      expectedHarvestDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      qualityGrade: 'Grade A',
      storageType: 'Jute Bags in Shade',
      shelfLifeDays: 8,
      minAcceptablePrice: 38,
      estimatedMarketPrice: 45,
      photos: [],
      status: 'completed',
      surplusRiskScore: 35,
      notes: 'Fully delivered and accepted by local processor.',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const offers = [
    {
      _id: 'offer-001',
      listingId: 'listing-001',
      farmerId: 'farmer-001',
      farmerName: 'Ravi Kumar',
      buyerId: 'buyer-001',
      buyerName: 'Chittoor Tomato Processing Co.',
      buyerRole: 'buyer',
      buyerCategory: 'processor',
      offeredQuantity: 1200,
      offeredPricePerKg: 19.5,
      transportOption: 'buyer_pickup', // buyer_pickup | farmer_delivery
      pickupDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      estimatedDistanceKm: 18,
      transportCost: 0,
      handlingCost: 600, // 0.50 / kg
      platformFee: 0,
      estimatedNetEarnings: 22800, // 1200 * 19.5 - 600
      counterPrice: null,
      status: 'accepted',
      notes: 'Processing batch scheduled. Buyer arranges 3-ton pickup vehicle.',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      _id: 'offer-002',
      listingId: 'listing-001',
      farmerId: 'farmer-001',
      farmerName: 'Ravi Kumar',
      buyerId: 'buyer-002',
      buyerName: 'FreshMart Retail Chain',
      buyerRole: 'buyer',
      buyerCategory: 'retailer',
      offeredQuantity: 500,
      offeredPricePerKg: 22.0,
      transportOption: 'farmer_delivery',
      pickupDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      estimatedDistanceKm: 42,
      transportCost: 1200,
      handlingCost: 350,
      platformFee: 0,
      estimatedNetEarnings: 9450, // 500 * 22 - 1200 - 350 = 9450 (Effective ₹18.9/kg net)
      counterPrice: null,
      status: 'pending',
      notes: 'Fresh retail supply. Farmer to arrange tempo delivery to Kuppam hub.',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  const orders = [
    {
      _id: 'order-001',
      offerId: 'offer-001',
      listingId: 'listing-001',
      cropName: 'Tomato',
      farmerId: 'farmer-001',
      farmerName: 'Ravi Kumar',
      farmerPhone: '9876543001',
      farmerLocation: 'Palamaner, Chittoor',
      buyerId: 'buyer-001',
      buyerName: 'Chittoor Tomato Processing Co.',
      buyerPhone: '9876543210',
      buyerLocation: 'Chittoor Industrial Area',
      quantityKg: 1200,
      agreedPricePerKg: 19.5,
      grossTotalValue: 23400,
      transportCost: 0,
      handlingCost: 600,
      netFarmerEarnings: 22800,
      transportType: 'buyer_pickup',
      scheduledDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      status: 'scheduled_pickup', // confirmed | scheduled_pickup | in_transit | delivered | completed | cancelled
      paymentStatus: 'pending_external', // pending_external | verified_paid
      pickupDetails: {
        driverName: 'K. Venkatesh',
        vehicleNumber: 'AP 03 TX 4412',
        estimatedTime: '09:30 AM',
      },
      confirmedRescuedKg: 0,
      confirmedWasteKg: 0,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'order-002',
      offerId: 'offer-historical-001',
      listingId: 'listing-003',
      cropName: 'Chilli',
      farmerId: 'farmer-002',
      farmerName: 'Anitha Devi',
      farmerPhone: '9876543002',
      farmerLocation: 'Kuppam, Chittoor',
      buyerId: 'buyer-001',
      buyerName: 'Chittoor Tomato Processing Co.',
      buyerPhone: '9876543210',
      buyerLocation: 'Chittoor Industrial Area',
      quantityKg: 600,
      agreedPricePerKg: 42.0,
      grossTotalValue: 25200,
      transportCost: 0,
      handlingCost: 400,
      netFarmerEarnings: 24800,
      transportType: 'buyer_pickup',
      scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      status: 'completed',
      paymentStatus: 'verified_paid',
      confirmedRescuedKg: 600,
      confirmedWasteKg: 0,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  const impactRecords = [
    {
      _id: 'imp-001',
      orderId: 'order-002',
      cropName: 'Chilli',
      farmerName: 'Anitha Devi',
      farmerId: 'farmer-002',
      buyerName: 'Chittoor Tomato Processing Co.',
      buyerId: 'buyer-001',
      quantityRedirectedKg: 600,
      valueProtectedInr: 24800,
      wasteAvoidedKg: 580,
      co2eAvoidedKg: 1102, // ~1.9 kg CO2e per kg food waste avoided
      waterSavedLiters: 145000,
      recipientCategory: 'processor',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      _id: 'imp-002',
      orderId: 'order-hist-003',
      cropName: 'Tomato',
      farmerName: 'Ravi Kumar',
      farmerId: 'farmer-001',
      buyerName: 'Sri Venkateswara Community Kitchen',
      buyerId: 'org-001',
      quantityRedirectedKg: 500,
      valueProtectedInr: 9000,
      wasteAvoidedKg: 490,
      co2eAvoidedKg: 931,
      waterSavedLiters: 112000,
      recipientCategory: 'institution',
      timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      _id: 'imp-003',
      orderId: 'order-hist-004',
      cropName: 'Brinjal',
      farmerName: 'Sridevi Reddy',
      farmerId: 'farmer-004',
      buyerName: 'Akshaya Patra Foundation',
      buyerId: 'org-002',
      quantityRedirectedKg: 1000,
      valueProtectedInr: 15000,
      wasteAvoidedKg: 960,
      co2eAvoidedKg: 1824,
      waterSavedLiters: 210000,
      recipientCategory: 'ngo',
      timestamp: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
  ];

  const marketObservations = [
    {
      _id: 'mkt-001',
      market: 'Madanapalle Mandi (APMC)',
      district: 'Chittoor / Annamayya',
      state: 'Andhra Pradesh',
      crop: 'Tomato',
      variety: 'Local Hybrid',
      minPrice: 15,
      modalPrice: 21,
      maxPrice: 26,
      dailyArrivalsQuintals: 1420,
      trend: 'falling', // rising | stable | falling
      priceChangePercent: -7.5,
      source: 'AP State Agricultural Marketing Board / Agmarknet Benchmark Feed',
      lastUpdated: new Date().toISOString(),
      isLiveVerified: true,
    },
    {
      _id: 'mkt-002',
      market: 'Palamaner Sub-Market Yard',
      district: 'Chittoor',
      state: 'Andhra Pradesh',
      crop: 'Tomato',
      variety: 'Desi / Hybrid',
      minPrice: 14,
      modalPrice: 20,
      maxPrice: 24,
      dailyArrivalsQuintals: 650,
      trend: 'falling',
      priceChangePercent: -8.0,
      source: 'Chittoor District APMC Daily Gazette',
      lastUpdated: new Date().toISOString(),
      isLiveVerified: true,
    },
    {
      _id: 'mkt-003',
      market: 'Tirupati Rythu Bazaar',
      district: 'Tirupati',
      state: 'Andhra Pradesh',
      crop: 'Tomato',
      variety: 'Hybrid Sahu',
      minPrice: 20,
      modalPrice: 25,
      maxPrice: 29,
      dailyArrivalsQuintals: 380,
      trend: 'stable',
      priceChangePercent: 0.0,
      source: 'Department of Agricultural Marketing AP',
      lastUpdated: new Date().toISOString(),
      isLiveVerified: true,
    },
    {
      _id: 'mkt-004',
      market: 'Madanapalle Mandi (APMC)',
      district: 'Chittoor',
      state: 'Andhra Pradesh',
      crop: 'Chilli',
      variety: 'Green G4',
      minPrice: 38,
      modalPrice: 44,
      maxPrice: 52,
      dailyArrivalsQuintals: 210,
      trend: 'rising',
      priceChangePercent: +4.2,
      source: 'AP State APMC Bulletin',
      lastUpdated: new Date().toISOString(),
      isLiveVerified: true,
    },
    {
      _id: 'mkt-005',
      market: 'Chittoor Mandi',
      district: 'Chittoor',
      state: 'Andhra Pradesh',
      crop: 'Onion',
      variety: 'Medium Red',
      minPrice: 15,
      modalPrice: 18.5,
      maxPrice: 22,
      dailyArrivalsQuintals: 820,
      trend: 'stable',
      priceChangePercent: +1.0,
      source: 'Agmarknet APMC Report',
      lastUpdated: new Date().toISOString(),
      isLiveVerified: true,
    },
  ];

  const auditLogs = [
    {
      _id: 'audit-001',
      actorId: 'admin-001',
      actorName: 'Operations Admin',
      action: 'ORGANIZATION_VERIFIED',
      targetId: 'org-001',
      targetType: 'User / Organization',
      details: 'Verified Sri Venkateswara Community Kitchen following state accreditation audit.',
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      _id: 'audit-002',
      actorId: 'admin-001',
      actorName: 'Operations Admin',
      action: 'ORGANIZATION_VERIFIED',
      targetId: 'org-002',
      targetType: 'User / Organization',
      details: 'Verified Akshaya Patra Foundation Tirupati Hub.',
      timestamp: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
  ];

  return {
    users,
    cropListings,
    offers,
    orders,
    impactRecords,
    marketObservations,
    auditLogs,
  };
}

import { rdbms } from './rdbms.js';

// Unified Relational Database Adapter with ACID Transactions and Constraints
class TransactionalStore {
  constructor() {
    this.rdbms = rdbms;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const seed = generateInitialData();
        for (const [table, rows] of Object.entries(seed)) {
          this.rdbms.inMemoryTables.set(table, rows);
        }
        this.rdbms.saveToDiskSync();
      } else {
        this.rdbms.loadFromDisk();
      }
      this.rdbms.buildIndexes();
    } catch (err) {
      console.warn('⚠️ Error loading DB from disk, generating fresh seed data:', err.message);
      const seed = generateInitialData();
      for (const [table, rows] of Object.entries(seed)) {
        this.rdbms.inMemoryTables.set(table, rows);
      }
      this.rdbms.saveToDiskSync();
      this.rdbms.buildIndexes();
    }
  }

  get data() {
    // Dynamic property proxy for backward compatibility with data access
    const obj = {};
    for (const [key, rows] of this.rdbms.inMemoryTables.entries()) {
      obj[key] = rows;
    }
    return obj;
  }

  saveSync() {
    this.rdbms.saveToDiskSync();
  }

  // Relational Query Methods
  find(collectionName, queryFn = () => true) {
    return this.rdbms.find(collectionName, queryFn);
  }

  findOne(collectionName, queryFn) {
    return this.rdbms.findOne(collectionName, queryFn);
  }

  findById(collectionName, id) {
    return this.rdbms.findById(collectionName, id);
  }

  findByPhone(collectionName, phone) {
    return this.rdbms.findByPhone(collectionName, phone);
  }

  insert(collectionName, doc) {
    return this.rdbms.insert(collectionName, doc);
  }

  update(collectionName, id, updateFields) {
    return this.rdbms.update(collectionName, id, updateFields);
  }

  remove(collectionName, id) {
    return this.rdbms.remove(collectionName, id);
  }

  // ACID Transaction Wrapper
  async withTransaction(operation) {
    return this.rdbms.withTransaction(operation);
  }

  // Parameterized SQL Query
  async query(sqlText, params = []) {
    return this.rdbms.query(sqlText, params);
  }

  // Backup & Restore
  exportJson() {
    return this.rdbms.exportJson();
  }

  importJson(data) {
    return this.rdbms.importJson(data);
  }

  getHealth() {
    return this.rdbms.getHealth();
  }
}

export const db = new TransactionalStore();
export { rdbms };
