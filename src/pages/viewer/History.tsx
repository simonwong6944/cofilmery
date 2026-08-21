import { Clock, Film, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';

export default function History() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <Logo size="md" withWordmark theme="dark" />
        <Link to="/viewer" className="text-white/80 hover:text-white text-sm">← 返回首頁</Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-ink mb-6 flex items-center gap-3"><Clock className="w-7 h-7 text-primary" />觀看記錄</h1>
        <div className="space-y-4">
          {mockProjects.slice(0,4).map((p, i) => (
            <div key={p.id} className="card-base p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                <Film className="w-8 h-8 text-primary/30" />
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">{35 + i * 10}%</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-ink">{p.title}</h3>
                <p className="text-muted text-sm">上次觀看：{i + 1} 天前</p>
                <div className="mt-2 h-1.5 bg-line rounded-full w-full"><div className="h-1.5 bg-accent rounded-full" style={{width: `${35 + i*10}%`}} /></div>
              </div>
              <Link to={`/viewer/watch/${p.id}`} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
