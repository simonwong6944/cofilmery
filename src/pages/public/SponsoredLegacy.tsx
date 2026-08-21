import { PublicNav } from '@/components/layout/PublicNav';
import { Heart } from 'lucide-react';

const SUBJECTS = [
  { name: '何先生', story: '守護大埔濕地三十年', views: 3200, status: '已發佈' },
  { name: '李女士', story: '義教基層兒童四十年', views: 4100, status: '製作中' },
  { name: '陳師傅', story: '中藥世家三代傳承', views: 2800, status: '已發佈' },
  { name: '張女士', story: '自閉症兒童之母親，創辦本地支援中心', views: 1900, status: '送審中' },
];

export function SponsoredLegacy() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-accent font-semibold mb-2">贊助式傳承 · 為無名英雄留下故事</p>
        <h1 className="text-4xl font-bold text-ink mb-6">值得被鄭重記錄的人生，不應只限於富裕家庭或知名人士⋯</h1>
        <div className="bg-accent/10 border border-accent rounded-xl p-5 mb-10 flex items-start gap-3">
          <Heart size={20} className="text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-ink">「值得被鄭重記錄的人生，不應只限於有錢人及名人。每一位默默付出的普通人，都值得有人為他們留下故事。」</p>
        </div>
        <div className="grid md:grid-cols-4 gap-5 mb-12">
          {SUBJECTS.map(({ name, story, views, status }) => (
            <div key={name} className="bg-card rounded-xl p-5 shadow-card">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg mb-3">{name[0]}</div>
              <p className="font-bold text-ink">{name}</p>
              <p className="text-sm text-muted mb-2">{story}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{views.toLocaleString()} 觀看</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${status==='已發佈'?'bg-green-100 text-green-700':status==='製作中'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>{status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="font-bold text-primary mb-4">我想贊助一個故事</h2>
            <input className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft mb-3 focus:outline-none focus:border-primary" placeholder="公司或個人名稱" />
            <input className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft mb-3 focus:outline-none focus:border-primary" placeholder="電郵地址" />
            <textarea rows={3} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft mb-3 focus:outline-none focus:border-primary resize-none" placeholder="贊助動機⋯" />
            <button className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors w-full">提交贊助查詢</button>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="font-bold text-primary mb-4">我想推薦一位值得被記錄的人</h2>
            <input className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft mb-3 focus:outline-none focus:border-primary" placeholder="推薦者姓名" />
            <input className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft mb-3 focus:outline-none focus:border-primary" placeholder="被推薦者姓名" />
            <textarea rows={3} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft mb-3 focus:outline-none focus:border-primary resize-none" placeholder="為何值得被記錄⋯" />
            <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors w-full">提交推薦</button>
          </div>
        </div>
      </div>
    </div>
  );
}
