import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_LEGACY_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { User, FileCheck, Video, Cpu, ArrowRight, Eye } from 'lucide-react';

export default function LegacyMode() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-3"><ModeBadge mode="legacy" /></div>
        <h1 className="text-5xl font-bold text-ink mb-4 leading-tight">
          運用人工智能技術記錄真實人生<br />
          <span className="text-accent">為家人留下珍貴的人生紀錄</span>
        </h1>
        <p className="text-xl text-muted mb-12">每集三至十分鐘 · 可用於家庭珍藏、企業週年、社會贊助等多種情境</p>
        <div className="grid md:grid-cols-4 gap-5 mb-10">
          {[
            { icon: User,      step: '第一步', title: '立項選定對象', desc: '確定記錄對象，填寫基本資料及取得倫理審查授權' },
            { icon: FileCheck, step: '第二步', title: '邀請受訪者並取得授權', desc: '提供正式的知情同意書，保障受訪者的隱私及權益' },
            { icon: Video,     step: '第三步', title: '結構化訪談錄影', desc: '按系統生成的訪談問題，引導受訪者分享珍貴的人生故事' },
            { icon: Cpu,       step: '第四步', title: '人工智能整理故事線與剪輯', desc: 'AI 自動整理訪談內容，生成章節結構，完成剪輯合成' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-card rounded-xl p-5 shadow-card border-t-4 border-accent">
              <Icon size={24} className="text-accent mb-3" />
              <p className="text-xs text-muted mb-1">{step}</p>
              <h3 className="font-bold text-ink mb-2">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {[
            { title: '企業領袖傳承', desc: '為企業創辦人或高管製作個人傳承紀錄片，留存企業精神與創業故事。起價 HK$120,000' },
            { title: '贊助式傳承', desc: '由企業贊助，為普通市民及基層長者記錄人生故事，彰顯企業 ESG 責任。起價 HK$80,000' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-accent/10 border border-accent rounded-xl p-5">
              <h3 className="font-bold text-accent mb-2">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-6">真實故事</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {MOCK_LEGACY_SERIES.map(s => (
            <Link key={s.id} to={`/works/${s.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
              <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                <p className="text-xs text-muted flex items-center gap-1"><Eye size={12} /> {s.views.toLocaleString()} 觀看 · {s.duration} 分鐘</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/creator/new" className="inline-flex items-center gap-2 bg-accent text-white font-bold px-10 py-4 rounded-xl hover:bg-accent/90 transition-colors text-lg">
            立即開始使用傳承模式 <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
