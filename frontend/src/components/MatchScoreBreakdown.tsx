// =============================================
// HARVEST BRIDGE — Match Score Breakdown
// "Why this buyer?" visual explanation
// =============================================

interface Props {
  breakdown: {
    quantityCompatibility: number;
    distanceScore: number;
    timingCompatibility: number;
    cropCompatibility: number;
    priceCompatibility: number;
  };
}

const FACTORS = [
  { key: 'cropCompatibility', label: 'Crop match', weight: '20%' },
  { key: 'quantityCompatibility', label: 'Quantity fit', weight: '25%' },
  { key: 'distanceScore', label: 'Distance', weight: '20%' },
  { key: 'timingCompatibility', label: 'Timing', weight: '20%' },
  { key: 'priceCompatibility', label: 'Price range', weight: '15%' },
] as const;

function getBarColor(value: number) {
  if (value >= 85) return 'bg-green-500';
  if (value >= 65) return 'bg-amber-500';
  return 'bg-red-500';
}

export function MatchScoreBreakdown({ breakdown }: Props) {
  return (
    <div className="space-y-2">
      {FACTORS.map(({ key, label, weight }) => {
        const value = breakdown[key];
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className="w-20 text-slate-500 flex-shrink-0">{label}</div>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <div className="w-8 text-right text-slate-400 font-medium">{value}%</div>
            <div className="w-6 text-slate-600 text-right">{weight}</div>
          </div>
        );
      })}
    </div>
  );
}
