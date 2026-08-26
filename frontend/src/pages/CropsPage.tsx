// =============================================
// HARVEST BRIDGE — Crops Page (Light Mode + Framer Motion)
// =============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Plus, AlertTriangle, Clock, Zap, ArrowRight } from 'lucide-react';
import { DEMO_CROPS } from '../data/demoData';
import { calculateSurplusRisk } from '../services/ai/surplusEngine';
import { formatCurrency, formatWeight, getRiskColor } from '../utils/format';

const CROP_EMOJIS: Record<string, string> = {
  'Tomato': '🍅', 'Onion': '🧅', 'Chilli': '🌶️',
  'Brinjal': '🍆', 'Capsicum': '🫑', 'Potato': '🥔',
  'Leafy Greens': '🥬',
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

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export default function CropsPage() {
  const crops = DEMO_CROPS.map((crop) => {
    const risk = calculateSurplusRisk({
      cropName: crop.cropName!,
      location: crop.location!,
      quantity: crop.quantity!,
      expectedHarvestDate: crop.expectedHarvestDate!,
      estimatedPrice: crop.estimatedPrice!,
    });
    const daysLeft = Math.max(0, Math.ceil(
      (new Date(crop.expectedHarvestDate!).getTime() - new Date().getTime()) / 86400000
    ));
    return { ...crop, risk, daysLeft };
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 py-8 space-y-6"
    >
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-forest-600" />
            My Registered Crops
          </h1>
          <p className="text-slate-500 text-sm mt-1">{crops.length} active crop yields tracked</p>
        </div>
        <Link to="/check-risk" className="btn-primary text-sm shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Crop
        </Link>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {crops.map((crop) => {
          const riskLevel = crop.risk.surplusRisk >= 70 ? 'HIGH' : crop.risk.surplusRisk >= 50 ? 'MEDIUM' : 'LOW';
          const grossValue = crop.quantity! * crop.estimatedPrice!;

          return (
            <motion.div
              key={crop._id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className={`card-hover border ${
                riskLevel === 'HIGH' ? 'border-rose-300 bg-rose-50/20' :
                riskLevel === 'MEDIUM' ? 'border-amber-300 bg-amber-50/20' :
                'border-slate-200 bg-white'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                    {CROP_EMOJIS[crop.cropName!] ?? '🌿'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{crop.cropName}</div>
                    <div className="text-xs text-slate-500 font-medium">{crop.location}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {crop.risk.surplusRisk}% RISK
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-white rounded-xl border border-slate-200 text-center mb-4 text-xs shadow-xs">
                <div>
                  <div className="text-slate-500 font-medium">Quantity</div>
                  <div className="font-bold text-slate-900 mt-0.5">{formatWeight(crop.quantity!)}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Est. Price</div>
                  <div className="font-bold text-slate-900 mt-0.5">₹{crop.estimatedPrice}/kg</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Gross Value</div>
                  <div className="font-bold text-slate-900 mt-0.5">{formatCurrency(grossValue)}</div>
                </div>
              </div>

              {/* Risk meter */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Surplus Risk Score</span>
                  <span className={getRiskColor(crop.risk.surplusRisk)}>{crop.risk.surplusRisk}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${crop.risk.surplusRisk}%` }}
                    transition={{ duration: 1.0, ease: 'easeOut' as const }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: crop.risk.surplusRisk >= 70 ? '#ef4444' : crop.risk.surplusRisk >= 50 ? '#f59e0b' : '#22c55e'
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-forest-600" />
                  <span>Harvest in <strong className="text-slate-900">{crop.daysLeft} days</strong></span>
                </div>
                <Link
                  to={`/check-risk?demo=true`}
                  className="text-forest-700 font-bold hover:underline flex items-center gap-1"
                >
                  Check Risk
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
