import { useState } from 'react';
import { PublicNav } from '@/components/layout/PublicNav';
import { CheckCircle, ChevronDown, ChevronUp, Sparkles, Film, BookOpen, Users, ShoppingBag } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const SPONSOR_MODE_STYLES = [
  {
    id: 'creator',
    icon: Users,
    emoji: '🎓',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    borderColor: 'border-blue-400',
    accentColor: 'text-blue-600',
    bgActive: 'bg-blue-50',
  },
  {
    id: 'legacyCorp',
    icon: BookOpen,
    emoji: '🏛️',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    borderColor: 'border-primary',
    accentColor: 'text-primary',
    bgActive: 'bg-primary/5',
  },
  {
    id: 'legacySocial',
    icon: Film,
    emoji: '🌍',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    borderColor: 'border-green-500',
    accentColor: 'text-green-600',
    bgActive: 'bg-green-50',
  },
  {
    id: 'brand',
    icon: ShoppingBag,
    emoji: '🏷️',
    badgeColor: 'bg-accent/10 text-accent border-accent/20',
    borderColor: 'border-accent',
    accentColor: 'text-accent',
    bgActive: 'bg-accent/5',
    isNew: true,
  },
];

const ESG_BENEFIT_KEYS = ['esgReport', 'brandTracking', 'crossGen', 'impact'] as const;
const ESG_BENEFIT_ICONS = ['📊', '👁️', '🤝', '🌱'];

export default function Enterprise() {
  const [activeMode, setActiveMode] = useState<string | null>('brand');
  const { locale } = useLocaleStore();
  const tr = t();
  const e = tr.enterprise;

  // Build sponsor modes dynamically from locale
  const SPONSOR_MODES = SPONSOR_MODE_STYLES.map(style => ({
    ...style,
    title:    e.sponsors[style.id as keyof typeof e.sponsors].title,
    badge:    e.sponsors[style.id as keyof typeof e.sponsors].badge,
    desc:     e.sponsors[style.id as keyof typeof e.sponsors].desc,
    details:  e.sponsors[style.id as keyof typeof e.sponsors].details,
    esgNote:  e.sponsors[style.id as keyof typeof e.sponsors].esgNote,
  }));

  const ESG_BENEFITS = ESG_BENEFIT_KEYS.map((key, i) => ({
    icon: ESG_BENEFIT_ICONS[i],
    title: e.benefits[key].title,
    desc:  e.benefits[key].desc,
  }));

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero with photo */}
        <div className="relative rounded-2xl overflow-hidden mb-12 shadow-card-hover -mx-0">
          <img
            src="/images/enterprise/esg-meeting.jpg"
            alt={e.heroTitle}
            className="w-full h-64 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50 flex items-center">
            <div className="px-10">
              <p className="text-accent font-semibold mb-2 text-sm tracking-wide">{e.heroBadge}</p>
              <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                {e.heroTitle}
              </h1>
              <p className="text-white/80 text-base max-w-xl">
                {e.heroDesc}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Sponsor Mode Cards */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-primary mb-6">{e.modesTitle}</h2>
          <div className="space-y-4">
            {SPONSOR_MODES.map(mode => {
              const isActive = activeMode === mode.id;
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                    isActive ? `${mode.borderColor} ${mode.bgActive}` : 'border-line bg-card hover:border-primary/30'
                  } shadow-card`}
                >
                  {/* Header — always visible */}
                  <button
                    onClick={() => setActiveMode(isActive ? null : mode.id)}
                    className="w-full text-left p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isActive ? 'bg-white/60' : 'bg-bg-soft'
                        }`}>
                          {mode.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-xl ${isActive ? mode.accentColor : 'text-ink'}`}>
                              {mode.title}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${mode.badgeColor}`}>
                              {mode.badge}
                            </span>
                            {mode.isNew && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-bold flex items-center gap-1">
                                <Sparkles size={10} /> {e.newBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted leading-relaxed">{mode.desc}</p>
                        </div>
                      </div>
                      <div className="ml-4 shrink-0">
                        {isActive
                          ? <ChevronUp size={20} className="text-muted" />
                          : <ChevronDown size={20} className="text-muted" />
                        }
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isActive && (
                    <div className="px-6 pb-6 border-t border-black/5 pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{e.detailsLabel}</p>
                          <ul className="space-y-2">
                            {mode.details.map((d, i) => (
                              <li key={i} className="flex gap-2 text-sm text-ink">
                                <CheckCircle size={15} className={`${mode.accentColor} shrink-0 mt-0.5`} />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-3">
                          {/* ESG note */}
                          <div className={`rounded-xl p-4 border ${mode.badgeColor}`}>
                            <p className="text-xs font-semibold mb-1">{e.esgLabel}</p>
                            <p className="text-sm font-medium">{mode.esgNote}</p>
                          </div>
                          {/* Brand Asset Library highlight for brand mode */}
                          {mode.id === 'brand' && (
                            <div className="bg-accent/8 border border-accent/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag size={14} className="text-accent" />
                                <p className="text-xs font-semibold text-accent">{e.brandAssetLabel}</p>
                              </div>
                              <p className="text-xs text-muted leading-relaxed">
                                {e.brandAssetDesc}
                              </p>
                            </div>
                          )}
                          <button className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors text-sm">
                            {e.inquiryBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ESG Benefits */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-primary mb-6">{e.benefitsTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ESG_BENEFITS.map(b => (
              <div key={b.title} className="bg-card border border-line rounded-xl p-5 shadow-card flex gap-4">
                <span className="text-2xl shrink-0">{b.icon}</span>
                <div>
                  <h3 className="font-bold text-ink mb-1">{b.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-14">
          <p className="text-sm text-muted font-semibold mb-3">{e.partnersLabel}</p>
          <div className="flex flex-wrap gap-3 items-center">
            {['太古地產', '香港中華煤氣', '匯豐銀行', '牛奶公司', '信和集團'].map(name => (
              <span key={name} className="px-4 py-2 bg-card border border-line rounded-lg text-sm text-ink font-medium shadow-card">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-line">
          <h2 className="text-xl font-bold text-primary mb-1">{e.formTitle}</h2>
          <p className="text-sm text-muted mb-6">{e.formDesc}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: e.formCompany,  placeholder: e.formCompany },
              { label: e.formContact,  placeholder: e.formContact },
              { label: e.formEmail,    placeholder: e.formEmail },
              { label: e.formPhone,    placeholder: e.formPhone },
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
              <label className="block text-sm font-medium text-ink mb-1">{e.formType}</label>
              <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option value="">{e.formTypePlaceholder}</option>
                <option value="creator">{e.formTypeCreator}</option>
                <option value="legacy-corp">{e.formTypeCorp}</option>
                <option value="legacy-social">{e.formTypeSocial}</option>
                <option value="brand">{e.formTypeBrand}</option>
                <option value="multi">{e.formTypeMulti}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">{e.formBrandCat}</label>
              <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option value="">{e.formBrandCatNone}</option>
                <option>{e.formBrandCatAuto}</option>
                <option>{e.formBrandCatFnb}</option>
                <option>{e.formBrandCatFmcg}</option>
                <option>{e.formBrandCatFinance}</option>
                <option>{e.formBrandCatRetail}</option>
                <option>{e.formBrandCatOther}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">{e.formNeeds}</label>
              <textarea
                rows={3}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none"
                placeholder={e.formNeedsPlaceholder}
              />
            </div>
          </div>
          <button className="mt-5 bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors">
            {e.formSubmit}
          </button>
        </div>

      </div>
    </div>
  );
}
