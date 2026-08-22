/**
 * ScriptEditor — 劇本編輯器
 * Phase 3: 從 useProjectStore 讀取 Story Architect 產出：
 *   - characters → 角色卡顯示於 AI 上下文面板
 *   - storyCards → 當前集的 story_card 顯示於 AI 上下文面板
 *   - 「AI 改寫」按鈕帶入角色性格、集故事核心到 prompt
 */
import { useState } from 'react';
import { Save, Download, Wand2, AlignLeft, Film, Users, BookOpen, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';

const SCENES = [
  { id: 1, location: '街市攤位', time: '清晨', chars: '阿婷、婆婆', action: '阿婷正在整理菜攤，婆婆走近詢問價錢。', dialogue: '婆婆：「今日嘅菜幾靚喎，幾多錢一斤？」\n阿婷：「婆婆，今日新鮮到㗎，賣你廿蚊一斤。」' },
  { id: 2, location: '街市走廊', time: '上午', chars: '阿婷、旁白',  action: '阿婷望著人來人往的街市，陷入沉思。',     dialogue: '旁白：「在這個街市裡，每天都有數不盡的故事……」' },
];

export default function ScriptEditor() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const loc = locale as 'zh-HK' | 'en' | 'zh-CN';

  // Phase 3: 從 projectStore 讀取 Story Architect 產出
  const { characters, storyCards, currentEpisode, projectTitle, isCoCreated } = useProjectStore();
  const currentCard = storyCards.find(c => c.episodeNumber === currentEpisode) ?? null;

  const [activeScene, setActiveScene] = useState(0);
  const [scenes] = useState(SCENES);

  // AI 上下文面板展開狀態
  const [showContext, setShowContext] = useState(true);

  // 組裝 AI 改寫 prompt（帶入角色 + 集故事卡）
  const buildAiRewritePrompt = (sceneIndex: number) => {
    const scene = scenes[sceneIndex];
    const charSummary = characters.slice(0, 3)
      .map(c => `${c.name_i18n[loc]}（${c.identityTag_i18n[loc]}）：${c.speechStyle_i18n[loc]}`)
      .join('\n');
    const storyContext = currentCard
      ? `本集主題：${currentCard.coreEmotion_i18n[loc]}\n本集開場鉤子：${currentCard.hook_i18n[loc]}\n本集轉折點：${currentCard.turningPoint_i18n[loc]}`
      : '';

    return `請改寫以下場景的對白，使其更符合香港短劇風格（每句台詞推進劇情，無廢話）。

${charSummary ? `【角色設定】\n${charSummary}\n` : ''}${storyContext ? `【本集故事脈絡】\n${storyContext}\n` : ''}
【場景】${scene.location}（${scene.time}）
【動作】${scene.action}
【現有對白】
${scene.dialogue}

要求：保留角色各自的說話風格，對白精煉，情感真實。`;
  };

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.scriptEditor.title}</span>
            <span className="text-muted text-sm">
              · {projectTitle} · 第 {currentEpisode} 集
            </span>
            {/* Phase 3: 共創徽章 */}
            {isCoCreated && (
              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                共創作品
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <CreditIndicator cost={3} label={tr.creator.scriptEditor.costLabel} />
            <button className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
              {tr.creator.scriptEditor.export}
            </button>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" />
              {tr.creator.scriptEditor.save}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Scene List */}
          <div className="w-56 shrink-0 bg-card border-r border-line flex flex-col">
            <div className="p-3 border-b border-line">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">{tr.creator.scriptEditor.sceneListTitle}</p>
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
                  <div className="text-xs font-bold text-ink">{tr.creator.scriptEditor.sceneLabel} {scene.id}</div>
                  <div className="text-xs text-muted mt-0.5 truncate">{scene.location}</div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-line">
              <button className="w-full text-center text-xs text-primary hover:underline">
                {tr.creator.scriptEditor.addScene}
              </button>
            </div>
          </div>

          {/* Script Editor */}
          <main className="flex-1 overflow-y-auto p-6">
            {scenes[activeScene] && (
              <div className="max-w-2xl mx-auto">
                {/* Phase 3: Story Architect 上下文卡片 */}
                {(characters.length > 0 || currentCard) && (
                  <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowContext(!showContext)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-violet-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm">
                        <BookOpen size={14} />
                        Story Architect 上下文
                        {currentCard && (
                          <span className="text-xs font-normal text-violet-500 ml-1">
                            · 第 {currentEpisode} 集：{currentCard.coreEmotion_i18n[loc]}
                          </span>
                        )}
                      </div>
                      {showContext ? <ChevronUp size={14} className="text-violet-500" /> : <ChevronDown size={14} className="text-violet-500" />}
                    </button>

                    {showContext && (
                      <div className="px-4 pb-4 space-y-3">
                        {/* 本集故事卡 */}
                        {currentCard && (
                          <div className="bg-white rounded-lg p-3 border border-violet-100">
                            <p className="text-xs font-semibold text-violet-700 mb-2 flex items-center gap-1">
                              <Film size={11} /> 第 {currentEpisode} 集故事脈絡
                            </p>
                            <div className="space-y-1.5 text-xs text-ink">
                              <div><span className="text-muted">開場鉤子：</span>{currentCard.hook_i18n[loc]}</div>
                              <div><span className="text-muted">核心情感：</span>{currentCard.coreEmotion_i18n[loc]}</div>
                              {currentCard.turningPoint_i18n[loc] && (
                                <div><span className="text-muted">轉折點：</span>{currentCard.turningPoint_i18n[loc]}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 角色卡摘要 */}
                        {characters.length > 0 && (
                          <div className="bg-white rounded-lg p-3 border border-violet-100">
                            <p className="text-xs font-semibold text-violet-700 mb-2 flex items-center gap-1">
                              <Users size={11} /> 角色說話風格
                            </p>
                            <div className="space-y-2">
                              {characters.slice(0, 3).map(c => (
                                <div key={c.id} className="text-xs">
                                  <span className="font-semibold text-ink">{c.name_i18n[loc]}</span>
                                  <span className="text-muted ml-1">（{c.identityTag_i18n[loc]}）</span>
                                  <span className="text-muted block mt-0.5 pl-2 border-l-2 border-violet-200 italic">
                                    {c.speechStyle_i18n[loc]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-ink">{tr.creator.scriptEditor.sceneLabel} {scenes[activeScene].id}</h2>
                  <button
                    onClick={() => {
                      const prompt = buildAiRewritePrompt(activeScene);
                      // 複製到剪貼板，供 AI Panel 使用
                      void navigator.clipboard?.writeText(prompt).catch(() => {});
                      // TODO: 直接送入 AIAssistantPanel（Phase 3+ 深化）
                    }}
                    className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-sm hover:bg-accent/20 transition-colors"
                    title={characters.length > 0 ? '已帶入角色設定與集故事卡' : ''}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    {tr.creator.scriptEditor.aiRewrite}
                    {characters.length > 0 && (
                      <span className="text-xs opacity-60">✦</span>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Scene Header */}
                  <div className="card-base p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">{tr.creator.scriptEditor.locationLabel}</label>
                        <input className="form-input" defaultValue={scenes[activeScene].location} />
                      </div>
                      <div>
                        <label className="form-label">{tr.creator.scriptEditor.timeLabel}</label>
                        <input className="form-input" defaultValue={scenes[activeScene].time} />
                      </div>
                      <div>
                        <label className="form-label">{tr.creator.scriptEditor.charsLabel}</label>
                        <input className="form-input" defaultValue={scenes[activeScene].chars} />
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="card-base p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Film className="w-4 h-4 text-primary" />
                      <label className="form-label mb-0">{tr.creator.scriptEditor.actionLabel}</label>
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
                      <label className="form-label mb-0">{tr.creator.scriptEditor.dialogueLabel}</label>
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
