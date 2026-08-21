import { useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Zap, Globe, Bell, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { CREDIT } from '@/credit-config';
import { cn } from '@/lib/utils';

interface SettingSection {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const SECTIONS: SettingSection[] = [
  { id: 'platform', label: '平台基本設定', icon: Globe, color: 'text-primary' },
  { id: 'credits', label: '點數系統設定', icon: Zap, color: 'text-accent' },
  { id: 'review', label: '審批流程設定', icon: Shield, color: 'text-green-600' },
  { id: 'notifications', label: '通知設定', icon: Bell, color: 'text-blue-600' },
  { id: 'data', label: '資料管理', icon: Database, color: 'text-purple-600' },
];

export default function SystemSettings() {
  const [expanded, setExpanded] = useState<string>('platform');
  const [saved, setSaved] = useState(false);

  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'CoFilmery',
    tagline: '用 AI，說粵語故事',
    defaultLocale: 'zh-HK',
    maxUploadMB: 500,
    supportEmail: 'support@cofilmery.com',
    maintenanceMode: false,
  });

  const [creditSettings, setCreditSettings] = useState({
    pointToHKD: CREDIT.pointToHKD,
    monthlyFreePoints: 1000,
    aiScriptCost: CREDIT.aiScript,
    aiVoiceCost: CREDIT.aiVoice,
    aiImageCost: CREDIT.aiImage,
    aiStoryboardCost: CREDIT.aiStoryboard,
    aiEditCost: CREDIT.aiEdit,
    reviewRewardPoints: 200,
    publishBonusPoints: 500,
  });

  const [reviewSettings, setReviewSettings] = useState({
    autoReviewEnabled: true,
    aiScoreThreshold: 7.5,
    humanReviewRequired: true,
    maxReviewHours: 48,
    autoApproveScore: 9.5,
    redlineAutoReject: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnApproval: true,
    emailOnRevision: true,
    emailOnReject: true,
    pushEnabled: true,
    weeklyDigest: true,
    adminAlertEmail: 'admin@cofilmery.com',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (id: string) => setExpanded(prev => prev === id ? '' : id);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">系統設定</h1>
          <button
            onClick={handleSave}
            className={cn('ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              saved ? 'bg-green-500 text-white' : 'btn-primary'
            )}
          >
            {saved ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? '已儲存！' : '儲存設定'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {SECTIONS.map(section => (
              <div key={section.id} className="card-base overflow-hidden">
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-soft transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <section.icon size={18} className={section.color} />
                    <span className="font-semibold text-ink">{section.label}</span>
                  </div>
                  {expanded === section.id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </button>

                {expanded === section.id && (
                  <div className="border-t border-line px-5 py-4">
                    {section.id === 'platform' && (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: '平台名稱', key: 'siteName', type: 'text' },
                          { label: '標語', key: 'tagline', type: 'text' },
                          { label: '預設語言', key: 'defaultLocale', type: 'select', options: ['zh-HK', 'zh-CN', 'en'] },
                          { label: '上傳限制 (MB)', key: 'maxUploadMB', type: 'number' },
                          { label: '支援電郵', key: 'supportEmail', type: 'email' },
                        ].map(field => (
                          <div key={field.key} className={field.key === 'supportEmail' ? 'col-span-2' : ''}>
                            <label className="text-xs text-muted mb-1 block">{field.label}</label>
                            {field.type === 'select' ? (
                              <select
                                value={(platformSettings as any)[field.key]}
                                onChange={e => setPlatformSettings(p => ({ ...p, [field.key]: e.target.value }))}
                                className="form-input w-full"
                              >
                                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                value={(platformSettings as any)[field.key]}
                                onChange={e => setPlatformSettings(p => ({ ...p, [field.key]: e.target.value }))}
                                className="form-input w-full"
                              />
                            )}
                          </div>
                        ))}
                        <div className="col-span-2 flex items-center justify-between p-3 bg-bg-soft rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-ink">維護模式</div>
                            <div className="text-xs text-muted">啟用後前台暫停服務，管理員仍可登入</div>
                          </div>
                          <button
                            onClick={() => setPlatformSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                            className={cn('w-11 h-6 rounded-full transition-colors relative',
                              platformSettings.maintenanceMode ? 'bg-red-500' : 'bg-line'
                            )}
                          >
                            <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                              platformSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'
                            )} />
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === 'credits' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                          ⚠️ 修改點數換算率將影響所有現有用戶的點數價值，請謹慎操作。
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: '1 點 = HK$', key: 'pointToHKD', step: '0.001' },
                            { label: '每月免費點數', key: 'monthlyFreePoints', step: '100' },
                            { label: 'AI 劇本生成 (點/次)', key: 'aiScriptCost', step: '10' },
                            { label: '粵語配音 (點/分鐘)', key: 'aiVoiceCost', step: '10' },
                            { label: 'AI 畫面生成 (點/張)', key: 'aiImageCost', step: '10' },
                            { label: 'AI 分鏡板 (點/場景)', key: 'aiStoryboardCost', step: '5' },
                            { label: 'AI 剪接 (點/分鐘)', key: 'aiEditCost', step: '10' },
                            { label: '作品審批獎勵點數', key: 'reviewRewardPoints', step: '50' },
                            { label: '作品上線獎勵點數', key: 'publishBonusPoints', step: '50' },
                          ].map(field => (
                            <div key={field.key}>
                              <label className="text-xs text-muted mb-1 block">{field.label}</label>
                              <input
                                type="number"
                                step={field.step}
                                value={(creditSettings as any)[field.key]}
                                onChange={e => setCreditSettings(p => ({ ...p, [field.key]: parseFloat(e.target.value) }))}
                                className="form-input w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.id === 'review' && (
                      <div className="space-y-4">
                        {[
                          { label: 'AI 預審啟用', key: 'autoReviewEnabled', type: 'toggle', desc: '所有提交先經 AI 五維評分' },
                          { label: '必須人工審批', key: 'humanReviewRequired', type: 'toggle', desc: 'AI 評分通過後仍需人工確認' },
                          { label: '紅線自動拒絕', key: 'redlineAutoReject', type: 'toggle', desc: '觸發嚴重紅線自動退回，無需人工' },
                        ].map(field => (
                          <div key={field.key} className="flex items-center justify-between p-3 bg-bg-soft rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-ink">{field.label}</div>
                              <div className="text-xs text-muted">{field.desc}</div>
                            </div>
                            <button
                              onClick={() => setReviewSettings(p => ({ ...p, [field.key]: !(p as any)[field.key] }))}
                              className={cn('w-11 h-6 rounded-full transition-colors relative',
                                (reviewSettings as any)[field.key] ? 'bg-primary' : 'bg-line'
                              )}
                            >
                              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                                (reviewSettings as any)[field.key] ? 'translate-x-5' : 'translate-x-0.5'
                              )} />
                            </button>
                          </div>
                        ))}
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: 'AI 通過分數線', key: 'aiScoreThreshold', step: '0.1' },
                            { label: '自動批准分數線', key: 'autoApproveScore', step: '0.1' },
                            { label: '最長審批小時', key: 'maxReviewHours', step: '1' },
                          ].map(field => (
                            <div key={field.key}>
                              <label className="text-xs text-muted mb-1 block">{field.label}</label>
                              <input type="number" step={field.step}
                                value={(reviewSettings as any)[field.key]}
                                onChange={e => setReviewSettings(p => ({ ...p, [field.key]: parseFloat(e.target.value) }))}
                                className="form-input w-full" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.id === 'notifications' && (
                      <div className="space-y-3">
                        {[
                          { label: '作品通過時發送電郵', key: 'emailOnApproval' },
                          { label: '退回修改時發送電郵', key: 'emailOnRevision' },
                          { label: '拒絕時發送電郵', key: 'emailOnReject' },
                          { label: '推送通知', key: 'pushEnabled' },
                          { label: '每週摘要通訊', key: 'weeklyDigest' },
                        ].map(field => (
                          <div key={field.key} className="flex items-center justify-between p-3 bg-bg-soft rounded-lg">
                            <span className="text-sm text-ink">{field.label}</span>
                            <button
                              onClick={() => setNotificationSettings(p => ({ ...p, [field.key]: !(p as any)[field.key] }))}
                              className={cn('w-11 h-6 rounded-full transition-colors relative',
                                (notificationSettings as any)[field.key] ? 'bg-primary' : 'bg-line'
                              )}
                            >
                              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                                (notificationSettings as any)[field.key] ? 'translate-x-5' : 'translate-x-0.5'
                              )} />
                            </button>
                          </div>
                        ))}
                        <div>
                          <label className="text-xs text-muted mb-1 block">管理員警告電郵</label>
                          <input type="email" value={notificationSettings.adminAlertEmail}
                            onChange={e => setNotificationSettings(p => ({ ...p, adminAlertEmail: e.target.value }))}
                            className="form-input w-full" />
                        </div>
                      </div>
                    )}

                    {section.id === 'data' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                          ⚠️ 以下操作不可逆轉，請在執行前確認備份已完成。
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: '匯出用戶資料', desc: '下載所有用戶 CSV', action: '匯出', safe: true },
                            { label: '匯出作品資料', desc: '下載所有作品元數據', action: '匯出', safe: true },
                            { label: '清除緩存', desc: '清除系統緩存，不影響資料', action: '清除', safe: true },
                            { label: '清除測試資料', desc: '刪除所有 mock/測試資料', action: '清除', safe: false },
                          ].map(item => (
                            <div key={item.label} className="p-4 border border-line rounded-lg">
                              <div className="text-sm font-medium text-ink mb-1">{item.label}</div>
                              <div className="text-xs text-muted mb-3">{item.desc}</div>
                              <button
                                onClick={() => alert(`${item.action}操作執行中…`)}
                                className={cn('text-xs px-3 py-1.5 rounded-lg font-medium',
                                  item.safe
                                    ? 'bg-bg-soft border border-line text-ink hover:bg-line'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                )}
                              >
                                {item.action}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
