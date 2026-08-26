// =============================================
// HARVEST BRIDGE — Login / Register Pages (Light Mode)
// =============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { UserRole } from '../types';

export function LoginPage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    dispatch({
      type: 'SET_USER',
      payload: {
        _id: 'farmer-001',
        name: phone === '9876543001' ? 'Ravi Kumar' : 'Farmer',
        phone,
        role: 'farmer',
        language: 'te',
        location: 'Palamaner, Chittoor',
        district: 'Chittoor',
        createdAt: new Date().toISOString(),
      },
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-forest-600 flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 text-lg">Harvest Bridge</div>
            <div className="text-xs text-slate-500">Predict · Redirect · Protect</div>
          </div>
        </Link>

        <div className="card shadow-sm">
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Sign In</h1>
          <p className="text-slate-500 text-sm mb-6">Access your farm surplus management dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1.5 text-forest-600" />Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543001"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1.5 text-forest-600" />Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6 font-medium">
          New to Harvest Bridge?{' '}
          <Link to="/register" className="text-forest-700 font-bold hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', role: 'farmer' as UserRole, location: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    dispatch({
      type: 'SET_USER',
      payload: {
        _id: `user-${Date.now()}`,
        name: form.name,
        phone: form.phone,
        role: form.role,
        language: 'en',
        location: form.location,
        createdAt: new Date().toISOString(),
      },
    });
    navigate(form.role === 'farmer' ? '/dashboard' : '/matches');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-forest-600 flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 text-lg">Harvest Bridge</span>
        </Link>

        <div className="card shadow-sm">
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
          <p className="text-slate-500 text-sm mb-6">Join the platform. Demo data will be populated immediately.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
              <input className="input" required placeholder="e.g. Ravi Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
              <input className="input" required type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">I am a *</label>
              <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <option value="farmer">Farmer / FPO Producer</option>
                <option value="buyer">Buyer / Processor / Institution</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location / District *</label>
              <input className="input" required placeholder="e.g. Chittoor, Andhra Pradesh" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
              <input className="input" required type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-700 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
