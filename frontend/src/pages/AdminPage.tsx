// =============================================
// HARVEST BRIDGE — Agricultural Operations Admin Portal
// Verification of organizations, audit trails, and platform-wide aggregate impact
// =============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Users, Building2, AlertTriangle, FileText,
  CheckCircle2, XCircle, Search, Filter, Activity, Sprout
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { formatCurrency, formatWeight } from '../utils/format';

export default function AdminPage() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const farmersCount = 42;
  const buyersCount = 18;
  const orgsCount = 6;
  const totalProtectedValue = 202800;
  const totalRedirectedWeight = 9900;

  const mockAuditLogs = [
    {
      id: 'audit-001',
      actor: 'Admin (Operations Lead)',
      action: 'ORGANIZATION_ACCREDITED',
      target: 'Akshaya Patra Foundation Tirupati',
      timestamp: '2 hours ago',
      status: 'VERIFIED',
    },
    {
      id: 'audit-002',
      actor: 'AI Risk Engine v2.4',
      action: 'SURPLUS_SPIKE_DETECTED',
      target: 'Chittoor District Tomato Harvest Surge (88%)',
      timestamp: '4 hours ago',
      status: 'ALERT_DISPATCHED',
    },
    {
      id: 'audit-003',
      actor: 'Chittoor Tomato Processing Co.',
      action: 'PURCHASE_ORDER_COMPLETED',
      target: '1,200 kg Tomato from Ravi Kumar',
      timestamp: '1 day ago',
      status: 'VERIFIED_PAID',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldCheck className="w-7 h-7 text-forest-600" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Agricultural Operations Administration
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Platform-level governance, organization accreditation, dispute moderation, and system audit logging
        </p>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Farmers', value: farmersCount, icon: Sprout, color: 'text-forest-700', bg: 'bg-emerald-50/70 border-emerald-200' },
          { label: 'Commercial Buyers', value: buyersCount, icon: Users, color: 'text-sky-700', bg: 'bg-sky-50/70 border-sky-200' },
          { label: 'Verified NGOs & Kitchens', value: orgsCount, icon: Building2, color: 'text-rose-700', bg: 'bg-rose-50/70 border-rose-200' },
          { label: 'Total Value Protected', value: formatCurrency(totalProtectedValue), icon: Activity, color: 'text-amber-700', bg: 'bg-amber-50/70 border-amber-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card border ${bg}`}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`font-display text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-slate-600 text-xs font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending Accreditation Reviews */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Organization Accreditation Queue</h2>
            <p className="text-xs text-slate-500">Review institutional applicants seeking surplus allocation access</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            1 Pending Verification
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Tirupati Zilla Parishad Hostel Kitchens</span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">Government Hostel</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Location: Tirupati Town · Daily Capacity: 1,200 kg produce · Serves 1,400 students
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Registration Document: <code>AP-DEPT-ED-2026-904.pdf</code>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-primary text-xs py-2 px-4 bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
            </button>
            <button className="btn-ghost text-xs py-2 px-3 text-slate-600 hover:bg-slate-200">
              Request Info
            </button>
          </div>
        </div>
      </div>

      {/* Real Audit Trail */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest-600" /> Platform Security & Activity Audit Log
            </h2>
            <p className="text-xs text-slate-500">Immutable record of critical transactions, verifications, and AI alerts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-3 text-left font-bold">Log ID</th>
                <th className="py-3 px-3 text-left font-bold">Actor</th>
                <th className="py-3 px-3 text-left font-bold">Action Event</th>
                <th className="py-3 px-3 text-left font-bold">Target Details</th>
                <th className="py-3 px-3 text-right font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-slate-400 font-mono">{log.id}</td>
                  <td className="py-3 px-3 text-slate-900 font-bold">{log.actor}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{log.target}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
