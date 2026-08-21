import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Play, Film, ChevronLeft } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Logo } from '@/components/shared/Logo';
import { FiveDimensionRadar } from '@/components/shared/FiveDimensionRadar';
import { MOCK_REVIEW_QUEUE } from '@/lib/mockData';

export default function SingleReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = MOCK_REVIEW_QUEUE.find(r => r.id === id) ?? MOCK_REVIEW_QUEUE[0];
  const [decision, setDecision] = useState<'approve' | 'revision' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const scores = {
    content: item.score.safety * 10,
    language: item.score.language * 10,
    culture: item.score.culture * 10,
    ethics: item.score.ethics * 10,
    commercial: item.score.commercial * 10,
  };

  if (submitted) {
    return (
      <div className="flex h-screen bg-bg-soft overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">審批完成</h2>
            <p className="text-muted mb-6">「{item.title}」審批結果已提交</p>
            <button onClick={() => navigate('/admin/queue')}
              className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
              返回佇列
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <button onClick={() => navigate('/admin/queue')} className="flex items-center gap-1 text-muted hover:text-ink text-sm">
            <ChevronLeft className="w-4 h-4" />返回佇列
          </button>
          <span className="text-primary font-bold text-lg">· {item.title}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto grid grid-cols-5 gap-5">
            {/* Video + Info col */}
            <div className="col-span-3 space-y-4">
              {/* Video Player Mock */}
              <div className="card-base overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative group cursor-pointer">
                  <div className="text-center text-white/30">
                    <Film className="w-14 h-14 mx-auto mb-2" />
                    <p>點擊播放影片</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-ink text-lg mb-1">{item.title}</h2>
                  <p className="text-sm text-muted">創作者：{item.creator} · 等候 {item.waitHours} 小時</p>
                </div>
              </div>

              {/* Dimension Scores */}
              <div className="card-base p-5">
                <h3 className="font-bold text-ink mb-4">五維度 AI 預審評分</h3>
                <div className="space-y-3">
                  {[
                    { key: 'content', label: '內容安全', val: item.score.safety },
                    { key: 'language', label: '語言表達', val: item.score.language },
                    { key: 'culture', label: '文化適切', val: item.score.culture },
                    { key: 'ethics', label: '倫理規範', val: item.score.ethics },
                    { key: 'commercial', label: '商業合規', val: item.score.commercial },
                  ].map(d => (
                    <div key={d.key} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-muted flex-shrink-0">{d.label}</span>
                      <div className="flex-1 h-2.5 bg-line rounded-full">
                        <div
                          className={`h-2.5 rounded-full ${d.val >= 8.5 ? 'bg-green-400' : d.val >= 7 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${d.val * 10}%` }}
                        />
                      </div>
                      <span className={`w-8 text-right font-bold text-sm ${d.val >= 8.5 ? 'text-green-600' : d.val >= 7 ? 'text-amber-600' : 'text-red-500'}`}>
                        {d.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision col */}
            <div className="col-span-2 space-y-4">
              <div className="card-base p-5">
                <FiveDimensionRadar scores={scores} />
              </div>

              <div className="card-base p-5">
                <h3 className="font-bold text-ink mb-4">審批決定</h3>
                <div className="space-y-2 mb-4">
                  {[
                    { id: 'approve', label: '批准發佈', icon: CheckCircle, color: 'border-green-400 bg-green-50 text-green-700' },
                    { id: 'revision', label: '要求修改', icon: AlertCircle, color: 'border-amber-400 bg-amber-50 text-amber-700' },
                    { id: 'reject', label: '拒絕發佈', icon: XCircle, color: 'border-red-400 bg-red-50 text-red-700' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setDecision(opt.id as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                        decision === opt.id ? opt.color : 'border-line hover:border-muted'
                      }`}
                    >
                      <opt.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="form-label">審批備註</label>
                  <textarea
                    className="form-input resize-none"
                    rows={4}
                    placeholder="輸入審批意見（必填）..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!decision || !comment.trim()}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    decision && comment.trim()
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-line text-muted cursor-not-allowed'
                  }`}
                >
                  確認提交審批
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
