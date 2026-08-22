import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_ALL_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, Star, Search, Film, BookOpen, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModeFilter = 'all' | 'drama' | 'legacy';
type StatusFilter = 'all' | 'published' | 'reviewing';

export default function Works() {
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_ALL_SERIES.filter(p => {
    const matchMode = modeFilter === 'all' || p.mode === modeFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = p.title.includes(search) || p.description.includes(search) ||
      p.tags?.some((t: string) => t.includes(search));
    return matchMode && matchStatus && matchSearch;
  });

  const published = MOCK_ALL_SERIES.filter(p => p.status === 'published');
  const totalViews = MOCK_ALL_SERIES.reduce((s, p) => s + (p.views ?? 0), 0);

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* Hero Bar */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-3">CoFilmery 作品集</h1>
          <p className="text-white/80 text-lg mb-6">由年輕創作者與長者合力創作的粵語短片</p>
          <div className="flex justify-center gap-8">
            {[
              { label: '已上線作品', value: published.length },
              { label: '累計觀看', value: `${(totalViews / 10000).toFixed(1)}萬` },
              { label: '創作者', value: '1,247' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-accent">{s.value}</div>
                <div className="text-white/70 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="搜尋作品名稱、標籤…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl bg-card text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: '全部' },
              { id: 'drama', label: '🎬 戲劇模式' },
              { id: 'legacy', label: '📖 傳承模式' },
            ].map(f => (
              <button key={f.id} onClick={() => setModeFilter(f.id as ModeFilter)}
                className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  modeFilter === f.id ? 'bg-primary text-white' : 'bg-card border border-line text-ink hover:border-primary'
                )}>
                {f.label}
              </button>
            ))}
            <button onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5',
                statusFilter === 'published' ? 'bg-green-600 text-white' : 'bg-card border border-line text-ink hover:border-primary'
              )}>
              <Filter size={14} /> 只看已上線
            </button>
          </div>
        </div>

        {/* Works Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Film size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">找不到符合條件的作品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <Link key={p.id} to={`/works/${p.id}`}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group border border-line hover:border-primary/30"
              >
                {/* Thumbnail */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'; }}
                  />
                  <div className="absolute top-3 left-3">
                    <ModeBadge mode={p.mode} />
                  </div>
                  {p.status === 'published' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                      <div className="flex items-center gap-3 text-white text-xs">
                        <span className="flex items-center gap-1"><Eye size={11} />{(p.views ?? 0).toLocaleString()} 觀看</span>
                        <span className="flex items-center gap-1"><Film size={11} />{p.episodes} 集</span>
                        {p.esgScore > 0 && <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" />{p.esgScore}</span>}
                      </div>
                    </div>
                  )}
                  {p.status !== 'published' && (
                    <div className="absolute top-3 right-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        p.status === 'reviewing' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      )}>
                        {p.status === 'reviewing' ? '審批中' : '草稿'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-xl text-ink mb-1 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-muted text-sm line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {p.creator.name[0]}
                      </div>
                      {p.creator.name}
                    </div>
                    {p.tags && (
                      <div className="flex gap-1">
                        {p.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs bg-bg-soft text-muted px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 text-center bg-primary/5 border border-primary/20 rounded-2xl p-10">
          <Film size={36} className="mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-ink mb-2">你也可以成為創作者</h2>
          <p className="text-muted mb-6">加入 CoFilmery，用 AI 說粵語故事，服務長者社群，建立創作履歷</p>
          <Link to="/recruit" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            立即申請成為創作者
          </Link>
        </div>
      </div>
    </div>
  );
}
