import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_ALL_SERIES, DRAMA_GENRES, LEGACY_SUB_MODES } from '@/lib/mockData';
import type { DramaGenreId, LegacySubModeId } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, Star, Search, Film, Filter, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModeFilter = 'all' | 'drama' | 'legacy';
type StatusFilter = 'all' | 'published' | 'reviewing';

export default function Works() {
  const [modeFilter, setModeFilter]     = useState<ModeFilter>('all');
  const [genreFilter, setGenreFilter]   = useState<DramaGenreId | 'all'>('all');
  const [subModeFilter, setSubModeFilter] = useState<LegacySubModeId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch]             = useState('');

  // reset sub-filters when mode changes
  function handleModeChange(m: ModeFilter) {
    setModeFilter(m);
    setGenreFilter('all');
    setSubModeFilter('all');
  }

  const filtered = MOCK_ALL_SERIES.filter(p => {
    const matchMode   = modeFilter === 'all' || p.mode === modeFilter;
    const matchGenre  = genreFilter === 'all' || (p as any).genre === genreFilter;
    const matchSub    = subModeFilter === 'all' || (p as any).legacySubMode === subModeFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const allText     = [p.title, p.description, ...(p.tags ?? []), ...((p as any).autoTags ?? [])].join(' ');
    const matchSearch = !search || allText.includes(search);
    return matchMode && matchGenre && matchSub && matchStatus && matchSearch;
  });

  const published   = MOCK_ALL_SERIES.filter(p => p.status === 'published');
  const totalViews  = MOCK_ALL_SERIES.reduce((s, p) => s + (p.views ?? 0), 0);

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

        {/* ── Filter Bar ── */}
        <div className="bg-card border border-line rounded-2xl p-5 mb-6 space-y-4 shadow-card">

          {/* Row 1: Search + status */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="搜尋作品名稱、標籤、AI 標籤…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl bg-bg-soft text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0',
                statusFilter === 'published' ? 'bg-green-600 text-white' : 'bg-bg-soft border border-line text-ink hover:border-primary'
              )}
            >
              <Filter size={14} /> 只看已上線
            </button>
          </div>

          {/* Row 2: Mode filter */}
          <div>
            <p className="text-xs text-muted font-semibold mb-2">模式篩選</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all',    label: '全部模式' },
                { id: 'drama',  label: '🎬 戲劇模式' },
                { id: 'legacy', label: '📖 傳承模式' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => handleModeChange(f.id as ModeFilter)}
                  className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    modeFilter === f.id ? 'bg-primary text-white' : 'bg-bg-soft border border-line text-ink hover:border-primary'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3a: Drama genre sub-filter */}
          {modeFilter === 'drama' && (
            <div>
              <p className="text-xs text-muted font-semibold mb-2">題材類型</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setGenreFilter('all')}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    genreFilter === 'all' ? 'bg-primary text-white' : 'bg-bg-soft border border-line text-ink hover:border-primary'
                  )}
                >
                  全部題材
                </button>
                {DRAMA_GENRES.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGenreFilter(g.id === genreFilter ? 'all' : g.id)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                      genreFilter === g.id ? 'bg-primary text-white' : 'bg-bg-soft border border-line text-ink hover:border-primary'
                    )}
                  >
                    <span>{g.icon}</span> {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row 3b: Legacy sub-mode filter */}
          {modeFilter === 'legacy' && (
            <div>
              <p className="text-xs text-muted font-semibold mb-2">傳承模式</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSubModeFilter('all')}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    subModeFilter === 'all' ? 'bg-accent text-white' : 'bg-bg-soft border border-line text-ink hover:border-accent'
                  )}
                >
                  全部模式
                </button>
                {LEGACY_SUB_MODES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSubModeFilter(s.id === subModeFilter ? 'all' : s.id)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                      subModeFilter === s.id ? 'bg-accent text-white' : 'bg-bg-soft border border-line text-ink hover:border-accent'
                    )}
                  >
                    <span>{s.icon}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result count */}
        <p className="text-sm text-muted mb-4">
          找到 <span className="font-semibold text-ink">{filtered.length}</span> 個作品
          {search && <span>（包含搜尋：「{search}」）</span>}
        </p>

        {/* Works Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Film size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">找不到符合條件的作品</p>
            <button onClick={() => { handleModeChange('all'); setSearch(''); setStatusFilter('all'); }}
              className="mt-4 text-primary text-sm underline">清除篩選條件</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => {
              const drama = p as typeof p & { genre?: DramaGenreId; autoTags?: string[] };
              const legacy = p as typeof p & { legacySubMode?: LegacySubModeId; autoTags?: string[] };
              const genreInfo  = drama.genre  ? DRAMA_GENRES.find(g => g.id === drama.genre)    : null;
              const subInfo    = legacy.legacySubMode ? LEGACY_SUB_MODES.find(s => s.id === legacy.legacySubMode) : null;
              const autoTags   = (drama.autoTags ?? []) as string[];

              return (
                <Link
                  key={p.id}
                  to={`/works/${p.id}`}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group border border-line hover:border-primary/30 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="h-44 overflow-hidden relative shrink-0">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'; }}
                    />
                    {/* Mode badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <ModeBadge mode={p.mode} />
                      {/* Genre / SubMode pill */}
                      {genreInfo && (
                        <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {genreInfo.icon} {genreInfo.label}
                        </span>
                      )}
                      {subInfo && (
                        <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {subInfo.icon} {subInfo.label}
                        </span>
                      )}
                    </div>
                    {/* Stats overlay */}
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
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-muted text-sm line-clamp-2 mb-3 flex-1">{p.description}</p>

                    {/* Creator + manual tags */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {p.creator.name[0]}
                        </div>
                        {p.creator.name}
                      </div>
                      <div className="flex gap-1">
                        {(p.tags ?? []).slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs bg-bg-soft text-muted px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* AI auto-tags */}
                    {autoTags.length > 0 && (
                      <div className="border-t border-line pt-2 mt-1">
                        <div className="flex items-center gap-1 mb-1.5">
                          <Sparkles size={10} className="text-primary/60" />
                          <span className="text-[10px] text-muted font-medium">AI 自動標籤</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {autoTags.slice(0, 4).map((tag: string) => (
                            <span key={tag} className="text-[10px] bg-primary/8 text-primary/80 border border-primary/15 px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
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
