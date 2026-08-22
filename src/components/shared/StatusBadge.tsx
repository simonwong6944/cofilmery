import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const STATUS_COLOR: Record<ProjectStatus, string> = {
  draft:     'bg-gray-100 text-gray-600',
  reviewing: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  revision:  'bg-red-100 text-red-700',
  approved:  'bg-blue-100 text-blue-800',
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const label = tr.creator.status[status] ?? status;
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', STATUS_COLOR[status], className)}>
      {label}
    </span>
  );
}
