import { ClipboardList } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Logo } from '@/components/shared/Logo';
export default function ReviewQueue() {
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <ClipboardList className="w-5 h-5 text-primary" />
          <span className="text-primary font-bold text-lg">審核佇列</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-base p-8 text-center text-muted">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h2 className="text-xl font-bold text-ink mb-2">審核佇列</h2>
              <p>此頁面功能開發中，將於正式版本提供完整功能。</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
