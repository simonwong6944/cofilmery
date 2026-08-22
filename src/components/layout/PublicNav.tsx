import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';
import { useAuthStore } from '@/store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { LogIn, Menu, X } from 'lucide-react';

export function PublicNav() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { locale } = useLocaleStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tr = t();
  void locale;

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'elder') return '/viewer';
    if (user.role === 'creator') return '/creator';
    if (user.role === 'sponsor') return '/sponsor';
    return '/admin';
  };

  const navLinks = [
    { to: '/about',      label: tr.nav.about },
    { to: '/drama-mode', label: tr.nav.dramaMode },
    { to: '/legacy-mode',label: tr.nav.legacyMode },
    { to: '/works',      label: tr.nav.works },
    { to: '/recruit',    label: tr.nav.recruit },
    { to: '/enterprise', label: tr.nav.enterprise },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-line shadow-nav">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Logo size="md" withWordmark withTagline={false} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm text-ink hover:text-primary transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <LocaleSwitcher layout="row" />
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="text-sm text-primary font-medium hover:underline">{user?.name}</Link>
              <button onClick={handleLogout} className="text-sm text-muted hover:text-ink transition-colors">{tr.nav.logout}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-ink hover:text-primary transition-colors">
                <LogIn size={16} /> {tr.nav.login}
              </Link>
              <Link to="/login" className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                {tr.nav.freeTrial}
              </Link>
            </>
          )}
        </div>

        {/* Mobile right: locale + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <LocaleSwitcher layout="row" />
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-2 rounded-lg text-ink hover:bg-bg-soft transition-colors"
            aria-label="選單"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-line shadow-lg">
          <nav className="px-4 py-3 space-y-0.5">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className="block px-3 py-3 rounded-lg text-sm text-ink hover:bg-bg-soft hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-line flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={closeMobile}
                  className="w-full text-center bg-primary text-white text-sm px-4 py-2.5 rounded-lg font-medium"
                >
                  {user?.name} — 進入後台
                </Link>
                <button
                  onClick={() => { handleLogout(); closeMobile(); }}
                  className="w-full text-center text-sm text-muted hover:text-ink py-2"
                >
                  {tr.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="w-full text-center bg-primary text-white text-sm px-4 py-2.5 rounded-lg font-medium"
                >
                  {tr.nav.freeTrial}
                </Link>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="w-full text-center flex items-center justify-center gap-1.5 text-sm text-ink hover:text-primary py-2"
                >
                  <LogIn size={15} /> {tr.nav.login}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
