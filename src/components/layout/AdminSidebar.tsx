import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import {
  LayoutDashboard, ListVideo, PlaySquare, Users, UserCheck,
  ShieldAlert, Coins, Megaphone, Leaf, Building2, Heart,
  AlertTriangle, Cpu, BarChart3, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/admin',                    icon: LayoutDashboard, label: '總覽' },
  { path: '/admin/queue',              icon: ListVideo,       label: '審批隊列' },
  { path: '/admin/review/drama-002-ep5', icon: PlaySquare,   label: '單作品審批' },
  { path: '/admin/users',              icon: Users,           label: '用戶管理' },
  { path: '/admin/creators',           icon: UserCheck,       label: '創作者管理' },
  { path: '/admin/moderation',         icon: ShieldAlert,     label: '內容審核' },
  { path: '/admin/credits',            icon: Coins,           label: '信用額引擎' },
  { path: '/admin/brands',             icon: Megaphone,       label: '品牌廣告' },
  { path: '/admin/esg',                icon: Leaf,            label: 'ESG 贊助' },
  { path: '/admin/enterprise',          icon: Building2,       label: '企業傳承' },
  { path: '/admin/sponsored-legacy',   icon: Heart,           label: '贊助式傳承' },
  { path: '/admin/redlines',           icon: AlertTriangle,   label: '紅線合規' },
  { path: '/admin/adapters',           icon: Cpu,             label: 'AI Adapter' },
  { path: '/admin/analytics',          icon: BarChart3,       label: '分析報表' },
  { path: '/admin/settings',           icon: Settings,        label: '系統設定' },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
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
