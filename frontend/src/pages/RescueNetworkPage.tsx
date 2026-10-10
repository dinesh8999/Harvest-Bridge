// =============================================
// HARVEST BRIDGE — Surplus Rescue Network Page
// Connects verified NGOs, community kitchens, and food processors
// Tracks: Predicted -> Listed -> Matched -> Collected -> Delivered -> Confirmed Rescued
// =============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Heart, ShieldCheck, Clock, MapPin,
  Package, CheckCircle2, ArrowRight, AlertTriangle, Users
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { formatCurrency, formatWeight } from '../utils/format';

const VERIFIED_ORGANIZATIONS = [
  {
    id: 'org-001',
    name: 'Sri Venkateswara Community Kitchen',
    category: 'Institutional Kitchen / Non-Profit',
    location: 'Tirupati, Andhra Pradesh',
    dailyBeneficiaries: 2500,
    cropsAccepted: ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Leafy Greens'],
    capacityKg: 800,
    verifiedBy: 'Department of Endowments & AP Food Safety',
    pickupOffered: false,
    impactRescuedTotalKg: 4200,
  },
  {
    id: 'org-002',
    name: 'Akshaya Patra Foundation — Tirupati Hub',
    category: 'Mid-Day Meal NGO Partner',
    location: 'Renigunta Road, Tirupati',
    dailyBeneficiaries: 18000,
    cropsAccepted: ['Tomato', 'Potato', 'Onion', 'Leafy Greens'],
    capacityKg: 2000,
    verifiedBy: 'District Education Officer & State Nutrition Board',
    pickupOffered: true,
    impactRescuedTotalKg: 12500,
  },
  {
    id: 'org-003',
    name: 'Annadan Food Relief Network',
    category: 'Community Food Bank',
    location: 'Chittoor Town',
    dailyBeneficiaries: 850,
    cropsAccepted: ['Tomato', 'Onion', 'Capsicum', 'Brinjal'],
    capacityKg: 500,
    verifiedBy: 'Chittoor District Collectorate NGO Cell',
    pickupOffered: false,
    impactRescuedTotalKg: 2800,
  },
];

export default function RescueNetworkPage() {
  const { state, dispatch } = useApp();
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');

  const cropsWithHighRisk = state.crops.filter(
    (c) => c.surplusRiskScore >= 65 && c.availableQuantity > 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Building2 className="w-7 h-7 text-forest-600" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Surplus Rescue Network
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Connecting imminent agricultural surpluses with verified non-profits, processing facilities, and community kitchens
        </p>
      </div>

      {/* 6-Stage Accountability Banner */}
      <div className="card bg-gradient-to-r from-forest-800 to-forest-900 text-white p-6 rounded-3xl border-0 shadow-lg">
        <h2 className="font-display font-bold text-base text-amber-300 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Strict Impact Accountability Protocol
        </h2>
        <p className="text-xs text-forest-100 leading-relaxed max-w-3xl">
          Harvest Bridge strictly separates <em>Predicted Surplus</em> from <em>Confirmed Rescued Produce</em>.
          Social and environmental impact metrics are ONLY recorded when recipient organizations confirm verified destination weight.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-5 pt-4 border-t border-forest-700/60 text-center text-xs">
          <div className="bg-forest-950/40 p-2 rounded-xl">
            <div className="text-amber-400 font-bold">1. Predicted</div>
            <div className="text-[10px] text-forest-200 mt-0.5">AI Early Scan</div>
          </div>
          <div className="bg-forest-950/40 p-2 rounded-xl">
            <div className="text-amber-400 font-bold">2. Listed</div>
            <div className="text-[10px] text-forest-200 mt-0.5">Farmer Listing</div>
          </div>
          <div className="bg-forest-950/40 p-2 rounded-xl">
            <div className="text-amber-400 font-bold">3. Matched</div>
            <div className="text-[10px] text-forest-200 mt-0.5">Offer Agreed</div>
          </div>
          <div className="bg-forest-950/40 p-2 rounded-xl">
            <div className="text-amber-400 font-bold">4. Collected</div>
            <div className="text-[10px] text-forest-200 mt-0.5">Farm Gate Pickup</div>
          </div>
          <div className="bg-forest-950/40 p-2 rounded-xl">
            <div className="text-amber-400 font-bold">5. Delivered</div>
            <div className="text-[10px] text-forest-200 mt-0.5">At Destination</div>
          </div>
          <div className="bg-emerald-600/60 p-2 rounded-xl border border-emerald-400/40">
            <div className="text-white font-extrabold">6. Rescued</div>
            <div className="text-[10px] text-emerald-100 mt-0.5">Verified Impact</div>
          </div>
        </div>
      </div>

      {/* Immediate Surplus Redirection Alert */}
      {cropsWithHighRisk.length > 0 && (
        <div className="card border-rose-200 bg-rose-50/40 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            {cropsWithHighRisk.length} High-Surplus Crops Requiring Institutional Outreach
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {cropsWithHighRisk.map((c) => (
              <div key={c._id} className="bg-white p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{c.cropName} ({formatWeight(c.availableQuantity)})</div>
                  <div className="text-xs text-slate-500">{c.location} · {c.surplusRiskScore}% Risk Score</div>
                </div>
                <span className="btn-primary text-xs py-1.5 px-3">
                  Match NGO
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Partner Organizations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" /> Verified Institutional & Community Partners
          </h2>
          <span className="text-xs text-slate-500 font-medium">{VERIFIED_ORGANIZATIONS.length} Accredited Organizations</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VERIFIED_ORGANIZATIONS.map((org) => (
            <motion.div
              key={org.id}
              whileHover={{ y: -3 }}
              className="card border border-slate-200 bg-white transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Accredited
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{org.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{org.category}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" /> {org.location}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Meals / Beneficiaries:</span>
                  <strong className="text-slate-900">{org.dailyBeneficiaries.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Intake Capacity:</span>
                  <strong className="text-slate-900">{formatWeight(org.capacityKg)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Produce Rescued:</span>
                  <strong className="text-forest-700">{formatWeight(org.impactRescuedTotalKg)}</strong>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-600 mb-1.5">Crops Needed:</div>
                <div className="flex flex-wrap gap-1">
                  {org.cropsAccepted.map((c) => (
                    <span key={c} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-tight">
                Verified by: <span className="font-medium text-slate-700">{org.verifiedBy}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
