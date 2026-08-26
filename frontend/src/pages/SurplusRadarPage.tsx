// =============================================
// HARVEST BRIDGE — Surplus Radar™ (With Framer Motion Animations)
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, Clock, AlertTriangle } from 'lucide-react';

const RADAR_DATA = {
  today: [
    { crop: 'Tomato', pressure: 78 },
    { crop: 'Onion', pressure: 45 },
    { crop: 'Chilli', pressure: 38 },
    { crop: 'Brinjal', pressure: 52 },
    { crop: 'Capsicum', pressure: 34 },
    { crop: 'Potato', pressure: 27 },
  ],
  plus3: [
    { crop: 'Tomato', pressure: 88 },
    { crop: 'Onion', pressure: 58 },
    { crop: 'Chilli', pressure: 41 },
    { crop: 'Brinjal', pressure: 60 },
    { crop: 'Capsicum', pressure: 38 },
    { crop: 'Potato', pressure: 30 },
  ],
  plus7: [
    { crop: 'Tomato', pressure: 90 },
    { crop: 'Onion', pressure: 72 },
    { crop: 'Chilli', pressure: 56 },
    { crop: 'Brinjal', pressure: 65 },
    { crop: 'Capsicum', pressure: 48 },
    { crop: 'Potato', pressure: 38 },
  ],
};

const TIMELINE_VIEW = [
  { key: 'today', label: 'Today' },
  { key: 'plus3', label: '+3 days' },
  { key: 'plus7', label: '+7 days' },
] as const;

type ViewKey = keyof typeof RADAR_DATA;

function getPressureEmoji(p: number) {
  if (p >= 80) return { emoji: '🔴', label: 'CRITICAL', color: 'text-rose-700 font-bold' };
  if (p >= 60) return { emoji: '🟠', label: 'HIGH', color: 'text-amber-700 font-bold' };
  if (p >= 40) return { emoji: '🟡', label: 'MEDIUM', color: 'text-amber-600 font-semibold' };
  return { emoji: '🟢', label: 'LOW', color: 'text-emerald-700 font-semibold' };
}

export default function SurplusRadarPage() {
  const [view, setView] = useState<ViewKey>('today');
  const data = RADAR_DATA[view];
  const radarData = data.map((d) => ({ crop: d.crop, pressure: d.pressure }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-7 h-7 text-sky-600" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Surplus Radar™</h1>
        </div>
        <p className="text-slate-600 text-sm">
          Projected surplus pressure across crops today and over the next 7 days.
          Higher pressure indicates elevated risk of regional oversupply.
        </p>
      </div>

      {/* ── Time selector ── */}
      <div className="flex gap-2">
        {TIMELINE_VIEW.map(({ key, label }) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              view === key
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Radar visualization ── */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            Regional Pressure Radar — {TIMELINE_VIEW.find((v) => v.key === view)?.label}
          </h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="crop" tick={{ fill: '#475569', fontSize: 11, fontWeight: '600' }} />
                  <Radar
                    dataKey="pressure"
                    stroke="#0284c7"
                    fill="#0284c7"
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    itemStyle={{ color: '#0284c7', fontWeight: '600' }}
                    formatter={(v: any) => [`${v}%`, 'Surplus Pressure']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Status table ── */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Crop Risk Status Breakdown
          </h3>
          <div className="space-y-3.5">
            {data.map(({ crop, pressure }) => {
              const { emoji, label, color } = getPressureEmoji(pressure);
              return (
                <div key={crop} className="flex items-center gap-3">
                  <span className="text-xl w-8 flex-shrink-0">{emoji}</span>
                  <div className="w-20 text-slate-900 font-semibold text-sm flex-shrink-0">{crop}</div>
                  <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pressure}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' as const }}
                      className="h-full rounded-full"
                      style={{
                        background: pressure >= 80 ? '#dc2626' : pressure >= 60 ? '#ea580c' : pressure >= 40 ? '#d97706' : '#16a34a',
                      }}
                    />
                  </div>
                  <div className={`w-24 text-right text-xs ${color}`}>{pressure}% {label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Timeline grid ── */}
      <div>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-500" />
          7-Day District Surplus Pressure Forecast
        </h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-slate-700 py-3 px-4 font-semibold">Crop</th>
                {TIMELINE_VIEW.map(({ label }) => (
                  <th key={label} className="text-center text-slate-700 py-3 px-4 font-semibold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['Tomato', 'Onion', 'Chilli', 'Brinjal', 'Capsicum', 'Potato'].map((crop) => (
                <tr key={crop} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-900 font-bold">{crop}</td>
                  {TIMELINE_VIEW.map(({ key }) => {
                    const pressure = RADAR_DATA[key].find((d) => d.crop === crop)?.pressure ?? 0;
                    const { emoji } = getPressureEmoji(pressure);
                    return (
                      <td key={key} className="py-3 px-4 text-center">
                        <span>{emoji}</span>
                        <span className="ml-1 text-xs font-bold text-slate-700">{pressure}%</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center">
        Surplus Radar™ shows projected pressure based on seasonal patterns and demo data. Not a real-time market feed.
      </div>
    </div>
  );
}
