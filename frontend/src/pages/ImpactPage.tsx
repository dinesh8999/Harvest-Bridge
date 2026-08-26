// =============================================
// HARVEST BRIDGE — Impact Dashboard (Light Mode)
// =============================================

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Leaf, Package, DollarSign, Users, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { DEMO_IMPACT_EVENTS } from '../data/demoData';
import { formatCurrency, formatWeight } from '../utils/format';

function buildTimelineData() {
  const events = [...DEMO_IMPACT_EVENTS].reverse();
  let cumQty = 0;
  let cumVal = 0;
  return events.map((e, i) => {
    cumQty += e.quantityRedirected ?? 0;
    cumVal += e.estimatedValueProtected ?? 0;
    return {
      day: `Day ${i + 1}`,
      quantity: cumQty,
      value: cumVal,
    };
  });
}

const CROP_BREAKDOWN = [
  { name: 'Tomato', value: 4500, color: '#ef4444' },
  { name: 'Potato', value: 2000, color: '#f59e0b' },
  { name: 'Chilli', value: 600, color: '#16a34a' },
  { name: 'Brinjal', value: 1000, color: '#8b5cf6' },
  { name: 'Onion', value: 1600, color: '#2563eb' },
  { name: 'Other', value: 800, color: '#64748b' },
];

const BUYER_BREAKDOWN = [
  { name: 'Processors', value: 4, color: '#16a34a' },
  { name: 'Institutions', value: 3, color: '#0d9488' },
  { name: 'Restaurants', value: 3, color: '#d97706' },
  { name: 'Retailers', value: 5, color: '#7c3aed' },
  { name: 'NGOs', value: 3, color: '#e11d48' },
];

const SURPLUS_PRESSURE = [
  { crop: 'Tomato', pressure: 78 },
  { crop: 'Onion', pressure: 54 },
  { crop: 'Chilli', pressure: 39 },
  { crop: 'Brinjal', pressure: 52 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-md text-xs">
        <div className="font-bold text-slate-900 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ImpactPage() {
  const timelineData = buildTimelineData();
  const totalQty = DEMO_IMPACT_EVENTS.reduce((acc, e) => acc + (e.quantityRedirected ?? 0), 0);
  const totalVal = DEMO_IMPACT_EVENTS.reduce((acc, e) => acc + (e.estimatedValueProtected ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Leaf className="w-7 h-7 text-forest-600" />
          Impact & Loss Prevention Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Tracking economic value protected and crop yield redirected across district FPOs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produce Redirected', value: formatWeight(totalQty), icon: Package, color: 'text-emerald-700', bg: 'bg-emerald-50/70 border-emerald-200' },
          { label: 'Value Protected', value: formatCurrency(totalVal), icon: DollarSign, color: 'text-amber-700', bg: 'bg-amber-50/70 border-amber-200' },
          { label: 'Active Farmers', value: '42 Farmers', icon: Users, color: 'text-sky-700', bg: 'bg-sky-50/70 border-sky-200' },
          { label: 'Buyer Network', value: '18 Buyers', icon: MapPin, color: 'text-purple-700', bg: 'bg-purple-50/70 border-purple-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card border ${bg}`}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`font-display text-xl sm:text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-slate-600 text-xs font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-600" />
            Produce Redirected Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="qtyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="quantity" name="Quantity (kg)" stroke="#16a34a" fill="url(#qtyGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Surplus pressure */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Surplus Pressure by Crop
          </h3>
          <div className="space-y-3.5">
            {SURPLUS_PRESSURE.map(({ crop, pressure }) => (
              <div key={crop} className="flex items-center gap-3 text-sm">
                <div className="w-20 text-slate-700 font-semibold flex-shrink-0">{crop}</div>
                <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pressure}%`,
                      background: pressure >= 70 ? '#dc2626' : pressure >= 50 ? '#d97706' : '#16a34a',
                    }}
                  />
                </div>
                <div className={`w-10 text-right font-bold text-xs ${
                  pressure >= 70 ? 'text-rose-700' : pressure >= 50 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {pressure}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Crop breakdown */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-6">Crop Categories Redirected</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={CROP_BREAKDOWN} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {CROP_BREAKDOWN.map(({ color }, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {CROP_BREAKDOWN.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-slate-700 font-medium">{name}</span>
                  </div>
                  <span className="text-slate-900 font-bold">{(value / 1000).toFixed(1)}t</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buyer demand */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-6">Buyer Demand Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BUYER_BREAKDOWN} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={85} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Matches" radius={[0, 6, 6, 0]}>
                {BUYER_BREAKDOWN.map(({ color }, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent events table ── */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Recent Crop Redirections</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-slate-600 py-3 px-4 font-semibold">Farmer</th>
                <th className="text-left text-slate-600 py-3 px-4 font-semibold">Crop</th>
                <th className="text-left text-slate-600 py-3 px-4 font-semibold">Buyer</th>
                <th className="text-right text-slate-600 py-3 px-4 font-semibold">Redirected</th>
                <th className="text-right text-slate-600 py-3 px-4 font-semibold">Value Protected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_IMPACT_EVENTS.slice(0, 6).map((event) => (
                <tr key={event._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-900 font-medium">{event.farmerName}</td>
                  <td className="py-3 px-4 text-slate-700">{event.cropName}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-[180px] truncate">{event.buyerName}</td>
                  <td className="py-3 px-4 text-forest-700 text-right font-bold">{formatWeight(event.quantityRedirected!)}</td>
                  <td className="py-3 px-4 text-amber-700 text-right font-bold">{formatCurrency(event.estimatedValueProtected!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center">
        All metrics shown are simulated demo data. Harvest Bridge does not claim these as real-world results.
      </div>
    </div>
  );
}
