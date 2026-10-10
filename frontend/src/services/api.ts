// =============================================
// HARVEST BRIDGE — Typed API Client Service
// Connects to Express Backend with resilient offline fallbacks
// =============================================

import axios from 'axios';
import type {
  User,
  CropListing,
  Offer,
  Order,
  BuyerMatch,
  MarketObservation,
  ImpactRecord,
  AssistantMessage,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hb_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Auth
  async login(phone: string, password: string): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/login', { phone, password });
    if (res.data.token) {
      localStorage.setItem('hb_auth_token', res.data.token);
    }
    return res.data;
  },

  async register(data: Partial<User> & { password: string }): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('hb_auth_token', res.data.token);
    }
    return res.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  // Crop Listings
  async getCrops(params?: { farmerId?: string; status?: string; cropName?: string }): Promise<{ listings: CropListing[] }> {
    const res = await api.get('/crops', { params });
    return res.data;
  },

  async getCropById(id: string): Promise<{ listing: CropListing }> {
    const res = await api.get(`/crops/${id}`);
    return res.data;
  },

  async createCrop(data: Partial<CropListing>): Promise<{ listing: CropListing; riskAnalysis: any }> {
    const res = await api.post('/crops', data);
    return res.data;
  },

  async updateCrop(id: string, data: Partial<CropListing>): Promise<{ listing: CropListing }> {
    const res = await api.put(`/crops/${id}`, data);
    return res.data;
  },

  async updateCropStatus(id: string, status: string): Promise<{ listing: CropListing }> {
    const res = await api.patch(`/crops/${id}/status`, { status });
    return res.data;
  },

  // AI Surplus Prediction
  async predictRisk(data: {
    cropName: string;
    location: string;
    quantity: number;
    expectedHarvestDate?: string;
    estimatedPrice?: number;
    storageType?: string;
  }): Promise<any> {
    const res = await api.post('/predict', data);
    return res.data;
  },

  // Buyer Matching
  async matchBuyers(data: {
    cropName: string;
    quantity: number;
    location?: string;
    latitude?: number;
    longitude?: number;
    expectedHarvestDate?: string;
    minAcceptablePrice?: number;
    qualityGrade?: string;
  }): Promise<{ matches: BuyerMatch[]; totalMatches: number }> {
    const res = await api.post('/buyers/match', data);
    return res.data;
  },

  // Offers & Negotiations
  async getOffers(): Promise<{ count: number; offers: Offer[] }> {
    const res = await api.get('/offers');
    return res.data;
  },

  async createOffer(data: {
    listingId: string;
    offeredQuantity: number;
    offeredPricePerKg: number;
    transportOption?: string;
    pickupDate?: string;
    notes?: string;
  }): Promise<{ offer: Offer }> {
    const res = await api.post('/offers', data);
    return res.data;
  },

  async acceptOffer(offerId: string): Promise<{ order: Order; listing: CropListing }> {
    const res = await api.post(`/offers/${offerId}/accept`);
    return res.data;
  },

  async rejectOffer(offerId: string): Promise<{ offer: Offer }> {
    const res = await api.post(`/offers/${offerId}/reject`);
    return res.data;
  },

  async calculateNetEarnings(data: any): Promise<any> {
    const res = await api.post('/offers/calculate-earnings', data);
    return res.data;
  },

  // Orders Lifecycle
  async getOrders(): Promise<{ count: number; orders: Order[] }> {
    const res = await api.get('/orders');
    return res.data;
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async recordPickup(orderId: string, data: { driverName?: string; vehicleNumber?: string; inspectedWeightKg?: number }): Promise<{ order: Order }> {
    const res = await api.post(`/orders/${orderId}/pickup`, data);
    return res.data;
  },

  async confirmDelivery(orderId: string, data: { verifiedWeightKg?: number; confirmedWasteKg?: number; receiverName?: string; notes?: string }): Promise<{ order: Order; impact: ImpactRecord }> {
    const res = await api.post(`/orders/${orderId}/delivery`, data);
    return res.data;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<{ order: Order }> {
    const res = await api.post(`/orders/${orderId}/cancel`, { reason });
    return res.data;
  },

  // Impact Analytics
  async getImpactMetrics(): Promise<any> {
    const res = await api.get('/impact');
    return res.data;
  },

  // Market Intelligence
  async getMarketIntelligence(params?: { crop?: string; district?: string }): Promise<{ observations: MarketObservation[]; summary: any }> {
    const res = await api.get('/market/intelligence', { params });
    return res.data;
  },

  // Grounded AI Assistant
  async sendAssistantMessage(query: string, language = 'en', context?: any): Promise<AssistantMessage> {
    const res = await api.post('/assistant/chat', { query, language, context });
    return res.data;
  },

  // Admin Portal
  async getAdminOverview(): Promise<any> {
    const res = await api.get('/admin/overview');
    return res.data;
  },

  async verifyOrganization(organizationId: string, notes?: string): Promise<any> {
    const res = await api.post('/organizations/verify', { organizationId, notes });
    return res.data;
  },
};
