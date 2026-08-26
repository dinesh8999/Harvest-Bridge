// =============================================
// HARVEST BRIDGE — Format Utilities
// =============================================

export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tonnes`;
  return `${kg.toLocaleString()} kg`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  return Math.max(0, Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getRiskColor(risk: number): string {
  if (risk >= 70) return 'text-red-400';
  if (risk >= 50) return 'text-amber-400';
  return 'text-green-400';
}

export function getRiskBgColor(risk: number): string {
  if (risk >= 70) return 'bg-red-500/20 border-red-500/30';
  if (risk >= 50) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-green-500/20 border-green-500/30';
}

export function getRiskLabel(risk: number): string {
  if (risk >= 70) return 'HIGH';
  if (risk >= 50) return 'MEDIUM';
  return 'LOW';
}

export function getUrgencyColor(urgency: string): string {
  if (urgency === 'CRITICAL') return 'text-red-400';
  if (urgency === 'HIGH') return 'text-amber-400';
  if (urgency === 'MEDIUM') return 'text-yellow-400';
  return 'text-green-400';
}

export function getUrgencyBgClass(urgency: string): string {
  if (urgency === 'CRITICAL') return 'badge-critical';
  if (urgency === 'HIGH') return 'badge-high';
  if (urgency === 'MEDIUM') return 'badge-medium';
  return 'badge-low';
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    processor: 'Food Processor',
    retailer: 'Retail Chain',
    restaurant: 'Restaurant',
    wholesaler: 'Wholesaler',
    institution: 'Institution / Kitchen',
    ngo: 'NGO / Food Relief',
    school: 'School Programme',
  };
  return map[category] ?? category;
}
