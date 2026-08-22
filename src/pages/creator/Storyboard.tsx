import { useState } from 'react';
import { Plus, Wand2, Trash2, ChevronRight } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const PANELS = [
  { id: 1, scene: '場景一', location: '街市攤位', time: '清晨', desc: '阿婷早起整理菜攤，陽光灑落街市。',     angle: '中景 · 靜態' },
  { id: 2, scene: '場景一', location: '街市攤位', time: '清晨', desc: '婆婆走近攤位，與阿婷打招呼。',         angle: '近景 · 推鏡' },
  { id: 3, scene: '場景一', location: '街市攤位', time: '清晨', desc: '阿婷遞上菜心，婆婆仔細查看。',         angle: '特寫 · 靜態' },
  { id: 4, scene: '場景二', location: '街市走廊', time: '上午', desc: '阿婷望著人流，陷入回憶。',             angle: '中遠景 · 淡出' },
  { id: 5, scene: '場景三', location: '涼茶舖',   time: '中午', desc: '阿婷與茶舖老闆閒聊。',               angle: '雙人近景 · 靜態' },
  { id: 6, scene: '場景三', location: '涼茶舖',   time: '中午', desc: '老闆遞上一碗廿四味，冒著熱氣。',     angle: '特寫 · 慢推' },
];

export default function Storyboard() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [panels, setPanels] = useState(PANELS);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.storyboard.title}</span>
            <span className="text-muted text-sm">· 街市情緣 · 第 1 集</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditIndicator cost={4} label={tr.creator.storyboard.costLabel} />
            <button className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-sm hover:bg-accent/20 transition-colors">
              <Wand2 className="w-3.5 h-3.5" />
              {tr.creator.storyboard.aiGenerate}
            </button>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              {tr.creator.storyboard.addPanel}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {panels.map((panel, i) => (
                <div
                  key={panel.id}
                  onClick={() => setSelected(panel.id)}
                  className={`card-base overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                    selected === panel.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {/* Panel Thumbnail */}
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 relative flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary/20">{i + 1}</div>
                      <div className="text-xs text-muted mt-1">{panel.angle}</div>
                    </div>
                    <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-0.5 rounded">
                      {panel.scene}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setPanels(p => p.filter(pp => pp.id !== panel.id)); }}
                      className="absolute top-2 right-2 bg-white/80 text-muted hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Panel Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-muted">{panel.location}</span>
                      <ChevronRight className="w-3 h-3 text-line" />
                      <span className="text-xs text-muted">{panel.time}</span>
                    </div>
                    <p className="text-sm text-ink leading-relaxed line-clamp-2">{panel.desc}</p>
                  </div>
                </div>
              ))}

              {/* Add Panel */}
              <button className="card-base border-2 border-dashed border-line flex flex-col items-center justify-center h-52 hover:border-primary hover:bg-primary/3 transition-colors text-muted hover:text-primary">
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm">{tr.creator.storyboard.addPanelBtn}</span>
              </button>
            </div>
          </main>

          {/* Detail Panel */}
          <aside className="w-72 shrink-0 bg-card border-l border-line overflow-y-auto">
            {selected ? (
              <div className="p-4">
                <h3 className="font-bold text-ink mb-4">{tr.creator.storyboard.panelDetail}</h3>
                {panels.filter(p => p.id === selected).map(panel => (
                  <div key={panel.id} className="space-y-4">
                    <div>
                      <label className="form-label">{tr.creator.storyboard.descLabel}</label>
                      <textarea className="form-input resize-none" rows={3} defaultValue={panel.desc} />
                    </div>
                    <div>
                      <label className="form-label">{tr.creator.storyboard.angleLabel}</label>
                      <input className="form-input" defaultValue={panel.angle} />
                    </div>
                    <div>
                      <label className="form-label">{tr.creator.storyboard.locationLabel}</label>
                      <input className="form-input" defaultValue={panel.location} />
                    </div>
                    <div>
                      <label className="form-label">{tr.creator.storyboard.timeLabel}</label>
                      <input className="form-input" defaultValue={panel.time} />
                    </div>
                    <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      {tr.creator.storyboard.updateBtn}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted mt-20">
                <p className="text-sm">{tr.creator.storyboard.noSelection}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
