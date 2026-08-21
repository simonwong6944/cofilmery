import { Heart, Film, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';

export default function Favorites() {
  const favs = mockProjects.slice(0,3);
  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <Logo size="md" withWordmark theme="dark" />
        <Link to="/viewer" className="text-white/80 hover:text-white text-sm">← 返回首頁</Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-ink mb-6 flex items-center gap-3"><Heart className="w-7 h-7 text-red-500" />我的收藏</h1>
        {favs.length === 0 ? (
          <div className="text-center py-20 text-muted"><Heart className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-lg">尚未收藏任何作品</p></div>
        ) : (
          <div className="space-y-4">
            {favs.map(p => (
              <div key={p.id} className="card-base p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Film className="w-8 h-8 text-primary/30" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-ink">{p.title}</h3>
                  <p className="text-muted text-sm">{p.episodeCount} 集 · {p.views.toLocaleString()} 人觀看</p>
                </div>
                <Link to={`/viewer/watch/${p.id}`} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
