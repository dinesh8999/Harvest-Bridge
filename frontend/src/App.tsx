// =============================================
// HARVEST BRIDGE — Master Application Router
// Comprehensive role-aware routing and navigation
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CheckRiskPage from './pages/CheckRiskPage';
import CropsPage from './pages/CropsPage';
import MatchesPage from './pages/MatchesPage';
import OrdersPage from './pages/OrdersPage';
import MarketPage from './pages/MarketPage';
import RescueNetworkPage from './pages/RescueNetworkPage';
import ImpactPage from './pages/ImpactPage';
import SurplusRadarPage from './pages/SurplusRadarPage';
import MapPage from './pages/MapPage';
import AssistantPage from './pages/AssistantPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes inside Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crops"
        element={
          <ProtectedRoute>
            <Layout><CropsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/check-risk"
        element={
          <ProtectedRoute>
            <Layout><CheckRiskPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Layout><MatchesPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout><OrdersPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <Layout><MarketPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rescue"
        element={
          <ProtectedRoute>
            <Layout><RescueNetworkPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/radar"
        element={
          <ProtectedRoute>
            <Layout><SurplusRadarPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Layout><MapPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <Layout><AssistantPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/impact"
        element={
          <ProtectedRoute>
            <Layout><ImpactPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout><AdminPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
