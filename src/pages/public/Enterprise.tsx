import { PublicNav } from '@/components/layout/PublicNav';

export default function Enterprise() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-accent font-semibold mb-2">ESG 合作 · 企業客戶</p>
        <h1 className="text-4xl font-bold text-ink mb-10">透過 CoFilmery 實踐企業之 ESG 使命</h1>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: '贊助年輕創作者群組', price: '起價 HK$50,000', desc: '贊助一批年輕創作者，資助其製作點數及培訓，以企業名義支持新一代創作者。' },
            { title: '企業領袖傳承製作', price: '起價 HK$120,000', desc: '為企業創辦人或高管製作個人傳承紀錄片，留存企業精神與創業故事。' },
            { title: '贊助式傳承', price: '起價 HK$80,000', desc: '由企業贊助，為普通市民及基層長者記錄人生故事，彰顯企業社會責任。' },
          ].map(({ title, price, desc }) => (
            <div key={title} className="bg-card rounded-xl p-6 shadow-card border-t-4 border-accent">
              <h3 className="font-bold text-primary text-lg mb-1">{title}</h3>
              <p className="text-accent font-semibold text-sm mb-3">{price}</p>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <span className="text-sm text-muted font-medium">現有合作夥伴：</span>
          {['太古地產','香港中華煤氣','匯豐銀行','牛奶公司','信和集團'].map(name => (
            <span key={name} className="px-4 py-2 bg-card border border-line rounded-lg text-sm text-ink font-medium shadow-card">{name}</span>
          ))}
        </div>
        <div className="bg-card rounded-2xl p-8 shadow-card">
          <h2 className="text-xl font-bold text-primary mb-4">聯絡 ESG 團隊</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {['公司名稱', '聯絡人姓名', '電郵地址', '聯絡電話'].map(label => (
              <div key={label}>
                <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                <input className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary" placeholder={label} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">預算範圍</label>
              <select className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option>HK$50,000–100,000</option><option>HK$100,000–250,000</option><option>HK$250,000 以上</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">合作類型</label>
              <select className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                <option>贊助創作者群組</option><option>企業領袖傳承</option><option>贊助式傳承</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">需求描述</label>
              <textarea rows={3} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none" placeholder="請描述您的 ESG 合作需求⋯" />
            </div>
          </div>
          <button className="mt-4 bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">提交查詢</button>
        </div>
      </div>
    </div>
  );
}
