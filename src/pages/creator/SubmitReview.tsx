import { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Send, Eye, Download, Shield } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { FiveDimensionRadar } from '@/components/shared/FiveDimensionRadar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const MOCK_SCORE = { content: 88, language: 82, culture: 90, ethics: 65, commercial: 92 };

export default function SubmitReview() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Checklist built inside component so labels re-render on locale change
  const CHECKLIST = [
    { id: 'content',    label: tr.creator.submitReview.checkContent,    desc: tr.creator.submitReview.checkContentDesc,    ok: true },
    { id: 'lang',       label: tr.creator.submitReview.checkLang,       desc: tr.creator.submitReview.checkLangDesc,       ok: true },
    { id: 'culture',    label: tr.creator.submitReview.checkCulture,    desc: tr.creator.submitReview.checkCultureDesc,    ok: true },
    { id: 'ethics',     label: tr.creator.submitReview.checkEthics,     desc: tr.creator.submitReview.checkEthicsDesc,     ok: false },
    { id: 'commercial', label: tr.creator.submitReview.checkCommercial, desc: tr.creator.submitReview.checkCommercialDesc, ok: true },
  ];

  const SCORE_DIMS = [
    { dim: tr.creator.submitReview.dim1, score: 88, note: tr.creator.submitReview.dim1Note },
    { dim: tr.creator.submitReview.dim2, score: 82, note: tr.creator.submitReview.dim2Note },
    { dim: tr.creator.submitReview.dim3, score: 90, note: tr.creator.submitReview.dim3Note },
    { dim: tr.creator.submitReview.dim4, score: 65, note: tr.creator.submitReview.dim4Note },
    { dim: tr.creator.submitReview.dim5, score: 92, note: tr.creator.submitReview.dim5Note },
  ];

  const pendingCount = CHECKLIST.filter(c => !c.ok).length;

  if (submitted) {
    return (
      <div className="flex h-screen bg-bg-soft overflow-hidden">
        <CreatorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.submitReview.title}</span>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">{tr.creator.submitReview.successTitle}</h2>
              <p className="text-muted mb-2">{tr.creator.submitReview.successEta}</p>
              <p className="text-muted text-sm mb-6">{tr.creator.submitReview.successNotice}</p>
              <StatusBadge status="reviewing" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.submitReview.title}</span>
            <span className="text-muted text-sm">· 街市情緣 · 第 1 集</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Eye className="w-4 h-4" />
              {tr.creator.submitReview.previewBtn}
            </button>
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
              {tr.creator.submitReview.downloadBtn}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
            {/* Left: Checklist */}
            <div>
              <h2 className="text-xl font-bold text-ink mb-4">{tr.creator.submitReview.checklistTitle}</h2>
              <div className="space-y-3 mb-6">
                {CHECKLIST.map(item => (
                  <div
                    key={item.id}
                    className={`card-base p-4 flex items-start gap-3 ${!item.ok ? 'border-amber-300 bg-amber-50' : ''}`}
                  >
                    {item.ok ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-ink text-sm">{item.label}</div>
                      <div className="text-xs text-muted mt-0.5">{item.desc}</div>
                      {!item.ok && (
                        <button className="mt-2 text-xs text-amber-600 hover:underline">{tr.creator.submitReview.fixLink}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pendingCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
                    <AlertCircle className="w-4 h-4" />
                    {tr.creator.submitReview.pendingWarning.replace('{{n}}', String(pendingCount))}
                  </div>
                  <p className="text-xs text-amber-600">{tr.creator.submitReview.pendingHint}</p>
                </div>
              )}

              <div className="card-base p-4 mb-6">
                <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {tr.creator.submitReview.timeTitle}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">{tr.creator.submitReview.timeNormal}</span>
                    <span className="text-ink font-medium">{tr.creator.submitReview.timeNormalValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">{tr.creator.submitReview.timePriority}</span>
                    <span className="text-ink font-medium">{tr.creator.submitReview.timePriorityValue}</span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="accent-primary mt-0.5 w-4 h-4"
                />
                <span className="text-sm text-muted">{tr.creator.submitReview.agreeText}</span>
              </label>

              <button
                onClick={() => setSubmitted(true)}
                disabled={!agreed || pendingCount > 0}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
                  agreed && pendingCount === 0
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-line text-muted cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                {tr.creator.submitReview.submitBtn}
              </button>
            </div>

            {/* Right: Score Radar */}
            <div>
              <h2 className="text-xl font-bold text-ink mb-4">{tr.creator.submitReview.scoreTitle}</h2>
              <div className="card-base p-5 mb-4">
                <FiveDimensionRadar scores={MOCK_SCORE} />
              </div>
              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-ink text-sm">{tr.creator.submitReview.scoreDesc}</h3>
                </div>
                <div className="space-y-2">
                  {SCORE_DIMS.map(d => (
                    <div key={d.dim} className="flex items-center gap-3 text-sm">
                      <span className="w-20 text-muted">{d.dim}</span>
                      <div className="flex-1 bg-line rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${d.score >= 80 ? 'bg-green-400' : 'bg-amber-400'}`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <span className={`w-8 text-right font-bold ${d.score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                        {d.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
