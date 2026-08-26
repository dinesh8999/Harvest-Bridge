// =============================================
// HARVEST BRIDGE — Demo Seed Data
// All identities are fictional demo data
// =============================================

import type { Buyer, User, Crop, ImpactEvent } from '../types';

export const DEMO_BUYERS: Buyer[] = [
  {
    _id: 'buyer-001',
    name: 'Chittoor Tomato Processing Co.',
    category: 'processor',
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
    phone: '+91-9876543210',
    requiredByDate: getDateFromNow(6),
  },
  {
    _id: 'buyer-002',
    name: 'Sri Venkateswara Community Kitchen',
    category: 'institution',
    location: 'Tirupati',
    district: 'Tirupati',
    latitude: 13.6288,
    longitude: 79.4192,
    cropsWanted: ['Tomato', 'Onion', 'Chilli', 'Brinjal'],
    capacity: 600,
    preferredPriceMin: 10,
    preferredPriceMax: 20,
    pickupAvailable: false,
    contactName: 'Lakshmi Naidu',
    requiredByDate: getDateFromNow(4),
  },
  {
    _id: 'buyer-003',
    name: 'FreshMart Retail Chain',
    category: 'retailer',
    location: 'Kuppam',
    district: 'Chittoor',
    latitude: 12.7463,
    longitude: 78.3455,
    cropsWanted: ['Tomato', 'Capsicum', 'Leafy Greens'],
    capacity: 1000,
    preferredPriceMin: 18,
    preferredPriceMax: 28,
    pickupAvailable: true,
    contactName: 'Venkat Sharma',
    requiredByDate: getDateFromNow(7),
  },
  {
    _id: 'buyer-004',
    name: 'Saravana Bhavan Restaurant Chain',
    category: 'restaurant',
    location: 'Madanapalle',
    district: 'Chittoor',
    latitude: 13.5559,
    longitude: 78.5040,
    cropsWanted: ['Tomato', 'Onion', 'Chilli'],
    capacity: 400,
    preferredPriceMin: 16,
    preferredPriceMax: 25,
    pickupAvailable: false,
    contactName: 'Kumar',
    requiredByDate: getDateFromNow(3),
  },
  {
    _id: 'buyer-005',
    name: 'Andhra Pradesh School Nutrition Programme',
    category: 'school',
    location: 'Chittoor',
    district: 'Chittoor',
    latitude: 13.2100,
    longitude: 79.1045,
    cropsWanted: ['Tomato', 'Onion', 'Potato', 'Brinjal'],
    capacity: 2000,
    preferredPriceMin: 8,
    preferredPriceMax: 18,
    pickupAvailable: false,
    contactName: 'District Coordinator',
    requiredByDate: getDateFromNow(5),
  },
  {
    _id: 'buyer-006',
    name: 'Akshaya Patra Foundation',
    category: 'ngo',
    location: 'Tirupati',
    district: 'Tirupati',
    latitude: 13.6500,
    longitude: 79.4100,
    cropsWanted: ['Tomato', 'Onion', 'Potato'],
    capacity: 800,
    preferredPriceMin: 6,
    preferredPriceMax: 16,
    pickupAvailable: false,
    contactName: 'Coordinator',
    requiredByDate: getDateFromNow(4),
  },
  {
    _id: 'buyer-007',
    name: 'Metro Wholesale Market',
    category: 'wholesaler',
    location: 'Vellore',
    district: 'Vellore',
    latitude: 12.9165,
    longitude: 79.1325,
    cropsWanted: ['Tomato', 'Onion', 'Chilli', 'Capsicum'],
    capacity: 10000,
    preferredPriceMin: 12,
    preferredPriceMax: 20,
    pickupAvailable: true,
    contactName: 'Rajesh',
    requiredByDate: getDateFromNow(8),
  },
  {
    _id: 'buyer-008',
    name: 'KG Agro Processors',
    category: 'processor',
    location: 'Renigunta',
    district: 'Tirupati',
    latitude: 13.6519,
    longitude: 79.5076,
    cropsWanted: ['Chilli', 'Tomato'],
    capacity: 3000,
    preferredPriceMin: 20,
    preferredPriceMax: 35,
    pickupAvailable: true,
    contactName: 'Gopal Reddy',
    requiredByDate: getDateFromNow(10),
  },
  {
    _id: 'buyer-009',
    name: 'HappyFarm Superstore',
    category: 'retailer',
    location: 'Tirupati',
    district: 'Tirupati',
    latitude: 13.6300,
    longitude: 79.4200,
    cropsWanted: ['Tomato', 'Capsicum', 'Onion'],
    capacity: 700,
    preferredPriceMin: 18,
    preferredPriceMax: 26,
    pickupAvailable: true,
    contactName: 'Priya',
    requiredByDate: getDateFromNow(5),
  },
  {
    _id: 'buyer-010',
    name: 'Annadan NGO – Food Relief',
    category: 'ngo',
    location: 'Chittoor',
    district: 'Chittoor',
    latitude: 13.2200,
    longitude: 79.0900,
    cropsWanted: ['Tomato', 'Onion', 'Potato', 'Leafy Greens'],
    capacity: 500,
    preferredPriceMin: 4,
    preferredPriceMax: 14,
    pickupAvailable: false,
    contactName: 'Sister Mary',
    requiredByDate: getDateFromNow(3),
  },
  {
    _id: 'buyer-011',
    name: 'Sunrise Hotel & Restaurant',
    category: 'restaurant',
    location: 'Chittoor',
    district: 'Chittoor',
    latitude: 13.2150,
    longitude: 79.0950,
    cropsWanted: ['Tomato', 'Onion', 'Chilli', 'Capsicum'],
    capacity: 300,
    preferredPriceMin: 15,
    preferredPriceMax: 28,
    pickupAvailable: false,
    contactName: 'Manager',
    requiredByDate: getDateFromNow(2),
  },
  {
    _id: 'buyer-012',
    name: 'AP Farmers Market Collective',
    category: 'wholesaler',
    location: 'Chittoor',
    district: 'Chittoor',
    latitude: 13.2280,
    longitude: 79.1100,
    cropsWanted: ['Tomato', 'Onion', 'Brinjal', 'Chilli'],
    capacity: 4000,
    preferredPriceMin: 14,
    preferredPriceMax: 22,
    pickupAvailable: true,
    contactName: 'Collective Manager',
    requiredByDate: getDateFromNow(7),
  },
];

