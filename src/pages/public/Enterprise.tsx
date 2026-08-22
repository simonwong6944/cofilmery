import { useState } from 'react';
import { PublicNav } from '@/components/layout/PublicNav';
import { CheckCircle, ChevronDown, ChevronUp, Sparkles, Film, BookOpen, Users, ShoppingBag } from 'lucide-react';

const SPONSOR_MODES = [
  {
    id: 'creator',
    icon: Users,
    emoji: '🎓',
    title: '贊助創作者群組',
    badge: '人才培育',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    borderColor: 'border-blue-400',
    accentColor: 'text-blue-600',
    bgActive: 'bg-blue-50',
    desc: '以企業名義贊助一批年輕創作者，資助其製作積分及培訓費用，支持本地年輕創意人才的成長。',
    details: [
      '企業名義冠名支持，創作者作品標注「由 [企業] 支持」',
      '資助年輕創作者的 AI 製作積分及技術培訓',
      '企業獲得 ESG 年報認可的貢獻記錄',
      '受贊助創作者作品於企業社交媒體渠道推廣',
    ],
    esgNote: '計入人才培育 ESG 指標',
  },
  {
    id: 'legacy-corp',
    icon: BookOpen,
    emoji: '🏛️',
    title: '企業傳承製作',
    badge: '企業記憶',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    borderColor: 'border-primary',
    accentColor: 'text-primary',
    bgActive: 'bg-primary/5',
    desc: '為企業創辦人、高管或長期服務員工製作傳承紀錄片，將企業精神、創業故事與員工付出永久留存。',
    details: [
      '支援創辦人、高管至基層長期服務員工，不論職位高低',
      '結構化訪談 + AI 整理故事線，每集三至十分鐘',
      '可製作單人專題集或多人多集系列',
      '作品於 CoFilmery 平台及企業內部渠道同步發佈',
    ],
    esgNote: '計入社會責任及文化保育 ESG 指標',
  },
  {
    id: 'legacy-social',
    icon: Film,
    emoji: '🌍',
    title: '社區傳承贊助',
    badge: 'ESG 社會責任',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    borderColor: 'border-green-500',
    accentColor: 'text-green-600',
    bgActive: 'bg-green-50',
    desc: '由企業贊助，為基層長者、義工、老師、環保人士等默默付出的社會人士記錄人生故事，彰顯企業對社區的承諾。',
    details: [
      '為社區長者、義工、教育工作者製作個人傳承短片',
      '以企業名義向社會呈現，強化品牌正面形象',
      '作品公開發佈於 CoFilmery 作品集，觸達廣泛觀眾',
      '附企業 ESG 貢獻報告，符合上市公司披露要求',
    ],
    esgNote: '計入社區投資及文化保育 ESG 指標',
  },
  {
    id: 'brand',
    icon: ShoppingBag,
    emoji: '🏷️',
    title: '品牌推廣贊助',
    badge: '品牌 × ESG',
    badgeColor: 'bg-accent/10 text-accent border-accent/20',
    borderColor: 'border-accent',
    accentColor: 'text-accent',
    bgActive: 'bg-accent/5',
    desc: '品牌透過贊助，將旗下產品或服務以自然方式融入 CoFilmery 短片故事中，實現品牌曝光的同時，亦成為 ESG 贊助計劃的一部分。',
    details: [
      '品牌產品或服務收入 AI 品牌素材庫（Brand Asset Library）',
      '創作者可在製作時選用品牌素材，自然融入場景、道具或對白',
      '每次曝光均記錄為贊助積分，品牌可追蹤各集的出現次數與觀看數',
      '符合 ESG 社區投資披露，品牌積分可轉換為慈善捐款記錄',
      '支援汽車、餐飲、日用消費品、服務業等多種品牌類別',
    ],
    esgNote: '計入社區投資及品牌社會責任 ESG 指標',
    isNew: true,
  },
];

const ESG_BENEFITS = [
  { icon: '📊', title: 'ESG 報告支援', desc: '提供符合 GRI / HKEX ESG 框架的貢獻數據報告，直接用於年度披露' },
  { icon: '👁️', title: '品牌曝光追蹤', desc: '詳細記錄每集的品牌出現時間、觀看人數及觀眾年齡分佈' },
  { icon: '🤝', title: '跨代觸達', desc: '短片觸達長者及關心長者文化的中生代，覆蓋獨特的消費群體' },
  { icon: '🌱', title: '可量化社會影響', desc: '每個贊助項目均有可追蹤的社會影響指標，包括故事保存數量及觀看時數' },
];

