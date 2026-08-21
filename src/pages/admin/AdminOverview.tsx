import { Users, Film, Star, Coins, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Logo } from '@/components/shared/Logo';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { FiveDimensionRadar } from '@/components/shared/FiveDimensionRadar';

export default function AdminOverview() {
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold text-lg">管理總覽</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <KPIStatCard label="總用戶數" value="1,842" unit="人" trend="+12%" icon={<Users className="w-5 h-5"/>} />
            <KPIStatCard label="本月作品" value="38" unit="部" trend="+8%" icon={<Film className="w-5 h-5"/>} />
            <KPIStatCard label="待審核" value="7" unit="部" trend="" icon={<Clock className="w-5 h-5"/>} />
            <KPIStatCard label="本月積分流通" value="12,450" unit="點" trend="+22%" icon={<Coins className="w-5 h-5"/>} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 card-base p-5">
              <h3 className="font-bold text-ink mb-4">近期審核活動</h3>
              <div className="space-y-3">
                {[
                  { title: '街市情緣 第2集', creator: '陳小明', status: 'approved', time: '2小時前' },
                  { title: '涼茶世家 第1集', creator: '林美芳', status: 'revision', time: '5小時前' },
                  { title: '獅子山下 第3集', creator: '黃志遠', status: 'reviewing', time: '昨天' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <p className="text-xs text-muted">{item.creator} · {item.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'approved' ? 'bg-green-100 text-green-700' :
                      item.status === 'revision' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{item.status === 'approved' ? '已通過' : item.status === 'revision' ? '需修改' : '審核中'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-base p-5">
              <h3 className="font-bold text-ink mb-4">平台整體評分</h3>
              <FiveDimensionRadar scores={{ content: 85, language: 88, culture: 90, ethics: 78, commercial: 86 }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
