import { useState } from 'react';
import { Wand2, Download, RefreshCw, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const FRAMES = [
  { id: 1, desc: '街市攤位晨光場景', style: '寫實風格', status: 'generated' },
  { id: 2, desc: '婆婆與阿婷對話',   style: '寫實風格', status: 'generated' },
  { id: 3, desc: '阿婷側臉望向遠方', style: '寫實風格', status: 'pending' },
  { id: 4, desc: '涼茶舖室內佈景',   style: '寫實風格', status: 'pending' },
];

const STYLES_ZH = ['寫實風格', '水彩插畫', '油畫感', '黑白紀錄片', '復古膠片'];

export default function Canvas() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(STYLES_ZH[0]);
  const [prompt, setPrompt] = useState('香港街市早晨，菜攤，陽光透過棚架灑落，溫暖色調');

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.canvas.title}</span>
            <span className="text-muted text-sm">· {tr.creator.canvas.frameCount.replace('{{n}}', String(FRAMES.length))}</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditIndicator cost={5} label={tr.creator.canvas.costLabel} />
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
              {tr.creator.canvas.exportAll}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Frame List */}
          <div className="w-48 shrink-0 bg-card border-r border-line flex flex-col">
            <div className="p-3 border-b border-line">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">{tr.creator.canvas.frameListTitle}</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {FRAMES.map((frame, i) => (
                <button
                  key={frame.id}
                  onClick={() => setCurrentFrame(i)}
                  className={`w-full p-3 border-b border-line text-left transition-colors ${
                    currentFrame === i ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-bg-soft'
                  }`}
                >
                  <div className="aspect-video rounded bg-gradient-to-br from-primary/10 to-accent/10 mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary/30">{i + 1}</span>
                  </div>
                  <p className="text-xs text-muted truncate">{frame.desc}</p>
                  <span className={`text-xs mt-1 ${frame.status === 'generated' ? 'text-green-500' : 'text-amber-500'}`}>
                    {frame.status === 'generated' ? tr.creator.canvas.statusGenerated : tr.creator.canvas.statusPending}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Main */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              {/* Canvas Preview */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-xl mb-4 flex items-center justify-center relative border border-line overflow-hidden">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary/10 mb-2">{currentFrame + 1}</div>
                  <p className="text-muted text-sm">{FRAMES[currentFrame]?.desc}</p>
                  {FRAMES[currentFrame]?.status === 'pending' && (
                    <p className="text-amber-500 text-xs mt-2">{tr.creator.canvas.pendingHint}</p>
                  )}
                </div>
                <button
                  onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-ink" />
                </button>
                <button
                  onClick={() => setCurrentFrame(Math.min(FRAMES.length - 1, currentFrame + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-ink" />
                </button>
              </div>

              {/* Generation Controls */}
              <div className="card-base p-5 space-y-4">
                <div>
                  <label className="form-label">{tr.creator.canvas.promptLabel}</label>
                  <textarea
                    className="form-input resize-none"
                    rows={3}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Palette className="w-4 h-4 text-accent" />
                    {tr.creator.canvas.styleLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES_ZH.map(style => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedStyle === style
                            ? 'bg-accent text-white'
                            : 'bg-bg-soft text-muted hover:bg-accent/10 hover:text-accent'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 border border-line px-4 py-2 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    {tr.creator.canvas.regenerate}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors">
                    <Wand2 className="w-4 h-4" />
                    {tr.creator.canvas.generateBtn.replace('{{n}}', '5')}
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* AI Panel */}
          <aside className="w-72 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
