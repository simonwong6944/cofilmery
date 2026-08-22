import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withWordmark?: boolean;
  withTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// Logo image sizes — icon-only height when withWordmark=false,
// full-logo height when withWordmark=true (the image already contains wordmark)
const sizes = {
  sm: { fullH: 32, iconH: 28 },
  md: { fullH: 44, iconH: 38 },
  lg: { fullH: 64, iconH: 54 },
  xl: { fullH: 96, iconH: 80 },
};

// Official CoFilmery logo image (contains both icon + wordmark)
const LOGO_SRC = '/logo.png';

export function Logo({
  size = 'md',
  withWordmark = true,
  withTagline = false,
  theme = 'light',
  className,
}: LogoProps) {
  const s = sizes[size];
  const taglineSize = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-xs', xl: 'text-sm' }[size];
  const taglineColor = theme === 'dark' ? 'text-gray-300' : 'text-muted';

  if (withWordmark) {
    // Use the full logo image (icon + wordmark already in image)
    return (
      <div className={cn('flex flex-col items-start leading-none', className)}>
        <img
          src={LOGO_SRC}
          alt="CoFilmery · AI短視頻共創平台"
          style={{ height: s.fullH, width: 'auto', objectFit: 'contain' }}
          draggable={false}
        />
        {withTagline && (
          <span className={cn('font-normal tracking-wide mt-0.5', taglineSize, taglineColor)}>
            AI 短視頻共創平台
          </span>
        )}
      </div>
    );
  }

  // Icon-only mode: crop to just the C icon portion on the left
  return (
    <div className={cn('flex items-center leading-none overflow-hidden', className)}
      style={{ height: s.iconH, width: s.iconH }}>
      <img
        src={LOGO_SRC}
        alt="CoFilmery"
        style={{
          height: s.iconH,
          width: 'auto',
          objectFit: 'cover',
          objectPosition: 'left center',
          // Show only the left ~30% which contains the C icon
          maxWidth: `${s.iconH * 1.05}px`,
        }}
        draggable={false}
      />
    </div>
  );
}
