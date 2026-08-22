import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';
import { LayoutDashboard, FolderOpen, PlusCircle, Coins, Award, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { TierBadge } from '@/components/shared/TierBadge';

export function CreatorSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { locale } = useLocaleStore();
  const tr = t();

  // suppress unused warning — locale subscribed for re-render
  void locale;

  const NAV_ITEMS = [
    { path: '/creator',               icon: LayoutDashboard, label: tr.creator.nav.creatorCenter },
    { path: '/creator/works',         icon: FolderOpen,      label: tr.creator.nav.myWorks },
    { path: '/creator/new',           icon: PlusCircle,      label: tr.creator.nav.newWork },
    { path: '/creator/credits',       icon: Coins,           label: tr.creator.nav.credits },
    { path: '/creator/esg',           icon: Award,           label: tr.creator.nav.esgLadder },
    { path: '/creator/notifications', icon: Bell,            label: tr.creator.nav.notifications, badge: 2 },
  ];

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-line">
        <Logo size="sm" withWordmark />
      </div>
      {user && (
        <div className="px-4 py-3 border-b border-line">
          <p className="font-semibold text-sm text-ink">{user.name}</p>
          <TierBadge tier={user.tier ?? 'trainee'} className="mt-1" />
          <p className="text-xs text-muted mt-1">{tr.creator.nav.productionCredits} {(user.credits ?? 0).toLocaleString()}</p>
        </div>
      )}
      <nav className="flex-1 py-3 px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label, badge }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors',
                active ? 'bg-primary text-white font-medium' : 'text-ink hover:bg-bg-soft'
              )}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-muted'} />
              <span className="flex-1">{label}</span>
              {badge && <span className="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>}
            </Link>
          );
        })}
      </nav>
      <LocaleSwitcher layout="stacked" />
    </aside>
  );
}
