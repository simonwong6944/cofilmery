import { useState } from 'react';
import { PublicNav } from '@/components/layout/PublicNav';
import { TierBadge } from '@/components/shared/TierBadge';
import { CheckCircle, ArrowRight, Sparkles, TrendingUp, Users, Award, ChevronDown, ChevronUp, Heart, Lightbulb, Briefcase } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

export default function Recruit() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { locale } = useLocaleStore();
  const tr = t();
  const r = tr.recruit;

  // Dynamic arrays from locale
  const PAIN_POINTS = [
    { icon: Heart,     problem: r.pain1Title, desc: r.pain1Desc, color: 'bg-rose-50 border-rose-200',   iconColor: 'text-rose-500' },
    { icon: Lightbulb, problem: r.pain2Title, desc: r.pain2Desc, color: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-500' },
    { icon: Briefcase, problem: r.pain3Title, desc: r.pain3Desc, color: 'bg-blue-50 border-blue-200',   iconColor: 'text-blue-500' },
  ];

  const VALUE_PROPS = [
    {
      icon: Sparkles,
      img: '/images/recruit/ai-vs-traditional.jpg',
      title: r.vp1Title,
      subtitle: r.vp1Subtitle,
      body: r.vp1Body,
      highlight: r.vp1Highlight,
    },
    {
      icon: Users,
      img: '/images/recruit/creator-sharing.jpg',
      title: r.vp2Title,
      subtitle: r.vp2Subtitle,
      body: r.vp2Body,
      highlight: r.vp2Highlight,
    },
    {
      icon: TrendingUp,
      img: '/images/recruit/bridge-hands.jpg',
      title: r.vp3Title,
      subtitle: r.vp3Subtitle,
      body: r.vp3Body,
      highlight: r.vp3Highlight,
    },
  ];

  const IMPACT_STATS = [
    { value: '55萬+', label: r.statsLabel1, sub: r.statsSub1 },
    { value: '2天',   label: r.statsLabel2, sub: r.statsSub2 },
    { value: '80%',  label: r.statsLabel3, sub: r.statsSub3 },
    { value: '4級',  label: r.statsLabel4, sub: r.statsSub4 },
  ];

  const TESTIMONIALS = [
    { quote: r.quote1, name: r.creator1Name, age: r.creator1Age, tier: r.creator1Tier as 'certified', detail: r.creator1Detail },
    { quote: r.quote2, name: r.creator2Name, age: r.creator2Age, tier: r.creator2Tier as 'senior',    detail: r.creator2Detail },
  ];

  const TIERS = [
    { tier: 'trainee'    as const, label: r.tier1Label, unlock: r.tier1Unlock, perks: r.tier1Perks },
    { tier: 'certified'  as const, label: r.tier2Label, unlock: r.tier2Unlock, perks: r.tier2Perks },
    { tier: 'senior'     as const, label: r.tier3Label, unlock: r.tier3Unlock, perks: r.tier3Perks },
    { tier: 'contracted' as const, label: r.tier4Label, unlock: r.tier4Unlock, perks: r.tier4Perks },
  ];

  const FAQ = [
    { q: r.faq1Q, a: r.faq1A },
    { q: r.faq2Q, a: r.faq2A },
    { q: r.faq3Q, a: r.faq3A },
    { q: r.faq4Q, a: r.faq4A },
  ];

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* ── Hero ── */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/recruit/creator-sharing.jpg"
            alt={r.heroTitle1}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24">
          <p className="text-accent font-semibold mb-3 text-sm tracking-wide">{r.heroLabel}</p>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            {r.heroTitle1}<br />
            {r.heroTitle2}
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mb-4 leading-relaxed">
            {r.heroDesc1}<strong className="text-white">{r.heroHighlight}</strong>{r.heroDesc2}
          </p>
          <p className="text-white/65 text-base max-w-2xl mb-8 leading-relaxed">
            {r.heroDesc3}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {(['trainee', 'certified', 'senior', 'contracted'] as const).map((tier, i) => (
              <div key={tier} className="flex items-center gap-2">
                <TierBadge tier={tier} />
                {i < 3 && <ArrowRight size={14} className="text-white/40" />}
              </div>
            ))}
          </div>
          <a href="#apply" className="inline-flex items-center gap-2 bg-accent text-white font-bold px-8 py-4 rounded-xl hover:bg-accent/90 transition-colors text-lg">
            {r.heroCta} <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* ── Impact Stats ── */}
      <div className="bg-white border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT_STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-ink mb-0.5">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* ── Problem: What Young Creators Lack ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">{r.painLabel}</p>
          <h2 className="text-3xl font-bold text-ink mb-3">{r.painTitle}</h2>
          <p className="text-muted mb-8 max-w-2xl">{r.painDesc}</p>
          <div className="grid md:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className={`border rounded-2xl p-6 shadow-card ${p.color}`}>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon size={20} className={p.iconColor} />
                  </div>
                  <h3 className="font-bold text-ink mb-2 text-lg">{p.problem}</h3>
                  <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Solution: 3 Value Props with Images ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">{r.solutionLabel}</p>
          <h2 className="text-3xl font-bold text-ink mb-3">{r.solutionTitle}</h2>
          <p className="text-muted mb-10 max-w-2xl">{r.solutionDesc}</p>

          <div className="space-y-16">
            {VALUE_PROPS.map((vp, i) => {
              const Icon = vp.icon;
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`grid md:grid-cols-2 gap-8 items-center ${isEven ? '' : 'md:[direction:rtl]'}`}>
                  {/* Image */}
                  <div className={`rounded-2xl overflow-hidden shadow-card-hover aspect-video ${isEven ? '' : 'md:[direction:ltr]'}`}>
                    <img
                      src={vp.img}
                      alt={vp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Text */}
                  <div className={isEven ? '' : 'md:[direction:ltr]'}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} className="text-accent" />
                      <span className="text-sm text-accent font-semibold">{vp.subtitle}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-ink mb-4">{vp.title}</h3>
                    <p className="text-muted leading-relaxed mb-5">{vp.body}</p>
                    <div className="bg-primary/8 border border-primary/20 rounded-lg px-4 py-3">
                      <p className="text-sm text-primary font-semibold flex items-center gap-2">
                        <CheckCircle size={14} /> {vp.highlight}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Creator Sharing Image Section ── */}
        <section className="relative rounded-2xl overflow-hidden shadow-card-hover">
          <img
            src="/images/recruit/creator-sharing.jpg"
            alt={r.sharingTitle}
            className="w-full h-80 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-transparent flex items-center">
            <div className="px-10 max-w-xl">
              <p className="text-accent font-semibold text-sm mb-2">{r.sharingTitle}</p>
              <h2 className="text-3xl font-bold text-white mb-3">{r.sharingSubtitle}</h2>
              <p className="text-white/85 leading-relaxed">{r.sharingDesc}</p>
            </div>
          </div>
        </section>

        {/* ── Bridge: Social Mission ── */}
        <section>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-accent font-semibold text-sm mb-2">{r.bridgeLabel}</p>
              <h2 className="text-3xl font-bold text-ink mb-5">{r.bridgeTitle}</h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>{r.bridgeP1}</p>
                <p>{r.bridgeP2}</p>
                <p>{r.bridgeP3}</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card-hover">
              <img
                src="/images/recruit/bridge-hands.jpg"
                alt={r.bridgeTitle}
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── Social Mission Divider ── */}
        <section className="relative rounded-2xl overflow-hidden">
          <img
            src="/images/landing/elder-watching-film.jpg"
            alt={r.missionTitle}
            className="w-full h-72 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50 flex items-center">
            <div className="px-10 max-w-2xl">
              <p className="text-accent font-semibold text-sm mb-2">{r.missionLabel}</p>
              <h2 className="text-3xl font-bold text-white mb-3">{r.missionTitle}</h2>
              <p className="text-white/85 text-lg leading-relaxed">{r.missionDesc}</p>
            </div>
          </div>
        </section>

        {/* ── Growth Tiers ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">{r.tiersLabel}</p>
          <h2 className="text-3xl font-bold text-ink mb-3">{r.tiersTitle}</h2>
          <p className="text-muted mb-8">{r.tiersDesc}</p>
          <div className="grid md:grid-cols-4 gap-4">
            {TIERS.map((tier, i) => (
              <div key={tier.tier} className="bg-card border border-line rounded-2xl p-5 shadow-card relative overflow-hidden">
                {i === 3 && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">{r.topTierBadge}</div>
                )}
                <TierBadge tier={tier.tier} />
                <h3 className="font-bold text-ink mt-3 mb-1">{tier.label}</h3>
                <p className="text-xs text-muted mb-3 pb-3 border-b border-line">{tier.unlock}</p>
                <ul className="space-y-1.5">
                  {tier.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-1.5 text-xs text-ink">
                      <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">{r.testimonialLabel}</p>
          <h2 className="text-3xl font-bold text-ink mb-8">{r.testimonialTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-card border border-line rounded-2xl p-6 shadow-card">
                <p className="text-ink leading-relaxed mb-5 italic">「{testimonial.quote}」</p>
                <div className="flex items-center gap-3 pt-4 border-t border-line">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm">{testimonial.name}</span>
                      <span className="text-xs text-muted">· {testimonial.age}</span>
                      <TierBadge tier={testimonial.tier} />
                    </div>
                    <p className="text-xs text-muted mt-0.5">{testimonial.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">{r.faqLabel}</p>
          <h2 className="text-3xl font-bold text-ink mb-8">{r.faqTitle}</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-card border border-line rounded-xl overflow-hidden shadow-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <span className="font-semibold text-ink">{f.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-muted shrink-0" />
                    : <ChevronDown size={18} className="text-muted shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted leading-relaxed border-t border-line pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Apply Form ── */}
        <section id="apply">
          <div className="bg-card rounded-2xl p-8 shadow-card border border-line">
            <div className="flex items-start gap-4 mb-6">
              <Award size={28} className="text-accent shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">{r.applyTitle}</h2>
                <p className="text-muted text-sm">{r.applyDesc}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: r.applyName,      placeholder: r.applyName },
                { label: r.applyEmail,     placeholder: r.applyEmail },
                { label: r.applyPortfolio, placeholder: r.applyPortfolio },
                { label: r.applyPhone,     placeholder: r.applyPhone },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                  <input
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">{r.applyMode}</label>
                <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                  <option>{r.applyModeDrama}</option>
                  <option>{r.applyModeLegacy}</option>
                  <option>{r.applyModeBoth}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">{r.applyStatus}</label>
                <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                  <option>{r.applyStatusStudent}</option>
                  <option>{r.applyStatusGrad}</option>
                  <option>{r.applyStatusWorking}</option>
                  <option>{r.applyStatusFreelance}</option>
                  <option>{r.applyStatusOther}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">{r.applyMotivation}</label>
                <textarea
                  rows={4}
                  className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none"
                  placeholder={r.applyMotivationPlaceholder}
                />
              </div>
            </div>
            <button className="mt-5 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
              {r.applySubmit} <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
