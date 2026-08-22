/**
 * Storyboard — 分鏡板
 * Phase 3: 從 useProjectStore 讀取角色外觀 prompt，
 *   在 AI 生成分鏡時注入 appearancePrompt_zh / _en 維持跨集視覺一致性。
 *   右側「角色外觀參考」面板列出每個角色的外觀描述供 AI 圖像生成參考。
 */
import { useState } from 'react';
import { Plus, Wand2, Trash2, ChevronRight, Users, Copy, Check as CheckIcon } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
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

  // Phase 3: 從 projectStore 讀取角色外觀 prompt
  const { characters, projectTitle, currentEpisode } = useProjectStore();
  const hasCharacters = characters.length > 0;

  const [panels, setPanels] = useState(PANELS);
  const [selected, setSelected] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 複製外觀 prompt 到剪貼板（供 AI 圖像生成工具使用）
  const copyPrompt = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.storyboard.title}</span>
            <span className="text-muted text-sm">· {projectTitle} · 第 {currentEpisode} 集</span>
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
            {/* Phase 3: 角色外觀一致性提示（有角色卡時顯示）*/}
            {hasCharacters && (
              <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-3">
                  <Users size={14} />
                  角色外觀參考（跨集一致性）
                  <span className="text-xs font-normal text-blue-500 ml-1">— 複製 Prompt 貼入 AI 圖像工具</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {characters.map(c => (
                    <div key={c.id} className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-xs font-bold text-ink">{c.name_i18n['zh-HK']}</span>
                          <span className="text-xs text-muted ml-1">· {c.identityTag_i18n['zh-HK']}</span>
                        </div>
                      </div>

                      {/* 中文外觀 prompt */}
                      {c.appearancePrompt_zh && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted">中文 Prompt</span>
                            <button
                              onClick={() => copyPrompt(`${c.id}-zh`, c.appearancePrompt_zh)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {copiedId === `${c.id}-zh`
                                ? <><CheckIcon size={10} className="text-green-500" /> 已複製</>
                                : <><Copy size={10} /> 複製</>
                              }
                            </button>
                          </div>
                          <p className="text-xs text-ink bg-blue-50 rounded p-2 leading-relaxed">
                            {c.appearancePrompt_zh}
                          </p>
                        </div>
                      )}

                      {/* 英文外觀 prompt（AI 圖像工具通常用英文）*/}
                      {c.appearancePrompt_en && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted">English Prompt</span>
                            <button
                              onClick={() => copyPrompt(`${c.id}-en`, c.appearancePrompt_en)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {copiedId === `${c.id}-en`
                                ? <><CheckIcon size={10} className="text-green-500" /> Copied</>
                                : <><Copy size={10} /> Copy</>
                              }
                            </button>
                          </div>
                          <p className="text-xs text-ink bg-blue-50 rounded p-2 leading-relaxed font-mono">
                            {c.appearancePrompt_en}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 分鏡格 */}
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

                    {/* Phase 3: AI 分鏡生成時帶入角色外觀 prompt */}
                    {hasCharacters && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <Users size={11} /> AI 生成分鏡時帶入角色
                        </p>
                        <div className="space-y-1">
                          {characters.slice(0, 3).map(c => (
                            <label key={c.id} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded" />
                              {c.name_i18n['zh-HK']}
                              <span className="text-muted text-xs">({c.identityTag_i18n['zh-HK']})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      {tr.creator.storyboard.updateBtn}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                {/* Phase 3: 未選格時顯示角色外觀快速參考 */}
                {hasCharacters ? (
                  <div>
                    <h3 className="font-bold text-ink mb-3 text-sm">角色外觀快速參考</h3>
                    <div className="space-y-3">
                      {characters.slice(0, 4).map(c => (
                        <div key={c.id} className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                          <p className="text-xs font-semibold text-ink">{c.name_i18n['zh-HK']}</p>
                          <p className="text-xs text-muted mt-0.5">{c.identityTag_i18n['zh-HK']}</p>
                          {c.appearancePrompt_en && (
                            <p className="text-xs text-blue-700 mt-1 font-mono leading-relaxed line-clamp-2">
                              {c.appearancePrompt_en}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted mt-20">
                    <p className="text-sm">{tr.creator.storyboard.noSelection}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Panel 折疊到底部 */}
            <div className="border-t border-line">
              <AIAssistantPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
