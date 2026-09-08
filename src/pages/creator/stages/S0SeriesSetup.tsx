import { useState, useRef, useEffect } from 'react';
import type { SeriesContext } from '@/adapters/types';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { saveProjectToD1 } from '@/adapters';
import { Layers } from 'lucide-react';
import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';

export function S0SeriesSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { setProjectId, setContext, projectId, context } = useProjectStore();
  const { user } = useAuthStore();
  const [seriesName, setSeriesName] = useState('');
  const [episodeCount, setEpisodeCount] = useState(30);
  const [duration, setDuration] = useState('60秒');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [need, setNeed] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── 掛載回填：從 store.context 同步 local state（僅首次有值時執行一次）──
  // 使用 hydratedRef 避免蓋掉使用者正在編輯的輸入
  const s0HydratedRef = useRef(false);
  useEffect(() => {
    if (s0HydratedRef.current) return; // 已回填過，不再覆蓋
    if (!context) return;              // async load 尚未完成，等下次 dep 觸發
    s0HydratedRef.current = true;
    if (context.seriesTitle)   setSeriesName(context.seriesTitle);
    if (context.genre)         setGenre(context.genre);
    if (context.tone)          setTone(context.tone);
    if (context.coreNeed)      setNeed(context.coreNeed);
    if (context.episodeCount)  setEpisodeCount(context.episodeCount);
    if (context.durationLabel) setDuration(context.durationLabel);
  }, [context]);

  const genreIcons = ['🌟','💛','👨‍👩‍👧‍👦','🌺','🕰️','🤝'];
  const genres = tr.creator.drama.s0.genres.map((g, i) => ({
    id: ['dream','love','family','restart','nostalgia','hero'][i],
    icon: genreIcons[i], label: g.label, desc: g.desc,
  }));

  const toneIcons = ['😌','🥲','😊','💛','🌱','💔'];
  const tones = tr.creator.drama.s0.tones.map((t, i) => ({
    id: ['warm','touching','light','nostalgic','inspiring','healing'][i],
    icon: toneIcons[i], label: t.label, desc: t.desc,
  }));

  const needs = tr.creator.drama.s0.needs.map((n, i) => ({
    id: ['seen','connected','reconcile','possible'][i],
    label: n.label, desc: n.desc,
  }));

  const durations = tr.creator.drama.s0.durations;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s0.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s0.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* 劇集名稱 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-2">{tr.creator.drama.s0.seriesNameLabel}</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary text-ink"
            placeholder="例：街市情緣、阿婆的裁縫心事"
            value={seriesName}
            onChange={e => setSeriesName(e.target.value)}
          />
        </div>

        {/* 題材類型 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s0.genreLabel}</label>
          <div className="grid grid-cols-2 gap-3">
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => setGenre(g.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  genre === g.id
                    ? 'border-primary bg-primary/5'
                    : 'border-line hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{g.icon}</span>
                  <span className="font-semibold text-sm text-ink">{g.label}</span>
                </div>
                <p className="text-xs text-muted">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 情感基調 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s0.toneLabel}</label>
          <div className="grid grid-cols-3 gap-2">
            {tones.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  tone === t.id
                    ? 'border-accent bg-accent/5'
                    : 'border-line hover:border-accent/40'
                }`}
              >
                <div className="text-xl mb-1">{t.icon}</div>
                <div className="font-semibold text-xs text-ink">{t.label}</div>
                <div className="text-xs text-muted mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 核心情感需求 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-1">{tr.creator.drama.s0.needLabel}</label>
          <p className="text-xs text-muted mb-3">{tr.creator.drama.s0.needSubtitle}</p>
          <div className="grid grid-cols-2 gap-2">
            {needs.map(n => (
              <button
                key={n.id}
                onClick={() => setNeed(n.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  need === n.id
                    ? 'border-primary bg-primary/5'
                    : 'border-line hover:border-primary/30'
                }`}
              >
                <div className="font-semibold text-sm text-ink">{n.label}</div>
                <div className="text-xs text-muted mt-0.5">{n.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 集數 + 時長 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                {tr.creator.drama.s0.episodeLabel}
              </label>
              <input
                type="range" min={5} max={70} value={episodeCount}
                onChange={e => setEpisodeCount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm text-primary font-semibold mt-1">{tr.creator.drama.s0.episodeSelected}{episodeCount} {tr.creator.drama.s0.episodeUnit}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">{tr.creator.drama.s0.durationLabel}</label>
              <div className="grid grid-cols-2 gap-1.5">
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      duration === d
                        ? 'border-primary bg-primary text-white'
                        : 'border-line text-muted hover:border-primary'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 目標受眾 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s0.audienceLabel}</label>
          <div className="flex flex-wrap gap-2">
            {['55–65 歲', '65–75 歲', '75 歲以上', '家庭觀眾（陪同長者）', '全港市民'].map(a => (
              <label
                key={a}
                className="flex items-center gap-2 bg-bg-soft border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-primary"
              >
                <input type="checkbox" className="accent-primary"
                  defaultChecked={a === '65–75 歲' || a === '55–65 歲'} />
                <span className="text-sm text-ink">{a}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 品牌/商業背景 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-2">{tr.creator.drama.s0.brandLabel}</label>
          <textarea
            className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary text-sm text-ink resize-none"
            rows={2}
            placeholder="例：CoEldery 85 社企品牌，主打長者有價值、有貢獻；適合 ESG 贊助商植入⋯"
          />
        </div>

        {/* 提示 */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-ink">{tr.creator.drama.s0.warningTitle}</p>
            <p className="text-sm text-muted mt-0.5">{tr.creator.drama.s0.warningDesc}</p>
          </div>
        </div>

        {/* 視覺提示：美學鎖在 S3 完成後才設定 */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3">
          <Layers size={16} className="text-violet-500 shrink-0" />
          <p className="text-xs text-violet-700">全劇視覺風格（美學鎖）將在 S3 故事框架完成後統一設定，令視覺從第一格就緊扣故事。</p>
        </div>

        <button
          disabled={saving}
          onClick={async () => {
            setSaveError('');
            setSaving(true);
            // 儲存劇集標題 + 系列上下文到 projectStore
            const title = seriesName.trim() || tr.creator.drama.s0.seriesNameLabel;
            setProjectId(projectId, title);
            const ctx: SeriesContext = {
              seriesTitle: title,
              genre: genre || 'drama',
              tone: tone || 'warm',
              coreNeed: need || 'seen',
              episodeCount,
              durationLabel: duration,
              mode: 'drama',
            };
            setContext(ctx);
            // 同步寫入 D1 projects 表（upsert），失敗時顯示錯誤不繼續
            try {
              await saveProjectToD1({
                projectId,
                userId: user?.id ?? 'demo-user',
                title,
                mode: 'drama',
                storyMaterial: '',           // S0 無 storyMaterial；PlanOverview(route 1)才輸入
                seriesContext: JSON.stringify(ctx),
              });
              onNext();
            } catch (e) {
              setSaveError('儲存失敗，請稍後再試：' + (e instanceof Error ? e.message : String(e)));
            } finally {
              setSaving(false);
            }
          }}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><RefreshCw size={18} className="animate-spin" /> 儲存中…</>
          ) : (
            <><ChevronRight size={18} /> {tr.creator.drama.s0.confirmBtn}</>
          )}
        </button>
        {saveError && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle size={14} className="shrink-0" />
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}
