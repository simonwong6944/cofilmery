import { useState } from 'react';
import { Clock, Film, Play, Trash2, ChevronLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';

type HistoryItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  mode: string;
  episodeCount: number;
  rating: string;
  views: number;
  watchedEp: number;
  progress: number;
  lastWatched: string;
};

const HISTORY_DATA: HistoryItem[] = mockProjects.slice(0, 5).map((p, i) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  thumbnail: (p as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
  mode: (p as any).mode || 'drama',
  episodeCount: p.episodeCount,
  rating: p.rating,
  views: p.views,
  watchedEp: Math.min(i + 1, p.episodeCount),
  progress: [35, 72, 100, 18, 55][i],
  lastWatched: ['剛才', '2 小時前', '昨天', '3 天前', '1 周前'][i],
}));

export default function History() {
  const [history, setHistory] = useState(HISTORY_DATA);
  const [cleared, setCleared] = useState(false);

  const handleRemove = (id: string) => {
    setHistory(h => h.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setHistory([]);
    setCleared(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-950/95 backdrop-blur sticky top-0 z-50 border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Link to="/viewer" className="text-white/60 hover:text-white flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-5 h-5"/>
        </Link>
        <Logo size="md" withWordmark theme="dark"/>
        <span className="text-white/30 text-sm">/ 觀看記錄</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7 text-primary"/>
            <h1 className="text-3xl font-bold text-white">觀看記錄</h1>
            <span className="bg-white/10 text-white/60 text-sm px-3 py-1 rounded-full">{history.length} 套</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-sm text-white/40 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4"/>清除全部
            </button>
          )}
        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-30"/>
            <p className="text-xl mb-2">{cleared ? '已清除全部記錄' : '尚無觀看記錄'}</p>
            <p className="text-sm mb-6">開始觀看作品，記錄將自動儲存</p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                to="/viewer/drama"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Film className="w-5 h-5"/>瀏覽作品
              </Link>
              {cleared && (
                <button
                  onClick={() => { setHistory(HISTORY_DATA); setCleared(false); }}
                  className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4"/>恢復示範資料
                </button>
              )}
            </div>
          </div>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((p) => (
              <div key={p.id} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl overflow-hidden transition-all group">
                <div className="flex items-stretch">
                  {/* Thumbnail */}
                  <div className="w-28 flex-shrink-0 relative">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=90&fit=crop'; }}
                    />
                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                      <div
                        className={`h-1 ${p.progress >= 100 ? 'bg-green-500' : 'bg-accent'}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    {p.progress >= 100 && (
                      <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-0.5">
                        <CheckCircle className="w-3 h-3 text-white"/>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${p.mode === 'drama' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {p.mode === 'drama' ? '戲劇' : '傳承'}
                          </span>
                          <span className="text-white/30 text-xs">{p.lastWatched}</span>
                        </div>
                        <h3 className="font-bold text-white text-sm truncate">{p.title}</h3>
                        <p className="text-white/40 text-xs mt-0.5">
                          已看第 {p.watchedEp} 集 / 共 {p.episodeCount} 集
                          {p.progress < 100 && <span> · 播放至 {p.progress}%</span>}
                          {p.progress >= 100 && <span className="text-green-400"> · 已看完</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/30 mb-1">
                        <span>觀看進度</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${p.progress >= 100 ? 'bg-green-500' : 'bg-accent'}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center pr-4">
                    <Link
                      to={`/viewer/watch/${p.id}`}
                      className="w-12 h-12 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition-colors group-hover:bg-primary"
                    >
                      <Play className="w-5 h-5 text-white ml-0.5"/>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Watching CTA */}
        {history.filter(p => p.progress < 100 && p.progress > 0).length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-accent/10 border border-white/10 rounded-2xl">
            <p className="text-white font-medium text-sm mb-1">
              你有 {history.filter(p => p.progress < 100 && p.progress > 0).length} 套作品未看完
            </p>
            <p className="text-white/50 text-xs">繼續觀看，支持創作者的心意</p>
          </div>
        )}
      </main>
    </div>
  );
}
