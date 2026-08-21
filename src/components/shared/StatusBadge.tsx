import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  draft:     { label: '草稿',  color: 'bg-gray-100 text-gray-600' },
  reviewing: { label: '送審中', color: 'bg-yellow-100 text-yellow-800' },
  published: { label: '已發佈', color: 'bg-green-100 text-green-800' },
  revision:  { label: '退修中', color: 'bg-red-100 text-red-700' },
  approved:  { label: '已批准', color: 'bg-blue-100 text-blue-800' },
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', config.color, className)}>
      {config.label}
    </span>
  );
}
