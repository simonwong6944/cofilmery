import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { Heart, Users, Film, Star, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_STORIES = [
  {
    id: 'sl1', name: '陳伯', age: 82, location: '大埔', story: '五十年街市歲月的守護者',
    sponsor: '孫兒陳大文', raised: 15000, goal: 15000, backers: 23, episodes: 3,
    status: 'completed', thumbnail: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&h=225&fit=crop',
    preview: '陳伯在大埔街市工作了整整五十年，見證了香港由農業社會演變至現代城市的全過程⋯⋯',
  },
  {
    id: 'sl2', name: '李婆婆', age: 75, location: '西貢', story: '四十年義教的無名英雄',
    sponsor: '兒子李志強', raised: 8400, goal: 12000, backers: 15, episodes: 1,
    status: 'active', thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=225&fit=crop',
    preview: '李婆婆四十年來在西貢義務教導基層兒童，從未收取任何報酬，她說「只要孩子們學到東西，就值得了」⋯⋯',
  },
  {
    id: 'sl3', name: '王阿姐', age: 70, location: '觀塘', story: '守護針線技藝的最後傳人',
    sponsor: '女兒王美珍', raised: 1200, goal: 8000, backers: 4, episodes: 0,
    status: 'crowdfunding', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    preview: '七十歲的王阿姐是觀塘區最後一位懂得傳統旗袍針線的手藝人，她希望在有生之年將技藝完整記錄下來⋯⋯',
  },
];

const STEPS = [
  { num: 1, title: '提出申請', desc: '家人或長者本人填寫申請表，說明長者故事及希望記錄的內容' },
  { num: 2, title: '發起眾籌', desc: '平台審核通過後，為項目設立眾籌頁面，向社區募集製作資金' },
  { num: 3, title: '匹配創作者', desc: '眾籌目標達成後，由平台為長者匹配合適的年輕創作者' },
  { num: 4, title: '拍攝製作', desc: '創作者在 AI 技術輔助下，為長者進行訪談及影片製作' },
  { num: 5, title: '永久保存', desc: '影片上架 CoFilmery 平台，長者的故事得以永久流傳' },
];

export default function SponsoredLegacy() {
  const [showApply, setShowApply] = useState(false);

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent/80 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Heart size={14} className="text-red-300" />
            贊助式傳承計劃
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">為您身邊的長者<br />留下永恆的生命故事</h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            發起眾籌，匹配年輕創作者，以 AI 技術記錄長者的人生智慧與珍貴回憶
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setShowApply(true)}
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-colors text-lg">
              <Heart size={20} />
              為長者申請記錄
            </button>
            <a href="#stories" className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors text-lg">
              <Play size={18} />
              觀看現有故事
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-center gap-12">
          {[
            { label: '已記錄長者', value: '127', icon: Users },
            { label: '發佈影片', value: '284', icon: Film },
            { label: '眾籌成功率', value: '91%', icon: Star },
            { label: '贊助家庭', value: '89', icon: Heart },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.icon size={18} className="mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-ink">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* How it works */}
        <h2 className="text-2xl font-bold text-ink mb-6 text-center">如何運作</h2>
        <div className="flex flex-col md:flex-row gap-0 mb-14 relative">
          <div className="hidden md:block absolute top-8 left-[calc(10%+24px)] right-[calc(10%+24px)] h-0.5 bg-primary/20" />
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex-1 text-center px-3 mb-6 md:mb-0 relative">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-3 relative z-10 shadow-md">
                {step.num}
              </div>
              <h3 className="font-bold text-ink mb-1 text-sm">{step.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Stories */}
        <h2 id="stories" className="text-2xl font-bold text-ink mb-6">現有傳承故事</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {MOCK_STORIES.map(story => {
            const fundingPct = Math.min((story.raised / story.goal) * 100, 100);
            return (
              <div key={story.id} className="bg-card rounded-2xl overflow-hidden shadow-card border border-line">
                <div className="h-44 overflow-hidden relative">
                  <img src={story.thumbnail} alt={story.name} className="w-full h-full object-cover" />
                  <div className={cn('absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium',
                    story.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    story.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-amber-100 text-amber-700'
                  )}>
                    {story.status === 'completed' ? '已完成' : story.status === 'active' ? '製作中' : '眾籌中'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {story.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-ink">{story.name} · {story.age}歲</div>
                      <div className="text-xs text-muted">{story.location} · 由{story.sponsor}發起</div>
                    </div>
                  </div>
                  <p className="text-accent font-semibold text-sm mb-2">{story.story}</p>
                  <p className="text-muted text-xs line-clamp-2 mb-3">{story.preview}</p>

                  {/* Funding bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>HK${story.raised.toLocaleString()} / {story.goal.toLocaleString()}</span>
                      <span>{story.backers} 人支持</span>
                    </div>
                    <div className="h-1.5 bg-line rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', fundingPct >= 100 ? 'bg-green-500' : 'bg-accent')}
                        style={{ width: `${fundingPct}%` }} />
                    </div>
                  </div>

                  {story.status === 'crowdfunding' && (
                    <button onClick={() => alert(`感謝您支持 ${story.name} 的故事！`)}
                      className="w-full mt-2 bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                      <Heart size={14} /> 立即贊助
                    </button>
                  )}
                  {story.status === 'completed' && story.episodes > 0 && (
                    <Link to={`/works/${story.id}`}
                      className="w-full mt-2 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <Play size={14} /> 觀看 {story.episodes} 集
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing tiers */}
        <h2 className="text-2xl font-bold text-ink mb-6 text-center">贊助方案</h2>
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            { tier: '基本', price: 'HK$3,000', episodes: 1, desc: '一集訪談紀錄片', features: ['30 分鐘訪談', '基礎剪接', '平台永久存檔', '家人專屬分享連結'] },
            { tier: '完整', price: 'HK$8,000', episodes: 3, desc: '三集完整傳承系列', features: ['三集訪談紀錄', 'AI 生成配樂', '字幕製作', '公開發佈', '家庭珍藏版下載'], popular: true },
            { tier: '珍藏', price: 'HK$18,000', episodes: 8, desc: '八集深度傳承系列', features: ['八集全面記錄', '專業後期製作', '實體 USB 珍藏版', '公映典禮', 'ESG 企業認可'], },
          ].map(plan => (
            <div key={plan.tier} className={cn('bg-card rounded-2xl p-6 border-2 shadow-card',
              plan.popular ? 'border-accent' : 'border-line'
            )}>
              {plan.popular && (
                <div className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">最受歡迎</div>
              )}
              <h3 className="font-bold text-xl text-ink mb-1">{plan.tier}方案</h3>
              <div className="text-3xl font-bold text-primary mb-1">{plan.price}</div>
              <p className="text-muted text-sm mb-4">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowApply(true)}
                className={cn('w-full py-3 rounded-xl font-semibold transition-colors',
                  plan.popular ? 'bg-accent text-white hover:bg-accent/90' : 'bg-primary text-white hover:bg-primary/90'
                )}>
                選擇此方案
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-ink mb-1">為長者申請傳承記錄</h3>
            <p className="text-muted text-sm mb-5">填寫以下資料，我們將在三個工作日內聯絡您</p>
            <div className="space-y-3">
              {[
                { label: '長者姓名', placeholder: '例如：陳伯' },
                { label: '長者年齡', placeholder: '例如：80', type: 'number' },
                { label: '長者所在地區', placeholder: '例如：大埔' },
                { label: '申請人姓名（與長者關係）', placeholder: '例如：王大文（孫兒）' },
                { label: '聯絡電郵', placeholder: 'example@email.com', type: 'email' },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-xs text-muted mb-1 block">{field.label}</label>
                  <input type={field.type ?? 'text'} placeholder={field.placeholder} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted mb-1 block">長者的故事（簡述）</label>
                <textarea rows={3} placeholder="請簡介長者的人生經歷，希望記錄的故事主題⋯" className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">選擇方案</label>
                <select className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                  <option>基本方案（HK$3,000 · 1集）</option>
                  <option>完整方案（HK$8,000 · 3集）</option>
                  <option>珍藏方案（HK$18,000 · 8集）</option>
                  <option>自訂眾籌（由社區共同支持）</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowApply(false)} className="flex-1 py-2.5 rounded-xl border border-line text-ink hover:bg-bg-soft font-medium">取消</button>
              <button onClick={() => { alert('申請已提交！我們將在三個工作日內聯絡您。'); setShowApply(false); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90">
                提交申請
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
