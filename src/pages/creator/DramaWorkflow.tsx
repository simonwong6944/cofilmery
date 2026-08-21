import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { Logo } from '@/components/shared/Logo';
import { MOCK_DRAMA_STORYBOARD, MOCK_VOICES } from '@/lib/mockData';
import { AlertTriangle, RefreshCw, Check, Mic, Save } from 'lucide-react';

function S0Initiate({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-primary mb-6">戲劇模式 · 立項</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">劇集名稱</label>
          <input className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary" defaultValue="街市情緣" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">目標觀眾</label>
          <div className="flex flex-wrap gap-2">
            {['五十五歲以上退休人士','家庭觀眾'].map(a => (
              <label key={a} className="flex items-center gap-2 bg-card border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-primary">
                <input type="checkbox" className="accent-primary" defaultChecked /> <span className="text-sm">{a}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">集數規劃（最多七十集）</label>
          <input type="range" min={1} max={70} defaultValue={30} className="w-full accent-primary" />
          <p className="text-sm text-muted mt-1">已選：三十集</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">每集時長</label>
          <div className="flex gap-3">
            {['十五秒','三十秒','四十五秒','六十秒'].map(l => (
              <label key={l} className="flex items-center gap-2 bg-card border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-primary">
                <input type="radio" name="duration" className="accent-primary" defaultChecked={l==='三十秒'} /> <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">素材來源</label>
          <div className="flex flex-wrap gap-2">
            {['訪問長者所得','問卷調查','社區觀察','企業客戶委託'].map(m => (
              <label key={m} className="flex items-center gap-2 bg-card border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-primary">
                <input type="checkbox" className="accent-primary" defaultChecked={m==='訪問長者所得'} /> <span className="text-sm">{m}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="bg-warn-bg border-l-4 border-warn-line rounded-r-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-ink">重要提示</p>
            <p className="text-sm text-muted mt-1">本模式以長者提供之真實生活素材為基礎，並非純虛構生成，請確保已取得受訪者之書面同意。</p>
          </div>
        </div>
        <button onClick={onNext} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          確認立項，進入取材
        </button>
      </div>
    </div>
  );
}

function S1Materials({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-primary mb-6">取材 · 上傳素材</h2>
      <div className="border-2 border-dashed border-line rounded-xl p-8 text-center mb-4">
        <p className="text-muted mb-2">拖放錄音、文字稿或相片至此處</p>
        <button className="bg-bg-soft border border-line px-4 py-2 rounded-lg text-sm text-ink hover:border-primary">選擇文件</button>
      </div>
      <div className="space-y-2 mb-6">
        {['陳伯訪談錄音 01.mp3','街市照片集.zip','訪談文字稿.docx'].map(f => (
          <div key={f} className="flex items-center gap-3 bg-card border border-line rounded-lg px-4 py-2.5">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">AI</div>
            <span className="text-sm text-ink flex-1">{f}</span>
            <span className="text-xs text-green-600">✓ 已上傳</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
        確認素材，生成劇本
      </button>
      <CreditIndicator cost={50} className="mt-3" />
    </div>
  );
}

function S2Script({ onNext }: { onNext: () => void }) {
  const scenes = [
    { num: 1, title: '街市清晨', dialogue: '陳先生：今日菜心非常新鮮，大家快來選購！\n街坊甲：是呀，陳先生的菜一向最靚。', rewrite: '可以改為：今日菜心非常新鮮，各位街坊請多多光顧！' },
    { num: 2, title: '舊友重逢', dialogue: '李先生：多年不見，陳先生您依然精神！\n陳先生：還好，每日來街市走走，身體自然好。', rewrite: null },
    { num: 3, title: '溫馨收檔', dialogue: '陳先生：又是收檔的時候了，感謝各位街坊今日的光顧。', rewrite: '可以改為：另一個黃昏到了，感謝各位街坊的支持，明日再見！' },
  ];
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-primary mb-6">劇本編輯</h2>
      <div className="space-y-4 mb-6">
        {scenes.map(scene => (
          <div key={scene.num} className="bg-card rounded-xl border border-line p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">第{scene.num}場</span>
              <h3 className="font-semibold text-ink">{scene.title}</h3>
            </div>
            <pre className="text-sm text-ink whitespace-pre-wrap font-sans mb-3">{scene.dialogue}</pre>
            {scene.rewrite && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <span className="text-amber-700 font-medium">AI 建議：</span>
                <span className="text-amber-800 underline decoration-dotted ml-1">{scene.rewrite}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={onNext} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
        確認劇本，生成分鏡
      </button>
      <CreditIndicator cost={30} className="mt-3" />
    </div>
  );
}

function S3Storyboard({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-primary mb-6">角色及分鏡</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 mb-6">
        {MOCK_DRAMA_STORYBOARD.map(panel => (
          <div key={panel.scene} className="shrink-0 w-48 bg-card rounded-xl overflow-hidden shadow-card border-2 border-white">
            <img src={panel.image} alt={panel.title} className="w-full h-28 object-cover" />
            <div className="p-3">
              <p className="text-xs text-muted">第{panel.scene}場 · {panel.duration}秒</p>
              <p className="text-sm font-medium text-ink mt-0.5">{panel.title}</p>
              <div className="flex gap-1 mt-2">
                <button className="text-xs text-accent hover:underline">✏ 編輯</button>
                <span className="text-muted">·</span>
                <button className="text-xs text-red-500 hover:underline">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
        確認分鏡，生成畫面
      </button>
      <CreditIndicator cost={200} className="mt-3" />
    </div>
  );
}

function S4Visuals({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-primary mb-6">畫面生成</h2>
      <div className="bg-card rounded-xl overflow-hidden shadow-card mb-4">
        <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=338&fit=crop" alt="預覽" className="w-full" />
      </div>
      <div className="flex gap-3 mb-4">
        {[1,2,3,4].map(i => (
          <img key={i} src={`https://images.unsplash.com/photo-${1578662996442 + i}?w=120&h=68&fit=crop`} alt={`變體${i}`} className="w-24 h-14 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-accent" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['夕陽光線','街市背景','三位角色','十五度鏡頭'].map(p => (
          <span key={p} className="bg-bg-soft border border-line px-3 py-1 rounded-full text-sm text-ink">{p}</span>
        ))}
      </div>
      <p className="text-sm text-green-600 mb-4">✓ 角色一致性達 92% · 適合五十五歲以上觀眾觀看清晰度</p>
      <div className="flex gap-3">
        <button onClick={onNext} className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2"><Check size={16}/> 接受此畫面</button>
        <button className="border border-line px-6 py-2.5 rounded-xl text-ink flex items-center gap-2"><RefreshCw size={16}/> 全部重生</button>
      </div>
    </div>
  );
}

function S5Subtitles({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-primary mb-6">字幕</h2>
      <div className="flex gap-3 mb-4">
        <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm">繁體中文</button>
        <button className="bg-bg-soft border border-line px-4 py-1.5 rounded-lg text-sm">粵語拼音</button>
      </div>
      <div className="bg-black rounded-xl p-6 mb-4">
        <p className="text-white text-2xl text-center font-medium">陳先生：今日菜心非常新鮮！</p>
      </div>
      <div className="space-y-3">
        {['陳先生：今日菜心非常新鮮！','街坊甲：是呀，陳先生的菜一向最靚。','陳先生：感謝各位街坊今日的光顧。'].map((line,i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-xs text-muted bg-bg-soft px-2 py-1 rounded">{String(i*5+1).padStart(2,'0')}:{String(i*5+1+2).padStart(2,'0')}</span>
            <input className="flex-1 border border-line rounded-lg px-3 py-2 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={line} />
          </div>
        ))}
      </div>
      <button onClick={onNext} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">確認字幕，進入配音</button>
    </div>
  );
}

function S6Voiceover({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-primary mb-6">配音</h2>
      <div className="space-y-3 mb-6">
        {MOCK_VOICES.map(v => (
          <div key={v.id} className="flex items-center gap-4 bg-card border border-line rounded-xl p-4 cursor-pointer hover:border-primary">
            <input type="radio" name="voice" className="accent-primary" defaultChecked={v.id==='v1'} />
            <div className="flex-1">
              <p className="font-medium text-sm text-ink">{v.label}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-accent border border-accent px-3 py-1 rounded-lg hover:bg-accent/5">
              <Mic size={12}/> 試聽
            </button>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
        <Mic size={16}/> 生成粵語配音
      </button>
      <CreditIndicator cost={80} className="mt-3" />
    </div>
  );
}

function S7Compile({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold text-primary mb-6">合成</h2>
      <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-video flex items-center justify-center">
        <p className="text-white text-lg">▶ 預覽播放</p>
      </div>
      <div className="space-y-2 mb-6">
        {[
          { label: '視覺軌道', color: 'bg-primary', width: '100%' },
          { label: '字幕軌道', color: 'bg-accent', width: '80%' },
          { label: '音樂軌道', color: 'bg-green-500', width: '100%' },
          { label: '配音軌道', color: 'bg-purple-500', width: '60%' },
        ].map(track => (
          <div key={track.label} className="flex items-center gap-3">
            <span className="text-xs text-muted w-20 text-right">{track.label}</span>
            <div className="flex-1 h-7 bg-line rounded overflow-hidden">
              <div className={`h-full ${track.color} opacity-70 rounded`} style={{width:track.width}} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors">確認合成，提交送審</button>
    </div>
  );
}

function S8Submit({ onNext }: { onNext: () => void }) {
  const dims = [
    {key:'safety',label:'內容安全',score:9},{key:'language',label:'語言表達',score:8},
    {key:'culture',label:'文化適切',score:9},{key:'ethics',label:'倫理規範',score:10},{key:'commercial',label:'商業合規',score:8},
  ];
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-primary mb-6">提交送審</h2>
      <div className="space-y-4 mb-6">
        {dims.map(d => (
          <div key={d.key} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-ink text-sm">{d.label}</span>
              <span className="text-accent font-bold">{d.score}/10</span>
            </div>
            <div className="h-2 bg-line rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{width:`${d.score*10}%`}} />
            </div>
            <input className="w-full mt-2 border border-line rounded px-2 py-1.5 text-xs bg-bg-soft focus:outline-none" placeholder={`${d.label}說明⋯`} />
          </div>
        ))}
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <p className="text-sm text-primary font-medium">AI 預估評分：整體約 8.8/10</p>
        <p className="text-xs text-muted mt-1">建議在商業合規方面加強說明，移除任何可能涉及商標的元素。</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onNext} className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold flex-1">提交送審</button>
        <button className="border border-line px-6 py-2.5 rounded-xl text-ink flex items-center gap-2"><Save size={16}/> 儲存草稿</button>
      </div>
    </div>
  );
}

function S9Publish() {
  return (
    <div className="max-w-2xl text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-2xl font-bold text-primary mb-3">作品已審批通過！</h2>
      <p className="text-muted mb-8">您的作品將發佈至 CoEldery 85 長者觀眾平台</p>
      <div className="grid grid-cols-2 gap-4 mb-8 text-left">
        {[
          { label: '發佈範圍', value: '公開發佈至 CoEldery 85' },
          { label: '發佈日期', value: '2026 年 8 月 21 日' },
          { label: '預計觸達', value: '約 12,500 位長者觀眾' },
          { label: '勞務分紅', value: '70% 觀看收益' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-xs text-muted mb-1">{label}</p>
            <p className="font-semibold text-ink text-sm">{value}</p>
          </div>
        ))}
      </div>
      <button className="bg-accent text-white px-10 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors">確認發佈</button>
    </div>
  );
}

const STEPS = [S0Initiate, S1Materials, S2Script, S3Storyboard, S4Visuals, S5Subtitles, S6Voiceover, S7Compile, S8Submit, S9Publish];

export default function DramaWorkflow() {
  const { step } = useParams();
  const navigate = useNavigate();
  const currentStep = Math.min(parseInt(step ?? '0', 10), 9);
  const StepComponent = STEPS[currentStep];

  const goNext = () => navigate(`/creator/drama/${Math.min(currentStep + 1, 9)}`);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold">戲劇模式</span>
          <span className="text-muted text-sm">· 街市情緣</span>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {/* Step nav */}
          <div className="w-48 shrink-0 bg-card border-r border-line overflow-y-auto">
            <StepNavigation mode="drama" currentStep={currentStep} onStepClick={s => navigate(`/creator/drama/${s}`)} />
          </div>
          {/* Canvas */}
          <main className="flex-1 overflow-y-auto p-8">
            <StepComponent onNext={goNext} />
          </main>
          {/* AI Assistant */}
          <aside className="w-72 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
