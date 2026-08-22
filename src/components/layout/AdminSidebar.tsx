import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import {
  LayoutDashboard, ListVideo, PlaySquare, Users, UserCheck,
  ShieldAlert, Coins, Megaphone, Leaf, Building2, Heart,
  AlertTriangle, Cpu, BarChart3, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { locale } = useLocaleStore();
  const tr = t();

  // suppress unused warning — locale subscribed for re-render
  void locale;

  const NAV_ITEMS = [
    { path: '/admin',                      icon: LayoutDashboard, label: tr.admin.sidebar.overview },
    { path: '/admin/queue',                icon: ListVideo,       label: tr.admin.sidebar.queue },
    { path: '/admin/review/drama-002-ep5', icon: PlaySquare,      label: tr.admin.sidebar.review },
    { path: '/admin/users',                icon: Users,           label: tr.admin.sidebar.users },
    { path: '/admin/creators',             icon: UserCheck,       label: tr.admin.sidebar.creators },
    { path: '/admin/moderation',           icon: ShieldAlert,     label: tr.admin.sidebar.moderation },
    { path: '/admin/credits',              icon: Coins,           label: tr.admin.sidebar.credits },
    { path: '/admin/brands',               icon: Megaphone,       label: tr.admin.sidebar.brands },
    { path: '/admin/esg',                  icon: Leaf,            label: tr.admin.sidebar.esg },
    { path: '/admin/enterprise',           icon: Building2,       label: tr.admin.sidebar.enterprise },
    { path: '/admin/sponsored-legacy',     icon: Heart,           label: tr.admin.sidebar.sponsoredLegacy },
    { path: '/admin/redlines',             icon: AlertTriangle,   label: tr.admin.sidebar.redlines },
    { path: '/admin/adapters',             icon: Cpu,             label: tr.admin.sidebar.adapters },
    { path: '/admin/analytics',            icon: BarChart3,       label: tr.admin.sidebar.analytics },
    { path: '/admin/settings',             icon: Settings,        label: tr.admin.sidebar.settings },
  ];

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-line">
        <Logo size="sm" withWordmark withTagline={false} />
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== '/admin' && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                active ? 'bg-primary text-white font-medium' : 'text-ink hover:bg-bg-soft'
              )}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-muted'} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
