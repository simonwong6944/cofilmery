import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import { UserCircle2, Camera, Building2, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const ROLE_CARDS = [
  {
    role: 'elder' as UserRole,
    icon: UserCircle2,
    title: '長者觀眾',
    desc: '觀看粵語短劇 · 收藏人生故事',
    cta: '進入觀眾端',
    emoji: '👴',
    color: 'border-elder-accent',
    btnColor: 'bg-elder-accent hover:bg-elder-accent/90',
    demo: 'elder@demo.com',
  },
  {
    role: 'creator' as UserRole,
    icon: Camera,
    title: '年輕創作者',
    desc: '十八至三十歲 · 運用人工智能創作有意義的內容',
    cta: '立即報名或登入',
    emoji: '🎬',
    color: 'border-primary',
    btnColor: 'bg-primary hover:bg-primary/90',
    demo: 'creator@demo.com',
  },
  {
    role: 'sponsor' as UserRole,
    icon: Building2,
    title: '企業贊助方',
    desc: '贊助創作者 · 企業領袖傳承 · 贊助式傳承',
    cta: '聯絡 ESG 團隊',
    emoji: '🏢',
    color: 'border-accent',
    btnColor: 'bg-accent hover:bg-accent/90',
    demo: 'sponsor@demo.com',
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('creator');
  const [email, setEmail] = useState('creator@demo.com');
  const [password, setPassword] = useState('demo');
  const [showAdmin, setShowAdmin] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const card = ROLE_CARDS.find(c => c.role === role);
    if (card) setEmail(card.demo);
  };

  const handleLogin = async () => {
    await login(email, password, selectedRole);
    if (selectedRole === 'elder') navigate('/viewer');
    else if (selectedRole === 'creator') navigate('/creator');
    else if (selectedRole === 'sponsor') navigate('/sponsor');
    else navigate('/admin');
  };

  const handleAdminLogin = async () => {
    setEmail('admin@demo.com');
    await login('admin@demo.com', 'demo', 'admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-10">
        <Logo size="lg" withWordmark withTagline />
      </div>

      <h1 className="text-3xl font-bold text-ink mb-2 text-center">選擇您的身份開始</h1>
      <p className="text-muted text-sm mb-8 text-center bg-warn-bg border border-warn-line rounded-lg px-4 py-2">
        示範版：任何密碼均可登入
      </p>

      {/* Role Cards */}
      <div className="grid md:grid-cols-3 gap-5 w-full max-w-4xl mb-8">
        {ROLE_CARDS.map(({ role, icon: Icon, title, desc, cta, emoji, color, btnColor }) => {
          const active = selectedRole === role;
          return (
            <div
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`bg-card rounded-2xl p-6 border-2 cursor-pointer transition-all shadow-card ${active ? `${color} shadow-card-hover` : 'border-transparent hover:border-line'}`}
            >
              {/* Login form inside card */}
              <div className="mb-4">
                <div className="relative mb-3">
                  <Mail size={14} className="absolute left-3 top-3 text-muted" />
                  <input
                    type="email"
                    placeholder="電郵地址"
                    value={active ? email : ROLE_CARDS.find(c => c.role === role)?.demo ?? ''}
                    onChange={e => active && setEmail(e.target.value)}
                    onClick={e => { e.stopPropagation(); handleRoleSelect(role); }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-lg bg-bg-soft focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="relative mb-3">
                  <Lock size={14} className="absolute left-3 top-3 text-muted" />
                  <input
                    type="password"
                    placeholder="密碼"
                    value={active ? password : ''}
                    onChange={e => active && setPassword(e.target.value)}
                    onClick={e => { e.stopPropagation(); handleRoleSelect(role); }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-lg bg-bg-soft focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleRoleSelect(role); handleLogin(); }}
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-lg text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 ${btnColor}`}
                >
                  {isLoading && active ? <Loader2 size={14} className="animate-spin" /> : null}
                  登入
                </button>
                <p className="text-xs text-center text-muted mt-2">或用 Google 帳戶登入</p>
              </div>

              <div className="border-t border-line pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-ink text-base">{title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted mb-4">{desc}</p>
                <button
                  onClick={e => { e.stopPropagation(); handleRoleSelect(role); handleLogin(); }}
                  className={`w-full py-2.5 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${btnColor}`}
                >
                  {cta} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin login */}
      <div className="text-center">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-xs text-muted hover:text-ink transition-colors flex items-center gap-1 mx-auto"
        >
          <ShieldCheck size={12} /> 管理員登入
        </button>
        {showAdmin && (
          <button onClick={handleAdminLogin} className="mt-2 bg-ink text-white text-sm px-6 py-2 rounded-lg hover:bg-ink/90 transition-colors">
            以管理員身份登入（示範）
          </button>
        )}
      </div>

      <p className="text-sm text-muted mt-6">
        尚未註冊？
        <button className="text-primary hover:underline ml-1">立即加入 CoFilmery</button>
      </p>
    </div>
  );
}
