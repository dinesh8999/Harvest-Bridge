// =============================================
// HARVEST BRIDGE — Find Buyers & Offer Negotiation Page
// Multi-factor ranked discovery, transparent Net Earnings calculation,
// and direct offer submission (Commercial & Verified Rescue Network)
// =============================================

import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MapPin, Package, CheckCircle, DollarSign, Star,
  Phone, Calculator, ShieldCheck, ArrowRight, HelpCircle,
  Truck, Send, ChevronDown, ChevronUp, Building2, HeartHandshake
} from 'lucide-react';
import { findBuyerMatches } from '../services/ai/matchingEngine';
import { MatchScoreBreakdown } from '../components/MatchScoreBreakdown';
import { NetEarningsModal } from '../components/NetEarningsModal';
import { getCategoryLabel, formatCurrency, formatWeight } from '../utils/format';
import { useApp } from '../hooks/useApp';
import type { BuyerMatch, Offer } from '../types';

const CATEGORY_EMOJIS: Record<string, string> = {
  processor: '🏭',
  retailer: '🛒',
  restaurant: '🍽️',
  wholesaler: '📦',
  institution: '🏛️',
  ngo: '❤️',
  school: '🏫',
};

export default function MatchesPage() {
  const { state, dispatch, t } = useApp();
  const [searchParams] = useSearchParams();
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [calculatorMatch, setCalculatorMatch] = useState<BuyerMatch | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Query or fallback
  const urlCrop = searchParams.get('crop');
  const activeListing = (urlCrop ? state.crops.find((c) => c.cropName.toLowerCase() === urlCrop.toLowerCase()) : null) ||
    state.crops.find((c) => c.status === 'active') ||
    state.crops[0];

  const cropName = urlCrop || state.lastPrediction?.cropName || activeListing?.cropName || 'Tomato';
  const quantity = state.lastPrediction?.quantity || activeListing?.availableQuantity || 2000;
  const location = state.lastPrediction?.location || activeListing?.location || 'Palamaner, Chittoor';
  const price = state.lastPrediction?.estimatedPrice || activeListing?.estimatedMarketPrice || 22;

  // Compute all matches
  const allMatches: BuyerMatch[] = findBuyerMatches({
    cropName,
    location,
    quantity,
    estimatedPrice: price,
  });

  // Filter by category
  const matches = selectedCategory === 'all'
    ? allMatches
    : selectedCategory === 'ngo'
    ? allMatches.filter((m) => m.category === 'ngo' || m.buyer?.category === 'ngo' || m.buyerRole === 'organization')
    : selectedCategory === 'processor'
    ? allMatches.filter((m) => m.category === 'processor' || m.buyer?.category === 'processor')
    : allMatches.filter((m) => m.category === 'retailer' || m.category === 'wholesaler' || m.buyer?.category === 'retailer' || m.buyer?.category === 'wholesaler');

  const handleSendOffer = (match: BuyerMatch) => {
    const id = match.buyerId || match.buyer?._id;
    setSentTo((prev) => [...prev, id]);

    const newOffer: Offer = {
      _id: `offer-${Date.now()}`,
      listingId: activeListing?._id || 'listing-001',
      cropName,
      farmerId: state.currentUser?._id || 'farmer-001',
      farmerName: state.currentUser?.name || 'Farmer',
      buyerId: id,
      buyerName: match.buyerName || match.buyer?.name,
      buyerRole: match.buyerRole || 'buyer',
      buyerCategory: match.category || match.buyer?.category || 'processor',
      offeredQuantity: Math.min(quantity, match.capacityKg || match.buyer?.capacity || 1000),
      offeredPricePerKg: match.indicativePricePerKg || match.buyer?.preferredPriceMin || 20,
      transportOption: match.pickupAvailable ? 'buyer_pickup' : 'farmer_delivery',
      pickupDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      estimatedDistanceKm: match.distanceKm || match.distance || 15,
      transportCost: match.pickupAvailable ? 0 : 800,
      handlingCost: Math.round(quantity * 0.5),
      platformFee: 0,
      estimatedNetEarnings: Math.round(quantity * (match.indicativePricePerKg || 20) * 0.9),
      status: 'pending',
      notes: 'Direct farm-to-buyer offer submitted via Harvest Bridge.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_OFFER', payload: newOffer });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: '✅ Formal Offer Sent',
        message: `Advance purchase inquiry submitted to ${match.buyerName || match.buyer?.name}.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-600" />
            Find Buyers & Matchmaking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ranked commercial processors, wholesale buyers, and verified relief organizations for{' '}
            <strong className="text-slate-800">{cropName}</strong> ({formatWeight(quantity)})
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'all', label: 'All Buyers' },
            { id: 'processor', label: '🏭 Food Processors' },
            { id: 'commercial', label: '🛒 Retail & Wholesale' },
            { id: 'ngo', label: '❤️ Rescue Network (NGOs)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-forest-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Match Cards List ── */}
      <div className="space-y-3.5">
        {matches.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No buyers found for this category</div>
            <p className="text-xs text-slate-500">Try selecting "All Buyers" or check back as new buyers register daily.</p>
          </div>
        ) : (
          matches.map((match, i) => {
            const buyerId = match.buyerId || match.buyer?._id;
            const buyerName = match.buyerName || match.buyer?.name;
            const category = match.category || match.buyer?.category || 'processor';
            const distance = match.distanceKm || match.distance || 15;
            const capacity = match.capacityKg || match.buyer?.capacity || 1000;
            const pickupAvailable = match.pickupAvailable ?? match.buyer?.pickupAvailable;
            const isSent = sentTo.includes(buyerId);
            const isExpanded = expanded === buyerId;

            const indicativeGrossPrice =
              match.indicativePricePerKg ||
              (match.buyer?.preferredPriceMin
                ? (match.buyer.preferredPriceMin + match.buyer.preferredPriceMax) / 2
                : 21);
            const grossValue = quantity * indicativeGrossPrice;
            const estimatedTransport = pickupAvailable ? 0 : Math.round(distance * (quantity / 100) * 1.25);
            const estimatedHandling = Math.round(quantity * 0.5);
            const netEarnings = Math.max(0, grossValue - estimatedTransport - estimatedHandling);
            const effectiveNetPerKg = Number((netEarnings / quantity).toFixed(2));

            return (
              <div
                key={buyerId}
                className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all shadow-2xs ${
                  match.matchScore >= 85
                    ? 'border-emerald-300'
                    : match.matchScore >= 70
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200 text-lg flex items-center justify-center flex-shrink-0">
                      {CATEGORY_EMOJIS[category] ?? '🏪'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{buyerName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                          {getCategoryLabel(category)}
                        </span>
                        {category === 'ngo' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                            Verified Rescue Partner
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {distance} km away
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-slate-400" /> Capacity: {formatWeight(capacity)}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          Indicative: ₹{indicativeGrossPrice}/kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex items-center gap-3 sm:self-start">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Match Fit</div>
                      <div className="text-sm font-extrabold text-forest-700">{match.matchScore}% Score</div>
                    </div>

                    <button
                      onClick={() => setCalculatorMatch(match)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      title="Simulate Take-Home Earnings"
                    >
                      <Calculator className="w-3.5 h-3.5 text-forest-700" />
                      Net Calc
                    </button>

                    <button
                      onClick={() => handleSendOffer(match)}
                      disabled={isSent}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                        isSent
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'btn-primary'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Offered
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Send Offer
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Net Earnings Snapshot Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50/70 p-2.5 rounded-xl">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>
                      Gross: <strong>{formatCurrency(grossValue)}</strong>
                    </span>
                    <span>
                      Transport: <strong>{pickupAvailable ? '₹0 (Buyer Pickup)' : `- ${formatCurrency(estimatedTransport)}`}</strong>
                    </span>
                    <span>
                      Handling: <strong>- {formatCurrency(estimatedHandling)}</strong>
                    </span>
                  </div>

                  <div className="font-extrabold text-forest-800 flex items-center gap-2">
                    <span>Estimated Net Profit: {formatCurrency(netEarnings)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-forest-100 text-forest-800 rounded font-bold">
                      (₹{effectiveNetPerKg}/kg effective)
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Net Earnings Calculator Modal */}
      {calculatorMatch && (
        <NetEarningsModal
          isOpen={Boolean(calculatorMatch)}
          cropName={cropName}
          quantityKg={quantity}
          initialPricePerKg={calculatorMatch.indicativePricePerKg || 21}
          initialDistanceKm={calculatorMatch.distanceKm || 20}
          onClose={() => setCalculatorMatch(null)}
        />
      )}
    </div>
  );
}
