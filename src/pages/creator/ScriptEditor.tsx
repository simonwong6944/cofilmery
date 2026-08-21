import { useState } from 'react';
import { Save, Download, Wand2, ChevronDown, AlignLeft, Film } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';

const SCENES = [
  { id: 1, location: '街市攤位', time: '清晨', chars: '阿婷、婆婆', action: '阿婷正在整理菜攤，婆婆走近詢問價錢。', dialogue: '婆婆：「今日嘅菜幾靚喎，幾多錢一斤？」\n阿婷：「婆婆，今日新鮮到㗎，賣你廿蚊一斤。」' },
  { id: 2, location: '街市走廊', time: '上午', chars: '阿婷、旁白', action: '阿婷望著人來人往的街市，陷入沉思。', dialogue: '旁白：「在這個街市裡，每天都有數不盡的故事……」' },
];

export default function ScriptEditor() {
  const [activeScene, setActiveScene] = useState(0);
  const [scenes, setScenes] = useState(SCENES);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">劇本編輯器</span>
            <span className="text-muted text-sm">· 街市情緣 · 第 1 集</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditIndicator cost={3} label="AI 改寫" />
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
              匯出
            </button>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" />
              儲存
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Scene List */}
          <div className="w-56 shrink-0 bg-card border-r border-line flex flex-col">
            <div className="p-3 border-b border-line">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">場景列表</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {scenes.map((scene, i) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(i)}
                  className={`w-full text-left px-4 py-3 border-b border-line transition-colors ${
                    activeScene === i ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-bg-soft'
                  }`}
                >
                  <div className="text-xs font-bold text-ink">場景 {scene.id}</div>
                  <div className="text-xs text-muted mt-0.5 truncate">{scene.location}</div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-line">
              <button className="w-full text-center text-xs text-primary hover:underline">
                + 新增場景
              </button>
            </div>
          </div>

          {/* Script Editor */}
          <main className="flex-1 overflow-y-auto p-6">
            {scenes[activeScene] && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-ink">場景 {scenes[activeScene].id}</h2>
                  <button className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-sm hover:bg-accent/20 transition-colors">
                    <Wand2 className="w-3.5 h-3.5" />
                    AI 改寫
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Scene Header */}
                  <div className="card-base p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">場景地點</label>
                        <input className="form-input" defaultValue={scenes[activeScene].location} />
                      </div>
                      <div>
                        <label className="form-label">時間</label>
                        <input className="form-input" defaultValue={scenes[activeScene].time} />
                      </div>
                      <div>
                        <label className="form-label">出場角色</label>
                        <input className="form-input" defaultValue={scenes[activeScene].chars} />
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="card-base p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Film className="w-4 h-4 text-primary" />
                      <label className="form-label mb-0">場景描述</label>
                    </div>
                    <textarea
                      className="form-input resize-none"
                      rows={3}
                      defaultValue={scenes[activeScene].action}
                    />
                  </div>

                  {/* Dialogue */}
                  <div className="card-base p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlignLeft className="w-4 h-4 text-accent" />
                      <label className="form-label mb-0">對白</label>
                    </div>
                    <textarea
                      className="form-input font-mono resize-none"
                      rows={6}
                      defaultValue={scenes[activeScene].dialogue}
                    />
                  </div>
                </div>
              </div>
            )}
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
