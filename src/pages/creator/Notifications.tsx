import { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Trash2 } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';

const NOTIFICATIONS = [
  { id: 1, type: 'success', title: '作品審核通過！', desc: '「街市情緣 第1集」已成功通過審核並發佈。', time: '10 分鐘前', read: false },
  { id: 2, type: 'warning', title: '作品需要修改', desc: '「涼茶世家 第2集」審核未通過，請查看修改意見。', time: '2 小時前', read: false },
  { id: 3, type: 'info', title: '積分到賬通知', desc: '您獲得 50 積分獎勵（作品發佈獎勵）。', time: '昨天', read: true },
  { id: 4, type: 'info', title: '系統更新', desc: 'AI 劇本功能已升級，現支援更多粵語表達。', time: '2 天前', read: true },
  { id: 5, type: 'success', title: '觀看量達標', desc: '「獅子山下 第1集」觀看量突破 1,000！獲得 30 積分。', time: '3 天前', read: true },
];

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  warning: { icon: AlertCircle, color: 'text-amber-500 bg-amber-50' },
  info: { icon: Info, color: 'text-blue-500 bg-blue-50' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(n => n.map(n2 => ({ ...n2, read: true })));
  const remove = (id: number) => setNotifications(n => n.filter(n2 => n2.id !== id));

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">通知中心</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-sm text-primary hover:underline">
              全部標為已讀
            </button>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {notifications.map(n => {
              const cfg = typeConfig[n.type as keyof typeof typeConfig];
              const Icon = cfg.icon;
              return (
                <div key={n.id} className={`card-base p-4 flex gap-4 ${!n.read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className={`w-10 h-10 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-semibold text-sm ${!n.read ? 'text-ink' : 'text-muted'}`}>{n.title}</p>
                        <p className="text-xs text-muted mt-0.5">{n.desc}</p>
                      </div>
                      <button onClick={() => remove(n.id)} className="text-muted hover:text-red-400 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </div>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-20 text-muted">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>暫無通知</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
