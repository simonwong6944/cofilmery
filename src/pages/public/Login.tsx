import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { useAuthStore } from '@/store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import type { UserRole } from '@/types';
import { UserCircle2, Camera, Building2, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { locale } = useLocaleStore();
  const tr = t();

  const ROLE_CARDS = [
    {
      role: 'elder' as UserRole,
      icon: UserCircle2,
      title: tr.login.card1Title,
      desc: tr.login.card1Desc,
      cta: tr.login.card1Cta,
      emoji: '👴',
      color: 'border-elder-accent',
      btnColor: 'bg-elder-accent hover:bg-elder-accent/90',
      demo: 'elder@demo.com',
    },
    {
      role: 'creator' as UserRole,
      icon: Camera,
      title: tr.login.card2Title,
      desc: tr.login.card2Desc,
      cta: tr.login.card2Cta,
      emoji: '🎬',
      color: 'border-primary',
      btnColor: 'bg-primary hover:bg-primary/90',
      demo: 'creator@demo.com',
    },
    {
      role: 'sponsor' as UserRole,
      icon: Building2,
      title: tr.login.card3Title,
      desc: tr.login.card3Desc,
      cta: tr.login.card3Cta,
      emoji: '🏢',
      color: 'border-accent',
      btnColor: 'bg-accent hover:bg-accent/90',
      demo: 'sponsor@demo.com',
    },
  ];

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

  // suppress unused warning — locale subscribed for re-render
  void locale;

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-10">
        <Logo size="lg" withWordmark withTagline />
      </div>

      <h1 className="text-3xl font-bold text-ink mb-2 text-center">{tr.login.title}</h1>
      <p className="text-muted text-sm mb-8 text-center bg-warn-bg border border-warn-line rounded-lg px-4 py-2">
        {tr.login.mockNotice}
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
                    placeholder={tr.login.emailLabel}
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
                    placeholder={tr.login.passwordLabel}
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
                  {tr.login.loginBtn}
                </button>
                <p className="text-xs text-center text-muted mt-2">{tr.login.googleLogin}</p>
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
          <ShieldCheck size={12} /> {tr.login.adminLogin}
        </button>
        {showAdmin && (
          <button onClick={handleAdminLogin} className="mt-2 bg-ink text-white text-sm px-6 py-2 rounded-lg hover:bg-ink/90 transition-colors">
            以管理員身份登入（示範）
          </button>
        )}
      </div>

      <p className="text-sm text-muted mt-6">
        {tr.login.noAccount}
        <button className="text-primary hover:underline ml-1">{tr.login.register}</button>
      </p>
    </div>
  );
}
