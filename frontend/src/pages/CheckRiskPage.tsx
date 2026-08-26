// =============================================
// HARVEST BRIDGE — Check Risk Page (With Geological Location Map)
// =============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sprout, MapPin, Scale, Calendar, DollarSign, Upload,
  Zap, ChevronRight, Loader2,
  CheckCircle, Info, Globe, Compass, Mountain, Droplets
} from 'lucide-react';
import { calculateSurplusRisk } from '../services/ai/surplusEngine';
import { findBuyerMatches } from '../services/ai/matchingEngine';
import { useApp } from '../hooks/useApp';
import { RiskResultPanel } from '../components/RiskResultPanel';
import { GeologicalMapModal, GEOLOGICAL_LOCATIONS, type GeologicalLocation } from '../components/GeologicalMapModal';
import type { BuyerMatch } from '../types';

const CROPS = ['Tomato', 'Onion', 'Chilli', 'Brinjal', 'Capsicum', 'Potato', 'Leafy Greens', 'Mango', 'Banana', 'Garlic'];
const LOCATIONS = [
  'Murukumbattu, Chittoor', 'Murukambattu, Chittoor',
  'Chittoor', 'Palamaner, Chittoor', 'Kuppam, Chittoor', 'Madanapalle, Chittoor',
  'Tirupati', 'Puttur, Chittoor', 'Nagari, Tirupati', 'Bangarupalem, Chittoor',
  'Thamballapalle, Chittoor', 'Srikalahasti, Tirupati',
];

const LOADING_STEPS = [
  'Reading crop information...',
  'Estimating supply pressure...',
  'Calculating rescue window...',
  'Finding nearby demand...',
  'Ranking buyer matches...',
];

interface FormData {
  cropName: string;
  location: string;
  quantity: number;
  expectedHarvestDate: string;
  estimatedPrice: number;
}

