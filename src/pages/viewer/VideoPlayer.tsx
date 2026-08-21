import { useState } from 'react';
import { Play, Pause, Volume2, Heart, Share2, ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';

export default function VideoPlayer() {
  const { id } = useParams();
  const project = mockProjects[0];
  const [liked, setLiked] = useState(false);
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-3 flex items-center justify-between border-b border-white/10">
        <Logo size="sm" withWordmark theme="dark" />
        <Link to="/viewer/drama" className="text-white/60 hover:text-white text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" />返回</Link>
      </header>
      <div className="aspect-video bg-black flex items-center justify-center max-h-[60vh] relative group">
        <div className="text-center text-white/20">
          <Play className="w-20 h-20 mx-auto mb-3" />
          <p className="text-lg">影片播放區域</p>
          <p className="text-sm">（實際部署後連接影片來源）</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full"><div className="h-1 bg-white rounded-full" style={{width:'35%'}} /></div>
            <span className="text-xs text-white/70">3:21 / 9:45</span>
            <Volume2 className="w-4 h-4 text-white/70" />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-6 text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{project.title}</h1>
            <p className="text-white/60">{project.description}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setLiked(!liked)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${liked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />{liked ? '已收藏' : '收藏'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-colors">
              <Share2 className="w-4 h-4" />分享
            </button>
          </div>
        </div>
        <div className="text-sm text-white/50">👁 {project.views.toLocaleString()} 觀看 · ⭐ {project.rating} 評分</div>
      </div>
    </div>
  );
}
