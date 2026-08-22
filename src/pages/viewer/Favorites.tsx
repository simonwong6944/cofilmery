import { useState } from 'react';
import { Heart, Film, Play, Trash2, ChevronLeft, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

export default function Favorites() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [favs, setFavs] = useState(mockProjects.slice(0, 4));
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = favs.filter(p => search === '' || p.title.includes(search));

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setFavs(f => f.filter(p => p.id !== id));
      setRemovingId(null);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-950/95 backdrop-blur sticky top-0 z-50 border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Link to="/viewer" className="text-white/60 hover:text-white flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-5 h-5"/>
        </Link>
        <Logo size="md" withWordmark theme="dark"/>
        <span className="text-white/30 text-sm">/ {tr.viewer.favorites.breadcrumb}</span>
        <div className="ml-auto">
          <LocaleSwitcher layout="row" className="text-white/60 [&_button]:text-white/50 [&_button]:hover:text-white" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-7 h-7 text-red-500 fill-red-500"/>
          <h1 className="text-3xl font-bold text-white">{tr.viewer.favorites.title}</h1>
          <span className="bg-white/10 text-white/60 text-sm px-3 py-1 rounded-full ml-2">{favs.length} {tr.common.episode.replace('集','套')}</span>
        </div>

        {/* Search */}
        {favs.length > 0 && (
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:bg-white/15 border border-white/10"
              placeholder={tr.viewer.favorites.searchPlaceholder}
            />
          </div>
        )}

        {/* Empty State */}
        {favs.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-30"/>
            <p className="text-xl mb-2">{tr.viewer.favorites.empty}</p>
            <p className="text-sm mb-6">{tr.viewer.favorites.emptyHint}</p>
            <Link
              to="/viewer/drama"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Film className="w-5 h-5"/>{tr.viewer.favorites.browseWorks}
            </Link>
          </div>
        )}

        {/* Favorites List */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all ${removingId === p.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={(p as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop'}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop'; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent"/>{p.rating}</span>
                    <span>{p.episodeCount} {tr.common.episode}</span>
                    <span>{p.views.toLocaleString()} {tr.common.views}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${(p as any).mode === 'drama' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {(p as any).mode === 'drama'
                        ? `🎭 ${tr.viewer.dramaWall.filterDrama}`
                        : `📜 ${tr.viewer.dramaWall.filterLegacy}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="w-9 h-9 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title={tr.viewer.favorites.removeBtn}
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                  <Link
                    to={`/viewer/watch/${p.id}`}
                    className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Play className="w-4 h-4 text-white ml-0.5"/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No search results */}
        {favs.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50"/>
            <p>{tr.viewer.favorites.noResults.replace('{q}', search)}</p>
          </div>
        )}

        {/* Discover More */}
        {favs.length > 0 && (
          <div className="mt-8 p-5 bg-gradient-to-r from-primary/20 to-accent/10 border border-white/10 rounded-2xl text-center">
            <Film className="w-8 h-8 text-accent mx-auto mb-2"/>
            <p className="text-white font-medium mb-1">{tr.viewer.favorites.discoverMore}</p>
            <p className="text-white/50 text-sm mb-3">{tr.viewer.favorites.discoverDesc}</p>
            <Link
              to="/viewer/drama"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4"/>{tr.viewer.favorites.browseAll}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
