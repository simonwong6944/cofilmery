import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { useAuthStore } from '@/store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { LOCALE_LABELS } from '@/i18n';
import type { SupportedLocale } from '@/types';
import { Globe, LogIn } from 'lucide-react';

export function PublicNav() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { locale, setLocale } = useLocaleStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'elder') return '/viewer';
    if (user.role === 'creator') return '/creator';
    if (user.role === 'sponsor') return '/sponsor';
    return '/admin';
  };

  const locales: SupportedLocale[] = ['zh-HK', 'en', 'zh-CN'];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-line shadow-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <Logo size="md" withWordmark withTagline={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/about" className="text-sm text-ink hover:text-primary transition-colors">關於</Link>
          <Link to="/drama-mode" className="text-sm text-ink hover:text-primary transition-colors">戲劇模式</Link>
          <Link to="/legacy-mode" className="text-sm text-ink hover:text-primary transition-colors">傳承模式</Link>
          <Link to="/works" className="text-sm text-ink hover:text-primary transition-colors">作品集</Link>
          <Link to="/recruit" className="text-sm text-ink hover:text-primary transition-colors">創作者</Link>
          <Link to="/enterprise" className="text-sm text-ink hover:text-primary transition-colors">贊助合作</Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <div className="flex items-center gap-1 text-xs text-muted">
            <Globe size={14} />
            {locales.map(l => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-1.5 py-0.5 rounded transition-colors ${locale === l ? 'text-primary font-semibold' : 'hover:text-primary'}`}
              >
                {l === 'zh-HK' ? '繁' : l === 'zh-CN' ? '簡' : 'EN'}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="text-sm text-primary font-medium hover:underline">{user?.name}</Link>
              <button onClick={handleLogout} className="text-sm text-muted hover:text-ink transition-colors">登出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-ink hover:text-primary transition-colors">
                <LogIn size={16} /> 登入
              </Link>
              <Link to="/login" className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                免費試用
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
