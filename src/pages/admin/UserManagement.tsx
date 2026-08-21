import { useState } from 'react';
import { Search, UserX, UserCheck, Mail, Shield, Filter } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Logo } from '@/components/shared/Logo';
import { MOCK_USERS } from '@/lib/mockData';

const ROLE_LABELS: Record<string, string> = {
  elder: '長者觀眾', creator: '創作者', sponsor: '企業贊助方', admin: '管理員'
};
const ROLE_COLORS: Record<string, string> = {
  elder: 'bg-purple-100 text-purple-700',
  creator: 'bg-blue-100 text-blue-700',
  sponsor: 'bg-amber-100 text-amber-700',
  admin: 'bg-red-100 text-red-700',
};

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = MOCK_USERS.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold text-lg">用戶管理</span>
            <span className="text-muted text-sm">共 {MOCK_USERS.length} 位用戶</span>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Mail className="w-4 h-4" />
            發送通知
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input className="form-input pl-9 py-2" placeholder="搜尋用戶名稱..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 border border-line rounded-lg p-1 bg-card">
              {['all', 'elder', 'creator', 'sponsor', 'admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${roleFilter === r ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}>
                  {r === 'all' ? '全部' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft border-b border-line">
                <tr>
                  <th className="text-left px-5 py-3 text-muted font-medium">用戶</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">角色</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">等級</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">月瀏覽</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">最後活躍</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">狀態</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-line last:border-0 hover:bg-bg-soft transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{user.name}</p>
                          <p className="text-xs text-muted">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{user.tier}</td>
                    <td className="px-5 py-3 text-ink">{user.monthlyViews.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted">{user.lastActive}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status === 'active' ? '正常' : '已停用'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button className="text-muted hover:text-primary" title="查看詳情"><Shield className="w-4 h-4" /></button>
                        <button className={`${user.status === 'active' ? 'text-muted hover:text-red-500' : 'text-muted hover:text-green-500'}`}
                          title={user.status === 'active' ? '停用' : '恢復'}>
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
