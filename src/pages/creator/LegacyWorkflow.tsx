import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import {
  Mic, FileText, Upload, CheckCircle, Send, Globe, Award,
  ChevronRight, RefreshCw, Check, Sparkles, Users, BookOpen,
  AlertTriangle, Eye, Save, Music, Edit3, Star, Heart, Camera,
  Plus, X, ChevronDown
} from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';
import { Logo } from '@/components/shared/Logo';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';

// ─────────────────────────────────────────
// S0: 專案設定
// ─────────────────────────────────────────
function S0ProjectSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [subMode, setSubMode] = useState('personal');

  // LEGACY_MODES defined inside component so labels rebuild on locale change
  const LEGACY_MODES = [
    {
      id: 'personal',
      icon: '👤',
      label: tr.creator.modeSelect.legacySub1Label,
      tagline: '個人 · 家庭',
      desc: tr.creator.modeSelect.legacySub1Desc,
      examples: ['退休老師口述執教生涯', '孫兒採訪阿公阿婆', '子女為父母製作壽宴影片'],
    },
    {
      id: 'corporate',
      icon: '🏢',
      label: tr.creator.modeSelect.legacySub2Label,
      tagline: '企業 · 機構',
      desc: tr.creator.modeSelect.legacySub2Desc,
      examples: ['創辦人創業歷程專題', '服務三十年員工的故事', '退休員工「那些年」系列'],
    },
    {
      id: 'social',
      icon: '🌍',
      label: tr.creator.modeSelect.legacySub3Label,
      tagline: '社會 · 公益',
      desc: tr.creator.modeSelect.legacySub3Desc,
      examples: ['學生為校長拍退休紀念片', '環保義工的堅持歷程', '義工婆婆照顧陌生老人的故事'],
    },
  ];

  const s0tr = tr.creator.legacy.s0;
  const themes = s0tr.themes.map((th, i) => ({ id: ['craft','memory','family','culture','history','dream'][i], ...th }));

  const selectedMode = LEGACY_MODES.find(m => m.id === subMode)!;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{s0tr.title}</h2>
        <p className="text-muted text-sm mt-1">{s0tr.subtitle}</p>
      </div>

      <div className="space-y-5">

        {/* 3 Sub-Mode Selector */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{s0tr.modeLabel}</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {LEGACY_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setSubMode(m.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  subMode === m.id
                    ? 'border-accent bg-accent/10'
                    : 'border-line hover:border-accent/40'
                }`}
              >
                <div className="text-2xl mb-1.5">{m.icon}</div>
                <div className={`font-semibold text-sm ${subMode === m.id ? 'text-accent' : 'text-ink'}`}>
                  {m.label}
                </div>
                <div className="text-xs text-muted mt-0.5">{m.tagline}</div>
              </button>
            ))}
          </div>
          {/* Selected Mode Detail */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-ink mb-2">{selectedMode.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedMode.examples.map(eg => (
                <span key={eg} className="text-xs bg-white border border-accent/30 text-accent px-2 py-0.5 rounded-full">
                  {eg}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-2">{s0tr.titleLabel}</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary text-ink"
            placeholder="例：陳伯的街市歲月、阿婆的裁縫心事"
            defaultValue="陳伯的街市歲月"
          />
        </div>

        {/* Theme */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{s0tr.themeLabel}</label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                className="p-3 rounded-lg border-2 border-line text-left hover:border-primary/40 transition-all"
              >
                <div className="font-semibold text-sm text-ink">{t.label}</div>
                <div className="text-xs text-muted mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-ink">{s0tr.warningTitle}</p>
            <p className="text-sm text-muted mt-0.5">{s0tr.warningDesc}</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight size={18} /> {s0tr.confirmBtn}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// S1: 素材庫（Subject Asset Bank）
// ─────────────────────────────────────────
function S1AssetBank({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const s1tr = tr.creator.legacy.s1;
  const assetTypeIcons = [Users, Camera, FileText, Music];
  const assetTypeCounts = [1, 3, 0, 0];
  const assetTypeColors = ['text-blue-500', 'text-amber-500', 'text-green-500', 'text-purple-500'];
  const assetTypes = s1tr.assetTypes.map((at, i) => ({
    icon: assetTypeIcons[i],
    label: at.label,
    count: assetTypeCounts[i],
    color: assetTypeColors[i],
    accept: at.accept,
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{s1tr.title}</h2>
        <p className="text-muted text-sm mt-1">{s1tr.subtitle}</p>
      </div>

      <div className="space-y-4 mb-6">
        {assetTypes.map((type, i) => (
          <div key={i} className="bg-card rounded-xl border border-line p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <type.icon size={18} className={type.color} />
                <span className="font-semibold text-sm text-ink">{type.label}</span>
                {type.count > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    {type.count} {s1tr.uploadedCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">{type.accept}</span>
            </div>
            <div className="border-2 border-dashed border-line rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload size={18} className="mx-auto text-muted mb-1" />
              <p className="text-xs text-muted">{s1tr.uploadPrompt}</p>
            </div>
          </div>
        ))}

        {/* 已上傳預覽 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <h3 className="font-semibold text-ink text-sm mb-3">{s1tr.uploadedPreview}</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop',
              'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop',
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop',
            ].map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                  <button className="text-white text-xs">{s1tr.deleteLabel}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {s1tr.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// ── Shared appearance types (mirrored from DramaWorkflow) ───────────────────
type LegacyAppearanceOptions = {
  height: string; build: string; skin: string;
  hair: string; hairColor: string; hairLength: string;
  face: string; eyes: string; eyewear: string;
  facial: string; posture: string; style: string;
};

const DEFAULT_LEGACY_APPEARANCE: LegacyAppearanceOptions = {
  height: '', build: '', skin: '', hair: '', hairColor: '', hairLength: '',
  face: '', eyes: '', eyewear: '', facial: '', posture: '', style: '',
};

// ── Legacy CharacterProfileCard ──────────────────────────────────────────────
function LegacyCharacterCard({
  img, name, role, age, similarity, setSimilarity,
}: {
  img: string; name: string; role: string; age: string;
  similarity: string; setSimilarity: (v: string) => void;
}) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [traits, setTraits] = useState(['開朗樂觀', '勤力', '重情義', '愛說故事', '傳統']);
  const [newTrait, setNewTrait] = useState('');
  const [addingTrait, setAddingTrait] = useState(false);
  const [appearance, setAppearance] = useState<LegacyAppearanceOptions>(DEFAULT_LEGACY_APPEARANCE);
  const [showAppearance, setShowAppearance] = useState(false);

  const removeTrait = (t: string) => setTraits(prev => prev.filter(x => x !== t));
  const addTrait = () => {
    const v = newTrait.trim();
    if (v && !traits.includes(v)) setTraits(prev => [...prev, v]);
    setNewTrait(''); setAddingTrait(false);
  };
  const setApp = (k: keyof LegacyAppearanceOptions, v: string) =>
    setAppearance(prev => ({ ...prev, [k]: prev[k] === v ? '' : v }));

  const TRAIT_PRESETS = tr.creator.legacy.shared.traitPresets;

  const s2tr = tr.creator.legacy.s2;
  const simColors = [
    { color: 'bg-green-500', border: 'border-green-500', bg: 'bg-green-50' },
    { color: 'bg-blue-500',  border: 'border-blue-500',  bg: 'bg-blue-50'  },
    { color: 'bg-purple-500', border: 'border-purple-500', bg: 'bg-purple-50' },
  ];
  const similarityLabels = [
    { id: s2tr.simVeryClose, label: s2tr.simVeryClose, desc: s2tr.simVeryCloseDesc, ...simColors[0] },
    { id: s2tr.simSeventyPct, label: s2tr.simSeventyPct, desc: s2tr.simSeventyPctDesc, ...simColors[1] },
    { id: s2tr.simSpirit, label: s2tr.simSpirit, desc: s2tr.simSpiritDesc, ...simColors[2] },
  ];

  const appearanceRowKeys: (keyof LegacyAppearanceOptions)[] = [
    'height','build','skin','hair','hairColor','hairLength',
    'face','eyes','eyewear','facial','posture','style',
  ];
  const appearanceRowLabels = s2tr.appearanceRows;
  const appearanceRows = appearanceRowLabels.map((r, i) => ({ label: r.label, key: appearanceRowKeys[i], opts: r.opts }));

  return (
    <div className="space-y-4">
      {/* Basic info */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img src={img} alt={name} className="w-20 h-20 rounded-xl object-cover" />
            <button className="absolute -bottom-1 -right-1 bg-white border border-line rounded-full p-1 hover:bg-bg-soft shadow-sm">
              <Upload size={10} className="text-muted" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{s2tr.nameLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={name} />
              </div>
              <div>
                <label className="text-xs text-muted">{s2tr.roleLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={role} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{s2tr.ageLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={age} />
              </div>
              <div>
                <label className="text-xs text-muted">{s2tr.bgLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" placeholder={s2tr.bgPlaceholder} />
              </div>
            </div>
          </div>
        </div>
        <div className="border border-dashed border-line rounded-lg p-3 text-center cursor-pointer hover:border-accent transition-colors">
          <Upload size={14} className="mx-auto text-muted mb-1" />
          <p className="text-xs text-muted">{s2tr.uploadRef}</p>
        </div>
      </div>

      {/* 性格特質 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-ink">{s2tr.traitsLabel}</label>
          <span className="text-xs text-muted">{s2tr.traitsSubtitle}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {traits.map(t => (
            <span key={t} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-3 py-1 rounded-full font-medium">
              {t}
              <button onClick={() => removeTrait(t)} className="opacity-40 hover:opacity-100 ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          {!addingTrait && (
            <button onClick={() => setAddingTrait(true)}
              className="text-xs text-muted border border-dashed border-line px-3 py-1 rounded-full hover:border-accent hover:text-accent transition-colors flex items-center gap-1">
              <Plus size={10} /> {s2tr.addTrait}
            </button>
          )}
        </div>
        {addingTrait && (
          <div className="flex gap-2 mb-3">
            <input autoFocus
              className="flex-1 border border-accent rounded-lg px-3 py-1.5 text-sm bg-bg-soft focus:outline-none"
              placeholder={s2tr.traitInputPlaceholder} value={newTrait}
              onChange={e => setNewTrait(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTrait(); if (e.key === 'Escape') setAddingTrait(false); }}
            />
            <button onClick={addTrait} className="bg-accent text-white text-xs px-3 py-1.5 rounded-lg">{s2tr.traitConfirm}</button>
            <button onClick={() => setAddingTrait(false)} className="text-muted text-xs px-2 py-1.5 rounded-lg hover:bg-bg-soft">{s2tr.traitCancel}</button>
          </div>
        )}
        <div>
          <p className="text-xs text-muted mb-1.5">{s2tr.quickAdd}</p>
          <div className="flex flex-wrap gap-1.5">
            {TRAIT_PRESETS.filter(p => !traits.includes(p)).map(p => (
              <button key={p} onClick={() => setTraits(prev => [...prev, p])}
                className="text-[11px] text-muted border border-line px-2.5 py-0.5 rounded-full hover:border-accent hover:text-accent transition-colors">
                + {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 外型設定 */}
      <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
        <button onClick={() => setShowAppearance(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-bg-soft transition-colors">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent" />
            <span className="text-sm font-semibold text-ink">{s2tr.appearanceTitle}</span>
            <span className="text-xs text-muted">{s2tr.appearanceSubtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {Object.values(appearance).filter(Boolean).length > 0 && (
              <span className="bg-accent/10 text-accent text-[10px] px-2 py-0.5 rounded-full font-medium">
                {s2tr.appearanceSet} {Object.values(appearance).filter(Boolean).length} 項
              </span>
            )}
            <ChevronDown size={16} className={`text-muted transition-transform ${showAppearance ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {showAppearance && (
          <div className="px-5 pb-5 border-t border-line pt-4 space-y-4">
            {appearanceRows.map(row => (
              <div key={row.key}>
                <label className="text-xs font-semibold text-ink mb-1.5 block">{row.label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {row.opts.map(opt => (
                    <button key={opt} onClick={() => setApp(row.key, opt)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        appearance[row.key] === opt
                          ? 'bg-accent text-white border-accent'
                          : 'border-line text-muted hover:border-accent hover:text-accent bg-bg-soft'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-ink mb-1.5 block">{s2tr.supplement}</label>
              <textarea className="w-full border border-line rounded-lg px-3 py-2 text-xs bg-bg-soft focus:outline-none focus:border-accent resize-none"
                rows={2} placeholder={s2tr.supplementPlaceholder} />
            </div>
            {Object.values(appearance).some(Boolean) && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                <p className="text-xs text-accent font-semibold mb-1">{s2tr.appearancePreview}</p>
                <p className="text-xs text-ink leading-relaxed">
                  {[
                    appearance.height, appearance.build,
                    appearance.skin ? appearance.skin + '膚色' : '',
                    appearance.hairLength && appearance.hairColor ? `${appearance.hairColor}${appearance.hairLength}${appearance.hair || ''}` : (appearance.hair || ''),
                    appearance.face, appearance.eyewear !== '無眼鏡' ? appearance.eyewear : '',
                    appearance.facial !== '無鬚' ? appearance.facial : '',
                    appearance.eyes, appearance.posture, appearance.style,
                  ].filter(Boolean).join('，')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 身份視覺一致性 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <label className="block text-sm font-semibold text-ink mb-1">{s2tr.similarityTitle}</label>
        <p className="text-xs text-muted mb-3">{s2tr.similaritySubtitle}</p>
        <div className="grid grid-cols-3 gap-2">
          {similarityLabels.map(s => (
            <button key={s.id} onClick={() => setSimilarity(s.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                similarity === s.id ? `${s.border} ${s.bg}` : 'border-line hover:border-accent/40 bg-bg-soft'
              }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="font-bold text-sm text-ink">{s.label}</span>
              </div>
              <p className="text-[11px] text-muted leading-tight">{s.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted bg-bg-soft rounded-lg p-2.5">
          {similarity === s2tr.simVeryClose && s2tr.simHintVeryClose}
          {similarity === s2tr.simSeventyPct && s2tr.simHint70}
          {similarity === s2tr.simSpirit && s2tr.simHintSpirit}
          {!similarity && s2tr.simHintNone}
        </div>
      </div>
    </div>
  );
}

// S2: 人物設定（Subject Setup）
// ─────────────────────────────────────────
function S2SubjectSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [similarity, setSimilarity] = useState('極似');
  const [showRelated, setShowRelated] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s2.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s2.subtitle}</p>
      </div>

      <div className="space-y-4 mb-6">
        <LegacyCharacterCard
          img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
          name="陳伯"
          role="退休街市豬肉佬"
          age="72歲"
          similarity={similarity}
          setSimilarity={setSimilarity}
        />

        {/* 相關人物 */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <button onClick={() => setShowRelated(v => !v)}
            className="w-full flex items-center justify-between p-4 hover:bg-bg-soft transition-colors">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-muted" />
              <span className="text-sm font-semibold text-ink">{tr.creator.legacy.s2.relatedTitle}</span>
              <span className="text-xs text-muted">{tr.creator.legacy.s2.relatedSubtitle}</span>
            </div>
            <ChevronDown size={15} className={`text-muted transition-transform ${showRelated ? 'rotate-180' : ''}`} />
          </button>
          {showRelated && (
            <div className="px-4 pb-4 border-t border-line pt-3">
              <p className="text-xs text-muted mb-3">{tr.creator.legacy.s2.relatedDesc}</p>
              <button className="w-full border-2 border-dashed border-line rounded-xl py-3 text-sm text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> {tr.creator.legacy.s2.addRelated}
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
        <ChevronRight size={18} /> {tr.creator.legacy.s2.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S3: 訪談引導（Interview Guidance）
// ─────────────────────────────────────────
function S3InterviewGuide({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const s3tr = tr.creator.legacy.s3;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{s3tr.title}</h2>
        <p className="text-muted text-sm mt-1">{s3tr.subtitle}</p>
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">{s3tr.questionsTitle}</h3>
          <CreditIndicator cost={2} label="生成" />
        </div>
        <div className="space-y-3">
          {[
            { q: '您在街市工作了多少年？是什麼緣故開始這份工作的？', followup: '當時家庭環境是怎樣的？有沒有其他選擇？' },
            { q: '您最記得的街市景象是什麼？能詳細描述一下嗎？', followup: '那個畫面為什麼會令您印象這麼深刻？' },
            { q: '從前的街市和現在有什麼不同？最大的變化是什麼？', followup: '您覺得消失了的東西中，最可惜的是哪一樣？' },
            { q: '在街市中，您認識了哪些難忘的街坊或朋友？', followup: '能說說其中一個令您感動的故事嗎？' },
            { q: '如果要傳授一件事給年輕人，您會說什麼？', followup: '這是您自己親身經歷得來的體會嗎？' },
          ].map((item, i) => (
            <div key={i} className="bg-bg-soft rounded-xl p-4 border border-line">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                <p className="text-ink text-sm">{item.q}</p>
              </div>
              <div className="ml-9 bg-white border border-accent/20 rounded-lg p-2.5">
                <p className="text-xs text-muted font-medium mb-0.5">{s3tr.followupLabel}</p>
                <p className="text-xs text-accent italic">{item.followup}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex-1 border border-line text-muted px-4 py-2 rounded-lg text-sm hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5 justify-center">
            <RefreshCw size={13} /> {s3tr.regenerateBtn}
          </button>
          <button className="flex-1 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-1.5 justify-center">
            <BookOpen size={13} /> {s3tr.downloadBtn}
          </button>
        </div>
      </div>

      {/* 拍攝建議 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <h3 className="font-bold text-ink mb-3">{s3tr.tipsTitle}</h3>
        <ul className="space-y-2 text-sm">
          {s3tr.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-muted">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {s3tr.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S4: 錄製（Recording）
// ─────────────────────────────────────────
function S4Recording({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s4.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s4.subtitle}</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* 上傳區域 */}
        {tr.creator.legacy.s4.uploads.map((upload, i) => ({
          icon: [Mic, Camera][i],
          label: upload.label,
          accept: upload.accept,
          color: ['text-blue-500', 'text-purple-500'][i],
          hint: upload.hint,
        })).map((item, i) => (
          <div key={i} className="bg-card rounded-xl border border-line p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <item.icon size={20} className={item.color} />
              <div>
                <span className="font-semibold text-sm text-ink">{item.label}</span>
                <p className="text-xs text-muted">{item.hint}</p>
              </div>
              <span className="text-xs text-muted ml-auto">{item.accept}</span>
            </div>
            <div
              onClick={() => setUploaded(true)}
              className="border-2 border-dashed border-line rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <Upload size={24} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-muted">{tr.creator.legacy.s1.uploadPrompt}</p>
            </div>
          </div>
        ))}

        {/* 已上傳確認 */}
        {uploaded && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-semibold text-ink text-sm">{tr.creator.legacy.s4.uploadSuccess}</p>
                <p className="text-xs text-muted">陳伯訪談錄音_01.mp3 · 1小時23分鐘</p>
              </div>
            </div>
          </div>
        )}

        {/* 拍攝清單 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.legacy.s4.shootTitle}</h3>
          <div className="space-y-2 text-sm text-muted">
            {tr.creator.legacy.s4.shootItems.map((s, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-accent" />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.legacy.s4.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S5: AI轉錄＋強制校對
// ─────────────────────────────────────────
function S5Transcription({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [proofread, setProofread] = useState(false);

  const transcript = [
    { speaker: '採訪者', text: '陳伯，您在街市工作了多少年？' },
    { speaker: '陳伯', text: '唉，我喺嗰個街市做咗差唔多四十年囉。當年係我老爸帶我入行嘅，嗰時我得十八歲，做豬肉佬學徒。' },
    { speaker: '採訪者', text: '您最記得的街市景象是什麼？' },
    { speaker: '陳伯', text: '最記得係朝早五點幾就要去入貨，嗰陣時街市好熱鬧，啲阿嬸爭住買靚豬肉，又係點評我哋，話我哋邊塊靚邊塊唔靚。' },
    { speaker: '採訪者', text: '從前的街市和現在有什麼不同？' },
    { speaker: '陳伯', text: '舊時街市係個社區嘅心臟，啲街坊關係好親密。而家個街市雖然仲係喺度，但係感覺唔同啦，冇咁多人情味咯。' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s5.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s5.subtitle}<strong className="text-ink">{tr.creator.legacy.s5.subtitleStrong}</strong>{tr.creator.legacy.s5.subtitleSuffix}</p>
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">{tr.creator.legacy.s5.transcriptTitle}</h3>
          <CreditIndicator cost={5} label="謄錄" />
        </div>
        <div className="bg-bg-soft rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-ink leading-relaxed space-y-3">
          {transcript.map((line, i) => (
            <p key={i}>
              <strong className={line.speaker === '陳伯' ? 'text-primary' : 'text-muted'}>
                {line.speaker}：
              </strong>
              {line.text}
            </p>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 border border-line text-muted px-4 py-2 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors">
            <FileText className="w-4 h-4" /> {tr.creator.legacy.s5.downloadBtn}
          </button>
          <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            {tr.creator.legacy.s5.editBtn}
          </button>
        </div>
      </div>

      {/* 強制校對確認 */}
      <div className={`rounded-xl border p-5 mb-4 transition-colors ${proofread ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={proofread}
            onChange={e => setProofread(e.target.checked)}
            className="accent-green-500 w-5 h-5 mt-0.5"
          />
          <div>
            <p className={`font-semibold text-sm ${proofread ? 'text-green-800' : 'text-amber-800'}`}>
              {proofread ? tr.creator.legacy.s5.proofreadDone : tr.creator.legacy.s5.proofreadRequired}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {tr.creator.legacy.s5.proofreadNote}
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={onNext}
        disabled={!proofread}
        className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
          proofread
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'bg-line text-muted cursor-not-allowed'
        }`}
      >
        <ChevronRight size={18} /> {tr.creator.legacy.s5.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S6: 執故事線
// ─────────────────────────────────────────
function S6StoryLine({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const storyline = [
    { time: '00:00', title: '開場：街市清晨', desc: '用陳伯描述朝早五點入貨的畫面切入，帶出街市的人情味', type: '場景導入' },
    { time: '01:30', title: '入行的緣起', desc: '父親帶入行、十八歲學徒，展示時代背景', type: '人生轉折' },
    { time: '03:45', title: '街市的黃金歲月', desc: '阿嬸搶豬肉的趣事，舊時街市的人情景象', type: '核心回憶' },
    { time: '06:00', title: '時代變遷的感嘆', desc: '舊時與現在對比，社區人情的流逝', type: '情感昇華' },
    { time: '08:30', title: '給年輕人的話', desc: '陳伯的人生感悟，留給後輩的話語', type: '傳承金句' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s6.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s6.subtitle}</p>
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">{tr.creator.legacy.s6.storyTitle}</h3>
          <CreditIndicator cost={8} label="生成" />
        </div>
        <div className="space-y-3">
          {storyline.map((seg, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-bg-soft rounded-xl border border-line">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-xs text-muted font-mono">{seg.time}</span>
                {i < storyline.length - 1 && <div className="w-0.5 h-6 bg-line" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-ink">{seg.title}</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{seg.type}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{seg.desc}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="text-xs text-accent hover:underline">{tr.creator.legacy.s6.editBtn}</button>
                <button className="text-xs text-muted hover:text-primary">{tr.creator.legacy.s6.reorderBtn}</button>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 text-accent text-sm hover:underline flex items-center gap-1">
          <Sparkles size={13} /> {tr.creator.legacy.s6.regenerateBtn}
        </button>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.legacy.s6.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S7: 字幕配樂
// ─────────────────────────────────────────
function S7SubtitleMusic({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s7.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s7.subtitle}</p>
      </div>

      {/* 字幕校對 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s7.subtitleTitle}</h3>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {[
            { time: '0:02', text: '我喺嗰個街市做咗差唔多四十年囉。' },
            { time: '0:08', text: '當年係我老爸帶我入行嘅，嗰時我得十八歲。' },
            { time: '0:15', text: '做豬肉佬學徒，由頭學起。' },
            { time: '0:22', text: '最記得係朝早五點幾就要去入貨。' },
            { time: '0:30', text: '嗰陣時街市好熱鬧，充滿人情味。' },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xs text-muted font-mono w-12 mt-1.5 flex-shrink-0">{s.time}</span>
              <textarea
                className="flex-1 border border-line rounded px-3 py-1.5 text-sm text-ink resize-none focus:ring-1 focus:ring-accent focus:border-accent bg-bg-soft"
                defaultValue={s.text}
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 背景音樂 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s7.musicTitle}</h3>
        <div className="space-y-2">
          {tr.creator.legacy.s7.musicOptions.map((m, i) => ({
            ...m,
            active: i === 0,
          })).map((m, i) => (
            <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${m.active ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40'}`}>
              <input type="radio" name="music" className="accent-accent" defaultChecked={m.active} />
              <div>
                <p className="font-medium text-sm text-ink">{m.label}</p>
                <p className="text-xs text-muted">{m.desc}</p>
              </div>
              <button className="ml-auto text-xs text-accent border border-accent px-3 py-1 rounded-lg hover:bg-accent/5 flex items-center gap-1">
                <Mic size={11} /> {tr.creator.legacy.s7.audition}
              </button>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.legacy.s7.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S8: 平台內剪輯
// ─────────────────────────────────────────
function S8PlatformEdit({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s8.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s8.subtitle}</p>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          <Check size={11} /> {tr.creator.legacy.s8.freeStep}
        </div>
      </div>

      {/* 播放器預覽 */}
      <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-video flex items-center justify-center relative">
        <p className="text-white opacity-60">▶ {tr.creator.legacy.s8.videoPreview}</p>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full w-2/5" />
          </div>
        </div>
      </div>

      {/* 版本選擇 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s8.versionTitle}</h3>
        <div className="grid grid-cols-3 gap-3">
          {tr.creator.legacy.s8.versions.map((v, i) => (
            <button
              key={i}
              className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-colors ${
                i === 1 ? 'border-accent bg-accent/5 text-accent' : 'border-line text-muted hover:border-accent/50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 剪輯選項 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s8.editTitle}</h3>
        <div className="grid grid-cols-2 gap-2">
          {tr.creator.legacy.s8.editOptions.map((opt, i) => ({
            ...opt,
            checked: [true, true, true, true, false, true][i],
          })).map((opt, i) => (
            <label key={i} className="flex items-center gap-3 p-3 border border-line rounded-lg cursor-pointer hover:border-accent transition-colors">
              <input type="checkbox" defaultChecked={opt.checked} className="accent-accent" />
              <span className="text-sm text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.legacy.s8.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S9: 授權發佈
// ─────────────────────────────────────────
function S9AuthorizePublish({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [consents, setConsents] = useState([false, false, false]);
  const allConsented = consents.every(Boolean);

  const toggleConsent = (i: number) => {
    const next = [...consents];
    next[i] = !next[i];
    setConsents(next);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.legacy.s9.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.legacy.s9.subtitle}</p>
      </div>

      {/* 五維度 AI 評分 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s9.aiScoreTitle}</h3>
        <div className="space-y-2">
          {tr.creator.legacy.s9.dims.map((d, i) => ({
            ...d,
            score: [9, 8, 10, 10, 9][i],
          })).map(d => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs text-muted w-20 text-right">{d.label}</span>
              <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${d.score * 10}%` }} />
              </div>
              <span className="text-xs font-bold text-accent w-8">{d.score}/10</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-primary font-medium mt-3">{tr.creator.legacy.s9.aiSummary}</p>
      </div>

      {/* 授權聲明 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s9.consentTitle}</h3>
        <div className="space-y-3">
          {tr.creator.legacy.s9.consents.map((item, i) => (
            <label
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                consents[i] ? 'border-green-400 bg-green-50' : 'border-line hover:border-accent/40'
              }`}
            >
              <input
                type="checkbox"
                className="accent-green-500 w-4 h-4 mt-0.5"
                checked={consents[i]}
                onChange={() => toggleConsent(i)}
              />
              <span className="text-sm text-ink">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 發佈設定 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-bold text-ink mb-3">{tr.creator.legacy.s9.publishTitle}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">{tr.creator.legacy.s9.publishAudienceLabel}</label>
            <select className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary">
              <option>{tr.creator.legacy.s9.publishOpt1}</option>
              <option>{tr.creator.legacy.s9.publishOpt2}</option>
              <option>{tr.creator.legacy.s9.publishOpt3}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">{tr.creator.legacy.s9.tagsLabel}</label>
            <input
              className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary"
              defaultValue="街市、香港情懷、長者故事、手藝傳承、CoEldery85"
            />
          </div>
        </div>
      </div>

      {/* ESG 積分 */}
      <div className="bg-card rounded-xl border-l-4 border-green-400 p-5 mb-6 shadow-card">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-semibold text-ink text-sm">{tr.creator.legacy.s9.esgTitle}</p>
            <p className="text-muted text-xs mt-0.5">{tr.creator.legacy.s9.esgDesc}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary transition-colors text-sm">
          <Globe className="w-4 h-4" /> {tr.creator.legacy.s9.previewBtn}
        </button>
        <button
          disabled={!allConsented}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
            allConsented
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'bg-line text-muted cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" /> {tr.creator.legacy.s9.submitBtn}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const STEPS = [
  S0ProjectSetup,    // 0: 專案設定
  S1AssetBank,       // 1: 素材庫
  S2SubjectSetup,    // 2: 人物設定
  S3InterviewGuide,  // 3: 訪談引導
  S4Recording,       // 4: 錄製
  S5Transcription,   // 5: AI轉錄校對
  S6StoryLine,       // 6: 執故事線
  S7SubtitleMusic,   // 7: 字幕配樂
  S8PlatformEdit,    // 8: 平台剪輯
  S9AuthorizePublish,// 9: 授權發佈
];

export default function LegacyWorkflow() {
  const { step } = useParams();
  const navigate = useNavigate();
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const currentStep = Math.min(parseInt(step ?? '0', 10), 9);
  const StepComponent = STEPS[currentStep];

  const goNext = () => navigate(`/creator/legacy/${Math.min(currentStep + 1, 9)}`);

  const seriesTitles: Record<number, string> = { 0: tr.creator.modeSelect.legacyTitle };
  const headerTitle = seriesTitles[currentStep] ?? '陳伯的街市歲月';

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-accent font-bold">{tr.creator.modeSelect.legacyTitle}</span>
          <span className="text-muted text-sm">· {headerTitle}</span>
          <div className="ml-auto flex items-center gap-3">
            <Heart size={16} className="text-accent" />
            <span className="text-xs text-muted">{tr.creator.credits} 842</span>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 shrink-0 bg-card border-r border-line overflow-y-auto">
            <StepNavigation
              mode="legacy"
              currentStep={currentStep}
              onStepClick={s => navigate(`/creator/legacy/${s}`)}
            />
          </div>
          <main className="flex-1 overflow-y-auto p-8">
            <StepComponent onNext={goNext} />
          </main>
          <aside className="w-72 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
