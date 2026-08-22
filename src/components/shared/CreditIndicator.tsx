import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

interface CreditIndicatorProps {
  cost: number;
  label?: string;
  className?: string;
}

export function CreditIndicator({ cost, label, className }: CreditIndicatorProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-muted bg-warn-bg border border-warn-line rounded-full px-3 py-1', className)}>
      <Zap size={12} className="text-accent" />
      <span>
        {label ? `${label}：` : ''}
        {tr.creator.creditConsume} <strong className="text-accent">{cost}</strong> {tr.creator.creditUnit}
      </span>
    </div>
  );
}