export default function Enterprise() {
  const [activeMode, setActiveMode] = useState<string | null>('brand');

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <p className="text-accent font-semibold mb-2 text-sm tracking-wide">ESG 合作 · 企業客戶</p>
        <h1 className="text-4xl font-bold text-ink mb-4 leading-tight">
          透過 CoFilmery 實踐<br />
          <span className="text-primary">企業 ESG 使命與品牌社會責任</span>
        </h1>
        <p className="text-lg text-muted mb-12 max-w-2xl">
          四種贊助模式，涵蓋人才培育、文化傳承、社區投資與品牌融合，每一個合作都是一個可量化、可披露的 ESG 貢獻。
        </p>

        {/* 4 Sponsor Mode Cards */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-primary mb-6">四種 ESG 贊助模式</h2>
          <div className="space-y-4">
            {SPONSOR_MODES.map(mode => {
              const isActive = activeMode === mode.id;
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                    isActive ? `${mode.borderColor} ${mode.bgActive}` : 'border-line bg-card hover:border-primary/30'
                  } shadow-card`}
                >
                  {/* Header — always visible */}
                  <button
                    onClick={() => setActiveMode(isActive ? null : mode.id)}
                    className="w-full text-left p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isActive ? 'bg-white/60' : 'bg-bg-soft'
                        }`}>
                          {mode.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-xl ${isActive ? mode.accentColor : 'text-ink'}`}>
                              {mode.title}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${mode.badgeColor}`}>
                              {mode.badge}
                            </span>
                            {mode.isNew && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-bold flex items-center gap-1">
                                <Sparkles size={10} /> 新
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted leading-relaxed">{mode.desc}</p>
                        </div>
                      </div>
                      <div className="ml-4 shrink-0">
                        {isActive
                          ? <ChevronUp size={20} className="text-muted" />
                          : <ChevronDown size={20} className="text-muted" />
                        }
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isActive && (
                    <div className="px-6 pb-6 border-t border-black/5 pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">合作內容包括</p>
                          <ul className="space-y-2">
                            {mode.details.map((d, i) => (
                              <li key={i} className="flex gap-2 text-sm text-ink">
                                <CheckCircle size={15} className={`${mode.accentColor} shrink-0 mt-0.5`} />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-3">
                          {/* ESG note */}
                          <div className={`rounded-xl p-4 border ${mode.badgeColor}`}>
                            <p className="text-xs font-semibold mb-1">ESG 分類</p>
                            <p className="text-sm font-medium">{mode.esgNote}</p>
                          </div>
                          {/* Brand Asset Library highlight for brand mode */}
                          {mode.id === 'brand' && (
                            <div className="bg-accent/8 border border-accent/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag size={14} className="text-accent" />
                                <p className="text-xs font-semibold text-accent">品牌素材庫運作方式</p>
                              </div>
                              <p className="text-xs text-muted leading-relaxed">
                                品牌提交產品圖片與資料後，CoFilmery 團隊將其整理至「品牌 Asset Library」。創作者在製作短片時，可從庫中選取素材自然融入劇情——例如車款出現在場景中、餐廳作為故事地點、或產品成為道具——每次使用均計為品牌贊助曝光，並記錄於 ESG 報告。
                              </p>
                            </div>
                          )}
                          <button className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors text-sm">
                            查詢此合作模式
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ESG Benefits */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-primary mb-6">為何選擇 CoFilmery ESG 合作</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ESG_BENEFITS.map(b => (
              <div key={b.title} className="bg-card border border-line rounded-xl p-5 shadow-card flex gap-4">
                <span className="text-2xl shrink-0">{b.icon}</span>
                <div>
                  <h3 className="font-bold text-ink mb-1">{b.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-14">
          <p className="text-sm text-muted font-semibold mb-3">現有合作夥伴</p>
          <div className="flex flex-wrap gap-3 items-center">
            {['太古地產', '香港中華煤氣', '匯豐銀行', '牛奶公司', '信和集團'].map(name => (
              <span key={name} className="px-4 py-2 bg-card border border-line rounded-lg text-sm text-ink font-medium shadow-card">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-line">
          <h2 className="text-xl font-bold text-primary mb-1">聯絡 ESG 合作團隊</h2>
          <p className="text-sm text-muted mb-6">我們的團隊將在兩個工作天內回覆，並為您安排詳細簡介。</p>
          <div className="grid md:grid-cols-2 gap-4">
            {['公司名稱', '聯絡人姓名', '電郵地址', '聯絡電話'].map(label => (
              <div key={label}>
                <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                <input
                  className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  placeholder={label}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">合作類型</label>
              <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option value="">請選擇合作模式</option>
                <option value="creator">贊助創作者群組</option>
                <option value="legacy-corp">企業傳承製作</option>
                <option value="legacy-social">社區傳承贊助</option>
                <option value="brand">品牌推廣贊助（Brand Asset Library）</option>
                <option value="multi">多模式組合</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">品牌/產品類別（如適用）</label>
              <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option value="">不適用</option>
                <option>汽車品牌</option>
                <option>餐飲品牌</option>
                <option>日用消費品</option>
                <option>金融服務</option>
                <option>零售品牌</option>
                <option>其他</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">需求描述</label>
              <textarea
                rows={3}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none"
                placeholder="請描述您的 ESG 合作需求、目標受眾或品牌融合想法⋯"
              />
            </div>
          </div>
          <button className="mt-5 bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors">
            提交查詢
          </button>
        </div>

      </div>
    </div>
  );
}
