import { useState, useEffect, useRef, useCallback, DragEvent } from 'react';
import {
  Upload, Image, Music, Video, Mic, Search, Grid, List,
  Trash2, Download, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AssetRecord {
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

const CATEGORY_OPTIONS = [
  { id: 'all',       label: '全部' },
  { id: 'character', label: '角色' },
  { id: 'scene',     label: '場景' },
  { id: 'prop',      label: '道具' },
  { id: 'sponsor',   label: '贊助商' },
  { id: 'audio',     label: '音頻' },
  { id: 'video',     label: '影片' },
  { id: 'other',     label: '其他' },
] as const;

const typeIcon: Record<string, React.ElementType> = {
  image:    Image,
  audio:    Music,
  video:    Video,
  voice:    Mic,
};

const typeColor: Record<string, string> = {
  image:   'text-blue-500 bg-blue-50',
  audio:   'text-purple-500 bg-purple-50',
  video:   'text-red-500 bg-red-50',
  voice:   'text-amber-500 bg-amber-50',
  default: 'text-gray-500 bg-gray-50',
};

function mimeToKind(mime: string): string {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'other';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Upload helper ────────────────────────────────────────────────────────────
async function uploadFile(
  file: File,
  projectId: string,
  category: string,
): Promise<AssetRecord> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('projectId', projectId);
  fd.append('userId', 'creator-local');   // replace with real auth user id when ready
  fd.append('category', category);

  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json<{ error?: string }>().catch(() => ({}));
    throw new Error(err.error ?? `Upload failed (${res.status})`);
  }
  return res.json<AssetRecord>();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Assets() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const { projectId } = useProjectStore();
  // Use project id from store; fall back to 'global' for standalone uploads
  const activeProject = projectId || 'global';

  const [assets, setAssets]             = useState<AssetRecord[]>([]);
  const [loading, setLoading]           = useState(false);
  const [fetchError, setFetchError]     = useState('');
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [activeType, setActiveType]     = useState('all');
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid');
  const [search, setSearch]             = useState('');
  const [dragOver, setDragOver]         = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch assets from D1 via /api/assets ────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const qs = new URLSearchParams({ project_id: activeProject, limit: '200' });
      const res = await fetch(`/api/assets?${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json<{ ok: boolean; assets: AssetRecord[] }>();
      setAssets(data.assets ?? []);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : '讀取資產失敗');
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      for (const file of arr) {
        const kind     = mimeToKind(file.type);
        const category = kind === 'image' ? 'other' : kind; // default mapping
        await uploadFile(file, activeProject, category);
      }
      setUploadSuccess(`✓ 成功上傳 ${arr.length} 個檔案`);
      await fetchAssets();          // refresh list
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : '上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { handleFiles(e.target.files); e.target.value = ''; }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    if (activeType !== 'all' && a.category !== activeType) return false;
    if (search && !a.file_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const ASSET_TYPES = CATEGORY_OPTIONS.map(c => ({
    id: c.id,
    label: c.label,
    icon: c.id === 'audio' ? Music : c.id === 'video' ? Video : c.id === 'character' ? Mic : Image,
  }));

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.assets.title}</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Upload className="w-4 h-4" />}
            {uploading ? '上傳中…' : tr.creator.assets.upload}
          </button>
        </header>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={onFileInputChange}
        />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Toast messages */}
          {uploadSuccess && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                className="form-input pl-9 py-2"
                placeholder={tr.creator.assets.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 border border-line rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button onClick={fetchAssets} className="text-xs text-muted hover:text-ink border border-line rounded-lg px-3 py-2">
              刷新
            </button>
          </div>

          {/* Type Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {ASSET_TYPES.map(tp => (
              <button
                key={tp.id}
                onClick={() => setActiveType(tp.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeType === tp.id ? 'bg-primary text-white' : 'bg-card border border-line text-muted hover:text-ink'
                }`}
              >
                <tp.icon className="w-4 h-4" />
                {tp.label}
              </button>
            ))}
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors cursor-pointer
              ${dragOver ? 'border-primary bg-primary/5' : 'border-line hover:border-primary'}`}
          >
            {uploading
              ? <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-2" />
              : <Upload className="w-8 h-8 mx-auto text-muted mb-2" />}
            <p className="text-sm text-muted">
              {uploading ? '上傳中，請稍候…' : (dragOver ? '放開以上傳' : tr.creator.assets.dropZoneText)}
            </p>
            <p className="text-xs text-muted mt-1">{tr.creator.assets.dropZoneHint}</p>
          </div>

          {/* Fetch error */}
          {fetchError && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {fetchError}
              <button onClick={fetchAssets} className="underline ml-1">重試</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted" />
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && filtered.length === 0 && (
            <div className="text-center py-16 text-muted">
              <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">尚未上傳任何素材</p>
              <p className="text-xs mt-1">點擊上方按鈕或拖放檔案到此區域</p>
            </div>
          )}

          {/* Grid view */}
          {!loading && viewMode === 'grid' && filtered.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(asset => {
                const kind      = mimeToKind(asset.file_type);
                const Icon      = typeIcon[kind] ?? Image;
                const colorCls  = typeColor[kind] ?? typeColor.default;
                const isImage   = kind === 'image';
                return (
                  <div key={asset.id} className="card-base p-4 hover:shadow-md transition-shadow group">
                    {isImage ? (
                      <img
                        src={asset.file_url}
                        alt={asset.file_name}
                        className="w-full h-28 object-cover rounded-lg mb-3"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-lg ${colorCls} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <p className="text-sm font-medium text-ink truncate mb-1">{asset.file_name}</p>
                    <p className="text-xs text-muted">{formatBytes(asset.file_size)}</p>
                    <div className="mt-3 pt-3 border-t border-line flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={asset.file_url}
                        download={asset.file_name}
                        className="flex-1 text-xs text-primary hover:underline"
                      >
                        <Download className="w-3.5 h-3.5 inline mr-1" />
                        下載
                      </a>
                      <button className="text-xs text-muted hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List view */}
          {!loading && viewMode === 'list' && filtered.length > 0 && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">{tr.creator.assets.colName}</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">{tr.creator.assets.colType}</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">{tr.creator.assets.colSize}</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">{tr.creator.assets.colDate}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(asset => {
                    const kind     = mimeToKind(asset.file_type);
                    const Icon     = typeIcon[kind] ?? Image;
                    const colorCls = typeColor[kind] ?? typeColor.default;
                    return (
                      <tr key={asset.id} className="border-b border-line last:border-0 hover:bg-bg-soft">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${colorCls.split(' ')[0]}`} />
                            <span className="text-ink">{asset.file_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted capitalize">{asset.category}</td>
                        <td className="px-4 py-3 text-muted">{formatBytes(asset.file_size)}</td>
                        <td className="px-4 py-3 text-muted">
                          {new Date(asset.uploaded_at).toLocaleDateString('zh-HK')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 justify-end">
                            <a href={asset.file_url} download={asset.file_name} className="text-muted hover:text-primary">
                              <Download className="w-4 h-4" />
                            </a>
                            <button className="text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
