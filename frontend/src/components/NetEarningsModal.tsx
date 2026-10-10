// =============================================
// HARVEST BRIDGE — Net Earnings Calculator Modal
// Transparent Comparison: Expected Revenue − Transport − Handling − Fees
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Truck, Package, ShieldCheck, DollarSign, ArrowRight, HelpCircle } from 'lucide-react';
import { formatCurrency, formatWeight } from '../utils/format';
import type { NetEarningsAnalysis } from '../types';

interface NetEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
  quantityKg: number;
  initialPricePerKg?: number;
  initialDistanceKm?: number;
}

export function NetEarningsModal({
  isOpen,
  onClose,
  cropName,
  quantityKg,
  initialPricePerKg = 21,
  initialDistanceKm = 25,
}: NetEarningsModalProps) {
  const [qty, setQty] = useState(quantityKg || 1500);
  const [price, setPrice] = useState(initialPricePerKg);
  const [distance, setDistance] = useState(initialDistanceKm);
  const [transportOption, setTransportOption] = useState<'buyer_pickup' | 'farmer_delivery'>('buyer_pickup');

  // Calculation parameters
  const grossRevenue = Math.round(qty * price);
  const handlingCost = Math.round(qty * 0.50); // ₹0.50/kg
  const transportCost = transportOption === 'buyer_pickup'
    ? 0
    : Math.round(Math.max(350, distance * (qty / 100) * 1.25));
  const platformFee = 0; // 0% fee guaranteed for farmers

  const totalDeductions = transportCost + handlingCost + platformFee;
  const netEarnings = Math.max(0, grossRevenue - totalDeductions);
  const netPricePerKg = qty > 0 ? Number((netEarnings / qty).toFixed(2)) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Net Earnings Calculator
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Transparent revenue simulation for {cropName} · {formatWeight(qty)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Controls Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quantity (kg)
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="input text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Buyer Offer Price (₹/kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                className="input text-sm font-semibold"
              />
            </div>
          </div>

          {/* Transport Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Logistics & Transport Responsibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransportOption('buyer_pickup')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  transportOption === 'buyer_pickup'
                    ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-forest-600" />
                  Buyer Farm Pickup
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Buyer pays logistics (₹0 farmer freight cost)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransportOption('farmer_delivery')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  transportOption === 'farmer_delivery'
                    ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Farmer Delivery
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Farmer covers tempo freight ({distance} km)
                </div>
              </button>
            </div>
          </div>

          {transportOption === 'farmer_delivery' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Distance to Delivery Destination</span>
                <span className="text-forest-700">{distance} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-forest-600 cursor-pointer"
              />
            </div>
          )}

          {/* Breakdown Card */}
          <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200/90 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Financial Breakdown & Cost Deductions
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <DollarSign className="w-4 h-4 text-slate-500" /> Gross Expected Revenue ({formatWeight(qty)} × ₹{price}/kg)
              </span>
              <span className="font-bold text-slate-900">{formatCurrency(grossRevenue)}</span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-amber-600" /> Transport & Freight
              </span>
              <span className={`font-bold ${transportCost === 0 ? 'text-forest-700' : 'text-rose-600'}`}>
                {transportCost === 0 ? '₹0 (Buyer Covers)' : `- ${formatCurrency(transportCost)}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Package className="w-4 h-4 text-slate-500" /> Handling, Weighing & Bagging (₹0.50/kg)
              </span>
              <span className="font-bold text-rose-600">- {formatCurrency(handlingCost)}</span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-forest-600" /> Harvest Bridge Platform Fee (0%)
              </span>
              <span className="font-bold text-forest-700">₹0 (Zero Fee)</span>
            </div>

            {/* Total Net Return Box */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-semibold">Estimated Net Farmer Return</div>
                <div className="text-2xl font-extrabold text-forest-800 font-display">
                  {formatCurrency(netEarnings)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-semibold">Effective Net Price</div>
                <div className="text-xl font-bold text-slate-900">
                  ₹{netPricePerKg} <span className="text-xs font-normal text-slate-500">/ kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button onClick={onClose} className="btn-primary text-xs py-2 px-6">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
