import { cn } from '@/lib/utils';
import type { CreatorTier } from '@/types';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const TIER_EMOJI: Record<string, string> = {
  trainee:    '🌱',
  certified:  '⭐',
  senior:     '💎',
  contracted: '🏆',
};

const TIER_COLOR: Record<string, string> = {
  trainee:    'bg-green-100 text-green-800',
  certified:  'bg-accent/10 text-accent',
  senior:     'bg-blue-100 text-blue-800',
  contracted: 'bg-primary/10 text-primary',
};

interface TierBadgeProps {
  tier: CreatorTier | string;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const label = (tr.creator.tierBadge as Record<string, string>)[tier] ?? tier;
  const emoji = TIER_EMOJI[tier] ?? '';
  const color = TIER_COLOR[tier] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
      color, className
    )}>
      {emoji} {label}
    </span>
  );
}
