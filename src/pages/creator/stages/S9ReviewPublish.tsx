import { useState } from 'react';
import { Eye, Save, Send } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

// ─────────────────────────────────────────
// S9: 審批與發佈
// ─────────────────────────────────────────
export function S9ReviewPublish({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [submitted, setSubmitted] = useState(false);

  const dimKeys = ['content', 'language', 'culture', 'ethics', 'commercial'];
  const dimScores = [9, 8, 9, 10, 8];
  const dims = tr.creator.drama.s9.dims.map((d, i) => ({
    key: dimKeys[i], label: d.label, score: dimScores[i], note: d.note,
  }));

  if (submitted) {
    return (
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-primary mb-3">{tr.creator.drama.s9.successTitle}</h2>
        <p className="text-muted mb-2">{tr.creator.drama.s9.successDesc}</p>
        <p className="text-xs text-muted mb-8">{tr.creator.drama.s9.successReach}</p>
        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          {[
            { label: tr.creator.drama.s9.publishRange, value: '公開發佈至 CoEldery 85' },
            { label: tr.creator.drama.s9.publishDate, value: '2026 年 8 月 22 日' },
            { label: tr.creator.drama.s9.expectedReach, value: '約 12,500 位長者觀眾' },
            { label: tr.creator.drama.s9.revenueShare, value: '觀看收益 70%' },
            { label: tr.creator.drama.s9.esgPoints, value: '+85 社企貢獻積分' },
            { label: tr.creator.drama.s9.seriesId, value: 'DRAMA-2026-001' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted mb-1">{label}</p>
              <p className="font-semibold text-ink text-sm">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors">
            {tr.creator.drama.s9.confirmPublish}
          </button>
          <button className="border border-line px-8 py-3 rounded-xl text-ink hover:border-primary transition-colors">
            {tr.creator.drama.s9.shareBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s9.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s9.subtitle}</p>
      </div>

      <div className="space-y-3 mb-6">
        {dims.map(d => (
          <div key={d.key} className="bg-card rounded-xl p-4 shadow-card border border-line">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-ink">{d.label}</span>
              <span className="text-accent font-bold">{d.score}/10</span>
            </div>
            <div className="h-2 bg-line rounded-full overflow-hidden mb-2">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${d.score * 10}%` }} />
            </div>
            <p className="text-xs text-muted">{d.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <p className="text-sm text-primary font-semibold">{tr.creator.drama.s9.aiSummary}</p>
        <p className="text-xs text-muted mt-1">{tr.creator.drama.s9.aiSummaryDesc}</p>
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s9.publishTitle}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">{tr.creator.drama.s9.publishAudienceLabel}</label>
            <select className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary">
              <option>公開發佈（CoEldery 85 平台）</option>
              <option>登入用戶限定</option>
              <option>ESG 贊助商專屬</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">{tr.creator.drama.s9.tagsLabel}</label>
            <input
              className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary"
              defaultValue="街市、圓夢、長者故事、香港情懷、CoEldery85"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary transition-colors text-sm">
          <Eye size={15} /> {tr.creator.drama.s9.previewBtn}
        </button>
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-accent transition-colors text-sm">
          <Save size={15} /> {tr.creator.drama.s9.saveDraft}
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send size={16} /> {tr.creator.drama.s9.submitBtn}
        </button>
      </div>
    </div>
  );
}
