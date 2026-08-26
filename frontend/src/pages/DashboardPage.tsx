// =============================================
// HARVEST BRIDGE — Farmer Dashboard (With Framer Motion)
// =============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout, Zap, TrendingDown, AlertTriangle, Users, BarChart3,
  ArrowRight, Package, DollarSign, Leaf
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { DEMO_CROPS, DEMO_IMPACT_EVENTS } from '../data/demoData';
import { calculateSurplusRisk } from '../services/ai/surplusEngine';
import { formatCurrency, formatWeight, getRiskColor } from '../utils/format';

const CROP_EMOJIS: Record<string, string> = {
  'Tomato': '🍅', 'Onion': '🧅', 'Chilli': '🌶️',
  'Brinjal': '🍆', 'Capsicum': '🫑', 'Potato': '🥔',
  'Leafy Greens': '🥬', 'Mango': '🥭', 'Banana': '🍌',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function DashboardPage() {
  const { state } = useApp();
  const user = state.currentUser;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Get farmer's crops (first 3)
  const myFarmerCrops = DEMO_CROPS.slice(0, 3).map((crop) => {
    const risk = calculateSurplusRisk({
      cropName: crop.cropName!,
      location: crop.location!,
      quantity: crop.quantity!,
      expectedHarvestDate: crop.expectedHarvestDate!,
      estimatedPrice: crop.estimatedPrice!,
    });
    return { ...crop, risk };
  });

  const highRiskCount = myFarmerCrops.filter((c) => c.risk.surplusRisk >= 70).length;
  const totalValueAtRisk = myFarmerCrops.reduce((sum, c) => sum + c.risk.valueAtRisk, 0);
  const totalRedirected = DEMO_IMPACT_EVENTS.reduce((sum, e) => sum + (e.quantityRedirected ?? 0), 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 py-8 space-y-8"
    >

      {/* ── Greeting ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-forest-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {greeting}, {user?.name.split(' ')[0] ?? 'Farmer'} 👋
          </h1>
          <p className="text-slate-600 mt-1">
            {user?.name ?? 'Farmer'} · {user?.location ?? 'Chittoor'}
          </p>
          <p className="text-forest-700 text-sm mt-1 font-semibold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse" />
            Your farm yield is monitored for surplus risk & price protection.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/check-risk" className="btn-primary">
            <Zap className="w-4 h-4 text-amber-300" />
            Check Crop Risk
          </Link>
        </motion.div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Crops',
            value: myFarmerCrops.length,
            icon: Sprout,
            color: 'text-forest-700',
            bg: 'bg-emerald-50/70 border-emerald-200',
          },
          {
            label: 'High Surplus Risk',
            value: highRiskCount,
            icon: AlertTriangle,
            color: 'text-rose-700',
            bg: 'bg-rose-50/70 border-rose-200',
          },
          {
            label: 'Value at Risk',
            value: formatCurrency(totalValueAtRisk),
            icon: TrendingDown,
            color: 'text-amber-700',
            bg: 'bg-amber-50/70 border-amber-200',
            isText: true,
          },
          {
            label: 'Protected Yield',
            value: formatWeight(totalRedirected),
            icon: Package,
            color: 'text-sky-700',
            bg: 'bg-sky-50/70 border-sky-200',
            isText: true,
          },
        ].map(({ label, value, icon: Icon, color, bg, isText }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`card border ${bg} transition-all`}
          >
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`font-display font-bold ${isText ? 'text-xl' : 'text-3xl'} ${color}`}>
              {value}
            </div>
            <div className="text-slate-600 text-xs font-medium mt-1">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Crop Health Cards ── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Your Active Crop Risk Monitor</h2>
          <Link to="/crops" className="text-sm font-semibold text-forest-700 hover:text-forest-800 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFarmerCrops.map((crop) => {
            const riskLevel = crop.risk.surplusRisk >= 70 ? 'HIGH' : crop.risk.surplusRisk >= 50 ? 'MEDIUM' : 'LOW';
            const daysLeft = Math.max(0, Math.ceil(
              (new Date(crop.expectedHarvestDate!).getTime() - Date.now()) / 86400000
            ));

            return (
              <motion.div
                key={crop._id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`card border transition-all ${riskLevel === 'HIGH' ? 'border-rose-300 bg-rose-50/30' : riskLevel === 'MEDIUM' ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CROP_EMOJIS[crop.cropName!] ?? '🌿'}</span>
                    <div>
                      <div className="font-bold text-slate-900">{crop.cropName}</div>
                      <div className="text-xs text-slate-500">{crop.quantity?.toLocaleString()} kg</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
                    riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {riskLevel} RISK
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Surplus Risk Index</span>
                    <span className={`font-bold ${getRiskColor(crop.risk.surplusRisk)}`}>
                      {crop.risk.surplusRisk}%
                    </span>
                  </div>
                  <div className="risk-meter h-2 bg-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${crop.risk.surplusRisk}%` }}
                      transition={{ duration: 1, ease: 'easeOut' as const }}
                      className="risk-fill h-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200">
                    <div className="text-slate-500 font-medium">Harvest in</div>
                    <div className="text-slate-900 font-bold">{daysLeft} days</div>
                  </div>
                  <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200">
                    <div className="text-slate-500 font-medium">Urgency</div>
                    <div className={`font-bold ${crop.risk.urgency === 'HIGH' || crop.risk.urgency === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
                      {crop.risk.urgency}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {crop.risk.recommendation.slice(0, 85)}...
                </p>

                <Link
                  to={`/check-risk?crop=${crop.cropName}&location=${encodeURIComponent(crop.location!)}&qty=${crop.quantity}&price=${crop.estimatedPrice}`}
                  className="btn-secondary text-xs py-2.5 w-full font-semibold"
                >
                  View Full Analysis
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Recent activity ── */}
      <motion.div variants={itemVariants}>
        <h2 className="section-title mb-4">Recent Surplus Redistribution Impact</h2>
        <div className="card space-y-3">
          {DEMO_IMPACT_EVENTS.slice(0, 4).map((event) => (
            <motion.div
              key={event._id}
              whileHover={{ x: 3 }}
              className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4.5 h-4.5 text-forest-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 font-semibold truncate">
                  {event.cropName} → {event.buyerName}
                </div>
                <div className="text-xs text-slate-500">{event.farmerName}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-forest-700">
                  {formatWeight(event.quantityRedirected!)}
                </div>
                <div className="text-xs text-slate-500">{formatCurrency(event.estimatedValueProtected!)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick links ── */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/radar', icon: BarChart3, label: 'Surplus Radar™', desc: 'District pressure heatmap', color: 'text-sky-600' },
          { to: '/assistant', icon: Users, label: 'AI Assistant', desc: 'Ask in English or Telugu', color: 'text-purple-600' },
          { to: '/impact', icon: DollarSign, label: 'Impact Analytics', desc: 'Track protected farm income', color: 'text-emerald-600' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <motion.div key={to} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
            <Link to={to} className="card-hover flex items-center gap-4">
              <Icon className={`w-8 h-8 ${color} flex-shrink-0`} />
              <div>
                <div className="font-bold text-slate-900 text-sm">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