export const DEMO_FARMERS: Partial<User>[] = [
  { _id: 'farmer-001', name: 'Ravi Kumar', phone: '9876543001', role: 'farmer', location: 'Palamaner, Chittoor', language: 'te' },
  { _id: 'farmer-002', name: 'Anitha Devi', phone: '9876543002', role: 'farmer', location: 'Kuppam, Chittoor', language: 'te' },
  { _id: 'farmer-003', name: 'Murugan S', phone: '9876543003', role: 'farmer', location: 'Madanapalle, Chittoor', language: 'en' },
  { _id: 'farmer-004', name: 'Sridevi Reddy', phone: '9876543004', role: 'farmer', location: 'Srikalahasti, Tirupati', language: 'te' },
  { _id: 'farmer-005', name: 'Bhaskar Rao', phone: '9876543005', role: 'farmer', location: 'Puttur, Chittoor', language: 'te' },
  { _id: 'farmer-006', name: 'Kavitha M', phone: '9876543006', role: 'farmer', location: 'Nagari, Tirupati', language: 'en' },
  { _id: 'farmer-007', name: 'Yellaiah G', phone: '9876543007', role: 'farmer', location: 'Bangarupalem, Chittoor', language: 'te' },
  { _id: 'farmer-008', name: 'Pushpa Latha', phone: '9876543008', role: 'farmer', location: 'Thamballapalle, Chittoor', language: 'te' },
];

