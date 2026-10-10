// =============================================
// HARVEST BRIDGE — Master Application Router
// Clean 6-Core Navigation Architecture with Smooth Legacy Redirects
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CropsPage from './pages/CropsPage';
import MatchesPage from './pages/MatchesPage';
import OrdersPage from './pages/OrdersPage';
import InsightsPage from './pages/InsightsPage';
import AssistantPage from './pages/AssistantPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
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
      {/* ── Public Auth & Landing ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── 6 Core Navigation Routes (Protected) ── */}
      {/* 1. Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 2. My Crops */}
      <Route
        path="/crops"
        element={
          <ProtectedRoute>
            <Layout>
              <CropsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 3. Find Buyers */}
      <Route
        path="/buyers"
        element={
          <ProtectedRoute>
            <Layout>
              <MatchesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/matches" element={<Navigate to="/buyers" replace />} />

      {/* 4. Orders */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 5. AI Insights (Consolidated Risk, Mandi, Radar) */}
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <Layout>
              <InsightsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 6. AI Assistant */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <Layout>
              <AssistantPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ── Auxiliary Settings & Administration ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ── Safe Legacy Redirects (Consolidated Functionality) ── */}
      <Route path="/check-risk" element={<Navigate to="/insights" replace />} />
      <Route path="/radar" element={<Navigate to="/insights" replace />} />
      <Route path="/market" element={<Navigate to="/insights" replace />} />
      <Route path="/map" element={<Navigate to="/insights" replace />} />
      <Route path="/rescue" element={<Navigate to="/buyers" replace />} />
      <Route path="/impact" element={<Navigate to="/orders" replace />} />

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
