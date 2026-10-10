// =============================================
// HARVEST BRIDGE — Master Role-Aware Layout
// Supports Farmer, Buyer, Organization, and Admin Portals,
// Live Language Switching (EN / తెలుగు), and Voice Readout
// =============================================

import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sprout, Users, TrendingUp, MessageCircle,
  Bell, Menu, X, Zap, BarChart3, Map, LogOut,
  Leaf, User as UserIcon, Truck, Building2, ShieldCheck,
  Volume2, VolumeX, Globe, Store, ChevronDown
} from 'lucide-react';
import { useApp, PERSONA_PRESETS } from '../hooks/useApp';
import { NotificationPanel } from './NotificationPanel';
import { AnimatedPageWrapper } from './AnimatedPageWrapper';
import type { UserRole, Language } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state, dispatch, t, speakText, stopSpeaking } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const user = state.currentUser;
  const currentRole = user?.role || 'farmer';
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  // Build Dynamic Role-Aware Navigation
  const getNavItems = () => {
    const common = [
      { path: '/dashboard', icon: LayoutDashboard, label: t('navDashboard') },
      { path: '/crops', icon: Sprout, label: t('navMyCrops') },
      { path: '/check-risk', icon: Zap, label: t('navCheckRisk'), badge: 'AI' },
      { path: '/matches', icon: Users, label: t('navBuyerMatches') },
      { path: '/orders', icon: Truck, label: t('navOrders'), badge: state.orders.length ? String(state.orders.length) : undefined },
      { path: '/market', icon: Store, label: t('navMarketMandi') },
      { path: '/rescue', icon: Building2, label: t('navRescueNetwork') },
      { path: '/radar', icon: BarChart3, label: t('navSurplusRadar') },
      { path: '/map', icon: Map, label: t('navMapView') },
      { path: '/assistant', icon: MessageCircle, label: t('navAiAssistant') },
      { path: '/impact', icon: TrendingUp, label: t('kpiTotalValueProtected') },
    ];

    if (currentRole === 'admin') {
      common.push({ path: '/admin', icon: ShieldCheck, label: t('navAdminPortal'), badge: 'ADMIN' });
    }

    return common;
  };

  const navItems = getNavItems();

  const handleRoleSwitch = (role: UserRole) => {
    dispatch({ type: 'SWITCH_ROLE', payload: role });
    setPersonaMenuOpen(false);
  };

  const toggleLanguage = () => {
    const nextLang: Language = state.language === 'en' ? 'te' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  const handleAudioTour = () => {
    if (state.isSpeaking) {
      stopSpeaking();
    } else {
      const text = state.language === 'te'
        ? `హార్వెస్ట్ బ్రిడ్జ్ కి స్వాగతం. మీ డాష్‌బోర్డ్‌లో పంటల మిగులు ప్రమాదాలు, మార్కెట్ ధరలు మరియు కొనుగోలుదారుల వివరాలు పర్యవేక్షించబడుతున్నాయి.`
        : `Welcome to Harvest Bridge. Your agricultural surplus management system is actively monitoring regional supply pressure, verified mandi benchmarks, and buyer purchase orders.`;
      speakText(text);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:inset-auto shadow-sm flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center shadow-sm text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-base leading-tight flex items-center gap-1.5">
                Harvest Bridge
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-tight">
                {t('tagline')}
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn-ghost p-1.5 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Switcher Box */}
        <div className="p-3 mx-3 mt-3 bg-slate-100/90 rounded-2xl border border-slate-200 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
              Active Persona
            </span>
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="text-[11px] font-bold text-forest-700 hover:text-forest-800 flex items-center gap-0.5"
            >
              Switch <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.name}
              </div>
              <div className="text-[11px] text-slate-600 capitalize font-medium flex items-center gap-1">
                {user?.role} · {user?.district || 'Chittoor'}
              </div>
            </div>
          </div>

          {/* Persona Menu Popup */}
          <AnimatePresence>
            {personaMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1"
              >
                {(['farmer', 'buyer', 'organization', 'admin'] as UserRole[]).map((role) => {
                  const preset = PERSONA_PRESETS[role];
                  const isCurrent = currentRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-forest-50 text-forest-800 font-bold border border-forest-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="capitalize">{preset.name}</div>
                        <div className="text-[10px] text-slate-600 capitalize">{role} role</div>
                      </div>
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-forest-600" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map(({ path, icon: Icon, label, badge }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'text-forest-800 bg-forest-50 border border-forest-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-forest-700' : 'text-slate-500'}`} />
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                      badge === 'AI' || badge === 'ADMIN'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-forest-600 text-white'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/50">
          {/* Audio tour button */}
          <button
            onClick={handleAudioTour}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              state.isSpeaking
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
          >
            <span className="flex items-center gap-2">
              {state.isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-forest-600" />}
              {state.isSpeaking ? 'Stop Audio Guidance' : t('speakText')}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-600">{state.language}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('navSignOut')}
          </button>
        </div>
      </aside>

      {/* ── Overlay for mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-ghost p-1.5 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-forest-600 text-white flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-sm text-slate-900">Harvest Bridge</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              title="Toggle Telugu / English"
            >
              <Globe className="w-3.5 h-3.5 text-forest-600" />
              <span>{state.language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="btn-ghost p-2 relative text-slate-600 hover:text-slate-900"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationPanel
                  notifications={state.notifications}
                  onClose={() => setNotifOpen(false)}
                  onMarkRead={(id) => dispatch({ type: 'MARK_READ', payload: id })}
                />
              )}
            </div>

            {/* Profile Avatar Quick Link */}
            {user && (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-forest-600 text-white text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-forest-400 transition-all shadow-xs"
                title={user.name}
              >
                {user.name.charAt(0)}
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <AnimatePresence mode="wait">
            <AnimatedPageWrapper key={location.pathname}>
              {children}
            </AnimatedPageWrapper>
          </AnimatePresence>
        </main>

        {/* Mobile bottom quick bar */}
        <nav className="lg:hidden bg-white border-t border-slate-200 grid grid-cols-5 px-1 py-1 safe-area-pb">
          {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg transition-colors ${
                  active ? 'text-forest-700 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] truncate max-w-[50px]">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
