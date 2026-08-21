import { Clock, Eye, CheckCircle, AlertCircle, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Logo } from '@/components/shared/Logo';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { MOCK_REVIEW_QUEUE } from '@/lib/mockData';

export default function ReviewQueue() {
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold text-lg">審批佇列</span>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {MOCK_REVIEW_QUEUE.length} 待審
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="w-4 h-4" />
            平均等候：4.2 小時
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '今日待審', value: '7', color: 'text-red-600 bg-red-50', icon: Clock },
              { label: '本週已審', value: '23', color: 'text-green-600 bg-green-50', icon: CheckCircle },
              { label: '需修改', value: '3', color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
              { label: '平均分', value: '8.7', color: 'text-blue-600 bg-blue-50', icon: Film },
            ].map((s, i) => (
              <div key={i} className="card-base p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-ink">{s.value}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Queue Table */}
          <div className="card-base overflow-hidden">
            <div className="px-5 py-3 border-b border-line bg-bg-soft flex items-center justify-between">
              <h2 className="font-bold text-ink">待審作品列表</h2>
              <select className="border border-line rounded px-2 py-1 text-sm text-muted">
                <option>全部模式</option>
                <option>戲劇模式</option>
                <option>傳承模式</option>
              </select>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className="text-left px-5 py-3 text-muted font-medium">作品名稱</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">模式</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">創作者</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">等候時間</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">AI 預審分</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REVIEW_QUEUE.map((item) => {
                  const avg = Object.values(item.score).reduce((a, b) => a + b, 0) / Object.values(item.score).length;
                  return (
                    <tr key={item.id} className="border-b border-line last:border-0 hover:bg-bg-soft transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Film className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-ink">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <ModeBadge mode={item.mode as 'drama' | 'legacy'} />
                      </td>
                      <td className="px-5 py-4 text-muted">{item.creator}</td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1 ${item.waitHours > 4 ? 'text-red-500' : 'text-muted'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {item.waitHours} 小時
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-bold ${avg >= 8.5 ? 'text-green-600' : avg >= 7 ? 'text-amber-600' : 'text-red-500'}`}>
                          {avg.toFixed(1)}
                        </span>
                        <span className="text-muted text-xs"> / 10</span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/review/${item.id}`}
                          className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          審核
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