export const DEMO_CROPS: Partial<Crop>[] = [
  { _id: 'crop-001', farmerId: 'farmer-001', cropName: 'Tomato', quantity: 2000, estimatedPrice: 22, location: 'Palamaner, Chittoor', expectedHarvestDate: getDateFromNow(5) },
  { _id: 'crop-002', farmerId: 'farmer-001', cropName: 'Onion', quantity: 800, estimatedPrice: 18, location: 'Palamaner, Chittoor', expectedHarvestDate: getDateFromNow(12) },
  { _id: 'crop-003', farmerId: 'farmer-002', cropName: 'Chilli', quantity: 600, estimatedPrice: 45, location: 'Kuppam, Chittoor', expectedHarvestDate: getDateFromNow(3) },
  { _id: 'crop-004', farmerId: 'farmer-003', cropName: 'Tomato', quantity: 1500, estimatedPrice: 20, location: 'Madanapalle, Chittoor', expectedHarvestDate: getDateFromNow(4) },
  { _id: 'crop-005', farmerId: 'farmer-004', cropName: 'Brinjal', quantity: 900, estimatedPrice: 15, location: 'Srikalahasti, Tirupati', expectedHarvestDate: getDateFromNow(7) },
  { _id: 'crop-006', farmerId: 'farmer-005', cropName: 'Capsicum', quantity: 400, estimatedPrice: 35, location: 'Puttur, Chittoor', expectedHarvestDate: getDateFromNow(8) },
  { _id: 'crop-007', farmerId: 'farmer-006', cropName: 'Potato', quantity: 3000, estimatedPrice: 12, location: 'Nagari, Tirupati', expectedHarvestDate: getDateFromNow(15) },
  { _id: 'crop-008', farmerId: 'farmer-007', cropName: 'Onion', quantity: 1200, estimatedPrice: 16, location: 'Bangarupalem, Chittoor', expectedHarvestDate: getDateFromNow(6) },
  { _id: 'crop-009', farmerId: 'farmer-008', cropName: 'Tomato', quantity: 1800, estimatedPrice: 21, location: 'Thamballapalle, Chittoor', expectedHarvestDate: getDateFromNow(5) },
  { _id: 'crop-010', farmerId: 'farmer-002', cropName: 'Leafy Greens', quantity: 300, estimatedPrice: 8, location: 'Kuppam, Chittoor', expectedHarvestDate: getDateFromNow(2) },
];

export const DEMO_IMPACT_EVENTS: Partial<ImpactEvent>[] = [
  { _id: 'evt-001', quantityRedirected: 1200, estimatedValueProtected: 26400, cropName: 'Tomato', farmerName: 'Ravi Kumar', buyerName: 'Chittoor Tomato Processing Co.', timestamp: getDaysAgo(1) },
  { _id: 'evt-002', quantityRedirected: 500, estimatedValueProtected: 9000, cropName: 'Tomato', farmerName: 'Ravi Kumar', buyerName: 'Sri Venkateswara Community Kitchen', timestamp: getDaysAgo(1) },
  { _id: 'evt-003', quantityRedirected: 600, estimatedValueProtected: 10800, cropName: 'Chilli', farmerName: 'Anitha Devi', buyerName: 'KG Agro Processors', timestamp: getDaysAgo(3) },
  { _id: 'evt-004', quantityRedirected: 800, estimatedValueProtected: 12800, cropName: 'Tomato', farmerName: 'Murugan S', buyerName: 'FreshMart Retail Chain', timestamp: getDaysAgo(4) },
  { _id: 'evt-005', quantityRedirected: 1000, estimatedValueProtected: 15000, cropName: 'Brinjal', farmerName: 'Sridevi Reddy', buyerName: 'Saravana Bhavan Restaurant Chain', timestamp: getDaysAgo(5) },
  { _id: 'evt-006', quantityRedirected: 2000, estimatedValueProtected: 24000, cropName: 'Potato', farmerName: 'Bhaskar Rao', buyerName: 'AP Farmers Market Collective', timestamp: getDaysAgo(6) },
  { _id: 'evt-007', quantityRedirected: 400, estimatedValueProtected: 3200, cropName: 'Onion', farmerName: 'Yellaiah G', buyerName: 'Akshaya Patra Foundation', timestamp: getDaysAgo(7) },
  { _id: 'evt-008', quantityRedirected: 700, estimatedValueProtected: 14000, cropName: 'Capsicum', farmerName: 'Kavitha M', buyerName: 'Metro Wholesale Market', timestamp: getDaysAgo(8) },
  { _id: 'evt-009', quantityRedirected: 300, estimatedValueProtected: 2400, cropName: 'Leafy Greens', farmerName: 'Pushpa Latha', buyerName: 'Annadan NGO – Food Relief', timestamp: getDaysAgo(9) },
  { _id: 'evt-010', quantityRedirected: 1500, estimatedValueProtected: 30000, cropName: 'Tomato', farmerName: 'Anitha Devi', buyerName: 'Chittoor Tomato Processing Co.', timestamp: getDaysAgo(10) },
];

