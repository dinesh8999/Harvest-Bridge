// =============================================
// HARVEST BRIDGE — Matches Page (With Framer Motion Animations)
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Package, CheckCircle, DollarSign, Star, Phone } from 'lucide-react';
import { findBuyerMatches } from '../services/ai/matchingEngine';
import { MatchScoreBreakdown } from '../components/MatchScoreBreakdown';
import { getCategoryLabel } from '../utils/format';
import { useApp } from '../hooks/useApp';
import type { BuyerMatch } from '../types';

export default function MatchesPage() {
  const { state, dispatch } = useApp();
  const [sentTo, setSentTo] = useState<string[]>(state.sentInquiries);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Use last prediction matches or default demo
  const matches: BuyerMatch[] = state.lastMatches.length > 0
    ? state.lastMatches
    : findBuyerMatches({
        cropName: 'Tomato',
        location: 'Palamaner, Chittoor',
        quantity: 2000,
        expectedHarvestDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        estimatedPrice: 22,
      });

  const handleSend = (match: BuyerMatch) => {
    const id = match.buyer._id;
    setSentTo((prev) => [...prev, id]);
    dispatch({ type: 'SEND_INQUIRY', payload: id });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: '✅ Inquiry Sent',
        message: `Interest sent to ${match.buyer.name}.`,
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-forest-600" />
          AI Buyer Matchmaking
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {matches.length} registered buyers ranked by multi-factor compatibility
          {state.lastPrediction?.cropName && (
            <span className="ml-1 font-semibold text-slate-700">— {state.lastPrediction.cropName} · {state.lastPrediction.location?.split(',')[0]}</span>
          )}
        </p>
      </motion.div>

      <div className="space-y-4">
        {matches.map((match, i) => {
          const isSent = sentTo.includes(match.buyer._id);
          const isExpanded = expanded === match.buyer._id;

          return (
            <motion.div
              key={match.buyer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`card-hover border transition-all ${
                match.matchScore >= 85 ? 'border-emerald-300 bg-emerald-50/20' :
                match.matchScore >= 70 ? 'border-amber-300 bg-amber-50/20' :
                'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-xs ${
                  i === 0 ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' :
                  i === 1 ? 'bg-slate-300 text-slate-900' :
                  i === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  #{i + 1}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_EMOJIS[match.buyer.category]}</span>
                        <span className="font-bold text-slate-900 text-lg">
                          {match.buyer.name}
                        </span>
                        {i === 0 && <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">{getCategoryLabel(match.buyer.category)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-display text-2xl sm:text-3xl font-extrabold ${
                        match.matchScore >= 85 ? 'text-emerald-700' :
                        match.matchScore >= 70 ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {match.matchScore}%
                      </div>
                      <div className="text-xs text-slate-500 font-medium">compatibility</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />{match.distance} km
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Package className="w-3.5 h-3.5 text-slate-500" />{match.buyer.capacity.toLocaleString()} kg capacity
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />₹{match.buyer.preferredPriceMin}–{match.buyer.preferredPriceMax}/kg
                    </span>
                    {match.buyer.pickupAvailable && (
                      <span className="text-forest-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ✓ Pickup Available
                      </span>
                    )}
                  </div>

                  {/* Score breakdown bars */}
                  <div className="mt-4">
                    <MatchScoreBreakdown breakdown={match.scoreBreakdown} />
                  </div>

                  {/* Recommendation details accordion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                          {match.recommendation}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    {!isSent ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(match)}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Send Interest
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Inquiry Sent — Awaiting Response
                      </motion.div>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : match.buyer._id)}
                      className="btn-ghost text-xs py-2 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      {isExpanded ? 'Hide explanation' : 'Why this buyer?'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <div className="text-lg font-bold text-slate-700">No matches yet</div>
          <div className="text-sm mt-1">Run a crop risk check to find matched buyers.</div>
        </div>
      )}
    </div>
  );
}
