import { useParams, Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_ALL_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, Heart, Share2, Clock, Download } from 'lucide-react';

export default function WorkDetail() {
  const { id } = useParams();
  const work = MOCK_ALL_SERIES.find(s => s.id === id) ?? MOCK_ALL_SERIES[0];
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-4">
              <img src={work.thumbnail} alt={work.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute"><span className="text-white text-6xl">▶</span></div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted mb-4">
              <span className="flex items-center gap-1"><Eye size={14}/>{work.views.toLocaleString()} 觀看</span>
              <span className="flex items-center gap-1"><Heart size={14}/>收藏</span>
              <span className="flex items-center gap-1"><Share2 size={14}/>分享</span>
              <span className="flex items-center gap-1"><Clock size={14}/>{work.publishedAt || '未發佈'}</span>
            </div>
          </div>
          <div>
            <div className="bg-card rounded-xl p-5 shadow-card mb-4">
              <h2 className="font-bold text-primary text-lg mb-1">作品資料</h2>
              <div className="mb-3"><ModeBadge mode={work.mode} size="sm" /></div>
              <h1 className="font-bold text-xl text-ink mb-2">{work.title}</h1>
              <p className="text-sm text-muted mb-3">{work.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {work.tags.map(t => <span key={t} className="px-2 py-0.5 bg-bg-soft text-xs text-muted rounded-full">{t}</span>)}
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-card mb-4">
              <h3 className="font-semibold text-ink mb-2">創作者</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{work.creator.name[0]}</div>
                <div>
                  <p className="font-medium text-ink text-sm">{work.creator.name}</p>
                  <p className="text-xs text-muted">{work.creator.age} 歲 · {work.creator.tier}</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary">
              <p className="font-medium mb-1">如欲觀看完整{work.episodes}集</p>
              <p className="text-muted text-xs mb-3">請於 CoEldery 85 應用程式內觀看</p>
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium w-full justify-center">
                <Download size={14}/> 立即下載
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold text-primary mb-4">同系列其他集數</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1,2,3,4,5].map(ep => (
              <div key={ep} className="shrink-0 w-36 bg-card rounded-lg overflow-hidden shadow-card">
                <img src={work.thumbnail} alt={`第${ep}集`} className="w-full h-20 object-cover" />
                <div className="p-2"><p className="text-xs font-medium text-ink">第{ep}集</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
