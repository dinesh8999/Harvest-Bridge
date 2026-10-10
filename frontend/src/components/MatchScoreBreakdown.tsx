// =============================================
// HARVEST BRIDGE — Match Score Breakdown
// "Why this buyer?" visual explanation
// =============================================

import type { ScoreBreakdown } from '../types';

interface Props {
  breakdown: ScoreBreakdown;
}

interface FactorDef {
  key: string;
  altKey?: string;
  label: string;
  weight: string;
}

const FACTORS: FactorDef[] = [
  { key: 'cropCompatibility', label: 'Crop match', weight: '25%' },
  { key: 'quantityCompatibility', altKey: 'quantityFit', label: 'Quantity fit', weight: '20%' },
  { key: 'distanceScore', altKey: 'logisticsProximity', label: 'Proximity', weight: '25%' },
  { key: 'timingCompatibility', altKey: 'timingAlignment', label: 'Timing alignment', weight: '15%' },
  { key: 'priceCompatibility', altKey: 'priceFeasibility', label: 'Price range', weight: '15%' },
];

function getBarColor(value: number) {
  if (value >= 85) return 'bg-emerald-500';
  if (value >= 65) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function MatchScoreBreakdown({ breakdown }: Props) {
  return (
    <div className="space-y-2">
      {FACTORS.map(({ key, altKey, label, weight }) => {
        const rawVal =
          (breakdown as any)[key] ??
          (altKey ? (breakdown as any)[altKey] : undefined) ??
          80;
        const value = Number(rawVal);

        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className="w-24 text-slate-500 font-medium flex-shrink-0">{label}</div>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <div className="w-10 text-right text-slate-700 font-bold">{value}%</div>
            <div className="w-8 text-slate-400 text-right font-medium">{weight}</div>
          </div>
        );
      })}
    </div>
  );
}
