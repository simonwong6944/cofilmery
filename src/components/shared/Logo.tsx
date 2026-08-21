import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withWordmark?: boolean;
  withTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: 'text-base', tagline: 'text-[9px]' },
  md: { icon: 38, text: 'text-xl', tagline: 'text-[10px]' },
  lg: { icon: 54, text: 'text-3xl', tagline: 'text-xs' },
  xl: { icon: 80, text: 'text-5xl', tagline: 'text-sm' },
};

export function Logo({ size = 'md', withWordmark = true, withTagline = false, theme = 'light', className }: LogoProps) {
  const s = sizes[size];
  const iconSize = s.icon;
  const navyColor = theme === 'dark' ? '#f3f6fb' : '#1f3a5f';
  const textColor = theme === 'dark' ? 'text-white' : 'text-primary';
  const taglineColor = theme === 'dark' ? 'text-gray-300' : 'text-muted';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Logo mark: outer C + inner iris */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer C */}
        <path
          d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C62 15 72.5 21 79.5 30.5"
          stroke={navyColor}
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner camera iris — 8-blade aperture */}
        <g transform="translate(50,50)">
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <ellipse
              key={i}
              rx="10" ry="4.5"
              transform={`rotate(${angle})`}
              fill="#c8912f"
              opacity="0.92"
            />
          ))}
          <circle r="6" fill="#f7f4ee" />
          <circle r="3.5" fill="#1f3a5f" opacity="0.7" />
        </g>
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight', s.text, textColor)}>CoFilmery</span>
          {withTagline && (
            <span className={cn('font-normal tracking-wide mt-0.5', s.tagline, taglineColor)}>
              CoFilmery · AI 短片共創平台
            </span>
          )}
        </div>
      )}
    </div>
  );
}