// ─── Helper functions ────────────────────────
function getDateFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ─── Crop perishability data ─────────────────
export const CROP_PERISHABILITY: Record<string, number> = {
  'Tomato': 0.85,
  'Leafy Greens': 0.95,
  'Brinjal': 0.75,
  'Capsicum': 0.70,
  'Chilli': 0.50,
  'Onion': 0.30,
  'Potato': 0.25,
  'Garlic': 0.20,
  'Banana': 0.80,
  'Mango': 0.78,
};

export const CROP_SEASONAL_PRESSURE: Record<string, number> = {
  'Tomato': 0.75,
  'Onion': 0.55,
  'Chilli': 0.40,
  'Brinjal': 0.50,
  'Capsicum': 0.45,
  'Potato': 0.35,
  'Leafy Greens': 0.65,
};

// ─── Assistant knowledge base ─────────────────
export const ASSISTANT_KB = {
  en: [
    {
      q: 'What does high surplus risk mean?',
      a: 'A high surplus risk (above 70%) means our AI estimates that there may be more supply of your crop in the local market than expected demand around your harvest window. This can lead to lower prices. We recommend reaching out to alternative buyers now.',
    },
    {
      q: 'What is the Rescue Window?',
      a: 'The Rescue Window is the estimated period during which you can take action to prevent meaningful crop loss. Once you pass the harvest day, options reduce significantly. Acting 3–5 days before harvest gives you the best chance to find alternative buyers.',
    },
    {
      q: 'How does buyer matching work?',
      a: 'We score each buyer based on five factors: how much they need vs. what you have, how close they are, whether their timing matches your harvest, whether they want your crop, and whether their price range fits your expectations. The top buyers are shown first.',
    },
    {
      q: 'What should I do during the Rescue Window?',
      a: 'During the Rescue Window: (1) Review the matched buyers shown, (2) Send inquiries to 2–3 buyers, (3) Confirm quantities and pickup arrangements, (4) Have your crop ready for a quick handover. Acting fast during this window is key.',
    },
    {
      q: 'How should I prepare for selling?',
      a: 'Before contacting a buyer: know your exact quantity available, have a quality description ready, confirm your harvest date, check if you can arrange transport or if the buyer provides pickup, and agree on a price range before finalizing.',
    },
    {
      q: 'What is Value at Risk?',
      a: 'Value at Risk is our estimate of how much of your expected crop revenue may be at risk due to surplus conditions. It\'s calculated based on your quantity, estimated price, and the portion of your crop that may face difficulty selling. This is a demo estimate only.',
    },
  ],
  te: [
    {
      q: 'అధిక మిగులు ప్రమాదం అంటే ఏమిటి?',
      a: 'అధిక మిగులు ప్రమాదం (70% కంటే ఎక్కువ) అంటే మీ పంట కోతకు వచ్చే సమయంలో స్థానిక మార్కెట్లో సరఫరా అంచనా కంటే ఎక్కువగా ఉండవచ్చని AI అంచనా వేస్తుంది. ఇప్పుడే ప్రత్యామ్నాయ కొనుగోలుదారులను సంప్రదించడం మంచిది.',
    },
    {
      q: 'రెస్క్యూ విండో అంటే ఏమిటి?',
      a: 'రెస్క్యూ విండో అనేది పంట నష్టాన్ని నివారించడానికి మీరు చర్యలు తీసుకోగలిగే అంచనా వ్యవధి. కోత రోజుకు ముందు 3–5 రోజులు చర్యలు తీసుకోవడం చాలా ముఖ్యం.',
    },
    {
      q: 'మార్కెట్ పరిస్థితి ఏమిటి?',
      a: 'మీ ప్రాంతంలో టమాటాకు సరఫరా పెరిగే అవకాశం ఉంది. ధర తగ్గే ముందే ప్రత్యామ్నాయ కొనుగోలుదారులను సంప్రదించడం మంచిది.',
    },
  ],
};
