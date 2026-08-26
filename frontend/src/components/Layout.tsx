// =============================================
// HARVEST BRIDGE — Main Layout (Light Mode Theme)
// =============================================

import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sprout, Users, TrendingUp, MessageCircle,
  Bell, Menu, X, Zap, BarChart3, Map, LogOut,
  Leaf, User as UserIcon
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { NotificationPanel } from './NotificationPanel';
import { AnimatedPageWrapper } from './AnimatedPageWrapper';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/crops', icon: Sprout, label: 'My Crops' },
  { path: '/check-risk', icon: Zap, label: 'Check Risk' },
  { path: '/matches', icon: Users, label: 'Buyer Matches' },
  { path: '/impact', icon: TrendingUp, label: 'Impact' },
  { path: '/radar', icon: BarChart3, label: 'Surplus Radar' },
  { path: '/map', icon: Map, label: 'Map View' },
  { path: '/assistant', icon: MessageCircle, label: 'AI Assistant' },
  { path: '/profile', icon: UserIcon, label: 'Profile' },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleDemoMode = () => {
    dispatch({ type: 'START_DEMO' });
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:inset-auto shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-sm leading-tight">
                Harvest Bridge
              </div>
              <div className="text-xs text-slate-500">Predict · Redirect · Protect</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn-ghost p-1.5 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        {state.currentUser && (
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="m-4 p-3 bg-slate-100/80 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-sm font-semibold text-white group-hover:scale-105 transition-transform">
              {state.currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-forest-700">
                {state.currentUser.name}
              </div>
              <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                {state.currentUser.role}
                {state.isDemoMode && (
                  <span className="demo-badge ml-1">DEMO</span>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active ? 'text-forest-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebarActiveTab"
                    className="absolute inset-0 bg-forest-50 border border-forest-200 rounded-lg -z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0 z-10" />
                <span className="z-10">{label}</span>
                {label === 'Check Risk' && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-harvest-600 text-white rounded-full z-10">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          {!state.isDemoMode && (
            <button onClick={handleDemoMode} className="nav-link w-full text-slate-700">
              <Zap className="w-4 h-4 text-amber-500" />
              Launch Demo Mode
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="nav-link w-full text-slate-500 hover:text-rose-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-ghost p-2"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <Leaf className="w-5 h-5 text-forest-600" />
              <span className="font-display font-bold text-sm text-slate-900">Harvest Bridge</span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Notifications */}
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
            {state.currentUser && (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-forest-600 text-white text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-forest-400 transition-all ml-1"
                title="View Profile"
              >
                {state.currentUser.name.charAt(0)}
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <AnimatePresence mode="wait">
            <AnimatedPageWrapper key={location.pathname}>
              {children}
            </AnimatedPageWrapper>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden bg-white border-t border-slate-200 grid grid-cols-5 px-2 py-1 safe-area-pb">
          {NAV_ITEMS.slice(0, 5).map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-colors ${
                  active ? 'text-forest-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
