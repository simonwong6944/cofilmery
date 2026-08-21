import { Play, Heart, Clock, Star, Film, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';

export default function ViewerHome() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <Logo size="md" withWordmark theme="dark" />
        <div className="flex items-center gap-4">
          <Link to="/viewer/favorites" className="flex items-center gap-1 text-white/80 hover:text-white text-sm"><Heart className="w-4 h-4" />我的收藏</Link>
          <Link to="/viewer/history" className="flex items-center gap-1 text-white/80 hover:text-white text-sm"><Clock className="w-4 h-4" />觀看記錄</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 p-6 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl">
          <h1 className="text-3xl font-bold mb-2">你好，{user?.name ?? '長者朋友'}！</h1>
          <p className="text-white/80 text-lg">今日有新的香港故事等你欣賞 ✨</p>
          <Link to="/viewer/drama" className="mt-4 inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl text-lg hover:bg-white/90 transition-colors">
            <Play className="w-5 h-5" />立即觀看
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-ink mb-4">為你推薦</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockProjects.filter(p => p.status === 'published').map(p => (
            <Link key={p.id} to={`/viewer/watch/${p.id}`} className="card-base overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                <Film className="w-12 h-12 text-primary/20" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-primary ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl text-ink mb-1">{p.title}</h3>
                <p className="text-muted text-base line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <Star className="w-4 h-4 text-accent" />{p.rating}
                  <span className="mx-1">·</span>{p.views.toLocaleString()} 人觀看
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
