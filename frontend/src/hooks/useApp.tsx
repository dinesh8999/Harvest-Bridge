// =============================================
// HARVEST BRIDGE — App Context / Global State
// =============================================

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { User, BuyerMatch } from '../types';


export interface AppState {
  isDemoMode: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  currentCrop: any | null;
  lastPrediction: any | null;
  lastMatches: BuyerMatch[];
  notifications: Notification[];
  demoRunning: boolean;
  sentInquiries: string[]; // buyerIds
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

type Action =
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_CROP'; payload: any }
  | { type: 'SET_PREDICTION'; payload: any }
  | { type: 'SET_MATCHES'; payload: BuyerMatch[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'SEND_INQUIRY'; payload: string }
  | { type: 'START_DEMO' }
  | { type: 'LOGOUT' };

const DEMO_USER: User = {
  _id: 'farmer-001',
  name: 'Ravi Kumar',
  phone: '9876543001',
  email: 'ravi.kumar@harvestbridge.org',
  role: 'farmer',
  language: 'te',
  location: 'Palamaner, Chittoor',
  district: 'Chittoor',
  farmSize: 4.5,
  primaryCrops: ['Tomato', 'Chilli', 'Brinjal'],
  irrigationType: 'Drip Irrigation',
  smsAlerts: true,
  riskThreshold: 70,
  createdAt: new Date().toISOString(),
};

const initialState: AppState = {
  isDemoMode: true,
  isAuthenticated: false,
  currentUser: null,
  currentCrop: null,
  lastPrediction: null,
  lastMatches: [],
  notifications: [
    {
      id: 'notif-001',
      type: 'critical',
      title: '🔴 HIGH SURPLUS RISK',
      message: 'Tomato surplus risk increased from 61% to 78%. Act within 3 days.',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 'notif-002',
      type: 'success',
      title: '🏭 Buyer Found',
      message: 'Chittoor Tomato Processing Co. needs 1,200 kg of tomatoes — 18 km away.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      read: false,
    },
    {
      id: 'notif-003',
      type: 'warning',
      title: '⏰ Rescue Window',
      message: 'Your recommended action window closes in approximately 3 days.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true,
    },
  ],
  demoRunning: false,
  sentInquiries: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    case 'SET_USER':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };
    case 'SET_CROP':
      return { ...state, currentCrop: action.payload };
    case 'SET_PREDICTION':
      return { ...state, lastPrediction: action.payload };
    case 'SET_MATCHES':
      return { ...state, lastMatches: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'SEND_INQUIRY':
      return { ...state, sentInquiries: [...state.sentInquiries, action.payload] };
    case 'START_DEMO':
      return {
        ...state,
        isDemoMode: true,
        isAuthenticated: true,
        currentUser: DEMO_USER,
        demoRunning: true,
      };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
