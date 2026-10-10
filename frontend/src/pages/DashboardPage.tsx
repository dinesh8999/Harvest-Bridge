// =============================================
// HARVEST BRIDGE — Farmer & Multi-Role Dashboard
// Displays actual stored crop listings, surplus alerts, buyer orders, and verified impact
// =============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout, Zap, TrendingDown, AlertTriangle, Users, BarChart3,
  ArrowRight, Package, DollarSign, Leaf, Truck, Store, Building2,
  CheckCircle2, Clock
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { calculateSurplusRisk } from '../services/ai/surplusEngine';
import { formatCurrency, formatWeight, getRiskColor } from '../utils/format';

const CROP_EMOJIS: Record<string, string> = {
  'Tomato': '🍅', 'Onion': '🧅', 'Chilli': '🌶️',
  'Brinjal': '🍆', 'Capsicum': '🫑', 'Potato': '🥔',
  'Leafy Greens': '🥬', 'Mango': '🥭', 'Banana': '🍌',
  'Garlic': '🧄',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function DashboardPage() {
  const { state, t } = useApp();
  const user = state.currentUser;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 17 ? t('goodAfternoon') : t('goodEvening');

  // Real crops from state
  const myFarmerCrops = (state.crops.length > 0 ? state.crops.slice(0, 3) : []).map((crop) => {
    const qty = crop.availableQuantity ?? crop.totalQuantity ?? crop.quantity ?? 1000;
    const price = crop.estimatedMarketPrice ?? crop.estimatedPrice ?? crop.minAcceptablePrice ?? 20;
    const risk = calculateSurplusRisk({
      cropName: crop.cropName,
      location: crop.location,
      quantity: qty,
      expectedHarvestDate: crop.expectedHarvestDate,
      estimatedPrice: price,
    });
    return { ...crop, risk, currentQty: qty, currentPrice: price };
  });

  const highRiskCount = myFarmerCrops.filter((c) => c.risk.surplusRisk >= 70).length;
  const totalValueAtRisk = myFarmerCrops.reduce((sum, c) => sum + c.risk.valueAtRisk, 0);
  const activeOrdersCount = state.orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrdersCount = state.orders.filter((o) => o.status === 'completed').length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in"
    >
      {/* ── Greeting Banner ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-forest-50/60 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {greeting}, {user?.name.split(' ')[0] ?? 'Farmer'} 👋
          </h1>
          <p className="text-slate-600 mt-1 text-sm font-medium">
            {user?.name ?? 'Farmer'} · <span className="capitalize">{user?.role}</span> ({user?.location ?? 'Chittoor District'})
          </p>
          <p className="text-forest-700 text-xs mt-1.5 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse" />
            {t('subtitleFarmMonitored')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/check-risk" className="btn-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-300" />
            {t('navCheckRisk')}
          </Link>
          <Link to="/orders" className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-600" />
            {t('navOrders')} ({state.orders.length})
          </Link>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('kpiActiveCrops'),
            value: `${state.crops.length} Listed`,
            icon: Sprout,
            color: 'text-forest-700',
            bg: 'bg-emerald-50/70 border-emerald-200',
          },
          {
            label: t('kpiHighRisk'),
            value: `${highRiskCount} Alerts`,
            icon: AlertTriangle,
            color: 'text-rose-700',
            bg: 'bg-rose-50/70 border-rose-200',
          },
          {
            label: t('kpiValueAtRisk'),
            value: formatCurrency(totalValueAtRisk),
            icon: TrendingDown,
            color: 'text-amber-700',
            bg: 'bg-amber-50/70 border-amber-200',
          },
          {
            label: 'Active Logistics',
            value: `${activeOrdersCount} in progress`,
            icon: Truck,
            color: 'text-sky-700',
            bg: 'bg-sky-50/70 border-sky-200',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className={`card border ${bg} transition-all`}
          >
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`font-display font-extrabold text-xl sm:text-2xl ${color}`}>
              {value}
            </div>
            <div className="text-slate-600 text-xs font-semibold mt-1">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Crop Health Cards ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Active Crop Surplus Risk Monitors</h2>
          <Link to="/crops" className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1">
            {t('viewAll')} ({state.crops.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFarmerCrops.map((crop) => {
            const riskLevel = crop.risk.surplusRisk >= 70 ? 'HIGH' : crop.risk.surplusRisk >= 50 ? 'MEDIUM' : 'LOW';
            const daysLeft = Math.max(0, Math.ceil(
              (new Date(crop.expectedHarvestDate).getTime() - Date.now()) / 86400000
            ));

            return (
              <motion.div
                key={crop._id}
                whileHover={{ y: -3 }}
                className={`card border transition-all ${
                  riskLevel === 'HIGH' ? 'border-rose-300 bg-rose-50/20' :
                  riskLevel === 'MEDIUM' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{CROP_EMOJIS[crop.cropName] ?? '🌿'}</span>
                    <div>
                      <div className="font-bold text-slate-900 text-base">{crop.cropName}</div>
                      <div className="text-xs text-slate-500 font-medium">{formatWeight(crop.currentQty)}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {crop.risk.surplusRisk}% RISK
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Surplus Pressure</span>
                    <span className={getRiskColor(crop.risk.surplusRisk)}>
                      {crop.risk.surplusRisk}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${crop.risk.surplusRisk}%`,
                        backgroundColor: crop.risk.surplusRisk >= 70 ? '#ef4444' : crop.risk.surplusRisk >= 50 ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/60">
                  <div>
                    <div className="text-slate-500 font-medium">Harvest in</div>
                    <div className="text-slate-900 font-extrabold">{daysLeft} days</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Urgency</div>
                    <div className={`font-extrabold ${crop.risk.urgency === 'HIGH' || crop.risk.urgency === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
                      {crop.risk.urgency}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mb-4 leading-relaxed line-clamp-2">
                  {crop.risk.recommendation}
                </p>

                <div className="flex gap-2">
                  <Link
                    to={`/check-risk?crop=${crop.cropName}&location=${encodeURIComponent(crop.location)}&qty=${crop.currentQty}&price=${crop.currentPrice}`}
                    className="btn-primary text-xs py-2 flex-1 font-semibold text-center"
                  >
                    Scan Surplus
                  </Link>
                  <Link
                    to="/matches"
                    className="btn-secondary text-xs py-2 flex-1 font-semibold text-center"
                  >
                    Matches
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Active Orders & Logistics ── */}
      <motion.div variants={itemVariants} className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-forest-600" /> Active Orders & Collections
            </h2>
            <p className="text-xs text-slate-500">Live order fulfillment and farm-gate logistics status</p>
          </div>
          <Link to="/orders" className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1">
            View All ({state.orders.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {state.orders.slice(0, 3).map((order) => (
            <div key={order._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center font-bold text-forest-700">
                  📦
                </div>
                <div>
                  <div className="font-bold text-slate-900">{order.cropName} ({formatWeight(order.quantityKg)})</div>
                  <div className="text-slate-500 mt-0.5">Buyer: {order.buyerName} · {order.scheduledDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-bold text-forest-700">
                  {formatCurrency(order.netFarmerEarnings)}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  order.status === 'in_transit' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Portals ── */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-4 gap-4">
        {[
          { to: '/market', icon: Store, label: 'Mandi Intelligence', desc: 'Real APMC benchmarks', color: 'text-forest-700' },
          { to: '/rescue', icon: Building2, label: 'Rescue Network', desc: 'Verified NGO matches', color: 'text-rose-600' },
          { to: '/radar', icon: BarChart3, label: 'Surplus Radar™', desc: '7-day district heatmap', color: 'text-sky-600' },
          { to: '/assistant', icon: Users, label: 'AI Assistant', desc: 'Bilingual voice guide', color: 'text-purple-600' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} className="card-hover flex items-center gap-3.5 p-4">
            <Icon className={`w-8 h-8 ${color} flex-shrink-0`} />
            <div>
              <div className="font-bold text-slate-900 text-xs">{label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
