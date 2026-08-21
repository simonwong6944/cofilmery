import { useState } from 'react';
import { Play, Star, Film, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';

export default function DramaWall() {
  const [search, setSearch] = useState('');
  const projects = mockProjects.filter(p => p.status === 'published' && (search === '' || p.title.includes(search)));
  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <Logo size="md" withWordmark theme="dark" />
        <Link to="/viewer" className="text-white/80 hover:text-white text-sm">← 返回首頁</Link>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-ink mb-6">所有作品</h1>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input className="w-full border border-line rounded-xl pl-12 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="搜尋作品名稱..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map(p => (
            <Link key={p.id} to={`/viewer/watch/${p.id}`} className="card-base overflow-hidden hover:shadow-md transition-shadow flex gap-4 p-4">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Film className="w-8 h-8 text-primary/30" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-ink">{p.title}</h3>
                <p className="text-muted text-sm line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-accent" /><span className="text-sm text-muted">{p.rating}</span>
                  <span className="text-muted">·</span><span className="text-sm text-muted">{p.episodeCount} 集</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
