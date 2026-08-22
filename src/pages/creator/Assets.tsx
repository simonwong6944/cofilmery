import { useState } from 'react';
import { Upload, Image, Music, Video, Mic, Search, Grid, List, Trash2, Download } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const MOCK_ASSETS = [
  { id: 1, type: 'image', name: '街市場景_01.jpg', size: '2.3 MB', date: '2025-01-10' },
  { id: 2, type: 'image', name: '主角近景_02.jpg', size: '1.8 MB', date: '2025-01-10' },
  { id: 3, type: 'audio', name: '背景音樂_懷舊.mp3', size: '4.2 MB', date: '2025-01-09' },
  { id: 4, type: 'voice', name: 'AI配音_旁白_v1.mp3', size: '1.1 MB', date: '2025-01-09' },
  { id: 5, type: 'video', name: '街市原始素材.mp4', size: '128 MB', date: '2025-01-08' },
  { id: 6, type: 'image', name: '道具_菜攤.jpg', size: '0.9 MB', date: '2025-01-08' },
];

const typeIcon: Record<string, React.ElementType> = {
  image: Image,
  audio: Music,
  video: Video,
  voice: Mic,
};

const typeColor: Record<string, string> = {
  image: 'text-blue-500 bg-blue-50',
  audio: 'text-purple-500 bg-purple-50',
  video: 'text-red-500 bg-red-50',
  voice: 'text-amber-500 bg-amber-50',
};

export default function Assets() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [activeType, setActiveType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const ASSET_TYPES = [
    { id: 'all',   label: tr.creator.assets.typeAll,   icon: Grid },
    { id: 'image', label: tr.creator.assets.typeImage, icon: Image },
    { id: 'audio', label: tr.creator.assets.typeAudio, icon: Music },
    { id: 'video', label: tr.creator.assets.typeVideo, icon: Video },
    { id: 'voice', label: tr.creator.assets.typeVoice, icon: Mic },
  ];

  const filtered = MOCK_ASSETS.filter(a => {
    if (activeType !== 'all' && a.type !== activeType) return false;
    if (search && !a.name.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.assets.title}</span>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Upload className="w-4 h-4" />
            {tr.creator.assets.upload}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input className="form-input pl-9 py-2" placeholder={tr.creator.assets.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-1 border border-line rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
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

          {/* Upload Zone */}
          <div className="border-2 border-dashed border-line rounded-xl p-8 text-center mb-6 hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-muted mb-2" />
            <p className="text-sm text-muted">{tr.creator.assets.dropZoneText}</p>
            <p className="text-xs text-muted mt-1">{tr.creator.assets.dropZoneHint}</p>
          </div>

          {/* Assets Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(asset => {
                const Icon = typeIcon[asset.type] || Image;
                const colorClass = typeColor[asset.type] || 'text-gray-500 bg-gray-50';
                return (
                  <div key={asset.id} className="card-base p-4 hover:shadow-md transition-shadow group">
                    <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-ink truncate mb-1">{asset.name}</p>
                    <p className="text-xs text-muted">{asset.size}</p>
                    <div className="mt-3 pt-3 border-t border-line flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex-1 text-xs text-primary hover:underline">{tr.creator.assets.useBtn}</button>
                      <button className="text-xs text-muted hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
                    const Icon = typeIcon[asset.type] || Image;
                    const colorClass = typeColor[asset.type] || 'text-gray-500';
                    return (
                      <tr key={asset.id} className="border-b border-line last:border-0 hover:bg-bg-soft">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                            <span className="text-ink">{asset.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted capitalize">{asset.type}</td>
                        <td className="px-4 py-3 text-muted">{asset.size}</td>
                        <td className="px-4 py-3 text-muted">{asset.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 justify-end">
                            <button className="text-muted hover:text-primary"><Download className="w-4 h-4" /></button>
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
