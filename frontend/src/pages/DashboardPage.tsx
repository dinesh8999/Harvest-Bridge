// =============================================
// HARVEST BRIDGE — Clean, Modern Farmer Dashboard
// Answers 4 questions:
// 1. What is happening with my crops?
// 2. Is any crop at risk of oversupply?
// 3. Which buyers can I contact?
// 4. What actions should I take next?
// =============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout, AlertTriangle, Users, Truck, ArrowRight,
  Plus, Sparkles, CheckCircle2, Clock, Calendar,
  ShieldCheck, ArrowUpRight, DollarSign, Package
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { calculateSurplusRisk } from '../services/ai/surplusEngine';
import { findBuyerMatches } from '../services/ai/matchingEngine';
import { formatCurrency, formatWeight, getRiskColor } from '../utils/format';
import { NetEarningsModal } from '../components/NetEarningsModal';
import type { BuyerMatch } from '../types';

const CROP_EMOJIS: Record<string, string> = {
  Tomato: '🍅', Onion: '🧅', Chilli: '🌶️',
  Brinjal: '🍆', Capsicum: '🫑', Potato: '🥔',
  'Leafy Greens': '🥬', Mango: '🥭', Banana: '🍌',
  Garlic: '🧄',
};

export default function DashboardPage() {
  const { state, t } = useApp();
  const user = state.currentUser;
  const [selectedBuyerForCalc, setSelectedBuyerForCalc] = useState<BuyerMatch | null>(null);

  // 1. Farmer Crops & Risk Evaluation
  const activeCrops = state.crops.filter((c) => c.status === 'active');
  const allCropsWithRisk = state.crops.map((crop) => {
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

  // Most severe surplus-risk alert
  const sortedByRisk = [...allCropsWithRisk].sort((a, b) => b.risk.surplusRisk - a.risk.surplusRisk);
  const topRiskCrop = sortedByRisk[0];

  // 2. Upcoming Harvests within 7 days
  const upcomingHarvestsCount = state.crops.filter((c) => {
    const days = Math.ceil((new Date(c.expectedHarvestDate).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  }).length;

  // 3. Open Offers
  const pendingOffersCount = state.offers.filter((o) => o.status === 'pending').length;

  // 4. Estimated Earnings & Confirmed Value
  const estimatedEarningsTotal = state.orders.reduce((sum, o) => sum + (o.netFarmerEarnings || 0), 0) +
    activeCrops.reduce((sum, c) => sum + ((c.availableQuantity ?? 1000) * (c.estimatedMarketPrice ?? 20)), 0);

  // Recommended Buyers for active crop
  const focusCrop = topRiskCrop || allCropsWithRisk[0];
  const recommendedBuyers = focusCrop
    ? findBuyerMatches({
        cropName: focusCrop.cropName,
        location: focusCrop.location,
        quantity: focusCrop.currentQty,
        estimatedPrice: focusCrop.currentPrice,
      }).slice(0, 3)
    : [];

  const recentOrders = state.orders.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* ── Top Welcome & Action Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {user?.name.split(' ')[0] ?? 'Farmer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.name ?? 'Farmer'} · <span className="capitalize">{user?.role}</span> ({user?.district || 'Chittoor District, AP'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/crops" className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold">
            <Plus className="w-3.5 h-3.5 text-forest-700" />
            Add Crop
          </Link>
          <Link to="/buyers" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs">
            <Users className="w-3.5 h-3.5" />
            Find Buyers
          </Link>
        </div>
      </div>

      {/* ── 4 Essential Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Crops</span>
            <Sprout className="w-4 h-4 text-forest-600" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900">{activeCrops.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{state.crops.length} total registered</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Upcoming Harvests</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900">{upcomingHarvestsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Due in the next 7 days</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Open Offers</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900">{pendingOffersCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting response</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Estimated Earnings</span>
            <DollarSign className="w-4 h-4 text-forest-600" />
          </div>
          <div className="font-display text-2xl font-bold text-forest-800">
            {formatCurrency(estimatedEarningsTotal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Inventory & order value</div>
        </div>
      </div>

      {/* ── AI Surplus Alert (Most Critical Warning) ── */}
      {topRiskCrop && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            topRiskCrop.risk.surplusRisk >= 70
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : topRiskCrop.risk.surplusRisk >= 50
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                  topRiskCrop.risk.surplusRisk >= 70
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>
                    Surplus Alert: {topRiskCrop.cropName} ({topRiskCrop.risk.surplusRisk}% Risk)
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-white/80 rounded-md border border-slate-200/80 font-bold">
                    Rescue Window: {topRiskCrop.risk.rescueWindowEnd || 4} Days Left
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700 leading-relaxed max-w-2xl">
                  {topRiskCrop.risk.recommendation} Potential loss at risk: <strong>{formatCurrency(topRiskCrop.risk.valueAtRisk)}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <Link
                to={`/insights?crop=${topRiskCrop.cropName}&qty=${topRiskCrop.currentQty}&price=${topRiskCrop.currentPrice}`}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-xs"
              >
                View Diagnosis
              </Link>
              <Link
                to={`/buyers?crop=${topRiskCrop.cropName}`}
                className="btn-primary text-xs py-1.5 px-3.5 shadow-xs flex items-center gap-1"
              >
                Match Buyers <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 2-Column Section: Active Crops Table & Recommended Buyers ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Crop Overview Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Crop Overview</h2>
              <p className="text-[11px] text-slate-500">Your active listings and surplus pressure</p>
            </div>
            <Link to="/crops" className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1">
              Manage All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {allCropsWithRisk.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No crops listed yet. Click "Add Crop" to register your first harvest.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2 font-semibold">Crop</th>
                    <th className="pb-2 font-semibold">Quantity</th>
                    <th className="pb-2 font-semibold">Harvest Due</th>
                    <th className="pb-2 font-semibold">Surplus Risk</th>
                    <th className="pb-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allCropsWithRisk.slice(0, 4).map((crop) => {
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((new Date(crop.expectedHarvestDate).getTime() - Date.now()) / 86400000)
                    );
                    return (
                      <tr key={crop._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CROP_EMOJIS[crop.cropName] ?? '🌱'}</span>
                            <div>
                              <div className="font-bold text-slate-900">{crop.cropName}</div>
                              <div className="text-[10px] text-slate-400">{crop.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-700 font-semibold">{formatWeight(crop.currentQty)}</td>
                        <td className="py-2.5 text-slate-600">
                          {daysLeft === 0 ? 'Today' : `${daysLeft} days`}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              crop.risk.surplusRisk >= 70
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : crop.risk.surplusRisk >= 50
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {crop.risk.surplusRisk}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <Link
                            to={`/buyers?crop=${crop.cropName}`}
                            className="text-forest-700 font-bold hover:underline"
                          >
                            Find Buyers
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Recommended Buyers (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Recommended Buyers</h2>
              <p className="text-[11px] text-slate-500">Verified nearby buyers for {focusCrop?.cropName || 'Crops'}</p>
            </div>
            <Link to="/buyers" className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recommendedBuyers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching buyers found for current crop parameters.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recommendedBuyers.map((match) => (
                <div
                  key={match.buyerId || match.buyer?._id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{match.buyerName || match.buyer?.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {match.distanceKm || match.distance || 15} km away · Indicative: ₹{match.indicativePricePerKg}/kg
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBuyerForCalc(match)}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-forest-700 hover:bg-forest-50 rounded-lg font-bold text-[11px] shadow-2xs"
                    >
                      Net Calc
                    </button>
                    <Link
                      to={`/buyers?crop=${focusCrop?.cropName}`}
                      className="px-2.5 py-1 bg-forest-600 text-white hover:bg-forest-700 rounded-lg font-bold text-[11px] shadow-2xs"
                    >
                      Offer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders Section ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest-600" />
              Recent Orders & Collections
            </h2>
            <p className="text-[11px] text-slate-500">Live order fulfillment and verified transactions</p>
          </div>
          <Link to="/orders" className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1">
            View All ({state.orders.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No orders created yet. Submit and accept buyer offers to begin farm collections.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order._id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-200 flex items-center justify-center font-bold text-forest-700 text-sm">
                    📦
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {order.cropName} ({formatWeight(order.quantityKg)})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Buyer: {order.buyerName} · Date: {order.scheduledDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-extrabold text-forest-800">
                    {formatCurrency(order.netFarmerEarnings)}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'in_transit'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Net Earnings Calculator Modal */}
      {selectedBuyerForCalc && (
        <NetEarningsModal
          isOpen={Boolean(selectedBuyerForCalc)}
          cropName={focusCrop?.cropName || 'Tomato'}
          quantityKg={focusCrop?.currentQty || 2000}
          initialPricePerKg={selectedBuyerForCalc.indicativePricePerKg || 21}
          initialDistanceKm={selectedBuyerForCalc.distanceKm || 20}
          onClose={() => setSelectedBuyerForCalc(null)}
        />
      )}
    </div>
  );
}
