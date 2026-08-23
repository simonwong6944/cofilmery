import { useState, useEffect, useRef } from 'react';
import { Library, Plus, Trash2, Upload, Filter, Tag, ImageIcon } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';
import { t } from '@/i18n';
import { useLocaleStore } from '@/store/localeStore';
import { useAuthStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface Asset {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  r2_key: string;
  file_url: string;
  category: string;
  label: string | null;
  uploaded_at: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetLibrary() {
  const { locale } = useLocaleStore();
  void locale;
  const tr = t();
  const atr = tr.admin.assetLibrary;
  const { user } = useAuthStore();

  const [tab, setTab] = useState<'assets' | 'categories'>('assets');

  // ── Category state ────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [catAdding, setCatAdding] = useState(false);
  const [catAddError, setCatAddError] = useState('');
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // ── Upload state ──────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Asset list state ──────────────────────────────────────────────────────
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // ── Load categories ───────────────────────────────────────────────────────
  const loadCategories = async () => {
    setCatLoading(true);
    setCatError('');
    try {
      const res = await fetch('/api/asset-categories');
      const data = await res.json() as { ok?: boolean; categories?: AssetCategory[]; error?: string };
      if (data.ok) {
        setCategories(data.categories ?? []);
      } else {
        setCatError(data.error ?? 'Error');
      }
    } catch (e) {
      setCatError(String(e));
    } finally {
      setCatLoading(false);
    }
  };

  // ── Load assets ───────────────────────────────────────────────────────────
  const loadAssets = async (catFilter = filterCat) => {
    setAssetsLoading(true);
    setAssetsError('');
    try {
      let url = '/api/assets?project_id=global&limit=200';
      if (catFilter) url += `&category=${encodeURIComponent(catFilter)}`;
      const res = await fetch(url);
      const data = await res.json() as { ok?: boolean; assets?: Asset[]; error?: string };
      if (data.ok) {
        setAssets(data.assets ?? []);
      } else {
        setAssetsError(data.error ?? 'Error');
      }
    } catch (e) {
      setAssetsError(String(e));
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadAssets('');
  }, []);

  // ── Add category ──────────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setCatAdding(true);
    setCatAddError('');
    try {
      const res = await fetch('/api/asset-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json() as { ok?: boolean; category?: AssetCategory; error?: string };
      if (res.status === 409) {
        setCatAddError(atr.catSlugExists);
      } else if (data.ok && data.category) {
        setCategories(prev => [...prev, data.category!]);
        setNewCatName('');
      } else {
        setCatAddError(data.error ?? 'Error');
      }
    } catch (e) {
      setCatAddError(String(e));
    } finally {
      setCatAdding(false);
    }
  };

  // ── Delete category ───────────────────────────────────────────────────────
  const handleDeleteCategory = async (cat: AssetCategory) => {
    if (!window.confirm(atr.catDeleteConfirm)) return;
    setDeletingCatId(cat.id);
    try {
      const res = await fetch(`/api/asset-categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json() as { ok?: boolean; error?: string; inUseCount?: number };
      if (res.status === 400 && data.inUseCount) {
        alert(atr.catInUseError);
      } else if (data.ok) {
        setCategories(prev => prev.filter(c => c.id !== cat.id));
      } else {
        alert(data.error ?? 'Error');
      }
    } catch (e) {
      alert(String(e));
    } finally {
      setDeletingCatId(null);
    }
  };

  // ── Upload file ───────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) { setUploadMsg({ type: 'error', text: atr.uploadNoFile }); return; }
    if (!uploadCategory) { setUploadMsg({ type: 'error', text: atr.uploadNoCategory }); return; }

    setUploading(true);
    setUploadMsg(null);
    const form = new FormData();
    form.append('file', selectedFile);
    form.append('projectId', 'global');
    form.append('userId', user?.id ?? 'admin');
    form.append('category', uploadCategory);
    form.append('label', uploadLabel);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        setUploadMsg({ type: 'success', text: atr.uploadSuccess });
        setSelectedFile(null);
        setUploadLabel('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadAssets(filterCat);
      } else {
        setUploadMsg({ type: 'error', text: data.error ?? atr.uploadError });
      }
    } catch (e) {
      setUploadMsg({ type: 'error', text: String(e) });
    } finally {
      setUploading(false);
    }
  };

  // ── Filter change ─────────────────────────────────────────────────────────
  const handleFilterChange = (slug: string) => {
    setFilterCat(slug);
    loadAssets(slug);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Library className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">{atr.pageTitle}</h1>
            <p className="text-xs text-muted">{atr.pageSubtitle}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6">
            {[
              { id: 'assets',     label: atr.tabAssets },
              { id: 'categories', label: atr.tabCategories },
            ].map(tb => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id as 'assets' | 'categories')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tab === tb.id
                    ? 'bg-primary text-white'
                    : 'bg-card text-ink hover:bg-line border border-line'
                )}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {/* ── Categories Tab ── */}
          {tab === 'categories' && (
            <div className="card-base p-6 max-w-2xl">
              <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                {atr.catTitle}
              </h2>

              {/* Add category input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => { setNewCatName(e.target.value); setCatAddError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  placeholder={atr.catNewPlaceholder}
                  className="flex-1 border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={catAdding || !newCatName.trim()}
                  className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Plus size={14} />
                  {atr.catAddBtn}
                </button>
              </div>
              {catAddError && (
                <p className="text-xs text-red-500 mb-3">{catAddError}</p>
              )}

              {/* Category list */}
              {catLoading ? (
                <p className="text-sm text-muted">{tr.common.loading}</p>
              ) : catError ? (
                <p className="text-sm text-red-500">{catError}</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted">{atr.catEmpty}</p>
              ) : (
                <div className="divide-y divide-line rounded-xl border border-line overflow-hidden">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-card hover:bg-bg-soft transition-colors">
                      <div>
                        <span className="text-sm font-medium text-ink">{cat.name}</span>
                        <span className="ml-2 text-xs text-muted font-mono">{atr.catSlugLabel}: {cat.slug}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={deletingCatId === cat.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                        title={tr.common.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Assets Tab ── */}
          {tab === 'assets' && (
            <div className="space-y-6">
              {/* Upload card */}
              <div className="card-base p-6">
                <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
                  <Upload size={16} className="text-primary" />
                  {atr.uploadTitle}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  {/* File picker */}
                  <div>
                    <label className="text-xs text-muted mb-1 block">{atr.uploadSelectFile}</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={e => { setSelectedFile(e.target.files?.[0] ?? null); setUploadMsg(null); }}
                      className="block w-full text-sm text-ink file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Category select */}
                  <div>
                    <label className="text-xs text-muted mb-1 block">{atr.uploadCategoryLabel}</label>
                    <select
                      value={uploadCategory}
                      onChange={e => { setUploadCategory(e.target.value); setUploadMsg(null); }}
                      className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                    >
                      <option value="">— {atr.uploadCategoryLabel} —</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Label input */}
                  <div>
                    <label className="text-xs text-muted mb-1 block">{atr.uploadLabelPlaceholder}</label>
                    <input
                      type="text"
                      value={uploadLabel}
                      onChange={e => setUploadLabel(e.target.value)}
                      placeholder={atr.uploadLabelPlaceholder}
                      className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Upload size={14} />
                    {uploading ? atr.uploading : atr.uploadBtn}
                  </button>
                  {selectedFile && (
                    <span className="text-xs text-muted">{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
                  )}
                  {uploadMsg && (
                    <span className={cn('text-xs font-medium', uploadMsg.type === 'success' ? 'text-green-600' : 'text-red-500')}>
                      {uploadMsg.text}
                    </span>
                  )}
                </div>
              </div>

              {/* Asset list card */}
              <div className="card-base p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                    <Filter size={16} className="text-primary" />
                    {atr.assetListTitle}
                    {!assetsLoading && <span className="text-xs text-muted font-normal ml-1">({assets.length})</span>}
                  </h2>

                  {/* Category filter */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleFilterChange('')}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                        filterCat === ''
                          ? 'bg-primary text-white border-primary'
                          : 'bg-card text-ink border-line hover:border-primary/50'
                      )}
                    >
                      {atr.filterAll}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleFilterChange(cat.slug)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                          filterCat === cat.slug
                            ? 'bg-primary text-white border-primary'
                            : 'bg-card text-ink border-line hover:border-primary/50'
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {assetsLoading ? (
                  <p className="text-sm text-muted py-6 text-center">{tr.common.loading}</p>
                ) : assetsError ? (
                  <p className="text-sm text-red-500 py-4">{assetsError}</p>
                ) : assets.length === 0 ? (
                  <p className="text-sm text-muted py-8 text-center">{atr.noAssets}</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {assets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex flex-col rounded-xl border border-line overflow-hidden bg-bg-soft hover:border-primary/40 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="w-full h-28 bg-line/40 flex items-center justify-center overflow-hidden">
                          {isImage(asset.file_type) ? (
                            <img
                              src={asset.file_url}
                              alt={asset.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <ImageIcon size={28} className="text-muted/40" />
                          )}
                        </div>
                        {/* Info */}
                        <div className="px-2 py-2 flex flex-col gap-0.5">
                          <p className="text-xs font-medium text-ink line-clamp-1 leading-tight" title={asset.file_name}>
                            {asset.file_name}
                          </p>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-muted">{asset.category}</span>
                            <span className="text-[10px] text-muted">{formatBytes(asset.file_size)}</span>
                          </div>
                          {asset.label && (
                            <p className="text-[10px] text-primary/70 line-clamp-1">{asset.label}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
