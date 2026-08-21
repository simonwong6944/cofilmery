import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Film, Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockProjects } from '@/lib/mockData';

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'draft', label: '草稿' },
  { id: 'reviewing', label: '審核中' },
  { id: 'published', label: '已發佈' },
  { id: 'revision', label: '需修改' },
];

export default function CreatorWorks() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockProjects.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false;
    if (search && !p.title.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold text-lg">我的作品</span>
          </div>
          <Link
            to="/creator/new"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            新增作品
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                className="form-input pl-9 py-2"
                placeholder="搜尋作品..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 border border-line px-3 py-2 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Filter className="w-4 h-4" />
              篩選
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 border border-line w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Works Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>暫無作品</p>
              <Link to="/creator/new" className="mt-4 inline-block text-primary hover:underline text-sm">
                立即建立新作品
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(project => (
                <div key={project.id} className="card-base overflow-hidden hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 relative flex items-center justify-center">
                    <Film className="w-10 h-10 text-primary/30" />
                    <div className="absolute top-3 left-3">
                      <ModeBadge mode={project.mode} />
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={project.status} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-ink mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-muted text-sm mb-3 line-clamp-2">{project.description}</p>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {project.views.toLocaleString()} 觀看
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {project.episodeCount} 集
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-line flex gap-2">
                      <Link
                        to={`/creator/drama/0`}
                        className="flex-1 text-center text-sm text-primary hover:underline font-medium"
                      >
                        繼續編輯
                      </Link>
                      <button className="text-sm text-muted hover:text-red-500 transition-colors">
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
