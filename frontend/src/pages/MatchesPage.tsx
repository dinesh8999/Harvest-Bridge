// =============================================
// HARVEST BRIDGE — AI Buyer Matching & Offer Comparison Page
// Multi-factor ranked discovery, transparent Net Earnings calculation,
// and direct offer submission
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MapPin, Package, CheckCircle, DollarSign, Star,
  Phone, Calculator, ShieldCheck, ArrowRight, HelpCircle,
  Truck, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { findBuyerMatches } from '../services/ai/matchingEngine';
import { MatchScoreBreakdown } from '../components/MatchScoreBreakdown';
import { NetEarningsModal } from '../components/NetEarningsModal';
import { getCategoryLabel, formatCurrency, formatWeight } from '../utils/format';
import { useApp } from '../hooks/useApp';
import type { BuyerMatch, Offer } from '../types';

export default function MatchesPage() {
  const { state, dispatch, t } = useApp();
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [calculatorMatch, setCalculatorMatch] = useState<BuyerMatch | null>(null);

  // Active crop or fallback
  const activeListing = state.crops.find((c) => c.status === 'active') || state.crops[0];
  const cropName = state.lastPrediction?.cropName || activeListing?.cropName || 'Tomato';
  const quantity = state.lastPrediction?.quantity || activeListing?.availableQuantity || 2000;
  const location = state.lastPrediction?.location || activeListing?.location || 'Palamaner, Chittoor';
  const price = state.lastPrediction?.estimatedPrice || activeListing?.estimatedMarketPrice || 22;

  // Compute matches
  const matches: BuyerMatch[] = findBuyerMatches({
    cropName,
    location,
    quantity,
    estimatedPrice: price,
  });

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
      notes: 'Direct farm-to-buyer offer submitted via Harvest Bridge AI.',
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

  const CATEGORY_EMOJIS: Record<string, string> = {
    processor: '🏭', retailer: '🛒', restaurant: '🍽️',
    wholesaler: '📦', institution: '🏛️', ngo: '❤️', school: '🏫',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Users className="w-7 h-7 text-forest-600" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {t('aiBuyerMatchmaking')}
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          {matches.length} commercial buyers and verified organizations ranked by multi-factor suitability for{' '}
          <strong className="text-slate-800">{cropName}</strong> ({formatWeight(quantity)})
        </p>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {matches.map((match, i) => {
          const buyerId = match.buyerId || match.buyer?._id;
          const buyerName = match.buyerName || match.buyer?.name;
          const category = match.category || match.buyer?.category || 'processor';
          const distance = match.distanceKm || match.distance || 15;
          const capacity = match.capacityKg || match.buyer?.capacity || 1000;
          const pickupAvailable = match.pickupAvailable ?? match.buyer?.pickupAvailable;
          const isSent = sentTo.includes(buyerId);
          const isExpanded = expanded === buyerId;

          const indicativeGrossPrice = match.indicativePricePerKg || (match.buyer?.preferredPriceMin ? (match.buyer.preferredPriceMin + match.buyer.preferredPriceMax) / 2 : 21);
          const grossValue = quantity * indicativeGrossPrice;
          const estimatedTransport = pickupAvailable ? 0 : Math.round(distance * (quantity / 100) * 1.25);
          const estimatedHandling = Math.round(quantity * 0.5);
          const netEarnings = Math.max(0, grossValue - estimatedTransport - estimatedHandling);
          const effectiveNetPerKg = Number((netEarnings / quantity).toFixed(2));

          return (
            <motion.div
              key={buyerId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`card border transition-all ${
                match.matchScore >= 85 ? 'border-emerald-300 bg-emerald-50/20' :
                match.matchScore >= 70 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left identity */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-xs ${
                    i === 0 ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' :
                    i === 1 ? 'bg-slate-300 text-slate-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    #{i + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CATEGORY_EMOJIS[category] ?? '🏢'}</span>
                      <span className="font-bold text-slate-900 text-lg">{buyerName}</span>
                      {match.verified && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                      {getCategoryLabel(category)} · {match.location || 'Chittoor District'}
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {distance} km away
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl font-medium">
                        <Package className="w-3.5 h-3.5 text-slate-400" /> {formatWeight(capacity)} capacity
                      </span>
                      {pickupAvailable ? (
                        <span className="text-forest-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-forest-600" /> Free Farm Pickup
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-amber-600" /> Farmer Delivery
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Match & Net Return Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <div className={`font-display text-2xl font-extrabold ${
                      match.matchScore >= 85 ? 'text-emerald-700' :
                      match.matchScore >= 70 ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                      {match.matchScore}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium tracking-tight">AI Compatibility Score</div>
                  </div>

                  <div className="mt-2 text-right">
                    <div className="text-[10px] text-slate-500 font-semibold">Est. Net Return</div>
                    <div className="text-base font-extrabold text-forest-800 font-display">
                      {formatCurrency(netEarnings)} <span className="text-xs font-normal text-slate-500">(₹{effectiveNetPerKg}/kg)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Factor Score Bars */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <MatchScoreBreakdown breakdown={match.scoreBreakdown} />
              </div>

              {/* Explainable Rationale Accordion */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-forest-600" /> Why is this buyer recommended?
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        {match.reasons && match.reasons.length > 0 ? (
                          match.reasons.map((r, ri) => <li key={ri}>{r}</li>)
                        ) : (
                          <>
                            <li>Buyer actively seeks {cropName} and operates within target delivery windows.</li>
                            <li>Capacity of {formatWeight(capacity)} can absorb high volume without saturating local retail shops.</li>
                            <li>Indicative price of ₹{indicativeGrossPrice}/kg fits regional market expectations.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : buyerId)}
                    className="btn-ghost text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                  >
                    {isExpanded ? 'Hide explanation' : 'Why this buyer?'}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setCalculatorMatch(match)}
                    className="btn-ghost text-xs text-forest-700 font-semibold hover:bg-forest-50 flex items-center gap-1"
                  >
                    <Calculator className="w-3.5 h-3.5" /> Simulate Net Earnings
                  </button>
                </div>

                <div>
                  {!isSent ? (
                    <button
                      onClick={() => handleSendOffer(match)}
                      className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Advance Offer
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Offer Sent — Awaiting Response
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Calculator Modal */}
      {calculatorMatch && (
        <NetEarningsModal
          isOpen={!!calculatorMatch}
          onClose={() => setCalculatorMatch(null)}
          cropName={cropName}
          quantityKg={quantity}
          initialPricePerKg={calculatorMatch.indicativePricePerKg || 21}
          initialDistanceKm={calculatorMatch.distanceKm || calculatorMatch.distance || 20}
        />
      )}
    </div>
  );
}
