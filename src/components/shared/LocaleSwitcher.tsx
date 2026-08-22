import { Globe } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import type { SupportedLocale } from '@/types';
import { cn } from '@/lib/utils';

interface LocaleSwitcherProps {
  /** 'row' = horizontal pill (default, for navbars/sidebars footer)
   *  'stacked' = vertical list (for sidebar bottom) */
  layout?: 'row' | 'stacked';
  className?: string;
}

const LOCALES: SupportedLocale[] = ['zh-HK', 'en', 'zh-CN'];
const LOCALE_SHORT: Record<SupportedLocale, string> = {
  'zh-HK': '繁',
  'en': 'EN',
  'zh-CN': '簡',
};

export function LocaleSwitcher({ layout = 'row', className }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocaleStore();

  if (layout === 'stacked') {
    return (
      <div className={cn('px-4 py-3 border-t border-line', className)}>
        <div className="flex items-center gap-1 text-xs text-muted mb-1.5">
          <Globe size={12} />
          <span>語言 / Language</span>
        </div>
        <div className="flex gap-1">
          {LOCALES.map(l => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={cn(
                'flex-1 py-1 rounded text-xs font-medium transition-colors',
                locale === l
                  ? 'bg-primary text-white'
                  : 'bg-bg-soft text-muted hover:text-primary hover:bg-primary/10'
              )}
            >
              {LOCALE_SHORT[l]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 text-xs text-muted', className)}>
      <Globe size={13} className="shrink-0" />
      {LOCALES.map(l => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cn(
            'px-1.5 py-0.5 rounded transition-colors',
            locale === l ? 'text-primary font-semibold' : 'hover:text-primary'
          )}
        >
          {LOCALE_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
