import { PublicNav } from '@/components/layout/PublicNav';
import { TierBadge } from '@/components/shared/TierBadge';
import { Link } from 'react-router-dom';

export default function Recruit() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-accent font-semibold mb-2">創作者招募 · 十八至三十歲</p>
        <h1 className="text-4xl font-bold text-ink mb-4">運用人工智能技術，為長者觀眾創造有意義的內容<br /><span className="text-primary">同時建立您的創作事業</span></h1>
        <div className="flex items-center gap-4 mb-12">
          {(['trainee','certified','senior','contracted'] as const).map((t, i) => (
            <div key={t} className="flex items-center gap-2">
              <TierBadge tier={t} />
              {i < 3 && <span className="text-muted">→</span>}
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: '專業級人工智能工具', desc: '使用業界頂尖的粵語影像生成技術，無需學習複雜軟件。' },
            { title: '有意義的創作方向', desc: '為真實的長者觀眾群體創作，每一個故事都有其社會價值。' },
            { title: '實際報酬及 ESG 履歷', desc: '勞務分紅最高 80%，同時建立您的 ESG 創作履歷。' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-card rounded-xl p-5 shadow-card">
              <h3 className="font-bold text-primary mb-2">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-2xl p-8 shadow-card mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">立即申請</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {['姓名', '電郵地址', '作品集連結', '聯絡電話'].map(label => (
              <div key={label}>
                <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                <input className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary" placeholder={label} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">希望參與之模式</label>
              <select className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option>戲劇模式</option><option>傳承模式</option><option>兩者皆可</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">自我介紹</label>
              <textarea rows={4} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none" placeholder="請簡介您的創作經驗及動機⋯" />
            </div>
          </div>
          <button className="mt-4 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">提交申請</button>
        </div>
        <div className="bg-bg-soft border border-line rounded-xl p-5 italic text-muted text-sm">
          「我起初不知道如何運用人工智能製作影像，但 CoFilmery 的系統令我在兩周內完成了第一套短劇。看到長者觀眾的回饋，感覺非常有意義。」<br />
          <span className="text-primary font-medium not-italic">— 李美華 · 二十四歲 · 認證創作者</span>
        </div>
      </div>
    </div>
  );
}
