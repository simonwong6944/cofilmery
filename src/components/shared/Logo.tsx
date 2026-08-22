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
// New CoFilmery logo is wide-aspect (~4:1), so heights are tuned accordingly
const sizes = {
  sm: { fullH: 28, iconH: 28 },
  md: { fullH: 36, iconH: 36 },
  lg: { fullH: 52, iconH: 52 },
  xl: { fullH: 72, iconH: 72 },
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

  // Icon-only mode — crop left ~25% of wide logo to show just the C+aperture icon
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
          objectFit: 'none',
          objectPosition: 'left center',
          // New logo is ~4:1 wide; icon occupies left ~25%, so render full natural width
          // and let overflow:hidden clip to the square container
          minWidth: `${s.iconH * 4}px`,
          maxWidth: `${s.iconH * 4}px`,
        }}
        draggable={false}
      />
    </div>
  );
}
