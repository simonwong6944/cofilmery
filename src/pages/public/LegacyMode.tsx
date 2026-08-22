import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_LEGACY_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { User, FileCheck, Video, Cpu, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const SUB_MODE_STYLES = {
  personal: {
    id: 'personal',
    icon: '👤',
    color: 'border-primary bg-primary/5',
    activeColor: 'border-primary bg-primary text-white',
    tagColor: 'bg-primary/10 text-primary',
  },
  corporate: {
    id: 'corporate',
    icon: '🏢',
    color: 'border-accent bg-accent/5',
    activeColor: 'border-accent bg-accent text-white',
    tagColor: 'bg-accent/10 text-accent',
  },
  social: {
    id: 'social',
    icon: '🌍',
    color: 'border-green-600 bg-green-50',
    activeColor: 'border-green-600 bg-green-600 text-white',
    tagColor: 'bg-green-100 text-green-700',
  },
};

export default function LegacyMode() {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const { locale } = useLocaleStore();
  const tr = t();
  const lm = tr.legacyMode;

  // Build SUB_MODES from locale
  const SUB_MODES = (['personal', 'corporate', 'social'] as const).map(key => ({
    ...SUB_MODE_STYLES[key],
    title:       lm.subModes[key].title,
    badge:       lm.subModes[key].badge,
    desc:        lm.subModes[key].desc,
    examples:    lm.subModes[key].examples,
    episodeNote: lm.subModes[key].episodeNote,
  }));

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* ── Hero with background image ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/legacy/interview-scene.jpg"
            alt={lm.heroTitle1}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-accent/90 via-accent/75 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="mb-4"><ModeBadge mode="legacy" /></div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            {lm.heroTitle1}<br />
            <span className="text-white/90">{lm.heroTitle2}</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl">{lm.heroSubtitle}</p>
          <Link
            to="/creator/new"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            {lm.heroCta} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* 3 Sub-Modes */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-primary mb-2">{lm.modesTitle}</h2>
          <p className="text-muted mb-6">{lm.modesDesc}</p>

          <div className="grid md:grid-cols-3 gap-5">
            {SUB_MODES.map(mode => {
              const isActive = activeMode === mode.id;
              return (
                <div
                  key={mode.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                    isActive ? mode.activeColor : mode.color + ' hover:shadow-card-hover'
                  }`}
                  onClick={() => setActiveMode(isActive ? null : mode.id)}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mode.icon}</span>
                        <div>
                          <h3 className={`font-bold text-xl ${isActive ? 'text-white' : 'text-ink'}`}>
                            {mode.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isActive ? 'bg-white/20 text-white' : mode.tagColor
                          }`}>
                            {mode.badge}
                          </span>
                        </div>
                      </div>
                      {isActive
                        ? <ChevronUp size={18} className="text-white/70" />
                        : <ChevronDown size={18} className="text-muted" />
                      }
                    </div>
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-white/90' : 'text-muted'}`}>
                      {mode.desc}
                    </p>
                  </div>

                  {/* Expanded Details */}
                  {isActive && (
                    <div className="px-6 pb-6 border-t border-white/20 pt-4">
                      <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mb-3">{lm.examplesLabel}</p>
                      <ul className="space-y-2 mb-4">
                        {mode.examples.map((eg, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/90">
                            <span className="text-white/50 shrink-0">·</span>
                            <span>{eg}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-white/10 rounded-lg px-4 py-3">
                        <p className="text-xs text-white/80">
                          <span className="font-semibold">{lm.episodesLabel}：</span>{mode.episodeNote}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Click hint */}
          {!activeMode && (
            <p className="text-center text-sm text-muted mt-4">{lm.clickHint}</p>
          )}
        </div>

        {/* 4-Step Flow */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-primary mb-6">{lm.flowTitle}</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: User,      step: lm.step1Step, title: lm.step1Title, desc: lm.step1Desc },
              { icon: FileCheck, step: lm.step2Step, title: lm.step2Title, desc: lm.step2Desc },
              { icon: Video,     step: lm.step3Step, title: lm.step3Title, desc: lm.step3Desc },
              { icon: Cpu,       step: lm.step4Step, title: lm.step4Title, desc: lm.step4Desc },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-card rounded-xl p-5 shadow-card border-t-4 border-accent">
                <Icon size={24} className="text-accent mb-3" />
                <p className="text-xs text-muted mb-1">{step}</p>
                <h3 className="font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo strip — interview moment */}
        <div className="relative rounded-2xl overflow-hidden mb-12 shadow-card-hover">
          <img
            src="/images/legacy/interview-scene.jpg"
            alt={lm.interviewTitle}
            className="w-full h-56 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-accent/85 to-transparent flex items-center">
            <div className="px-8">
              <p className="text-white/70 font-semibold text-sm mb-1">{lm.interviewBadge}</p>
              <h3 className="text-2xl font-bold text-white mb-2">{lm.interviewTitle}</h3>
              <p className="text-white/80 text-sm max-w-md">{lm.interviewDesc}</p>
            </div>
          </div>
        </div>

        {/* Works Gallery */}
        <h2 className="text-2xl font-bold text-primary mb-6">{lm.worksTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {MOCK_LEGACY_SERIES.map(s => (
            <Link key={s.id} to={`/works/${s.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
              <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                <p className="text-xs text-muted flex items-center gap-1"><Eye size={12} /> {s.views.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/creator/new" className="inline-flex items-center gap-2 bg-accent text-white font-bold px-10 py-4 rounded-xl hover:bg-accent/90 transition-colors text-lg">
            {lm.finalCta} <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
