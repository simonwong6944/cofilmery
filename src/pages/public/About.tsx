import { PublicNav } from '@/components/layout/PublicNav';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

export default function About() {
  const { locale } = useLocaleStore();
  const tr = t();
  const a = tr.about;

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* ── Hero with photo ── */}
      <div className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img
            src="/images/about/two-generations.jpg"
            alt={a.title}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <Logo size="xl" withWordmark withTagline className="justify-center mb-8" theme="dark" />
          <h1 className="text-4xl font-bold text-white mb-3">{a.title}</h1>
          <p className="text-xl text-white/75">{a.subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { title: a.pillar1Title, desc: a.pillar1Desc, icon: a.pillar1Icon },
            { title: a.pillar2Title, desc: a.pillar2Desc, icon: a.pillar2Icon },
            { title: a.pillar3Title, desc: a.pillar3Desc, icon: a.pillar3Icon },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="bg-card rounded-xl p-6 shadow-card">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-primary mb-3">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Mission Image + Text */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div className="rounded-2xl overflow-hidden shadow-card-hover">
            <img
              src="/images/about/two-generations.jpg"
              alt={a.missionTitle}
              className="w-full h-72 object-cover"
            />
          </div>
          <div>
            <p className="text-accent font-semibold text-sm mb-2">{a.missionLabel}</p>
            <h2 className="text-2xl font-bold text-primary mb-4">{a.missionTitle}</h2>
            <div className="space-y-3 text-muted text-sm leading-relaxed">
              <p>{a.missionP1}</p>
              <p>{a.missionP2}</p>
              <p>{a.missionP3}</p>
            </div>
          </div>
        </div>

        {/* Ecosystem Banner */}
        <div className="bg-primary text-white rounded-2xl p-8 text-center mb-12">
          <p className="text-sm text-white/70 mb-2">{a.ecosystemLabel}</p>
          <h2 className="text-2xl font-bold mb-3">{a.ecosystemTitle}</h2>
          <p className="text-white/80">{a.ecosystemDesc}</p>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">{a.milestonesTitle}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { period: a.milestone1Period, event: a.milestone1Event },
              { period: a.milestone2Period, event: a.milestone2Event },
              { period: a.milestone3Period, event: a.milestone3Event },
              { period: a.milestone4Period, event: a.milestone4Event },
            ].map(({ period, event }) => (
              <div key={period} className="bg-card rounded-xl p-5 shadow-card border-l-4 border-accent">
                <p className="text-accent font-semibold text-sm mb-2">{period}</p>
                <p className="text-ink text-sm">{event}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
