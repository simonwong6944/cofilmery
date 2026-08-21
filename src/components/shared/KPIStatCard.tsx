import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function KPIStatCard({ label, value, unit, trend, trendPositive = true, icon, className }: KPIStatCardProps) {
  return (
    <div className={cn('bg-card rounded-xl p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-ink">{value}</span>
            {unit && <span className="text-sm text-muted">{unit}</span>}
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs', trendPositive ? 'text-green-600' : 'text-red-500')}>
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        {icon && <div className="text-accent opacity-70">{icon}</div>}
      </div>
    </div>
  );
}
