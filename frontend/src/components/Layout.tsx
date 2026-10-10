// =============================================
// HARVEST BRIDGE — Master Clean Layout
// High-tech AI Agricultural SaaS aesthetic with 6 primary navigation items:
// 1. Dashboard, 2. My Crops, 3. Find Buyers, 4. Orders, 5. AI Insights, 6. AI Assistant
// =============================================

import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, Users, Truck, Sparkles,
  Bot, Bell, Menu, X, Globe, LogOut, User as UserIcon,
  ChevronRight, ShieldCheck, Leaf, Activity
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { NotificationPanel } from './NotificationPanel';
import { AnimatedPageWrapper } from './AnimatedPageWrapper';
import type { Language } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state, dispatch, t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const user = state.currentUser;
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  // The 6 Primary Navigation Items
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('navDashboard') || 'Dashboard' },
    { path: '/crops', icon: Sprout, label: t('navMyCrops') || 'My Crops' },
    { path: '/buyers', icon: Users, label: t('navFindBuyers') || 'Find Buyers', altPath: '/matches' },
    { path: '/orders', icon: Truck, label: t('navOrders') || 'Orders', badge: state.orders.length > 0 ? String(state.orders.length) : undefined },
    { path: '/insights', icon: Sparkles, label: t('navAiInsights') || 'AI Insights', altPath: '/check-risk' },
    { path: '/assistant', icon: Bot, label: t('navAiAssistant') || 'AI Assistant' },
  ];

  const toggleLanguage = () => {
    const nextLang: Language = state.language === 'en' ? 'te' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  const handleSignOut = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-900 flex selection:bg-ai-500/20 selection:text-forest-900">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-800 via-forest-700 to-ai-600 text-white flex items-center justify-center shadow-glow-forest transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-ai-200" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                Harvest Bridge
                <span className="w-2 h-2 rounded-full bg-ai-500 shadow-glow-ai animate-pulse" />
              </div>
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <span className="text-ai-600 font-semibold">AI Powered</span>
                <span>•</span>
                <span>Agri Surplus</span>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 mx-3 mt-3 bg-gradient-to-r from-forest-50/50 via-ai-50/30 to-white border border-slate-200/80 rounded-xl flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-700 to-ai-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                <span className="font-medium text-forest-700">{user.role}</span>
                <span>•</span>
                <span>{user.district || 'Chittoor, AP'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 6 Core Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label, altPath, badge }) => {
            const isActive = location.pathname === path || (altPath && location.pathname === altPath);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-forest-50 via-ai-50/50 to-white text-forest-900 font-bold border border-ai-400/40 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-forest-600 text-white shadow-2xs' : 'text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-forest-700 text-white rounded-full shadow-2xs">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-forest-600 to-ai-500 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: AI Engine Status, Language, Sign Out */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/70">
          {/* Real-time AI Status pill */}
          <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-[11px] shadow-2xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Activity className="w-3 h-3 text-ai-600 animate-pulse" />
              <span>APMC Feed</span>
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-ai-700 text-[10px] bg-ai-50 px-1.5 py-0.5 rounded border border-ai-200">
              LIVE 2.4 GHz
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <Globe className="w-3.5 h-3.5 text-forest-600" /> Language
            </span>
            <span className="font-bold text-forest-700">
              {state.language === 'en' ? 'తెలుగు' : 'English'}
            </span>
          </button>

          {/* User Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('navSignOut') || 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Main App Shell ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-forest-800 to-ai-600 text-white flex items-center justify-center shadow-xs">
                <Leaf className="w-4 h-4 text-ai-200" />
              </div>
              <span className="font-display font-bold text-sm text-slate-900">Harvest Bridge</span>
            </div>

            {/* AI Engine Status Badge on Desktop Topbar */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-ai-50/70 border border-ai-200 text-xs font-semibold text-ai-800">
              <Sparkles className="w-3.5 h-3.5 text-ai-600 animate-pulse" />
              <span>Grounded AI Surplus Diagnostic Engine Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Quick Switch */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-bold border border-slate-200 bg-white rounded-lg text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Globe className="w-3 h-3 text-forest-600" />
              <span>{state.language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
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

            {/* Profile Avatar */}
            {user && (
              <Link
                to="/profile"
                className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-700 to-ai-600 text-white text-xs font-bold flex items-center justify-center hover:opacity-90 transition-opacity shadow-2xs"
              >
                {user.name.charAt(0)}
              </Link>
            )}
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 overflow-auto bg-[#F8FAF9]">
          <AnimatedPageWrapper key={location.pathname}>
            {children}
          </AnimatedPageWrapper>
        </main>

        {/* Mobile Bottom Quick Navigation (6 items) */}
        <nav className="lg:hidden bg-white border-t border-slate-200 grid grid-cols-6 px-1 py-1.5 safe-area-pb">
          {navItems.map(({ path, icon: Icon, label, altPath }) => {
            const isActive = location.pathname === path || (altPath && location.pathname === altPath);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-lg text-center ${
                  isActive ? 'text-forest-700 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] truncate max-w-[46px]">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

