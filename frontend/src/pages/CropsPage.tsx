// =============================================
// HARVEST BRIDGE — Crop Listings & Inventory Management
// Create, View, Edit, Pause, Close listings with real inventory tracking
// =============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, Plus, Clock, ArrowRight, Edit3, Pause, Play,
  XCircle, CheckCircle2, ShieldAlert, DollarSign, Package,
  MapPin, X, Save, AlertTriangle
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { formatCurrency, formatWeight, getRiskColor } from '../utils/format';
import type { CropListing, ListingStatus } from '../types';

const CROP_EMOJIS: Record<string, string> = {
  'Tomato': '🍅', 'Onion': '🧅', 'Chilli': '🌶️',
  'Brinjal': '🍆', 'Capsicum': '🫑', 'Potato': '🥔',
  'Leafy Greens': '🥬', 'Mango': '🥭', 'Banana': '🍌',
  'Garlic': '🧄',
};

export default function CropsPage() {
  const { state, dispatch, t } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropListing | null>(null);

  // Form state for creating / editing
  const [form, setForm] = useState({
    cropName: 'Tomato',
    variety: 'Hybrid Sahu',
    category: 'Solanaceous',
    location: state.currentUser?.location || 'Palamaner, Chittoor',
    quantity: 2000,
    expectedHarvestDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    minAcceptablePrice: 16,
    estimatedMarketPrice: 22,
    qualityGrade: 'Grade A',
    storageType: 'Ambient Farm Shed',
    shelfLifeDays: 5,
    notes: 'Micro-sprinkler irrigated, ready for direct harvest.',
  });

  const crops = state.crops;
  const filteredCrops = filterStatus === 'all'
    ? crops
    : crops.filter((c) => c.status === filterStatus);

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!form.cropName || qty <= 0) return;

    const newListing: CropListing = {
      _id: `listing-${Date.now()}`,
      farmerId: state.currentUser?._id || 'farmer-001',
      farmerName: state.currentUser?.name || 'Farmer',
      cropName: form.cropName,
      variety: form.variety,
      category: form.category,
      location: form.location,
      district: form.location.split(',')[1]?.trim() || 'Chittoor',
      totalQuantity: qty,
      availableQuantity: qty,
      reservedQuantity: 0,
      soldQuantity: 0,
      wastedQuantity: 0,
      unit: 'kg',
      expectedHarvestDate: form.expectedHarvestDate,
      qualityGrade: form.qualityGrade,
      storageType: form.storageType,
      shelfLifeDays: Number(form.shelfLifeDays),
      minAcceptablePrice: Number(form.minAcceptablePrice),
      estimatedMarketPrice: Number(form.estimatedMarketPrice),
      photos: [],
      status: 'active',
      surplusRiskScore: form.cropName.toLowerCase().includes('tomato') ? 78 : 45,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CROP', payload: newListing });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: '🌱 Crop Listing Registered',
        message: `${newListing.cropName} (${formatWeight(qty)}) registered for surplus monitoring and buyer matching.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });

    setIsAddModalOpen(false);
  };

  const handleUpdateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    dispatch({
      type: 'UPDATE_CROP',
      payload: {
        id: editingCrop._id,
        data: {
          cropName: form.cropName,
          variety: form.variety,
          location: form.location,
          totalQuantity: Number(form.quantity),
          minAcceptablePrice: Number(form.minAcceptablePrice),
          estimatedMarketPrice: Number(form.estimatedMarketPrice),
          qualityGrade: form.qualityGrade,
          storageType: form.storageType,
          notes: form.notes,
        },
      },
    });

    setEditingCrop(null);
  };

  const handleToggleStatus = (crop: CropListing) => {
    const nextStatus: ListingStatus = crop.status === 'active' ? 'paused' : 'active';
    dispatch({
      type: 'UPDATE_CROP',
      payload: {
        id: crop._id,
        data: { status: nextStatus },
      },
    });
  };

  const handleCloseListing = (id: string) => {
    dispatch({
      type: 'UPDATE_CROP',
      payload: {
        id,
        data: { status: 'closed' },
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sprout className="w-7 h-7 text-forest-600" />
            {t('navMyCrops')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your crop yields, unreserved inventory, active harvest timelines, and surplus protection
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex gap-1 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
            {['all', 'active', 'completed', 'paused'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setForm({
                cropName: 'Tomato',
                variety: 'Hybrid Sahu',
                category: 'Solanaceous',
                location: state.currentUser?.location || 'Palamaner, Chittoor',
                quantity: 2000,
                expectedHarvestDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
                minAcceptablePrice: 16,
                estimatedMarketPrice: 22,
                qualityGrade: 'Grade A',
                storageType: 'Ambient Farm Shed',
                shelfLifeDays: 5,
                notes: '',
              });
              setIsAddModalOpen(true);
            }}
            className="btn-primary text-xs py-2.5 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('addNewCrop')}
          </button>
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid sm:grid-cols-2 gap-6">
        {filteredCrops.map((crop) => {
          const daysLeft = Math.max(0, Math.ceil(
            (new Date(crop.expectedHarvestDate).getTime() - Date.now()) / 86400000
          ));
          const isHighRisk = crop.surplusRiskScore >= 70;
          const isMediumRisk = crop.surplusRiskScore >= 50 && crop.surplusRiskScore < 70;

          return (
            <motion.div
              key={crop._id}
              whileHover={{ y: -3 }}
              className={`card border transition-all ${
                crop.status === 'paused' ? 'border-slate-300 bg-slate-50/80 opacity-75' :
                crop.status === 'completed' ? 'border-emerald-200 bg-emerald-50/20' :
                isHighRisk ? 'border-rose-300 bg-rose-50/20' :
                isMediumRisk ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                    {CROP_EMOJIS[crop.cropName] ?? '🌿'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      {crop.cropName}
                      <span className="text-xs font-normal text-slate-500 font-mono">#{crop._id}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {crop.variety || 'Standard'} · {crop.location}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    crop.status === 'paused' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                    crop.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    isHighRisk ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {crop.status === 'paused' ? 'PAUSED' :
                     crop.status === 'completed' ? 'COMPLETED' :
                     `${crop.surplusRiskScore}% SURPLUS RISK`}
                  </span>
                </div>
              </div>

              {/* Multi-stage Inventory Counters */}
              <div className="grid grid-cols-4 gap-2 py-3 px-3 bg-white rounded-2xl border border-slate-200 text-center mb-4 text-xs shadow-xs">
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">Total Yield</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{formatWeight(crop.totalQuantity)}</div>
                </div>
                <div>
                  <div className="text-forest-700 font-medium text-[10px]">Available</div>
                  <div className="font-extrabold text-forest-700 mt-0.5">{formatWeight(crop.availableQuantity)}</div>
                </div>
                <div>
                  <div className="text-amber-700 font-medium text-[10px]">Reserved</div>
                  <div className="font-extrabold text-amber-700 mt-0.5">{formatWeight(crop.reservedQuantity || 0)}</div>
                </div>
                <div>
                  <div className="text-sky-700 font-medium text-[10px]">Sold / Delivered</div>
                  <div className="font-extrabold text-sky-700 mt-0.5">{formatWeight(crop.soldQuantity || 0)}</div>
                </div>
              </div>

              {/* Price and Risk Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Surplus Risk Level</span>
                  <span className={getRiskColor(crop.surplusRiskScore)}>{crop.surplusRiskScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${crop.surplusRiskScore}%`,
                      backgroundColor: isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
              </div>

              {/* Harvest details */}
              <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-forest-600" /> Harvest in <strong>{daysLeft} days</strong> ({crop.expectedHarvestDate})
                </span>
                <span>Reserve: <strong>₹{crop.minAcceptablePrice}/kg</strong></span>
              </div>

              {/* Actions toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingCrop(crop);
                      setForm({
                        cropName: crop.cropName,
                        variety: crop.variety || '',
                        category: crop.category || '',
                        location: crop.location,
                        quantity: crop.totalQuantity,
                        expectedHarvestDate: crop.expectedHarvestDate,
                        minAcceptablePrice: crop.minAcceptablePrice,
                        estimatedMarketPrice: crop.estimatedMarketPrice,
                        qualityGrade: crop.qualityGrade,
                        storageType: crop.storageType,
                        shelfLifeDays: crop.shelfLifeDays,
                        notes: crop.notes || '',
                      });
                    }}
                    className="btn-ghost p-1.5 text-xs text-slate-600 hover:text-slate-900"
                    title="Edit Listing"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(crop)}
                    className="btn-ghost p-1.5 text-xs text-slate-600 hover:text-slate-900"
                    title={crop.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
                  >
                    {crop.status === 'active' ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-forest-600" />}
                  </button>

                  <button
                    onClick={() => handleCloseListing(crop._id)}
                    className="btn-ghost p-1.5 text-xs text-slate-600 hover:text-rose-600"
                    title="Close Listing"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  to={`/check-risk?crop=${crop.cropName}&location=${encodeURIComponent(crop.location)}&qty=${crop.availableQuantity}&price=${crop.estimatedMarketPrice}`}
                  className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
                >
                  Run Full Scan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── ADD CROP MODAL ── */}
      <AnimatePresence>
        {(isAddModalOpen || editingCrop) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-forest-600" />
                  {editingCrop ? 'Edit Crop Listing' : 'Register New Crop Listing'}
                </h2>
                <button
                  onClick={() => { setIsAddModalOpen(false); setEditingCrop(null); }}
                  className="btn-ghost p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingCrop ? handleUpdateCrop : handleCreateCrop} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Crop Name *</label>
                    <select
                      className="select"
                      value={form.cropName}
                      onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                    >
                      {['Tomato', 'Onion', 'Chilli', 'Brinjal', 'Capsicum', 'Potato', 'Leafy Greens', 'Mango', 'Banana', 'Garlic'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Crop Variety</label>
                    <input className="input" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expected Quantity (kg) *</label>
                    <input
                      type="number"
                      className="input"
                      required
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expected Harvest Date *</label>
                    <input
                      type="date"
                      className="input"
                      required
                      value={form.expectedHarvestDate}
                      onChange={(e) => setForm({ ...form, expectedHarvestDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Min Acceptable Reserve (₹/kg)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.minAcceptablePrice}
                      onChange={(e) => setForm({ ...form, minAcceptablePrice: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Est. Market Price (₹/kg)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.estimatedMarketPrice}
                      onChange={(e) => setForm({ ...form, estimatedMarketPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quality Grade</label>
                    <select
                      className="select"
                      value={form.qualityGrade}
                      onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                    >
                      <option value="Grade A">Grade A (Premium / Firm)</option>
                      <option value="Grade B">Grade B (Standard Market)</option>
                      <option value="Processing Grade">Processing Grade (Bulk Pulp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farm Location</label>
                    <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Storage / Irrigation Notes</label>
                  <textarea
                    className="input h-16 py-2"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setEditingCrop(null); }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    <Save className="w-4 h-4" />
                    {editingCrop ? 'Save Changes' : 'Register Crop Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
