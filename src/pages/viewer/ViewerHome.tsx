import { useState } from 'react';
import { Play, Heart, Clock, Star, Film, ChevronRight, Search, Bell, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';

const FEATURED_WORK = mockProjects[0];
const RECOMMENDED = mockProjects.filter(p => p.status === 'published');

export default function ViewerHome() {
  const { user } = useAuthStore();
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const categories = [
    { id: 'all',    label: tr.viewer.categories.all },
    { id: 'drama',  label: tr.viewer.categories.drama },
    { id: 'legacy', label: tr.viewer.categories.legacy },
    { id: 'hk',     label: tr.viewer.categories.hk },
    { id: 'family', label: tr.viewer.categories.family },
  ];

  const filtered = RECOMMENDED.filter(p => {
    if (activeCategory === 'drama') return p.mode === 'drama';
    if (activeCategory === 'legacy') return p.mode === 'legacy';
    if (searchQuery) return p.title.includes(searchQuery) || p.description.includes(searchQuery);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <header className="bg-gray-950/95 backdrop-blur sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Logo size="md" withWordmark theme="dark" />

          {showSearch ? (
            <div className="flex-1 max-w-md">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:bg-white/15"
                placeholder={tr.viewer.home.searchPlaceholder}
              />
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/viewer/drama" className="text-white/80 hover:text-white transition-colors">
                {tr.viewer.home.allWorks}
              </Link>
              <Link to="/viewer/favorites" className="text-white/80 hover:text-white transition-colors flex items-center gap-1">
                <Heart className="w-4 h-4"/>{tr.viewer.home.favorites}
              </Link>
              <Link to="/viewer/history" className="text-white/80 hover:text-white transition-colors flex items-center gap-1">
                <Clock className="w-4 h-4"/>{tr.viewer.home.history}
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <Search className="w-5 h-5"/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5"/>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full"/>
            </button>
            {/* Locale switcher for viewer */}
            <LocaleSwitcher layout="row" className="text-white/70 [&_button]:text-white/60 [&_button:hover]:text-white [&_.text-primary]:text-accent" />
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0] ?? 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10"/>
        <img
          src={FEATURED_WORK.thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=500&fit=crop'}
          alt={FEATURED_WORK.title}
          className="w-full h-[340px] object-cover opacity-50"
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              🎬 {tr.viewer.home.todayFeature}
            </span>
            <h1 className="text-4xl font-bold mb-2">{FEATURED_WORK.title}</h1>
            <p className="text-white/80 text-lg mb-2 max-w-xl">{FEATURED_WORK.description}</p>
            <div className="flex items-center gap-3 mb-5 text-sm text-white/70">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent"/>{FEATURED_WORK.rating}</span>
              <span>·</span>
              <span>{FEATURED_WORK.views.toLocaleString()} {tr.viewer.drama.episodes}</span>
              <span>·</span>
              <span>{FEATURED_WORK.episodeCount} {tr.common.episode}</span>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/viewer/watch/${FEATURED_WORK.id}`}
                className="flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-lg"
              >
                <Play className="w-5 h-5 fill-primary"/>{tr.viewer.home.watchNow}
              </Link>
              <Link
                to="/viewer/drama"
                className="flex items-center gap-2 bg-white/10 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                {tr.viewer.home.browseMore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl">👋</div>
          <div>
            <h2 className="text-white font-bold text-lg">
              {tr.viewer.home.welcomeGreeting}{user?.name ?? tr.viewer.home.defaultName}！
            </h2>
            <p className="text-white/60 text-sm">
              {tr.viewer.home.newToday}{' '}
              <span className="text-accent font-semibold">3</span>{' '}
              {tr.viewer.home.newTodaySuffix}
            </p>
          </div>
          <Link to="/viewer/history" className="ml-auto text-accent text-sm font-medium flex items-center gap-1 hover:underline whitespace-nowrap">
            {tr.viewer.home.continueWatching} <ChevronRight className="w-4 h-4"/>
          </Link>
        </div>

        {/* Category Filter */}
        <section>
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <Link
                key={p.id}
                to={`/viewer/watch/${p.id}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={(p as any).thumbnail || `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop`}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-5 h-5 text-primary ml-0.5"/>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${(p as any).mode === 'drama' ? 'bg-blue-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                      {(p as any).mode === 'drama' ? `🎭 ${tr.viewer.dramaWall.filterDrama}` : `📜 ${tr.viewer.dramaWall.filterLegacy}`}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                    {p.episodeCount} {tr.common.episode}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-accent transition-colors">{p.title}</h3>
                  <p className="text-white/50 text-xs line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent"/>{p.rating}</span>
                    <span>{p.views.toLocaleString()} {tr.common.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Film className="w-12 h-12 mx-auto mb-3"/>
              <p>{tr.viewer.dramaWall.noWorks}</p>
            </div>
          )}
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent"/>{tr.viewer.home.trending}
            </h2>
            <Link to="/viewer/drama" className="text-sm text-accent hover:underline flex items-center gap-1">
              {tr.viewer.home.viewAll} <ChevronRight className="w-4 h-4"/>
            </Link>
          </div>
          <div className="space-y-3">
            {mockProjects.slice(0, 4).map((p, i) => (
              <Link
                key={p.id}
                to={`/viewer/watch/${p.id}`}
                className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'}`}>
                  {i + 1}
                </div>
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={(p as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=75&fit=crop'}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=75&fit=crop'; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm group-hover:text-accent transition-colors">{p.title}</h3>
                  <p className="text-white/50 text-xs">{p.views.toLocaleString()} {tr.common.views}</p>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <Star className="w-3 h-3 text-accent fill-accent"/>{p.rating}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ESG / Impact Section */}
        <section className="bg-gradient-to-r from-primary/30 to-accent/20 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-accent"/>
            <h2 className="text-white font-bold text-lg">{tr.viewer.home.esgTitle}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '47,300', label: tr.viewer.home.totalViews,        icon: '👁' },
              { value: '6',      label: tr.viewer.home.publishedWorks,    icon: '🎬' },
              { value: '5',      label: tr.viewer.home.certifiedCreators, icon: '🏆' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-white/60 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-4"/>
      </main>
    </div>
  );
}
