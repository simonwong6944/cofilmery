import { useState, useRef } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';
import { Layers, Upload, X, Plus, Info, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────
// 全劇美學鎖（修正九：加入參考圖上傳）
// 故事已定，進入視覺化前為整套劇定調一次視覺風格
// 支援：風格參考圖 / 角色參考圖 / 場景參考圖 + 文字描述並存
// ─────────────────────────────────────────
type RefImageItem = { id: string; url: string; caption: string; linkedCharId?: string };
type RefImageSection = 'style' | 'character' | 'scene';

export function SeriesAestheticLock({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const { aestheticLock, setAestheticLock, characters: storedCharacters, projectId: storeProjectId } = useProjectStore();
  const [open, setOpen] = useState(true);
  const alTr = tr.creator.drama.aestheticLock;

  // 參考圖 state（三類）
  const [refImages, setRefImages] = useState<Record<RefImageSection, RefImageItem[]>>({
    style: [], character: [], scene: [],
  });

  const addRefImage = (section: RefImageSection, url: string) => {
    const id = `ref-${section}-${Date.now()}`;
    setRefImages(prev => ({ ...prev, [section]: [...prev[section], { id, url, caption: '' }] }));
  };

  const removeRefImage = (section: RefImageSection, id: string) => {
    setRefImages(prev => ({ ...prev, [section]: prev[section].filter(r => r.id !== id) }));
  };

  const updateCaption = (section: RefImageSection, id: string, caption: string) => {
    setRefImages(prev => ({
      ...prev,
      [section]: prev[section].map(r => r.id === id ? { ...r, caption } : r),
    }));
  };

  const linkChar = (section: RefImageSection, id: string, charId: string) => {
    setRefImages(prev => ({
      ...prev,
      [section]: prev[section].map(r => r.id === id ? { ...r, linkedCharId: charId } : r),
    }));
  };

  // 真實上傳 — 開啟 file picker，上傳到 R2，把 URL 加入 refImages
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadingSection, setUploadingSection] = useState<RefImageSection | null>(null);

  const handleUpload = (section: RefImageSection) => {
    setUploadingSection(section);
    uploadRef.current?.click();
  };

  const onRefFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadingSection) return;
    const categoryMap: Record<RefImageSection, string> = {
      style: 'other', character: 'character', scene: 'scene',
    };
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', storeProjectId || 'global');
      fd.append('userId', 'creator-local');
      fd.append('category', categoryMap[uploadingSection]);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json<{ fileUrl: string }>();
      addRefImage(uploadingSection, data.fileUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingSection(null);
    }
  };

  const RefImageSectionUI = ({
    sectionKey, title, subtitle,
  }: { sectionKey: RefImageSection; title: string; subtitle: string }) => {
    const items = refImages[sectionKey];
    return (
      <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line bg-violet-50/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
          <button
            onClick={() => handleUpload(sectionKey)}
            className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Upload size={12} /> {alTr.uploadBtn}
          </button>
        </div>
        <div className="p-4">
          {items.length === 0 ? (
            <button
              onClick={() => handleUpload(sectionKey)}
              className="w-full border-2 border-dashed border-line rounded-xl p-6 text-center hover:border-violet-300 transition-colors group"
            >
              <Upload size={24} className="mx-auto text-muted mb-2 group-hover:text-violet-400 transition-colors" />
              <p className="text-xs text-muted">{alTr.uploadHint}</p>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map(item => (
                <div key={item.id} className="relative group">
                  <img src={item.url} alt="" className="w-full h-28 object-cover rounded-lg" />
                  {/* 移除按鈕 */}
                  <button
                    onClick={() => removeRefImage(sectionKey, item.id)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={alTr.removeImg}
                  >
                    <X size={10} />
                  </button>
                  {/* 說明欄 */}
                  <input
                    value={item.caption}
                    onChange={e => updateCaption(sectionKey, item.id, e.target.value)}
                    placeholder={alTr.captionPlaceholder}
                    className="w-full mt-1.5 text-[11px] border border-line rounded px-2 py-1 bg-bg-soft focus:outline-none focus:border-violet-400"
                  />
                  {/* 角色關聯（僅 character 區顯示） */}
                  {sectionKey === 'character' && storedCharacters.length > 0 && (
                    <select
                      value={item.linkedCharId ?? ''}
                      onChange={e => linkChar(sectionKey, item.id, e.target.value)}
                      className="w-full mt-1 text-[11px] border border-line rounded px-2 py-1 bg-bg-soft focus:outline-none focus:border-violet-400"
                    >
                      <option value="">{alTr.linkChar}</option>
                      {storedCharacters.map(c => (
                        <option key={c.id} value={c.id}>{c.name_i18n['zh-HK']}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              {/* 加更多 */}
              <button
                onClick={() => handleUpload(sectionKey)}
                className="h-28 border-2 border-dashed border-line rounded-lg flex items-center justify-center hover:border-violet-300 transition-colors"
              >
                <Plus size={20} className="text-muted" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* 標題 */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Layers size={12} /> {alTr.title}
        </div>
        <h2 className="text-2xl font-bold text-primary">{alTr.title}</h2>
        <p className="text-muted text-sm mt-1">{alTr.subtitle}</p>
      </div>

      {/* 已鎖定摘要 */}
      {aestheticLock && !open && (
        <div className="bg-violet-50 border border-violet-300 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center shrink-0">
            <Layers size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-violet-800">{tr.aestheticComposer.seriesLock.locked}</p>
            <p className="text-xs text-violet-600 mt-0.5 line-clamp-2">{aestheticLock.compiledPromptZh}</p>
          </div>
          <button onClick={() => setOpen(true)} className="text-xs text-violet-600 hover:text-violet-800 border border-violet-300 px-3 py-1.5 rounded-lg transition-colors shrink-0">
            修改
          </button>
        </div>
      )}

      {open && (<>
        {/* Hidden file input for real uploads */}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onRefFileChange}
        />

        {/* ── 參考圖三區（修正九）── */}
        <RefImageSectionUI sectionKey="style"     title={alTr.styleRefTitle}  subtitle={alTr.styleRefSubtitle}  />
        <RefImageSectionUI sectionKey="character" title={alTr.charRefTitle}   subtitle={alTr.charRefSubtitle}   />
        <RefImageSectionUI sectionKey="scene"     title={alTr.sceneRefTitle}  subtitle={alTr.sceneRefSubtitle}  />

        {/* ── 文字風格描述（原 AestheticComposer）── */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center gap-2">
            <Layers size={16} className="text-violet-600" />
            <span className="text-sm font-semibold text-ink">{alTr.textStyleTitle}</span>
            {aestheticLock && (
              <button onClick={() => setOpen(false)} className="ml-auto text-xs text-muted hover:text-ink transition-colors">
                收起
              </button>
            )}
          </div>
          <div className="p-4">
            <AestheticComposer
              mode="drama"
              initialOutput={aestheticLock ?? undefined}
              isSeriesLock
              onApply={(output) => {
                setAestheticLock(output);
                setOpen(false);
              }}
              onCancel={aestheticLock ? () => setOpen(false) : undefined}
            />
          </div>
        </div>
      </>)}

      {/* 說明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5"><Info size={13} /> 美學鎖如何運作？</p>
        <p>・S4 分鏡、S5 關鍵幀頂部會顯示「繼承全劇美學：<span className="font-semibold">{aestheticLock?.compiledPromptZh?.slice(0, 20) ?? '未設定'}…</span>」</p>
        <p>・每集可局部微調（只影響當前集），唔會改動呢度的全劇設定。</p>
        <p>・之後返呢度可以修改全劇美學；改完後新一集自動套用，舊集保留局部調整。</p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        {!aestheticLock && (
          <button onClick={onNext} className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm">
            稍後再設定，先去分鏡
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!aestheticLock}
          className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
            aestheticLock ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-line text-muted cursor-not-allowed'
          }`}
        >
          <ChevronRight size={18} />
          {aestheticLock ? alTr.confirmBtn : '請先設定全劇美學'}
        </button>
      </div>
    </div>
  );
}