function getDefaultHarvestDate(daysFromNow = 5): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export default function CheckRiskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useApp();
  const isDemoParam = searchParams.get('demo') === 'true';

  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [loadingStep, setLoadingStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any | null>(null);
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [isGeoMapOpen, setIsGeoMapOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    cropName: isDemoParam ? 'Tomato' : '',
    location: isDemoParam ? 'Palamaner, Chittoor' : '',
    quantity: isDemoParam ? 2000 : 0,
    expectedHarvestDate: getDefaultHarvestDate(5),
    estimatedPrice: isDemoParam ? 22 : 0,
  });

  const geoInfo = GEOLOGICAL_LOCATIONS.find((l) =>
    l.name.toLowerCase().includes((form.location || '').toLowerCase())
  ) || (form.location ? GEOLOGICAL_LOCATIONS[0] : undefined);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.cropName || !form.location || !form.quantity || !form.estimatedPrice) return;

    setStep('loading');
    setLoadingStep(0);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(i + 1);
      await new Promise((res) => setTimeout(res, 350));
    }

    const risk = calculateSurplusRisk({
      cropName: form.cropName,
      location: form.location,
      quantity: form.quantity,
      expectedHarvestDate: form.expectedHarvestDate,
      estimatedPrice: form.estimatedPrice,
    });

    const buyerMatches = findBuyerMatches({
      cropName: form.cropName,
      location: form.location,
      quantity: form.quantity,
      expectedHarvestDate: form.expectedHarvestDate,
      estimatedPrice: form.estimatedPrice,
    });

    setPrediction(risk);
    setMatches(buyerMatches);
    setStep('result');

    dispatch({
      type: 'SET_PREDICTION',
      payload: {
        prediction: risk,
        matches: buyerMatches,
        crop: {
          cropName: form.cropName,
          location: form.location,
          quantity: form.quantity,
          expectedHarvestDate: form.expectedHarvestDate,
          estimatedPrice: form.estimatedPrice,
        },
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'warning',
        title: '⚠️ Risk Scan Complete',
        message: `${form.cropName} surplus risk calculated: ${risk.surplusRisk}%. ${buyerMatches.length} buyers matched.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
  };

  useEffect(() => {
    if (isDemoParam) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isDemoParam]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // ─── Result Step ──────────────────────────────
  if (step === 'result' && prediction) {
    return (
      <RiskResultPanel
        prediction={prediction}
        matches={matches}
        formData={form}
        onReset={() => setStep('form')}
      />
    );
  }

  // ─── Loading Step ─────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-forest-900/60 border-2 border-forest-500/60 flex items-center justify-center mx-auto shadow-glow-green">
            <Loader2 className="w-10 h-10 text-forest-400 animate-spin" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-1">
              Analyzing Crop Risk...
            </h2>
            <p className="text-slate-400 text-sm">
              Harvest Bridge AI is calculating risk factors and finding matches
            </p>
          </div>

          {/* Loading steps */}
          <div className="card space-y-3 text-left border-slate-800">
            {LOADING_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {i < loadingStep ? (
                    <CheckCircle className="w-5 h-5 text-forest-400" />
                  ) : i === loadingStep ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
                  )}
                </div>
                <span className={i <= loadingStep ? 'text-slate-200' : 'text-slate-600'}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Form Step ────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800 font-medium">Check Crop Risk</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-2">
            Check My Crop Risk
          </h1>
          <p className="text-slate-600">
            Enter your crop details and AI will predict surplus risk, find buyers, and calculate your Rescue Window.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Crop name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Sprout className="w-4 h-4 inline mr-1.5 text-forest-600" />
              Crop *
            </label>
            <select
              value={form.cropName}
              onChange={(e) => setForm({ ...form, cropName: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a crop...</option>
              {CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location + Geological Map Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                <MapPin className="w-4 h-4 inline mr-1.5 text-forest-600" />
                Farm Location *
              </label>
              <button
                type="button"
                onClick={() => setIsGeoMapOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-forest-600" />
                Select on Geological Map
              </button>
            </div>

            <input
              type="text"
              list="location-list-options"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Type village e.g. Murukumbattu, Chittoor..."
              className="input"
              required
            />
            <datalist id="location-list-options">
              {LOCATIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>

            {/* Geological Information Badge */}
            {geoInfo && (
              <div className="mt-2.5 p-3.5 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5 shadow-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Compass className="w-3.5 h-3.5 text-forest-600" />
                    Geological Soil Profile
                  </div>
                  <span className="text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-md border border-forest-200">
                    VERIFIED ZONE
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: geoInfo.soilColor }} />
                    {geoInfo.soilType}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-sky-600" />
                    {geoInfo.elevation} Elevation
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                    {geoInfo.waterTable} Water Table
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity + Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Scale className="w-4 h-4 inline mr-1.5 text-forest-600" />
                Quantity (kg) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 2000"
                value={form.quantity || ''}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1.5 text-forest-600" />
                Price (₹/kg) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 22"
                value={form.estimatedPrice || ''}
                onChange={(e) => setForm({ ...form, estimatedPrice: Number(e.target.value) })}
                className="input"
                required
              />
            </div>
          </div>

          {/* Harvest date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5 text-forest-600" />
              Expected Harvest Date *
            </label>
            <input
              type="date"
              value={form.expectedHarvestDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, expectedHarvestDate: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Image upload (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1.5 text-forest-600" />
              Crop / Field Photo (Optional)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-forest-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white"
            >
              {imagePreview ? (
                <div className="flex items-center gap-3 justify-center">
                  <img src={imagePreview} alt="Crop preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                  <span className="text-sm text-forest-700 font-semibold">Photo attached — ready for visual check</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-sm text-slate-700 font-medium">Click to upload crop or field photo</div>
                  <div className="text-xs text-slate-400 mt-1">PNG, JPG up to 10 MB</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="btn-primary w-full py-4 text-base rounded-2xl mt-6 shadow-md"
          >
            <Zap className="w-5 h-5 text-amber-300" />
            Calculate Surplus Risk & Find Buyers
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 justify-center">
          <Info className="w-4 h-4 text-slate-400" />
          Predictions use historical seasonality, crop perishability index, and buyer capacity rules.
        </div>
      </div>

      {/* Geological Location Map Modal */}
      <GeologicalMapModal
        isOpen={isGeoMapOpen}
        onClose={() => setIsGeoMapOpen(false)}
        onSelectLocation={(loc: GeologicalLocation) => {
          setForm((prev) => ({ ...prev, location: loc.name }));
        }}
        currentLocationName={form.location}
      />
    </div>
  );
}
