import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mic, FileText, BookOpen, Play, Star, Upload, CheckCircle, Send, Globe, Award } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';

// ─────────── S0: 立項 ───────────
function S0Initiate({ onNext }: { onNext: () => void }) {
  const [form, setForm] = useState({
    title: '',
    elder: '',
    age: '',
    topic: '',
    subMode: 'individual',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S0 · 立項設定</h2>
      <p className="text-muted mb-6">為長者傳承計劃建立項目，記錄珍貴生命故事。</p>

      <div className="card-base p-6 space-y-5">
        <div>
          <label className="form-label">項目標題</label>
          <input className="form-input" placeholder="例：陳伯的街市歲月" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">受訪長者姓名</label>
            <input className="form-input" placeholder="例：陳伯" value={form.elder}
              onChange={e => setForm({ ...form, elder: e.target.value })} />
          </div>
          <div>
            <label className="form-label">長者年齡</label>
            <input className="form-input" type="number" placeholder="例：78" value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="form-label">主題方向</label>
          <select className="form-input" value={form.topic}
            onChange={e => setForm({ ...form, topic: e.target.value })}>
            <option value="">請選擇</option>
            <option value="craft">手藝與職業</option>
            <option value="memory">地方記憶</option>
            <option value="family">家族傳承</option>
            <option value="culture">文化習俗</option>
            <option value="history">歷史見證</option>
          </select>
        </div>
        <div>
          <label className="form-label">子模式</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'individual', label: '個人傳承', desc: '單一長者的生命故事' },
              { id: 'corporate', label: '企業領袖傳承', desc: '機構或企業歷史記錄' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setForm({ ...form, subMode: s.id })}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  form.subMode === s.id ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/50'
                }`}
              >
                <div className="font-semibold text-ink text-sm">{s.label}</div>
                <div className="text-muted text-xs mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={onNext}
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
          確認立項，進入採訪準備
        </button>
      </div>
    </div>
  );
}

// ─────────── S1: 採訪準備 ───────────
function S1Prepare({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S1 · 採訪準備</h2>
      <p className="text-muted mb-6">AI 生成個性化採訪問題，讓長者輕鬆分享故事。</p>

      <div className="card-base p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">AI 生成採訪問題</h3>
          <CreditIndicator cost={2} label="生成" />
        </div>
        <div className="space-y-3">
          {[
            '您在街市工作了多少年？是什麼緣故開始這份工作的？',
            '您最記得的街市景象是什麼？',
            '從前的街市和現在有什麼不同？',
            '在街市中，您認識了哪些難忘的街坊？',
            '如果要傳授一件事給年輕人，您會說什麼？',
          ].map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-bg-soft rounded-lg">
              <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-ink text-sm">{q}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex-1 border border-line text-muted px-4 py-2 rounded-lg text-sm hover:border-accent hover:text-accent transition-colors">
            重新生成
          </button>
          <button className="flex-1 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            下載問題清單
          </button>
        </div>
      </div>

      <div className="card-base p-6 mb-4">
        <h3 className="font-bold text-ink mb-3">拍攝建議</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />選擇安靜、光線充足的環境</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />拍攝前讓長者熟悉環境，放鬆心情</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />準備相關文物、老照片作輔助</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />錄音設備放置距長者 30cm 內</li>
        </ul>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        準備完成，前往素材上傳
      </button>
    </div>
  );
}

// ─────────── S2: 素材上傳 ───────────
function S2Materials({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S2 · 素材上傳</h2>
      <p className="text-muted mb-6">上傳訪問錄音、老照片及相關文物影像。</p>

      <div className="space-y-4 mb-6">
        {[
          { icon: Mic, label: '訪談錄音', accept: '音訊檔 MP3/WAV', color: 'text-blue-500' },
          { icon: Upload, label: '老照片及文物影像', accept: '圖片 JPG/PNG', color: 'text-amber-500' },
          { icon: FileText, label: '書面文件（可選）', accept: 'PDF/Word', color: 'text-green-500' },
        ].map((item, i) => (
          <div key={i} className="card-base p-5">
            <div className="flex items-center gap-3 mb-3">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="font-semibold text-ink">{item.label}</span>
              <span className="text-xs text-muted ml-auto">{item.accept}</span>
            </div>
            <div className="border-2 border-dashed border-line rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-muted mb-2" />
              <p className="text-sm text-muted">點擊上傳或拖放檔案</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        素材已上傳，開始 AI 謄錄
      </button>
    </div>
  );
}

// ─────────── S3: AI 謄錄 ───────────
function S3Transcript({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S3 · AI 謄錄</h2>
      <p className="text-muted mb-6">AI 將粵語訪談自動轉為文字稿，支援廣東話用語。</p>

      <div className="card-base p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">謄錄文字稿</h3>
          <CreditIndicator cost={5} label="謄錄" />
        </div>
        <div className="bg-bg-soft rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-ink leading-relaxed">
          <p className="mb-3"><strong>採訪者：</strong>陳伯，您在街市工作了多少年？</p>
          <p className="mb-3"><strong>陳伯：</strong>唉，我喺嗰個街市做咗差唔多四十年囉。當年係我老爸帶我入行嘅，嗰時我得十八歲，做豬肉佬學徒。</p>
          <p className="mb-3"><strong>採訪者：</strong>您最記得的街市景象是什麼？</p>
          <p className="mb-3"><strong>陳伯：</strong>最記得係朝早五點幾就要去入貨，嗰陣時街市好熱鬧，啲阿嬸爭住買靚豬肉，又係點評我哋，話我哋邊塊靚邊塊唔靚。</p>
          <p className="mb-3"><strong>採訪者：</strong>從前的街市和現在有什麼不同？</p>
          <p><strong>陳伯：</strong>舊時街市係個社區嘅心臟，啲街坊關係好親密。而家個街市雖然仲係喺度，但係感覺唔同啦，冇咁多人情味咯。</p>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 border border-line text-muted px-4 py-2 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors">
            <FileText className="w-4 h-4" />
            下載原稿
          </button>
          <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            進入編輯模式
          </button>
        </div>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        確認文字稿，進行剪輯
      </button>
    </div>
  );
}

// ─────────── S4: 剪輯成片 ───────────
function S4Edit({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S4 · 剪輯成片</h2>
      <p className="text-muted mb-6">AI 輔助剪輯，自動選取精彩片段，加入字幕及背景音樂。</p>

      <div className="card-base p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">AI 自動剪輯</h3>
          <CreditIndicator cost={8} label="剪輯" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['3分鐘精華版', '8分鐘完整版', '15分鐘加長版'].map((v, i) => (
            <button key={i}
              className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-colors ${
                i === 1 ? 'border-accent bg-accent/5 text-accent' : 'border-line text-muted hover:border-accent/50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['字幕樣式', '背景音樂', '片頭片尾', '老照片插入'].map((opt, i) => (
            <label key={i} className="flex items-center gap-3 p-3 border border-line rounded-lg cursor-pointer hover:border-accent transition-colors">
              <input type="checkbox" defaultChecked={i < 3} className="accent-accent" />
              <span className="text-sm text-ink">{opt}</span>
            </label>
          ))}
        </div>
        <button className="mt-4 w-full bg-accent text-white py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          開始 AI 剪輯
        </button>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        剪輯完成，加入章節標記
      </button>
    </div>
  );
}

// ─────────── S5: 章節標記 ───────────
function S5Chapters({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S5 · 章節標記</h2>
      <p className="text-muted mb-6">為長篇故事劃分章節，方便觀眾按需收看。</p>

      <div className="card-base p-6 mb-4">
        <h3 className="font-bold text-ink mb-4">章節列表</h3>
        <div className="space-y-3">
          {[
            { time: '00:00', title: '童年與入行' },
            { time: '02:15', title: '街市的黃金歲月' },
            { time: '05:30', title: '難忘的街坊情' },
            { time: '08:45', title: '時代變遷的感慨' },
            { time: '11:20', title: '給年輕人的話' },
          ].map((ch, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-bg-soft rounded-lg">
              <span className="text-xs text-muted font-mono w-12">{ch.time}</span>
              <input className="flex-1 border-none bg-transparent text-ink text-sm focus:outline-none" defaultValue={ch.title} />
              <button className="text-muted hover:text-red-400 text-xs">刪除</button>
            </div>
          ))}
        </div>
        <button className="mt-3 text-accent text-sm hover:underline">
          + 新增章節
        </button>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        章節完成，進入字幕校對
      </button>
    </div>
  );
}

// ─────────── S6: 字幕校對 ───────────
function S6Subtitles({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S6 · 字幕校對</h2>
      <p className="text-muted mb-6">校對粵語字幕，確保準確反映長者原話。</p>

      <div className="card-base p-6 mb-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {[
            { time: '0:02', text: '我喺嗰個街市做咗差唔多四十年囉。' },
            { time: '0:08', text: '當年係我老爸帶我入行嘅，嗰時我得十八歲。' },
            { time: '0:15', text: '做豬肉佬學徒，由頭學起。' },
            { time: '0:22', text: '最記得係朝早五點幾就要去入貨。' },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xs text-muted font-mono w-12 mt-1 flex-shrink-0">{s.time}</span>
              <textarea
                className="flex-1 border border-line rounded px-3 py-1.5 text-sm text-ink resize-none focus:ring-1 focus:ring-accent focus:border-accent"
                defaultValue={s.text}
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        字幕確認，進入配音
      </button>
    </div>
  );
}

// ─────────── S7: Cantonese 配音 ───────────
function S7Voiceover({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S7 · 旁白配音</h2>
      <p className="text-muted mb-6">AI Seedance 為影片加入粵語旁白，串連故事脈絡。</p>

      <div className="card-base p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">旁白腳本</h3>
          <CreditIndicator cost={6} label="配音" />
        </div>
        <textarea
          className="w-full border border-line rounded-lg px-4 py-3 text-sm text-ink resize-none focus:ring-1 focus:ring-accent"
          rows={5}
          defaultValue="在香港的街市裡，有一位叫陳伯的豬肉佬，用了四十年時光，見證了一個社區的變遷。他的故事，是無數香港人共同的記憶……"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {['溫暖女聲（普通話）', '懷舊男聲（粵語）'].map((v, i) => (
            <button key={i}
              className={`p-3 rounded-lg border-2 text-sm transition-colors ${
                i === 1 ? 'border-accent bg-accent/5 text-accent' : 'border-line text-muted hover:border-accent/50'
              }`}
            >
              <Mic className="w-4 h-4 mx-auto mb-1" />
              {v}
            </button>
          ))}
        </div>
        <button className="mt-3 w-full bg-accent text-white py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          <Play className="w-4 h-4 inline mr-2" />
          試聽旁白
        </button>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        配音完成，合成影片
      </button>
    </div>
  );
}

// ─────────── S8: 合成 ───────────
function S8Compile({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S8 · 合成輸出</h2>
      <p className="text-muted mb-6">最終合成，生成高清傳承影片。</p>

      <div className="card-base p-6 mb-4">
        <h3 className="font-bold text-ink mb-4">合成設定</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">輸出畫質</label>
            <select className="form-input">
              <option>1080p Full HD（推薦）</option>
              <option>720p HD</option>
              <option>4K（需更多積分）</option>
            </select>
          </div>
          <div>
            <label className="form-label">片頭風格</label>
            <div className="grid grid-cols-3 gap-2">
              {['傳統書法', '現代簡約', '懷舊菲林'].map((s, i) => (
                <button key={i}
                  className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                    i === 0 ? 'border-accent bg-accent/5 text-accent' : 'border-line text-muted hover:border-accent/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 p-4 bg-bg-soft rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">預計用時</span>
            <span className="text-ink font-medium">約 8 分鐘</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">積分消耗</span>
            <CreditIndicator cost={10} label="合成" />
          </div>
        </div>
        <button className="mt-4 w-full bg-accent text-white py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          開始合成
        </button>
      </div>

      <button onClick={onNext} className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
        合成完成，送交審核
      </button>
    </div>
  );
}

// ─────────── S9: 送審發佈 ───────────
function S9Publish({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-2">S9 · 送審及發佈</h2>
      <p className="text-muted mb-6">提交審核，通過後在平台發佈，讓更多人看見長者智慧。</p>

      <div className="card-base p-6 mb-4">
        <h3 className="font-bold text-ink mb-4">發佈設定</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">授權聲明</label>
            <div className="space-y-2">
              {['已獲長者本人同意發佈', '家屬同意書已簽署', '私隱資料已作適當處理'].map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="accent-accent w-4 h-4" />
                  <span className="text-sm text-ink">{item}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">發佈對象</label>
            <select className="form-input">
              <option>公開發佈（所有觀眾）</option>
              <option>登入用戶限定</option>
              <option>限家人查看（私密）</option>
            </select>
          </div>
          <div>
            <label className="form-label">相關標籤</label>
            <input className="form-input" placeholder="例：街市、香港情懷、手藝傳承" />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 border border-accent text-accent py-3 rounded-lg font-semibold hover:bg-accent/5 transition-colors">
            <Globe className="w-4 h-4" />
            預覽
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
            <Send className="w-4 h-4" />
            送交審核
          </button>
        </div>
      </div>

      <div className="card-base p-5 border-l-4 border-green-400">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-semibold text-ink text-sm">發佈後可獲得 ESG 積分</p>
            <p className="text-muted text-xs mt-0.5">每部傳承影片可為贊助機構提供 CSR 記錄證明</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────── Main Component ───────────
const STEPS = [S0Initiate, S1Prepare, S2Materials, S3Transcript, S4Edit, S5Chapters, S6Subtitles, S7Voiceover, S8Compile, S9Publish];

export default function LegacyWorkflow() {
  const { step } = useParams();
  const navigate = useNavigate();
  const currentStep = Math.min(parseInt(step ?? '0', 10), 9);
  const StepComponent = STEPS[currentStep];

  const goNext = () => navigate(`/creator/legacy/${Math.min(currentStep + 1, 9)}`);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-accent font-bold">傳承模式</span>
          <span className="text-muted text-sm">· 陳伯的街市歲月</span>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 shrink-0 bg-card border-r border-line overflow-y-auto">
            <StepNavigation
              mode="legacy"
              currentStep={currentStep}
              onStepClick={s => navigate(`/creator/legacy/${s}`)}
            />
          </div>
          <main className="flex-1 overflow-y-auto p-8">
            <StepComponent onNext={goNext} />
          </main>
          <aside className="w-72 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
