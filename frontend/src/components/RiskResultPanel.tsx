// =============================================
// HARVEST BRIDGE — Risk Result Panel (Light Mode + Motion)
// The core prediction display: Rescue Window,
// Value at Risk, Buyer Matches, Explainability
// =============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, CheckCircle,
  ChevronRight, ArrowRight, Info, Leaf, Zap, MessageCircle,
  Star, MapPin, Package, DollarSign, Phone
} from 'lucide-react';
import type { BuyerMatch } from '../types';
import { useApp } from '../hooks/useApp';
import { getRiskColor, getCategoryLabel } from '../utils/format';
import { MatchScoreBreakdown } from './MatchScoreBreakdown';
import { RescueWindowTimeline } from './RescueWindowTimeline';

interface Props {
  prediction: any;
  matches: BuyerMatch[];
  formData: any;
  onReset: () => void;
}

function AnimateNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const steps = 40;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCurrent(end); clearInterval(timer); }
      else setCurrent(Math.round(start));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{current.toLocaleString()}{suffix}</>;
}

function getRiskMeterColor(risk: number) {
  if (risk >= 70) return '#ef4444';
  if (risk >= 50) return '#f59e0b';
  return '#22c55e';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export function RiskResultPanel({ prediction, matches, formData, onReset }: Props) {
  const { dispatch, state } = useApp();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string[]>(state.sentInquiries);
  const [successBuyer, setSuccessBuyer] = useState<BuyerMatch | null>(null);

  const daysUntilHarvest = Math.max(0, Math.ceil(
    (new Date(formData.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));

  const grossValue = formData.quantity * formData.estimatedPrice;

  const handleSendInquiry = (match: BuyerMatch) => {
    const buyerId = match.buyer._id;
    setSentTo((prev) => [...prev, buyerId]);
    dispatch({ type: 'SEND_INQUIRY', payload: buyerId });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-inquiry-${Date.now()}`,
        type: 'success',
        title: '📩 Inquiry Sent',
        message: `Direct inquiry sent to ${match.buyer.name} for ${formData.quantity.toLocaleString()} kg ${formData.cropName}.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
    setSuccessBuyer(match);
  };

  // ── Success state screen ──
  if (successBuyer) {
    const qty = formData.quantity;
    const valueProtected = qty * formData.estimatedPrice;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full card border-emerald-200 text-center p-8 shadow-lg"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            🌱 Harvest Redirect Inquiry Sent!
          </h1>
          <p className="text-slate-600 mb-6 text-sm">
            Your availability inquiry was submitted to <span className="text-slate-900 font-bold">{successBuyer.buyer.name}</span>.
          </p>

          <div className="card border-emerald-200 bg-emerald-50/50 mb-6 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl font-bold text-forest-700 font-display">
                  <AnimateNumber value={qty} suffix=" kg" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Potentially Redirected</div>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl font-bold text-amber-700 font-display">
                  <AnimateNumber value={valueProtected} prefix="₹" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Estimated Value Protected</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                MATCH CONFIRMED
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-100 rounded-xl p-3 border border-slate-200 mb-6 text-left">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
            Decision-support estimate. Logistics details and pricing are confirmed directly with the buyer.
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={onReset} className="btn-primary w-full shadow-md">
              <Zap className="w-4 h-4 text-amber-300" />
              Check Another Crop
            </button>
            <a href="/impact" className="btn-secondary w-full justify-center">
              View Impact Dashboard
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50 pb-24"
    >
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Breadcrumb ── */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span className="cursor-pointer hover:text-slate-800" onClick={onReset}>Check Risk</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-medium">{formData.cropName} — {formData.location?.split(',')[0]}</span>
        </motion.div>

        {/* ── BIG RISK HEADER ── */}
        <motion.div variants={itemVariants} className={`card mb-6 border ${prediction.surplusRisk >= 70 ? 'border-rose-300 bg-rose-50/40' : prediction.surplusRisk >= 50 ? 'border-amber-300 bg-amber-50/40' : 'border-emerald-300 bg-emerald-50/40'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                AI SURPLUS PREDICTION
              </div>
              <h1 className={`font-display text-3xl sm:text-4xl font-extrabold ${getRiskColor(prediction.surplusRisk)}`}>
                SURPLUS RISK: {prediction.surplusRisk >= 70 ? 'HIGH' : prediction.surplusRisk >= 50 ? 'MEDIUM' : 'LOW'}
              </h1>
            </div>
            <div className="text-right">
              <div className="font-display text-5xl font-black text-slate-900">
                <AnimateNumber value={prediction.surplusRisk} suffix="%" />
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Risk Score</div>
            </div>
          </div>

          {/* Risk meter */}
          <div
            role="progressbar"
            aria-valuenow={prediction.surplusRisk}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Surplus Risk Percentage"
            className="risk-meter mb-2"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prediction.surplusRisk}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' as const }}
              className="risk-fill"
              style={{ backgroundColor: getRiskMeterColor(prediction.surplusRisk) }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-semibold mb-6">
            <span>LOW</span><span>MEDIUM</span><span>HIGH</span>
          </div>

          {/* AI Explanation */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-forest-700 text-xs font-bold mb-2 uppercase tracking-wider">
              <MessageCircle className="w-3.5 h-3.5 text-forest-600" />
              AI EXPLANATION
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Your {formData.cropName.toLowerCase()} crop ({formData.quantity.toLocaleString()} kg) may face increased selling pressure around the expected harvest window
              because projected local supply is higher than estimated demand. With {daysUntilHarvest} days until harvest, 
              acting now gives you the best chance to redirect surplus.
            </p>
          </div>

          {/* 4 key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3.5 text-center border border-slate-200 shadow-xs">
              <div className={`font-extrabold text-lg font-display ${getRiskColor(prediction.surplusRisk)}`}>
                {prediction.surplusRisk}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Surplus Risk</div>
            </div>
            <div className="bg-white rounded-xl p-3.5 text-center border border-slate-200 shadow-xs">
              <div className={`font-extrabold text-lg font-display ${getRiskColor(prediction.priceRisk)}`}>
                {prediction.priceRisk}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Price Drop Risk</div>
            </div>
            <div className="bg-white rounded-xl p-3.5 text-center border border-slate-200 shadow-xs">
              <div className={`font-extrabold text-sm font-display ${prediction.urgency === 'HIGH' || prediction.urgency === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
                {prediction.urgency}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Harvest Urgency</div>
            </div>
            <div className="bg-white rounded-xl p-3.5 text-center border border-slate-200 shadow-xs">
              <div className="font-extrabold text-sm font-display text-slate-900">
                {daysUntilHarvest - 2}–{daysUntilHarvest} days
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Sellable Window</div>
            </div>
          </div>
        </motion.div>

        {/* ── WHY THIS ALERT ── */}
        <motion.div variants={itemVariants} className="card mb-6">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            WHY THIS ALERT?
          </div>
          <div className="space-y-2.5">
            {prediction.reasons.map((reason: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span className="text-slate-700 text-sm font-medium">{reason}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 italic">
            Note: These are AI-generated decision-support estimates based on crop characteristics and seasonal patterns, not real-time market data.
          </div>
        </motion.div>

        {/* ── RESCUE WINDOW ── */}
        <motion.div variants={itemVariants}>
          <RescueWindowTimeline daysUntilHarvest={daysUntilHarvest} urgency={prediction.urgency} />
        </motion.div>

        {/* ── VALUE AT RISK ── */}
        <motion.div variants={itemVariants} className="card mb-6 border-amber-200 bg-amber-50/40">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              VALUE AT RISK
            </div>
            <span className="demo-badge">Estimate</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 text-sm">Expected harvest</span>
              <span className="text-slate-900 font-bold">{formData.quantity.toLocaleString()} kg</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 text-sm">Estimated price</span>
              <span className="text-slate-900 font-bold">₹{formData.estimatedPrice}/kg</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 text-sm">Potential gross value</span>
              <span className="text-amber-800 font-bold">₹{grossValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 text-sm">Quantity at risk</span>
              <span className="text-rose-700 font-bold">{prediction.quantityAtRisk.toLocaleString()} kg</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-900 font-bold text-sm">Estimated value at risk</span>
              <span className="text-rose-700 font-black text-xl font-display">
                ₹{prediction.valueAtRisk.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── BEST NEXT ACTION ── */}
        <motion.div variants={itemVariants} className="card mb-6 border-forest-200 bg-forest-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-forest-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">BEST NEXT ACTION</span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed">
            {prediction.recommendedAction}
          </p>
        </motion.div>

        {/* ── TOP BUYER MATCHES ── */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-forest-600" />
                Ranked Buyer Matches
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Matched based on location distance, crop capacity, and target price
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-forest-50 text-forest-700 border border-forest-200 rounded-full">
              {matches.length} Buyers Found
            </span>
          </div>

          <div className="space-y-4">
            {matches.map((match, i) => {
              const isSent = sentTo.includes(match.buyer._id);
              const isExpanded = selectedMatch === match.buyer._id;

              return (
                <motion.div
                  key={match.buyer._id}
                  whileHover={{ y: -2 }}
                  className={`card transition-all ${i === 0 ? 'border-forest-400 ring-1 ring-forest-400/40 bg-white shadow-md' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 font-display font-extrabold flex items-center justify-center flex-shrink-0 text-sm shadow-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{match.buyer.name}</h3>
                          {i === 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              TOP MATCH
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="capitalize text-slate-700 font-semibold">{getCategoryLabel(match.buyer.category)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-forest-600" />{match.distance} km away</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium"><Package className="w-3 h-3 text-slate-400" />Cap: {match.buyer.capacity.toLocaleString()} kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-lg font-black font-display text-forest-700">
                          {match.matchScore}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">Match Score</div>
                      </div>

                      <button
                        onClick={() => handleSendInquiry(match)}
                        disabled={isSent}
                        className={`btn-primary py-2.5 px-4 text-xs font-bold shadow-xs ${isSent ? 'opacity-60 cursor-not-allowed bg-slate-300 text-slate-600' : ''}`}
                      >
                        {isSent ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Inquiry Sent
                          </>
                        ) : (
                          <>
                            <Phone className="w-3.5 h-3.5" />
                            Send Inquiry
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Match score breakdown expander */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedMatch(isExpanded ? null : match.buyer._id)}
                      className="text-forest-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide score breakdown' : 'Why this score?'}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    <span className="text-slate-500 font-medium">Price Range: ₹{match.buyer.preferredPriceMin}–{match.buyer.preferredPriceMax}/kg</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <MatchScoreBreakdown breakdown={match.scoreBreakdown} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── RESET CTA ── */}
        <motion.div variants={itemVariants} className="text-center pt-4">
          <button onClick={onReset} className="btn-secondary py-3 px-8 text-sm font-bold shadow-xs">
            ← Check Another Crop Risk
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}
