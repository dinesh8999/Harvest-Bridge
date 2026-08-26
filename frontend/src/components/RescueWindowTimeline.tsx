// =============================================
// HARVEST BRIDGE — Rescue Window™ Timeline
// The memorable innovation visualization
// =============================================

import { Shield, Clock, AlertTriangle, XCircle, AlertOctagon } from 'lucide-react';

interface Props {
  daysUntilHarvest: number;
  urgency: string;
}

export function RescueWindowTimeline({ daysUntilHarvest, urgency }: Props) {
  const phases = [
    {
      label: 'Planning Window',
      icon: Shield,
      daysRange: [7, 99] as [number, number],
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      dot: 'bg-green-500',
      status: '🟢',
      desc: 'Ideal time to register crop and begin market awareness.',
    },
    {
      label: 'Buyer Matching',
      icon: Clock,
      daysRange: [4, 7] as [number, number],
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      dot: 'bg-green-500',
      status: '🟢',
      desc: 'Best window to connect with buyers and confirm interest.',
    },
    {
      label: 'Rescue Window™',
      icon: AlertTriangle,
      daysRange: [1, 4] as [number, number],
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-500',
      status: '🟠',
      desc: 'Critical action period — reach out to matched buyers now.',
      isRescue: true,
    },
    {
      label: 'Harvest Day',
      icon: AlertOctagon,
      daysRange: [0, 1] as [number, number],
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      dot: 'bg-red-500',
      status: '🔴',
      desc: 'Options are limited. Immediate action is essential.',
    },
    {
      label: 'Post-Harvest',
      icon: XCircle,
      daysRange: [-99, 0] as [number, number],
      color: 'text-slate-500',
      bg: 'bg-slate-800/40 border-slate-700/20',
      dot: 'bg-slate-600',
      status: '⚠️',
      desc: 'Spoilage risk increases significantly without cold storage.',
    },
  ];

  const getCurrentPhase = () => {
    if (daysUntilHarvest >= 7) return 0;
    if (daysUntilHarvest >= 4) return 1;
    if (daysUntilHarvest >= 1) return 2;
    if (daysUntilHarvest === 0) return 3;
    return 4;
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="card mb-6 border-amber-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            RESCUE WINDOW™
          </span>
        </div>
        <div className="text-sm font-semibold text-amber-400">
          {daysUntilHarvest} days until harvest
        </div>
      </div>

      <div className="space-y-2">
        {phases.map((phase, i) => {
          const { label, color, bg, dot, status, desc, isRescue } = phase;
          const isActive = i === currentPhase;
          const isPast = i > currentPhase;

          return (
            <div
              key={label}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                isActive
                  ? `${bg} ${isRescue ? 'ring-1 ring-amber-500/30' : ''}`
                  : isPast
                  ? 'bg-slate-900/30 border-slate-800/30 opacity-50'
                  : 'bg-slate-900/30 border-slate-800/30'
              }`}
            >
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center pt-0.5">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? dot : 'bg-slate-700'} ${isActive && isRescue ? 'animate-pulse' : ''}`} />
                {i < phases.length - 1 && (
                  <div className="w-0.5 h-4 bg-slate-800 mt-1" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{status}</span>
                  <span className={`text-sm font-semibold ${isActive ? color : 'text-slate-500'}`}>
                    {label}
                    {isRescue && (
                      <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5">™</span>
                    )}
                  </span>
                  {isActive && (
                    <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded-full">
                      YOU ARE HERE
                    </span>
                  )}
                </div>
                {isActive && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentPhase === 2 && (
        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-xl">
          <p className="text-amber-300 text-sm font-medium">
            ⚡ You are in the Rescue Window. Contact matched buyers now to maximize the chance of redirecting your crop.
          </p>
        </div>
      )}
    </div>
  );
}
