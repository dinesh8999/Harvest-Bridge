// =============================================
// HARVEST BRIDGE — User Profile Page (With Framer Motion Animations)
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon, Phone, Mail, MapPin, Sprout,
  Shield, Bell, Save, CheckCircle, Sliders, Globe,
  TrendingUp, Award, Droplets, Wheat
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { UserRole, Language } from '../types';

const CROPS_LIST = [
  'Tomato', 'Onion', 'Chilli', 'Brinjal', 'Capsicum',
  'Potato', 'Leafy Greens', 'Mango', 'Banana', 'Garlic'
];

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'farm' | 'notifications' | 'activity'>('personal');

  // Form State
  const [form, setForm] = useState({
    name: user?.name ?? 'Ravi Kumar',
    phone: user?.phone ?? '9876543001',
    email: user?.email ?? 'ravi.kumar@harvestbridge.org',
    role: (user?.role ?? 'farmer') as UserRole,
    language: (user?.language ?? 'te') as Language,
    location: user?.location ?? 'Palamaner, Chittoor',
    district: user?.district ?? 'Chittoor',
    farmSize: user?.farmSize ?? 4.5,
    primaryCrops: user?.primaryCrops ?? ['Tomato', 'Chilli', 'Brinjal'],
    irrigationType: user?.irrigationType ?? 'Drip Irrigation',
    smsAlerts: user?.smsAlerts ?? true,
    riskThreshold: user?.riskThreshold ?? 70,
  });

  const handleCropToggle = (crop: string) => {
    setForm((prev) => {
      const exists = prev.primaryCrops.includes(crop);
      const updated = exists
        ? prev.primaryCrops.filter((c) => c !== crop)
        : [...prev.primaryCrops, crop];
      return { ...prev, primaryCrops: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch({
      type: 'UPDATE_USER',
      payload: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        role: form.role,
        language: form.language,
        location: form.location,
        district: form.district,
        farmSize: Number(form.farmSize),
        primaryCrops: form.primaryCrops,
        irrigationType: form.irrigationType,
        smsAlerts: form.smsAlerts,
        riskThreshold: Number(form.riskThreshold),
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: '✅ Profile Updated',
        message: 'Your farmer profile & risk thresholds have been saved.',
        timestamp: new Date().toISOString(),
        read: false,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <UserIcon className="w-7 h-7 text-forest-600" />
          Farmer Account & Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your personal details, farm profile, irrigation attributes, and surplus alert preferences
        </p>
      </div>

      {/* ── Profile Summary Card ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Icon */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-24 h-24 rounded-2xl bg-forest-600 text-white font-display font-extrabold text-3xl flex items-center justify-center shadow-md flex-shrink-0 relative"
          >
            {form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white title='Verified'">
              ✓
            </span>
          </motion.div>

          {/* User Bio */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="font-display text-2xl font-bold text-slate-900">{form.name}</h2>
              <span className="bg-forest-100 text-forest-800 text-xs font-bold px-3 py-1 rounded-full border border-forest-200 uppercase">
                {form.role} Producer
              </span>
            </div>

            <p className="text-slate-600 text-sm flex items-center justify-center md:justify-start gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-forest-600" />
              {form.location}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-slate-400" />
                {form.farmSize} Acres
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Language: {form.language === 'te' ? 'Telugu (తెలుగు)' : 'English'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Harvest Bridge Member
              </span>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex md:flex-col items-center justify-around w-full md:w-48 gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Protected Yield</div>
              <div className="text-lg font-bold text-forest-700">9,900 kg</div>
            </div>
            <div className="h-8 md:h-auto md:w-full border-r md:border-r-0 md:border-b border-slate-200" />
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Income Saved</div>
              <div className="text-lg font-bold text-amber-700">₹2,02,800</div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'personal', label: 'Personal Details', icon: UserIcon },
            { id: 'farm', label: 'Farm & Produce Profile', icon: Sprout },
            { id: 'notifications', label: 'Risk & Alert Preferences', icon: Bell },
            { id: 'activity', label: 'Impact & Activity', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Forms ── */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* Tab 1: Personal Details */}
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6"
            >
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-forest-600" />
                Personal & Contact Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input pl-10"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number (SMS & WhatsApp Alerts) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      className="input pl-10"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input pl-10"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred AI & Interface Language *
                  </label>
                  <select
                    className="select"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value as Language })}
                  >
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="en">English (English)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Village / Mandal Location *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input pl-10"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Farm & Produce Profile */}
          {activeTab === 'farm' && (
            <motion.div
              key="farm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6"
            >
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest-600" />
                Farm Attributes & Cultivated Crops
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Total Farm Land Area (Acres) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      className="input pl-10"
                      value={form.farmSize}
                      onChange={(e) => setForm({ ...form, farmSize: parseFloat(e.target.value) || 0 })}
                      required
                    />
                    <Wheat className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Primary Irrigation Source *
                  </label>
                  <div className="relative">
                    <select
                      className="select pl-10"
                      value={form.irrigationType}
                      onChange={(e) => setForm({ ...form, irrigationType: e.target.value })}
                    >
                      <option value="Drip Irrigation">Drip Irrigation System</option>
                      <option value="Borewell / Groundwater">Borewell / Groundwater</option>
                      <option value="Canal Irrigation">Canal Water Network</option>
                      <option value="Rainfed Only">Rainfed Agriculture</option>
                    </select>
                    <Droplets className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Crops Cultivated (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {CROPS_LIST.map((crop) => {
                    const isSelected = form.primaryCrops.includes(crop);
                    return (
                      <button
                        type="button"
                        key={crop}
                        onClick={() => handleCropToggle(crop)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-forest-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        {crop}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Risk & Alert Preferences */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6"
            >
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-forest-600" />
                Alert Trigger & Risk Preferences
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-sm">SMS & WhatsApp Warning Alerts</div>
                    <div className="text-xs text-slate-500">
                      Receive instant message alerts when regional crop surplus risk crosses your threshold.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.smsAlerts}
                      onChange={(e) => setForm({ ...form, smsAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-forest-600" />
                      <span className="font-bold text-slate-900 text-sm">Surplus Risk Warning Threshold</span>
                    </div>
                    <span className="font-extrabold text-forest-700 text-base">{form.riskThreshold}% Risk</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={form.riskThreshold}
                    onChange={(e) => setForm({ ...form, riskThreshold: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-forest-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>50% (Moderate Risk)</span>
                    <span>70% (Recommended)</span>
                    <span>90% (Critical Only)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 4: Impact & Activity */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6"
            >
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-600" />
                Agricultural Impact Overview
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Scans Performed', val: '12 Scans', icon: Sliders, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
                  { label: 'Buyers Matched', val: '18 Buyers', icon: UserIcon, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
                  { label: 'Redirected Yield', val: '9,900 kg', icon: Sprout, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                  { label: 'Income Protected', val: '₹2,02,800', icon: Award, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-2xl border ${item.bg}`}>
                    <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                    <div className={`font-display font-bold text-xl ${item.color}`}>{item.val}</div>
                    <div className="text-xs text-slate-600 font-semibold mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Save Bar ── */}
        <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Changes apply instantly across Harvest Bridge algorithms.
          </div>
          <div className="flex items-center gap-3">
            {savedSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold text-emerald-700 flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Profile Saved!
              </motion.span>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="btn-primary text-sm px-6 py-2.5"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
