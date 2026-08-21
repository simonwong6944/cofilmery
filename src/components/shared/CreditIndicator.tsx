import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditIndicatorProps {
  cost: number;
  label?: string;
  className?: string;
}

export function CreditIndicator({ cost, label, className }: CreditIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-muted bg-warn-bg border border-warn-line rounded-full px-3 py-1', className)}>
      <Zap size={12} className="text-accent" />
      <span>{label ? `${label}：` : ''}消耗 <strong className="text-accent">{cost}</strong> 點數</span>
    </div>
  );
}
