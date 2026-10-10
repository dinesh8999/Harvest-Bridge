// =============================================
// HARVEST BRIDGE — Master Clean Layout
// Minimal, modern SaaS aesthetic with 6 primary navigation items:
// 1. Dashboard, 2. My Crops, 3. Find Buyers, 4. Orders, 5. AI Insights, 6. AI Assistant
// =============================================

import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, Users, Truck, Sparkles,
  Bot, Bell, Menu, X, Globe, LogOut, User as UserIcon,
  ChevronRight, ShieldCheck, Leaf
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
    <div className="min-h-screen bg-[#F7F9F7] text-[#17211B] flex">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E3E9E4] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E3E9E4] flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#246B4B] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-[#17211B] leading-tight">
                Harvest Bridge
              </div>
              <div className="text-[11px] text-[#647067] font-medium">
                Predict. Redirect. Protect.
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-[#647067] hover:text-[#17211B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 mx-3 mt-3 bg-[#F7F9F7] border border-[#E3E9E4] rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#246B4B] text-white font-bold text-xs flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#17211B] truncate">{user.name}</div>
              <div className="text-[11px] text-[#647067] capitalize">{user.role} · {user.district || 'Chittoor'}</div>
            </div>
          </div>
        )}

        {/* 6 Core Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label, altPath, badge }) => {
            const isActive = location.pathname === path || (altPath && location.pathname === altPath);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#EAF5EE] text-[#194D38] font-bold border border-[#246B4B]/20'
                    : 'text-[#647067] hover:text-[#17211B] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#246B4B]' : 'text-[#647067]'}`} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#246B4B] text-white rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Language, Notifications, Sign Out */}
        <div className="p-3 border-t border-[#E3E9E4] space-y-2 bg-[#F7F9F7]">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E3E9E4] rounded-xl text-xs font-semibold text-[#17211B] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2 text-[#647067]">
              <Globe className="w-3.5 h-3.5 text-[#246B4B]" /> Language
            </span>
            <span className="font-bold text-[#246B4B]">
              {state.language === 'en' ? 'తెలుగు' : 'English'}
            </span>
          </button>

          {/* User Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#647067] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
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
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E3E9E4] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#647067] hover:text-[#17211B]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#246B4B] text-white flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-sm text-[#17211B]">Harvest Bridge</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Quick Switch */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-bold border border-[#E3E9E4] bg-white rounded-lg text-[#17211B] hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Globe className="w-3 h-3 text-[#246B4B]" />
              <span>{state.language === 'en' ? 'తె' : 'EN'}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-1.5 text-[#647067] hover:text-[#17211B] rounded-lg hover:bg-slate-100 relative"
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
                className="w-7 h-7 rounded-full bg-[#246B4B] text-white text-xs font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {user.name.charAt(0)}
              </Link>
            )}
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 overflow-auto bg-[#F7F9F7]">
          <AnimatedPageWrapper key={location.pathname}>
            {children}
          </AnimatedPageWrapper>
        </main>

        {/* Mobile Bottom Quick Navigation (6 items) */}
        <nav className="lg:hidden bg-white border-t border-[#E3E9E4] grid grid-cols-6 px-1 py-1.5 safe-area-pb">
          {navItems.map(({ path, icon: Icon, label, altPath }) => {
            const isActive = location.pathname === path || (altPath && location.pathname === altPath);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-lg text-center ${
                  isActive ? 'text-[#194D38] font-bold' : 'text-[#647067]'
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
