import { cn } from '@/lib/utils';
import { Film, BookOpen } from 'lucide-react';

interface ModeBadgeProps {
  mode: 'drama' | 'legacy';
  size?: 'sm' | 'md';
  className?: string;
}

export function ModeBadge({ mode, size = 'md', className }: ModeBadgeProps) {
  const isDrama = mode === 'drama';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      isDrama
        ? 'bg-primary text-white'
        : 'bg-accent text-white',
      className
    )}>
      {isDrama ? <Film size={size === 'sm' ? 10 : 13} /> : <BookOpen size={size === 'sm' ? 10 : 13} />}
      {isDrama ? '戲劇模式' : '傳承模式'}
    </span>
  );
}
