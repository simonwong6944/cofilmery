import { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Send, Eye, Download, Shield } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { FiveDimensionRadar } from '@/components/shared/FiveDimensionRadar';
import { StatusBadge } from '@/components/shared/StatusBadge';

const CHECKLIST = [
  { id: 'content', label: '內容安全', desc: '無暴力、色情、仇恨言論', ok: true },
  { id: 'lang', label: '語言表達', desc: '廣東話字幕準確，無粗口', ok: true },
  { id: 'culture', label: '文化適切', desc: '尊重香港文化及長者', ok: true },
  { id: 'ethics', label: '倫理規範', desc: '受訪者已簽署授權書', ok: false },
  { id: 'commercial', label: '商業合規', desc: '無未授權商標及廣告', ok: true },
];

const MOCK_SCORE = { content: 88, language: 82, culture: 90, ethics: 65, commercial: 92 };

export default function SubmitReview() {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allPassed = CHECKLIST.every(c => c.ok);
  const pendingCount = CHECKLIST.filter(c => !c.ok).length;

  if (submitted) {
    return (
      <div className="flex h-screen bg-bg-soft overflow-hidden">
        <CreatorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">送交審核</span>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">已成功送交審核！</h2>
              <p className="text-muted mb-2">預計審核時間：24–48 小時</p>
              <p className="text-muted text-sm mb-6">審核結果將以通知形式告知</p>
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
            <span className="text-primary font-bold">送交審核</span>
            <span className="text-muted text-sm">· 街市情緣 · 第 1 集</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Eye className="w-4 h-4" />
              預覽影片
            </button>
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
              下載草稿
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
            {/* Left: Checklist */}
            <div>
              <h2 className="text-xl font-bold text-ink mb-4">送審前檢查清單</h2>
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
                        <button className="mt-2 text-xs text-amber-600 hover:underline">→ 前往修正</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pendingCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
                    <AlertCircle className="w-4 h-4" />
                    尚有 {pendingCount} 項待完成
                  </div>
                  <p className="text-xs text-amber-600">請完成所有必要項目後再送審</p>
                </div>
              )}

              <div className="card-base p-4 mb-6">
                <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  審核時間預估
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">一般審核</span>
                    <span className="text-ink font-medium">24–48 小時</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">優先審核（需積分）</span>
                    <span className="text-ink font-medium">4–6 小時</span>
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
                <span className="text-sm text-muted">
                  我確認所有內容符合 CoFilmery 社群守則，及已取得所有必要授權，作品可公開發佈。
                </span>
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
                送交審核
              </button>
            </div>

            {/* Right: Score Radar */}
            <div>
              <h2 className="text-xl font-bold text-ink mb-4">AI 預審評分</h2>
              <div className="card-base p-5 mb-4">
                <FiveDimensionRadar scores={MOCK_SCORE} />
              </div>
              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-ink text-sm">評分說明</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { dim: '內容安全', score: 88, note: '通過基本安全標準' },
                    { dim: '語言表達', score: 82, note: '廣東話用字自然' },
                    { dim: '文化適切', score: 90, note: '良好體現香港文化' },
                    { dim: '倫理規範', score: 65, note: '需補充授權文件' },
                    { dim: '商業合規', score: 92, note: '無商業合規問題' },
                  ].map(d => (
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
