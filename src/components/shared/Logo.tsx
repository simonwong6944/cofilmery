import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withWordmark?: boolean;
  withTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
  /** If true (default), clicking the logo navigates to home ("/"). Set false to disable. */
  clickable?: boolean;
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
  clickable = true,
}: LogoProps) {
  const navigate = useNavigate();
  const s = sizes[size];
  const taglineSize = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-xs', xl: 'text-sm' }[size];
  const taglineColor = theme === 'dark' ? 'text-gray-300' : 'text-muted';

  const handleClick = clickable
    ? () => navigate('/')
    : undefined;

  const wrapperClass = clickable ? 'cursor-pointer' : '';

  if (withWordmark) {
    return (
      <div
        className={cn('flex flex-col items-start leading-none', wrapperClass, className)}
        onClick={handleClick}
      >
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

  // Icon-only mode
  return (
    <div
      className={cn('flex items-center leading-none overflow-hidden', wrapperClass, className)}
      style={{ height: s.iconH, width: s.iconH }}
      onClick={handleClick}
    >
      <img
        src={LOGO_SRC}
        alt="CoFilmery"
        style={{
          height: s.iconH,
          width: 'auto',
          objectFit: 'cover',
          objectPosition: 'left center',
          maxWidth: `${s.iconH * 1.05}px`,
        }}
        draggable={false}
      />
    </div>
  );
}
