import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Share2, ChevronLeft, Maximize, Settings, ThumbsUp, MessageSquare, Star, Film } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { mockProjects } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';

export default function VideoPlayer() {
  const { id } = useParams();
  const project = mockProjects.find(p => p.id === id) ?? mockProjects[0];
  const relatedProjects = mockProjects.filter(p => p.id !== project.id).slice(0, 4);

  const [liked, setLiked] = useState(false);
  const [thumbsUp, setThumbsUp] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentEp, setCurrentEp] = useState(1);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: '陳婆婆', text: '非常感人，令我想起自己年輕的時候⋯', time: '2 小時前', likes: 8 },
    { id: 2, user: '黎伯', text: '好睇！希望快點出下一集！', time: '5 小時前', likes: 15 },
    { id: 3, user: '梁太', text: '創作者的心思很細膩，感謝他們記錄這些故事。', time: '1 天前', likes: 22 },
  ]);

  const totalEps = Math.min(project.episodeCount, 6);

  const handleComment = () => {
    if (!comment.trim()) return;
    setComments([{ id: Date.now(), user: '你', text: comment, time: '剛才', likes: 0 }, ...comments]);
    setComment('');
    setShowComment(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="px-6 py-3 flex items-center justify-between border-b border-white/10 bg-gray-950/95 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/viewer/drama" className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-5 h-5"/>返回
          </Link>
          <span className="text-white/20">|</span>
          <Logo size="sm" withWordmark theme="dark"/>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span>第 {currentEp} 集</span>
          <span>/</span>
          <span>共 {project.episodeCount} 集</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-0">
        {/* Video Column */}
        <div className="flex-1">
          {/* Video Player */}
          <div
            className="relative bg-black aspect-video max-h-[65vh] group cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {/* Fake video background */}
            <img
              src={(project as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=675&fit=crop'}
              alt={project.title}
              className="w-full h-full object-cover opacity-60"
              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=675&fit=crop'; }}
            />

            {/* Play/Pause overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 transition-colors">
                  <Play className="w-10 h-10 text-white ml-1" fill="white"/>
                </div>
              </div>
            )}

            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
                  <Pause className="w-8 h-8 text-white" fill="white"/>
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress">
                  <div className="h-1.5 bg-accent rounded-full transition-all" style={{ width: isPlaying ? '42%' : '35%' }}/>
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: isPlaying ? '42%' : '35%', transform: 'translate(-50%, -50%)' }}/>
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>{isPlaying ? '3:58' : '3:21'}</span>
                  <span>9:45</span>
                </div>
              </div>
              {/* Control Buttons */}
              <div className="flex items-center gap-3">
                <button onClick={e => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  {isPlaying ? <Pause className="w-4 h-4" fill="white"/> : <Play className="w-4 h-4 ml-0.5" fill="white"/>}
                </button>
                <button onClick={e => { e.stopPropagation(); setIsMuted(!isMuted); }} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
                </button>
                <div className="flex-1"/>
                <button className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Settings className="w-4 h-4"/>
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Maximize className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* Mode Badge */}
            <div className="absolute top-3 left-3">
              <ModeBadge mode={(project as any).mode} size="sm"/>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{project.title} 第 {currentEp} 集</h1>
                <p className="text-white/50 text-sm">{project.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${liked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}/>{liked ? '已收藏' : '收藏'}
                </button>
                <button
                  onClick={() => setThumbsUp(!thumbsUp)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${thumbsUp ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${thumbsUp ? 'fill-current' : ''}`}/>
                  {thumbsUp ? '已讚好' : '讚好'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 border border-white/10 transition-colors">
                  <Share2 className="w-4 h-4"/>分享
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent"/>{project.rating}</span>
              <span>👁 {project.views.toLocaleString()} 觀看</span>
              <span>共 {project.episodeCount} 集</span>
            </div>
          </div>

          {/* Episodes */}
          <div className="p-5 border-b border-white/10">
            <h2 className="text-white font-bold mb-3">集數選擇</h2>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map(ep => (
                <button
                  key={ep}
                  onClick={() => setCurrentEp(ep)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentEp === ep
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {ep}
                </button>
              ))}
              {project.episodeCount > 6 && (
                <span className="flex items-center text-white/30 text-sm px-2">…共 {project.episodeCount} 集</span>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent"/>
                留言 ({comments.length})
              </h2>
              <button
                onClick={() => setShowComment(!showComment)}
                className="text-sm text-accent hover:underline"
              >
                {showComment ? '取消' : '發表留言'}
              </button>
            </div>

            {showComment && (
              <div className="mb-4 flex gap-3">
                <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">我</div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/15 border border-white/10 resize-none"
                    placeholder="分享您的感受…"
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <button onClick={() => setShowComment(false)} className="px-4 py-1.5 text-sm text-white/60 hover:text-white">取消</button>
                    <button onClick={handleComment} className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">發表</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {c.user[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{c.user}</span>
                      <span className="text-white/30 text-xs">{c.time}</span>
                    </div>
                    <p className="text-white/70 text-sm">{c.text}</p>
                    <button className="mt-1.5 text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
                      <ThumbsUp className="w-3 h-3"/>{c.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 border-l border-white/10 flex-shrink-0">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-bold mb-1">創作者</h3>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center font-bold text-primary">
                {((project as any).creator?.name?.[0]) ?? 'C'}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{(project as any).creator?.name ?? '創作者'}</p>
                <p className="text-white/40 text-xs">{(project as any).creator?.age} 歲 · {(project as any).creator?.tier}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-white font-bold mb-3">相關作品</h3>
            <div className="space-y-3">
              {relatedProjects.map(p => (
                <Link
                  key={p.id}
                  to={`/viewer/watch/${p.id}`}
                  className="flex gap-3 group hover:bg-white/5 rounded-xl p-2 transition-colors"
                >
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={(p as any).thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-xs font-medium line-clamp-2 group-hover:text-accent transition-colors">{p.title}</h4>
                    <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-accent fill-accent"/>{p.rating}
                      <span className="ml-1">{p.episodeCount} 集</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
