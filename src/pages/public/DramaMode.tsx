import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_DRAMA_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, ArrowRight, MessageSquare, Cpu, Camera, Mic } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const GENRE_STYLES = [
  { icon: '🌟', color: 'from-yellow-50 to-amber-50',   border: 'border-yellow-200',  badge: 'bg-yellow-100 text-yellow-700' },
  { icon: '💛', color: 'from-rose-50 to-pink-50',      border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-700' },
  { icon: '👨‍👩‍👧‍👦', color: 'from-blue-50 to-indigo-50',   border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-700' },
  { icon: '🌺', color: 'from-emerald-50 to-teal-50',   border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  { icon: '🕰️', color: 'from-orange-50 to-amber-50',  border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-700' },
  { icon: '🤝', color: 'from-violet-50 to-purple-50',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700' },
];

export default function DramaMode() {
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const { locale } = useLocaleStore();
  const tr = t();
  const d = tr.dramaMode;

  // Build genres dynamically from locale
  const GENRES = [1, 2, 3, 4, 5, 6].map((num, i) => ({
    num,
    ...GENRE_STYLES[i],
    title:   d.genres[num as keyof typeof d.genres].title,
    tagline: d.genres[num as keyof typeof d.genres].tagline,
    desc:    d.genres[num as keyof typeof d.genres].desc,
    eg:      d.genres[num as keyof typeof d.genres].eg,
  }));

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* ── Hero with background image ── */}
      <div className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <img
            src="/images/drama/creative-team.jpg"
            alt={d.heroTitle1}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="mb-4"><ModeBadge mode="drama" /></div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            {d.heroTitle1}<br />
            <span className="text-accent">{d.heroTitle2}</span>
          </h1>
          <p className="text-xl text-white/75 mb-8 max-w-2xl">{d.heroSubtitle}</p>
          <Link
            to="/creator/new"
            className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-8 py-3 rounded-xl hover:bg-accent/90 transition-colors"
          >
            {d.heroCta} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ─── Genre Section ─── */}
        <div className="mb-16">
          <div className="text-center mb-3">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">{d.genresBadge}</span>
            <h2 className="text-3xl font-bold text-ink mb-2">{d.genresTitle}</h2>
            <p className="text-muted text-base max-w-xl mx-auto">{d.genresDesc}</p>
          </div>

          {/* Genre grid */}
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {GENRES.map((g) => {
              const isActive = activeGenre === g.num;
              return (
                <button
                  key={g.num}
                  onClick={() => setActiveGenre(isActive ? null : g.num)}
                  className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 bg-gradient-to-br ${g.color} ${
                    isActive ? `${g.border} shadow-lg scale-[1.01]` : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{g.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${g.badge}`}>{d.genreNum} {g.num}</span>
                        </div>
                        <h3 className="font-bold text-ink text-lg leading-tight">{g.title}</h3>
                      </div>
                    </div>
                    <span className={`text-xl transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}>›</span>
                  </div>

                  <p className="text-sm font-medium text-primary mb-2">{g.tagline}</p>

                  {/* Expanded detail */}
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-black/10 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-ink/80 leading-relaxed">{g.desc}</p>
                      <div className="bg-white/70 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted leading-relaxed">{g.eg}</p>
                      </div>
                    </div>
                  )}

                  {/* Collapsed preview */}
                  {!isActive && (
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{g.desc}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA below genres */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted mb-4">{d.ctaLine1}</p>
            <Link
              to="/creator/new"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              {d.ctaBtn} <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 4-step flow */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-primary mb-6">{d.flowTitle}</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: MessageSquare, step: d.step1Step, title: d.step1Title, desc: d.step1Desc },
              { icon: Cpu,           step: d.step2Step, title: d.step2Title, desc: d.step2Desc },
              { icon: Camera,        step: d.step3Step, title: d.step3Title, desc: d.step3Desc },
              { icon: Mic,           step: d.step4Step, title: d.step4Title, desc: d.step4Desc },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-card rounded-xl p-5 shadow-card border-t-4 border-primary">
                <Icon size={24} className="text-primary mb-3" />
                <p className="text-xs text-muted mb-1">{step}</p>
                <h3 className="font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Era nostalgia visual strip */}
        <div className="relative rounded-2xl overflow-hidden mb-12 shadow-card-hover">
          <img
            src="/images/drama/hk-nostalgia.jpg"
            alt={d.nostalgiaTitle}
            className="w-full h-56 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent flex items-center">
            <div className="px-8">
              <p className="text-accent font-semibold text-sm mb-1">{d.nostalgiaBadge}</p>
              <h3 className="text-2xl font-bold text-white mb-2">{d.nostalgiaTitle}</h3>
              <p className="text-white/80 text-sm max-w-md">{d.nostalgiaDesc}</p>
            </div>
          </div>
        </div>

        {/* Works */}
        <h2 className="text-2xl font-bold text-primary mb-6">{d.worksTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {MOCK_DRAMA_SERIES.map(s => (
            <Link key={s.id} to={`/works/${s.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
              <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                <p className="text-xs text-muted flex items-center gap-1"><Eye size={12} /> {s.views.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Link to="/creator/new" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg">
            {d.finalCta} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
