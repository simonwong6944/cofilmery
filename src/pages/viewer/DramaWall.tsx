import { useState } from 'react';
import { Play, Star, Film, Search, Filter, Clock, ChevronLeft, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';
import { mockProjects } from '@/lib/mockData';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

type SortKey = 'views' | 'rating' | 'newest';
type ModeFilter = 'all' | 'drama' | 'legacy';

export default function DramaWall() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('views');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const projects = mockProjects
    .filter(p => p.status === 'published')
    .filter(p => modeFilter === 'all' || (p as any).mode === modeFilter)
    .filter(p => search === '' || p.title.includes(search) || p.description.includes(search))
    .sort((a, b) => {
      if (sort === 'views') return b.views - a.views;
      if (sort === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
      return 0;
    });

  const modeFilterOptions: [ModeFilter, string][] = [
    ['all',    tr.viewer.dramaWall.filterAll],
    ['drama',  tr.viewer.dramaWall.filterDrama],
    ['legacy', tr.viewer.dramaWall.filterLegacy],
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-950/95 backdrop-blur sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link to="/viewer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5"/>
          </Link>
          <Logo size="md" withWordmark theme="dark" />
          <span className="text-white/30 text-sm">/ {tr.viewer.dramaWall.allWorks}</span>
          <div className="ml-auto">
            <LocaleSwitcher layout="row" className="text-white/60 [&_button]:text-white/50 [&_button]:hover:text-white" />
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="border-b border-white/10 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/>
            <input
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white/15 border border-white/10 focus:border-primary/50"
              placeholder={tr.viewer.dramaWall.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Mode Filter */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {modeFilterOptions.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setModeFilter(val)}
                className={`px-3 py-2 text-sm transition-colors ${modeFilter === val ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40"/>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-primary/50"
            >
              <option value="views">{tr.viewer.dramaWall.sortByViews}</option>
              <option value="rating">{tr.viewer.dramaWall.sortByRating}</option>
              <option value="newest">{tr.viewer.dramaWall.sortNewest}</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Grid className="w-4 h-4"/>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
            >
              <List className="w-4 h-4"/>
            </button>
          </div>

          <span className="text-white/40 text-sm ml-auto">
            {projects.length} {tr.viewer.dramaWall.worksCount}
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Film className="w-16 h-16 mx-auto mb-4 opacity-50"/>
            <p className="text-xl mb-2">{tr.viewer.dramaWall.noWorks}</p>
            <p className="text-sm">{tr.viewer.dramaWall.noWorksHint}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => (
              <Link
                key={p.id}
                to={`/viewer/watch/${p.id}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={(p as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-6 h-6 text-primary ml-0.5"/>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${(p as any).mode === 'drama' ? 'bg-blue-600/90 text-white' : 'bg-amber-600/90 text-white'}`}>
                      {(p as any).mode === 'drama'
                        ? `🎭 ${tr.viewer.dramaWall.filterDrama}`
                        : `📜 ${tr.viewer.dramaWall.filterLegacy}`}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3"/>{p.episodeCount} {tr.common.episode}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-accent transition-colors">{p.title}</h3>
                  <p className="text-white/50 text-xs line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent"/>{p.rating}</span>
                    <span>{p.views.toLocaleString()} {tr.common.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                to={`/viewer/watch/${p.id}`}
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
              >
                <span className="text-white/30 font-bold w-6 text-center text-sm">{i + 1}</span>
                <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={(p as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=85&fit=crop'}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=85&fit=crop'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm group-hover:text-accent transition-colors mb-0.5">{p.title}</h3>
                  <p className="text-white/50 text-xs line-clamp-1">{p.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent"/>{p.rating}</span>
                    <span>{p.views.toLocaleString()} {tr.common.views}</span>
                    <span>{p.episodeCount} {tr.common.episode}</span>
                  </div>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${(p as any).mode === 'drama' ? 'bg-blue-600/30 text-blue-300' : 'bg-amber-600/30 text-amber-300'}`}>
                    {(p as any).mode === 'drama'
                      ? tr.viewer.dramaWall.filterDrama
                      : tr.viewer.dramaWall.filterLegacy}
                  </span>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Play className="w-4 h-4 text-white ml-0.5"/>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
