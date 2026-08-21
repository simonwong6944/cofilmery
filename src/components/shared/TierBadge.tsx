import { cn } from '@/lib/utils';
import type { CreatorTier } from '@/types';

interface TierBadgeProps {
  tier: CreatorTier | string;
  className?: string;
}

const TIER_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  trainee:   { label: '見習',     emoji: '🌱', color: 'bg-green-100 text-green-800' },
  certified: { label: '認證創作者', emoji: '⭐', color: 'bg-accent/10 text-accent' },
  senior:    { label: '資深創作者', emoji: '💎', color: 'bg-blue-100 text-blue-800' },
  contracted:{ label: '簽約創作者', emoji: '🏆', color: 'bg-primary/10 text-primary' },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier] ?? { label: tier, emoji: '', color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
      config.color, className
    )}>
      {config.emoji} {config.label}
    </span>
  );
}
