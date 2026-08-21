import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_ALL_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, Clock } from 'lucide-react';

type Filter = 'all' | 'drama' | 'legacy';

export default function Works() {
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = filter === 'all' ? MOCK_ALL_SERIES : MOCK_ALL_SERIES.filter(s => s.mode === filter);
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-primary mb-2">作品展廊 · 公開預覽</h1>
        <p className="text-muted mb-8">完整作品於 CoEldery 85 應用程式內發佈</p>
        <div className="flex gap-3 mb-8">
          {(['all','drama','legacy'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter===f ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-line'}`}>
              {f==='all'?'全部':f==='drama'?'戲劇模式':'傳承模式'}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {filtered.map(s => (
            <Link key={s.id} to={`/works/${s.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
              <div className="relative">
                <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2"><ModeBadge mode={s.mode} size="sm" /></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink text-sm mb-2">{s.title} · {s.duration}{s.mode==='drama'?'秒':'分鐘'}</h3>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock size={11} />{s.mode==='drama'?`${s.episodes}集`:`${s.duration}分鐘`}</span>
                  <span className="flex items-center gap-1"><Eye size={11} />{s.views.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted mt-2">{s.creator.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
