// =============================================
// HARVEST BRIDGE — Landing Page (Light Mode)
// =============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, ArrowRight, Zap, TrendingDown, Users, Shield,
  BarChart3, CheckCircle, AlertTriangle,
  Sprout, Factory, ShoppingCart, Heart
} from 'lucide-react';

// ─── Animated counter ─────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(stepValue * step), target));
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{prefix}{current.toLocaleString()}{suffix}</span>;
}

// ─── Flow step ────────────────────────────────
function FlowStep({ icon: Icon, label, color, delay }: { icon: any; label: string; color: string; delay: number }) {
  return (
    <div
      className="flex flex-col items-center gap-2 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs text-slate-700 font-bold text-center">{label}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden text-slate-900 animate-fade-in">

      {/* ── Header ──────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg">Harvest Bridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2.5">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────── */}
      <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-forest-100/60 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-[90px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold mb-8 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-forest-600" />
              AI-Powered Agricultural Surplus Prevention
            </div>

            {/* Main headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 animate-slide-up">
              Stop predicting crop waste{' '}
              <span className="text-forest-600">after it happens.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-700 mb-4 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up">
              Predict surplus before harvest. Find buyer demand before crops lose sellable value.
            </p>
            <p className="text-slate-600 text-base mb-10 max-w-xl mx-auto animate-slide-up">
              <span className="text-forest-700 font-bold">Harvest Bridge</span> uses AI algorithms to identify regional surplus risks early,
              match farmers with verified buyers, and prevent post-harvest economic loss.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
              <Link
                to="/check-risk"
                className="btn-primary text-base px-8 py-4 rounded-2xl gap-3 w-full sm:w-auto font-bold"
              >
                <Zap className="w-5 h-5 text-amber-300" />
                Check My Crop Risk
              </Link>
              <Link
                to="/impact"
                className="btn-secondary text-base px-8 py-4 rounded-2xl w-full sm:w-auto font-bold"
              >
                <BarChart3 className="w-5 h-5 text-slate-600" />
                Explore Platform Impact
              </Link>
            </div>

            {/* Hero flow visualization */}
            <div className="card bg-white/90 border-slate-200 max-w-3xl mx-auto shadow-sm p-6">
              <div className="text-xs text-slate-500 text-center mb-6 font-bold uppercase tracking-wider">
                The Harvest Bridge Journey
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                {[
                  { icon: Sprout, label: 'Field Harvest', color: 'bg-forest-600' },
                  { icon: BarChart3, label: 'AI Prediction', color: 'bg-sky-600' },
                  { icon: AlertTriangle, label: 'Surplus Alert', color: 'bg-amber-600' },
                  { icon: Users, label: 'Buyer Match', color: 'bg-purple-600' },
                  { icon: Leaf, label: 'Rescue Window', color: 'bg-forest-700' },
                  { icon: Shield, label: 'Value Protected', color: 'bg-emerald-600' },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <FlowStep {...step} delay={i * 80} />
                    {i < 5 && (
                      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────── */}
      <section className="py-12 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: 202800, prefix: '₹', suffix: '+', label: 'Demo Value Protected', color: 'text-emerald-700' },
              { value: 9900, suffix: ' kg', label: 'Produce Redirected', color: 'text-forest-700' },
              { value: 18, suffix: '', label: 'Successful Buyer Matches', color: 'text-sky-700' },
              { value: 14, suffix: ' km', label: 'Avg Match Radius', color: 'text-amber-700' },
            ].map(({ value, prefix, suffix, label, color }) => (
              <div key={label}>
                <div className={`font-display text-3xl lg:text-4xl font-extrabold ${color}`}>
                  <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
                </div>
                <div className="text-slate-600 text-sm font-semibold mt-1">{label}</div>
                <div className="demo-badge mx-auto mt-1.5">DEMO DATA</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem → Solution story ─────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            A crop can be healthy and{' '}
            <span className="text-rose-600">still become an economic loss.</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Agricultural losses don't only happen because crops fail in the field — they happen because
            buyers never knew the surplus harvest existed in time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <div className="card border-rose-200 bg-rose-50/30">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-700" />
              </div>
              <span className="font-bold text-rose-800">WITHOUT Harvest Bridge</span>
            </div>
            <div className="space-y-3">
              {['Farmer grows healthy yield', 'Harvest date arrives unexpectedly', 'No buyer contacted in advance', 'Local supply over-saturates district market', 'Market price crashes', 'Produce decays un-harvested', '🗑️ Spoilage — avoidable economic loss'].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${i === 6 ? 'bg-rose-600' : 'bg-slate-400'}`} />
                  <span className={`text-sm ${i === 6 ? 'text-rose-800 font-bold' : 'text-slate-600'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* With Harvest Bridge */}
          <div className="card border-emerald-200 bg-emerald-50/30">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="font-bold text-emerald-800">WITH Harvest Bridge</span>
            </div>
            <div className="space-y-3">
              {[
                'Farmer inputs expected crop harvest details',
                '🤖 AI Surplus Engine predicts pressure score',
                '⚠️ Alert: 78% surplus risk detected 5 days early',
                '🎯 Top 3 nearby buyers matched within 18 km',
                'Direct inquiry dispatched before harvest',
                '✅ Buyer confirms 1,200 kg order pickup',
                '🌱 Income protected — 0% food waste',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${i === 6 ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
                  <span className={`text-sm ${i === 6 ? 'text-emerald-900 font-bold' : 'text-slate-700 font-medium'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature highlights ──────────────────── */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
              Built around one core objective
            </h2>
            <p className="text-forest-700 text-lg font-bold italic">
              "How can we predict that a crop is likely to be economically wasted — before it happens?"
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Surplus Risk Engine',
                desc: 'Predicts surplus pressure before harvest using seasonal historical patterns, perishability, and demand signals.',
                color: 'bg-sky-50 border-sky-200 text-sky-700',
                iconBg: 'bg-sky-100',
              },
              {
                icon: Shield,
                title: 'Rescue Window™',
                desc: 'Actionable timeframe during which intervention can successfully redirect produce to buyers.',
                color: 'bg-amber-50 border-amber-200 text-amber-700',
                iconBg: 'bg-amber-100',
              },
              {
                icon: Users,
                title: 'Buyer Matchmaking',
                desc: 'AI-ranked buyer compatibility scoring evaluating capacity, distance, harvest timing, and target price.',
                color: 'bg-purple-50 border-purple-200 text-purple-700',
                iconBg: 'bg-purple-100',
              },
              {
                icon: Heart,
                title: 'Value at Risk',
                desc: 'Real-time calculation of potential financial revenue loss, rendering post-harvest impact transparent.',
                color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                iconBg: 'bg-emerald-100',
              },
            ].map(({ icon: Icon, title, desc, color, iconBg }) => (
              <div key={title} className={`card border ${color.split(' ').slice(1).join(' ')}`}>
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color.split(' ')[2]}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who uses it ─────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-slate-900 text-center mb-12">
          Connecting the regional agricultural ecosystem
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Sprout,
              role: 'Farmers & FPOs',
              desc: 'Receive pre-harvest risk scores, identify buyers, and protect farm income.',
              color: 'text-forest-700',
              bg: 'bg-emerald-50/60 border-emerald-200',
            },
            {
              icon: Factory,
              role: 'Buyers & Processors',
              desc: 'Food processing plants, retail chains, and schools source fresh produce at fair rates.',
              color: 'text-sky-700',
              bg: 'bg-sky-50/60 border-sky-200',
            },
            {
              icon: ShoppingCart,
              role: 'Communities',
              desc: 'Avoidable food waste is eliminated, delivering nutrition directly to local institutions.',
              color: 'text-amber-700',
              bg: 'bg-amber-50/60 border-amber-200',
            },
          ].map(({ icon: Icon, role, desc, color, bg }) => (
            <div key={role} className={`card border ${bg} text-center`}>
              <Icon className={`w-10 h-10 ${color} mx-auto mb-4`} />
              <h3 className="font-bold text-lg text-slate-900 mb-2">{role}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────── */}
      <section className="py-16 bg-forest-600 mx-4 sm:mx-8 lg:mx-16 rounded-3xl mb-20 relative overflow-hidden shadow-lg">
        <div className="relative text-center px-4 text-white">
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold mb-4">
            Ready to protect your crop harvest?
          </h2>
          <p className="text-forest-100 mb-8 text-base max-w-lg mx-auto">
            Experience the AI surplus prediction & matching engine.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/check-risk"
              className="flex items-center gap-2 px-8 py-4 bg-white text-forest-800 font-bold rounded-2xl hover:bg-forest-50 transition-colors shadow-md text-base"
            >
              <Zap className="w-5 h-5 text-forest-600" />
              Analyze Crop Risk Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-slate-200 py-8 px-4 text-center bg-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-forest-600" />
          <span className="font-display font-bold text-slate-900">Harvest Bridge</span>
        </div>
        <p className="text-slate-500 text-xs max-w-lg mx-auto">
          Harvest Bridge is a hackathon demo project. All predictions are AI-generated estimates
          for decision support only. This platform does not guarantee prices, buyers, or agricultural outcomes.
        </p>
      </footer>
    </div>
  );
}
