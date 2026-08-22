import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { Logo } from '@/components/shared/Logo';
import { Film, BookOpen, BookMarked, Users, Eye, ArrowRight, Play } from 'lucide-react';
import { MOCK_DRAMA_SERIES, MOCK_LEGACY_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

export default function Landing() {
  // Subscribe to locale so this component re-renders on language switch
  const { locale } = useLocaleStore();
  const tr = t();
  const l = tr.landing;

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* Hero — full-bleed with photo background */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/landing/elder-watching-film.jpg"
            alt={l.hero1}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-soft/95 via-bg-soft/80 to-bg-soft" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {l.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight mb-5">
            {l.hero1}<br />
            <span className="text-primary">{l.hero2}</span>
          </h1>
          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
            {l.subline}
          </p>

          {/* Two Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-14">
            <div className="bg-primary rounded-2xl p-8 text-left text-white shadow-card-hover">
              <div className="flex items-center gap-2 mb-4">
                <Film size={22} />
                <span className="font-bold text-xl">{l.dramaMode}</span>
              </div>
              <p className="text-white/90 font-medium mb-2">{l.dramaModeDesc}</p>
              <p className="text-white/70 text-sm mb-6">{l.dramaModeDetail}</p>
              <Link to="/drama-mode" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm">
                {l.learnMore} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-accent rounded-2xl p-8 text-left text-white shadow-card-hover">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={22} />
                <span className="font-bold text-xl">{l.legacyMode}</span>
              </div>
              <p className="text-white/90 font-medium mb-2">{l.legacyModeDesc}</p>
              <p className="text-white/70 text-sm mb-6">{l.legacyModeDetail}</p>
              <Link to="/legacy-mode" className="inline-flex items-center gap-2 bg-white text-accent font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm">
                {l.learnMore} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mb-12">
            {[
              { icon: BookMarked, label: l.stat1Label, value: l.stat1Value, unit: l.stat1Unit },
              { icon: Users,      label: l.stat2Label, value: l.stat2Value, unit: l.stat2Unit },
              { icon: Eye,        label: l.stat3Label, value: l.stat3Value, unit: l.stat3Unit },
            ].map(({ icon: Icon, label, value, unit }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={24} className="text-accent mb-1" />
                <span className="text-sm text-muted">{label}</span>
                <span className="text-2xl font-bold text-primary">{value}</span>
                <span className="text-sm text-muted">{unit}</span>
              </div>
            ))}
          </div>

          {/* Creator Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl py-4 px-6 text-sm text-primary font-medium">
            {l.creatorBannerText}{' '}
            <Link to="/recruit" className="underline hover:no-underline">{l.creatorBannerLink}</Link>
          </div>
        </div>
      </section>

      {/* ── Platform Mission Visual Strip ── */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-15">
          <img
            src="/images/recruit/bridge-hands.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-white">
          <div className="text-center">
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="font-bold text-lg mb-2">{l.missionTitle1}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{l.missionDesc1}</p>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2">{l.missionTitle2}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{l.missionDesc2}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💛</div>
            <h3 className="font-bold text-lg mb-2">{l.missionTitle3}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{l.missionDesc3}</p>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-line">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">{l.featuredWorks}</h2>
          <Link to="/works" className="text-sm text-accent hover:underline flex items-center gap-1">
            {l.viewAll} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...MOCK_DRAMA_SERIES.slice(0,2), ...MOCK_LEGACY_SERIES.slice(0,1)].map(project => (
            <Link key={project.id} to={`/works/${project.id}`} className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              <div className="relative">
                <img src={project.thumbnail} alt={project.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3">
                  <ModeBadge mode={project.mode} size="sm" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Play size={40} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{project.title}</h3>
                <p className="text-xs text-muted mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{project.creator.name}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {project.views.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <Logo size="md" withWordmark withTagline theme="dark" />
              <p className="text-white/60 text-sm mt-3 max-w-xs">{l.footerTagline}</p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold mb-3">{l.footerPlatform}</p>
                {[l.footerAbout, l.footerModes, l.footerWorks, l.footerPricing].map(label => (
                  <p key={label} className="text-white/60 hover:text-white cursor-pointer mb-1.5">{label}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold mb-3">{l.footerCreator}</p>
                {[l.footerRecruit, l.footerESG, l.footerCredits, l.footerSubmit].map(label => (
                  <p key={label} className="text-white/60 hover:text-white cursor-pointer mb-1.5">{label}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold mb-3">{l.footerEnterprise}</p>
                {[l.footerESGCollab, l.footerCorpLegacy, l.footerBrandSponsor, l.footerContact].map(label => (
                  <p key={label} className="text-white/60 hover:text-white cursor-pointer mb-1.5">{label}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/50">
            <p>{l.footerCopyright}</p>
            <p>{l.footerLinks}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
