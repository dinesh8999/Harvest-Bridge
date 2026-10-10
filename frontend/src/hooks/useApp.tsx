// =============================================
// HARVEST BRIDGE — Enhanced App Context & State
// Multi-role support, Language management, Text-To-Speech audio guidance
// =============================================

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, UserRole, Language, CropListing, BuyerMatch, Offer, Order } from '../types';
import { TRANSLATIONS, type TranslationKey } from '../utils/translations';
import { DEMO_CROPS, DEMO_BUYERS, DEMO_IMPACT_EVENTS } from '../data/demoData';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppState {
  isDemoMode: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  language: Language;
  crops: CropListing[];
  offers: Offer[];
  orders: Order[];
  lastPrediction: any | null;
  lastMatches: BuyerMatch[];
  notifications: Notification[];
  isSpeaking: boolean;
}

type Action =
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SWITCH_ROLE'; payload: UserRole }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_CROPS'; payload: CropListing[] }
  | { type: 'ADD_CROP'; payload: CropListing }
  | { type: 'UPDATE_CROP'; payload: { id: string; data: Partial<CropListing> } }
  | { type: 'SET_OFFERS'; payload: Offer[] }
  | { type: 'ADD_OFFER'; payload: Offer }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { id: string; data: Partial<Order> } }
  | { type: 'SET_PREDICTION'; payload: any }
  | { type: 'SET_MATCHES'; payload: BuyerMatch[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'LOGOUT' };

// Persona Presets for Quick Testing in Hackathons
export const PERSONA_PRESETS: Record<UserRole, User> = {
  farmer: {
    _id: 'farmer-001',
    name: 'Ravi Kumar',
    phone: '9876543001',
    email: 'ravi.kumar@harvestbridge.org',
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
    createdAt: new Date().toISOString(),
  },
  buyer: {
    _id: 'buyer-001',
    name: 'Chittoor Tomato Processing Co.',
    phone: '9876543210',
    email: 'procurement@chittoorprocessing.com',
    role: 'buyer',
    category: 'processor',
    language: 'en',
    location: 'Chittoor Industrial Area',
    district: 'Chittoor',
    capacity: 5000,
    cropsWanted: ['Tomato', 'Onion'],
    preferredPriceMin: 14,
    preferredPriceMax: 22,
    pickupAvailable: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  organization: {
    _id: 'org-001',
    name: 'Sri Venkateswara Community Kitchen',
    phone: '9876543300',
    email: 'annadanam@svkitchen.org',
    role: 'organization',
    category: 'institution',
    language: 'te',
    location: 'Tirupati',
    district: 'Tirupati',
    capacity: 800,
    cropsWanted: ['Tomato', 'Onion', 'Chilli', 'Brinjal', 'Potato'],
    preferredPriceMin: 8,
    preferredPriceMax: 18,
    pickupAvailable: false,
    verified: true,
    verificationNotes: 'Registered Non-Profit Community Kitchen serving 2,500 daily meals.',
    createdAt: new Date().toISOString(),
  },
  admin: {
    _id: 'admin-001',
    name: 'State Agricultural Operations Administrator',
    phone: '9876543999',
    email: 'admin@harvestbridge.org',
    role: 'admin',
    language: 'en',
    location: 'State APMC HQ, Vijayawada',
    verified: true,
    createdAt: new Date().toISOString(),
  },
};

const INITIAL_CROPS: CropListing[] = [
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
    notes: 'Firm red tomatoes ready for harvest in 4 days. Drip irrigated.',
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
    notes: 'Medium bulb size, well cured skins.',
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
    category: 'Spices',
    location: 'Kuppam, Chittoor',
    district: 'Chittoor',
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
    notes: 'Delivered and verified at local processing plant.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_OFFERS: Offer[] = [
  {
    _id: 'offer-001',
    listingId: 'listing-001',
    cropName: 'Tomato',
    farmerId: 'farmer-001',
    farmerName: 'Ravi Kumar',
    buyerId: 'buyer-001',
    buyerName: 'Chittoor Tomato Processing Co.',
    buyerRole: 'buyer',
    buyerCategory: 'processor',
    offeredQuantity: 1200,
    offeredPricePerKg: 19.5,
    transportOption: 'buyer_pickup',
    pickupDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    estimatedDistanceKm: 18,
    transportCost: 0,
    handlingCost: 600,
    platformFee: 0,
    estimatedNetEarnings: 22800,
    status: 'accepted',
    notes: 'Processing batch scheduled. Buyer arranges 3-ton tempo.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'offer-002',
    listingId: 'listing-001',
    cropName: 'Tomato',
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
    estimatedNetEarnings: 9450,
    status: 'pending',
    notes: 'Fresh retail supply. Farmer to arrange delivery to Kuppam hub.',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

const INITIAL_ORDERS: Order[] = [
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
    status: 'scheduled_pickup',
    paymentStatus: 'pending_external',
    pickupDetails: {
      driverName: 'K. Venkatesh',
      vehicleNumber: 'AP 03 TX 4412',
    },
    confirmedRescuedKg: 0,
    confirmedWasteKg: 0,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'order-002',
    offerId: 'offer-hist-001',
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
    deliveryDetails: {
      deliveredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      deliveredWeightKg: 600,
      receiverName: 'Suresh Reddy (Plant Lead)',
    },
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const initialState: AppState = {
  isDemoMode: true,
  isAuthenticated: true,
  currentUser: PERSONA_PRESETS.farmer,
  language: 'en',
  crops: INITIAL_CROPS,
  offers: INITIAL_OFFERS,
  orders: INITIAL_ORDERS,
  lastPrediction: null,
  lastMatches: [],
  notifications: [
    {
      id: 'notif-001',
      type: 'critical',
      title: '🔴 HIGH SURPLUS RISK (78%)',
      message: 'Tomato surplus risk elevated in Chittoor district. 4 days remaining until harvest window.',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 'notif-002',
      type: 'success',
      title: '🏭 Buyer Matched & Verified',
      message: 'Chittoor Tomato Processing Co. submitted an offer for 1,200 kg with free farm pickup.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'notif-003',
      type: 'warning',
      title: '⏰ Rescue Window Active',
      message: 'Lock in unreserved 800 kg within the next 48 hours for optimal net return.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
  ],
  isSpeaking: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    case 'SET_USER':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'SWITCH_ROLE': {
      const preset = PERSONA_PRESETS[action.payload] || PERSONA_PRESETS.farmer;
      return {
        ...state,
        currentUser: preset,
        isAuthenticated: true,
        language: preset.language || state.language,
      };
    }
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };
    case 'SET_CROPS':
      return { ...state, crops: action.payload };
    case 'ADD_CROP':
      return { ...state, crops: [action.payload, ...state.crops] };
    case 'UPDATE_CROP':
      return {
        ...state,
        crops: state.crops.map((c) => (c._id === action.payload.id ? { ...c, ...action.payload.data } : c)),
      };
    case 'SET_OFFERS':
      return { ...state, offers: action.payload };
    case 'ADD_OFFER':
      return { ...state, offers: [action.payload, ...state.offers] };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) => (o._id === action.payload.id ? { ...o, ...action.payload.data } : o)),
      };
    case 'SET_PREDICTION':
      return { ...state, lastPrediction: action.payload };
    case 'SET_MATCHES':
      return { ...state, lastMatches: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('hb_auth_token');
      return { ...initialState, isAuthenticated: false, currentUser: null };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  t: (key: TranslationKey) => string;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Translation helper
  const t = (key: TranslationKey): string => {
    const lang = state.language || 'en';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  // Text to speech audio guidance for accessibility
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => dispatch({ type: 'SET_SPEAKING', payload: true });
    utterance.onend = () => dispatch({ type: 'SET_SPEAKING', payload: false });
    utterance.onerror = () => dispatch({ type: 'SET_SPEAKING', payload: false });

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      dispatch({ type: 'SET_SPEAKING', payload: false });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, t, speakText, stopSpeaking }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
