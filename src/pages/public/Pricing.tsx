import { PublicNav } from '@/components/layout/PublicNav';
import { Check, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    id: 'free', name: '免費體驗', price: 'HK$0', period: '/月',
    features: ['每月一千練習池點數', '人工智能教學模式', '社群支援'],
    highlighted: false, badge: null,
  },
  {
    id: 'indie', name: '獨立創作者', price: 'HK$298', period: '/月',
    features: ['五千製作點數', '完整人工智能功能', '優先審批通道', '勞務分紅 70%'],
    highlighted: true, badge: '最多創作者選擇',
  },
  {
    id: 'pro', name: '專業創作者', price: 'HK$998', period: '/月',
    features: ['兩萬製作點數', '進階人工智能模型', 'ESG 履歷認證', '勞務分紅 80%'],
    highlighted: false, badge: '企業推薦',
  },
  {
    id: 'enterprise', name: '企業方案', price: '自訂報價', period: '',
    features: ['無限製作點數', '品牌專屬服務', 'ESG 客製方案', '專屬客戶經理'],
    highlighted: false, badge: null,
  },
];

const FAQ = [
  { q: '點數會過期嗎？', a: '練習池每月重置；製作點數永久有效。' },
  { q: '生成失敗會扣點數嗎？', a: '不會，系統會自動退還。' },
  { q: '為何勞務分紅並非 100%？', a: '我們需要維持平台運作及人工審批成本。' },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-ink mb-3">點數制度 · 雙重設計</h1>
          <p className="text-muted text-lg">練習池免費使用 · 製作點數精打細算 · 創作有意義，付費有尊嚴</p>
        </div>

        <div className="grid md:grid-cols-4 gap-5 mb-16">
          {TIERS.map(tier => (
            <div key={tier.id} className={cn(
              'relative bg-card rounded-2xl p-6 shadow-card flex flex-col',
              tier.highlighted && 'ring-2 ring-accent shadow-card-hover'
            )}>
              {tier.badge && (
                <div className={cn(
                  'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white',
                  tier.highlighted ? 'bg-accent' : 'bg-primary'
                )}>
                  {tier.badge}
                </div>
              )}
              <h3 className="font-bold text-ink text-base mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-0.5 mb-4">
                <span className="text-3xl font-bold text-primary">{tier.price}</span>
                <span className="text-muted text-sm">{tier.period}</span>
              </div>
              <ul className="flex-1 space-y-2.5 mb-6">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink">
                    <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={cn(
                  'block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors',
                  tier.highlighted
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-bg-soft text-primary border border-line hover:bg-primary/5'
                )}
              >
                {tier.id === 'enterprise' ? '聯絡我們' : '立即開始'}
              </Link>
            </div>
          ))}
        </div>

        {/* Credit info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-12 flex items-center gap-4">
          <Zap size={24} className="text-accent shrink-0" />
          <div>
            <p className="font-semibold text-primary">點數換算說明</p>
            <p className="text-sm text-muted mt-1">
              製作點數換算：每點 = HK$0.196 · 點數可用於劇本生成、畫面生成、粵語配音等所有 AI 功能。
              練習池點數每月重置，不可換算現金。
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">常見問題</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-card rounded-xl p-5 shadow-card">
                <p className="font-semibold text-ink mb-2 text-sm">Q：{q}</p>
                <p className="text-muted text-sm">A：{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/login" className="inline-block bg-accent text-white font-bold text-lg px-10 py-4 rounded-xl hover:bg-accent/90 transition-colors">
            立即開始
          </Link>
        </div>
      </div>
    </div>
  );
}
