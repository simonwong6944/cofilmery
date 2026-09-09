import { useState, useRef, useEffect } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import {
  AppearanceOptions, DEFAULT_APPEARANCE, BEARD_VALUES,
  buildAppearanceSummary, CHAR_ANGLE_ROLES, CharAngleRole, CHAR_ANGLE_LABELS,
} from '@/components/shared/appearanceConstants';
import { Layers } from 'lucide-react';
import {
  AlertTriangle, RefreshCw, Check, ChevronDown,
  Sparkles, Image, Upload,
  Plus, X,
  Users, Camera, Save,
} from 'lucide-react';

export function CharacterProfileCard({
  img, refs, name, role, age, bg, similarity, setSimilarity, mode,
  gender, onGenderChange,
  initialTraits, initialAppearance,
  onTraitsChange, onAppearanceChange,
  onNameChange, onRoleChange, onAgeChange, onBgChange,
  onImgChange, onRefsChange,
  onSaveChar,
  projectId,
  charId,
  userId,
}: {
  img: string; refs?: string[]; name: string; role: string; age: string; bg: string;
  similarity: string; setSimilarity: (v: string) => void;
  mode: 'drama' | 'legacy';
  gender?: 'male' | 'female' | 'other';
  onGenderChange?: (g: 'male' | 'female' | 'other' | undefined) => void;
  initialTraits?: string[];
  initialAppearance?: AppearanceOptions;
  onTraitsChange?: (t: string[]) => void;
  onAppearanceChange?: (a: AppearanceOptions) => void;
  onNameChange?: (v: string) => void;
  onRoleChange?: (v: string) => void;
  onAgeChange?: (v: string) => void;
  onBgChange?: (v: string) => void;
  onImgChange?: (url: string) => void;
  onRefsChange?: (urls: string[]) => void;
  onSaveChar?: () => void;
  projectId?: string;
  charId?: string;
  userId?: string;
}) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [traits, setTraits] = useState(initialTraits ?? ['開朗樂觀', '勤力', '重情義', '愛說故事', '傳統']);
  const [newTrait, setNewTrait] = useState('');
  const [addingTrait, setAddingTrait] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceOptions>(initialAppearance ?? DEFAULT_APPEARANCE);
  const [showAppearance, setShowAppearance] = useState(false);
  const [saveCharSaved, setSaveCharSaved] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<'img' | 'refs'>('img');
  const [showAvatarModal, setShowAvatarModal] = useState(false);   // Fix 2: avatar click modal
  const [s1Assets, setS1Assets] = useState<{ id: string; file_name: string; file_url: string; file_type: string }[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  // D3: AI image generation state
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [imageGenResult, setImageGenResult] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // S2 角色設定圖：多角度生成狀態
  type AngleStatus = 'idle' | 'loading' | 'done' | 'error';
  const [angleMedia, setAngleMedia] = useState<Record<string, string>>({}); // role → fileUrl
  const [angleStatus, setAngleStatus] = useState<Record<string, AngleStatus>>(
    () => Object.fromEntries(CHAR_ANGLE_ROLES.map(r => [r, 'idle' as AngleStatus]))
  );
  const [angleError, setAngleError] = useState<Record<string, string>>({});
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [loopProgress, setLoopProgress] = useState<{ current: number; total: number; roleName: string } | null>(null);
  // Similarity mode for character-angle API (independent from D3 image-gen similarity)
  const [angleSimMode, setAngleSimMode] = useState<'high' | 'mid' | 'low'>('mid');

  // Load existing asset_media rows on mount / charId change (persistence)
  useEffect(() => {
    if (!charId) return;
    fetch(`/api/asset-media?asset_id=${charId}`)
      .then(r => r.json())
      .then((data: { ok: boolean; media?: { role: string; file_url: string }[] }) => {
        if (data.ok && data.media) {
          const map: Record<string, string> = {};
          const statusMap: Record<string, AngleStatus> = Object.fromEntries(
            CHAR_ANGLE_ROLES.map(r => [r, 'idle' as AngleStatus])
          );
          data.media.forEach(m => {
            if ((CHAR_ANGLE_ROLES as readonly string[]).includes(m.role)) {
              map[m.role] = m.file_url;
              statusMap[m.role] = 'done';
            }
          });
          setAngleMedia(map);
          setAngleStatus(statusMap);
        }
      })
      .catch(() => { /* non-blocking */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charId]);

  // Call POST /api/ai/character-angle for one role
  const generateOneAngle = async (
    angleRole: CharAngleRole,
    appearanceSummary: string,
    referenceImageUrl?: string,
    sim?: 'high' | 'mid' | 'low'
  ): Promise<string> => {
    const t0 = Date.now();
    console.log('[generateOneAngle] START role=', angleRole, 'sim=', sim, 'hasRef=', !!referenceImageUrl, 'charId=', charId);
    const res = await fetch('/api/ai/character-angle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: charId ?? 'unknown',
        role: angleRole,
        referenceImageUrl,
        appearanceSummary,
        projectId: projectId ?? 'global',
        userId: userId ?? 'anonymous',
        similarity: sim ?? 'mid',
      }),
    });
    console.log('[generateOneAngle] HTTP role=', angleRole, 'status=', res.status, 'elapsed=', Date.now()-t0, 'ms');
    const data = await res.json() as { ok: boolean; fileUrl?: string; error?: string; mediaWriteFailed?: boolean; mediaWriteError?: string };
    console.log('[generateOneAngle] RESPONSE role=', angleRole, 'ok=', data.ok, 'fileUrl=', data.fileUrl?.slice(0,60), 'error=', data.error, 'total=', Date.now()-t0, 'ms');
    if (data.mediaWriteFailed) {
      console.warn('[generateOneAngle] mediaWriteFailed role=', angleRole, data.mediaWriteError);
    }
    if (!data.ok || !data.fileUrl) throw new Error(data.error ?? '生成失敗');
    return data.fileUrl;
  };

  // FIX A — 呼叫前先清掉三個舊角度（避免舊圖殘留），再用最新 frontUrl 串連重生
  // 串連生成 three-quarter → side → back（front 已由 image-gen 產生並設為頭像）
  // frontUrl: 一致性角色圖 URL，全部角度都用它做 reference
  const startRemainingAngles = async (frontUrl: string) => {
    console.log('[startRemainingAngles] called, frontUrl=', frontUrl, 'charId=', charId);
    if (!charId) { console.log('[startRemainingAngles] EARLY RETURN: charId is empty/undefined'); return; }
    const prompt = buildAppearanceSummary(appearance);
    console.log('[startRemainingAngles] prompt=', JSON.stringify(prompt), 'appearance=', JSON.stringify(appearance));
    if (!prompt) { console.log('[startRemainingAngles] EARLY RETURN: prompt is empty (appearance not filled)'); return; }

    // ① FIX A: 先清掉舊三角度 media 及狀態，防止舊圖殘留
    const REMAINING_ROLES: CharAngleRole[] = ['three-quarter', 'side', 'back'];
    setAngleMedia(prev => {
      const next = { ...prev };
      REMAINING_ROLES.forEach(r => { delete next[r]; });
      return next;
    });
    setAngleStatus(prev => {
      const next = { ...prev };
      REMAINING_ROLES.forEach(r => { next[r] = 'idle'; });
      return next;
    });
    setAngleError(prev => {
      const next = { ...prev };
      REMAINING_ROLES.forEach(r => { next[r] = ''; });
      return next;
    });

    setIsLoopRunning(true);
    setLoopProgress(null);

    for (let i = 0; i < REMAINING_ROLES.length; i++) {
      const r = REMAINING_ROLES[i];
      setLoopProgress({ current: i + 1, total: 3, roleName: CHAR_ANGLE_LABELS[r] });
      setAngleStatus(prev => ({ ...prev, [r]: 'loading' }));
      setAngleError(prev => ({ ...prev, [r]: '' }));
      try {
        // 全部角度用最新 frontUrl 做 reference，用 high 盡量跟近 front
        const fileUrl = await generateOneAngle(r, prompt, frontUrl, 'high');
        console.log('[startRemainingAngles] got fileUrl for', r, '=', fileUrl?.slice(0,60), '→ setAngleMedia');
        setAngleMedia(prev => ({ ...prev, [r]: fileUrl }));
        setAngleStatus(prev => ({ ...prev, [r]: 'done' }));
        console.log('[startRemainingAngles] setAngleMedia+Status done for', r);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : '生成失敗';
        console.error('[startRemainingAngles] CATCH role=', r, 'error=', errMsg, e);
        setAngleStatus(prev => ({ ...prev, [r]: 'error' }));
        setAngleError(prev => ({ ...prev, [r]: errMsg }));
        // Don't abort — continue remaining angles
      }
    }
    setIsLoopRunning(false);
    setLoopProgress(null);
  };

  // 个別角度重試（用 front 做 reference）
  const retryAngle = async (r: CharAngleRole) => {
    const prompt = buildAppearanceSummary(appearance);
    if (!prompt || !charId) return;
    setAngleStatus(prev => ({ ...prev, [r]: 'loading' }));
    setAngleError(prev => ({ ...prev, [r]: '' }));
    try {
      // front retry: 用原相/refs; 其餘角度: 用 front output
      const refUrl = r === 'front'
        ? (img || (refs ?? [])[0] || undefined)
        : (angleMedia['front'] || undefined);
      const sim = r === 'front' ? 'mid' : 'high'; // STEP 1: front fixed mid, others fixed high
      const fileUrl = await generateOneAngle(r, prompt, refUrl, sim);
      setAngleMedia(prev => ({ ...prev, [r]: fileUrl }));
      setAngleStatus(prev => ({ ...prev, [r]: 'done' }));
      if (r === 'front') onImgChange?.(fileUrl);
    } catch (e) {
      setAngleStatus(prev => ({ ...prev, [r]: 'error' }));
      setAngleError(prev => ({ ...prev, [r]: e instanceof Error ? e.message : '生成失敗' }));
    }
  };

  // 補齊全部 idle non-front 角度（離開再入後使用）
  // 重用 retryAngle 邏輯：各角度用 front 做 reference，sim='high'
  const fillIdleAngles = async () => {
    const idleRoles = (['three-quarter', 'side', 'back'] as CharAngleRole[]).filter(
      r => (angleStatus[r] ?? 'idle') === 'idle'
    );
    for (const r of idleRoles) {
      await retryAngle(r);
    }
  };

  // 是否有任何 non-front 角度仍係 idle（front done 但尚未自動串）
  const hasIdleRemainingAngles =
    angleStatus['front'] === 'done' &&
    (['three-quarter', 'side', 'back'] as CharAngleRole[]).some(
      r => (angleStatus[r] ?? 'idle') === 'idle'
    );

  // Completeness gate: front + side + back required (three-quarter optional)
  const isAngleSetComplete =
    angleStatus['front'] === 'done' &&
    angleStatus['side'] === 'done' &&
    angleStatus['back'] === 'done';

  // Upload helper: POST to /api/upload
  const uploadFile = async (file: File, target: 'img' | 'refs') => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', projectId ?? 'global');
      fd.append('userId', 'anonymous');
      fd.append('category', 'character');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json() as { ok: boolean; fileUrl: string };
      if (!data.ok) throw new Error('upload failed');
      if (target === 'img') {
        onImgChange?.(data.fileUrl);
      } else {
        onRefsChange?.([...(refs ?? []), data.fileUrl]);
      }
    } catch (e) {
      console.error('S2 upload error:', e);
    } finally {
      setUploading(false);
    }
  };

  // Fetch all assets for picker (no category filter — show everything uploaded)
  const loadAssets = async () => {
    if (s1Assets.length > 0) return;
    setAssetsLoading(true);
    try {
      const res = await fetch(`/api/assets?project_id=${projectId ?? 'global'}&limit=200`);
      const data = await res.json() as { ok: boolean; assets: typeof s1Assets };
      if (data.ok) setS1Assets(data.assets);
    } catch { /* non-blocking */ }
    finally { setAssetsLoading(false); }
  };

  // Open asset picker for refs
  const openAssetPicker = async (target: 'img' | 'refs') => {
    setAssetPickerTarget(target);
    setShowAssetPicker(true);
    await loadAssets();
  };

  // Fix 2: open avatar picker modal
  const openAvatarModal = async () => {
    setShowAvatarModal(true);
    await loadAssets();
  };

  const removeTrait = (t: string) => {
    const next = traits.filter(x => x !== t);
    setTraits(next);
    onTraitsChange?.(next);
  };
  const addTrait = () => {
    const v = newTrait.trim();
    if (v && !traits.includes(v)) {
      const next = [...traits, v];
      setTraits(next);
      onTraitsChange?.(next);
    }
    setNewTrait(''); setAddingTrait(false);
  };
  const addPresetTrait = (p: string) => {
    const next = [...traits, p];
    setTraits(next);
    onTraitsChange?.(next);
  };

  const setApp = (k: keyof AppearanceOptions, v: string) => {
    const next = { ...appearance, [k]: appearance[k] === v ? '' : v };
    setAppearance(next);
    onAppearanceChange?.(next);
  };
  const setAppText = (k: keyof AppearanceOptions, v: string) => {
    const next = { ...appearance, [k]: v };
    setAppearance(next);
    onAppearanceChange?.(next);
  };

  const simColors = [
    { color: 'bg-green-500', border: 'border-green-500', bg: 'bg-green-50' },
    { color: 'bg-blue-500',  border: 'border-blue-500',  bg: 'bg-blue-50'  },
    { color: 'bg-purple-500',border: 'border-purple-500',bg: 'bg-purple-50'},
  ];
  const s2tr = tr.creator.drama.s2;
  const similarityLabels = [
    { id: s2tr.simVeryClose, label: s2tr.simVeryClose, desc: s2tr.simVeryCloseDesc, ...simColors[0] },
    { id: s2tr.simSeventyPct, label: s2tr.simSeventyPct, desc: s2tr.simSeventyPctDesc, ...simColors[1] },
    { id: s2tr.simSpirit, label: s2tr.simSpirit, desc: s2tr.simSpiritDesc, ...simColors[2] },
  ];

  // 性別聯動性格預設清單
  const PERSONALITY_PRESETS_BY_GENDER: Record<'male' | 'female' | 'other', string[]> = {
    male:   s2tr.personalityPresetsMale,
    female: s2tr.personalityPresetsFemale,
    other:  s2tr.personalityPresetsOther,
  };
  const TRAIT_PRESETS = gender
    ? PERSONALITY_PRESETS_BY_GENDER[gender]
    : tr.creator.drama.shared.traitPresets;

  // 性別聯動外型選項覆蓋清單
  // 分性別的類別：build / hairLength / face / facial / style（共 5 個）
  // 共用類別：height / skin / hair / hairColor / eyes / eyewear / posture（共 7 個）
  const appearanceOptsOverride = gender
    ? (s2tr.appearanceOptsOverride[gender] as Partial<Record<keyof AppearanceOptions, string[]>>)
    : null;

  // Appearance option rows — from locale so they rebuild on locale change
  // gender 有值時，5 個分性別 key 用 override opts；其餘 7 個保持共用
  const appearanceRowLabels = tr.creator.drama.s2.appearanceRows;
  const appearanceRowKeys: (keyof AppearanceOptions)[] = [
    'height','build','skin','hair','hairColor','hairLength',
    'face','eyes','eyewear','facial','posture','style',
  ];
  // FIX 2: female/other 嘅 facial row 移除鬚款選項，只保留面部特徵（酒窩/皺紋/睫毛等）
  // 令用戶唔會誤揀鬚款，且 summary 唔會帶鬚字眼
  const BEARD_OPTS = new Set(['\u7121鬚', '短鬚', '山羊鬚', '八字鬚', '滿臉鬚',
    'No Beard', 'Stubble', 'Goatee', 'Moustache', 'Full Beard',
    '无胡须', '短胡须', '山羊胡', '八字胡', '络煶胡']);

  const appearanceRows: { label: string; key: keyof AppearanceOptions; opts: string[] }[] = [
    // 原有 12 row（locale 驅動，gender override 適用）
    ...appearanceRowLabels.map((r, i) => {
      const key = appearanceRowKeys[i];
      const overriddenOpts = appearanceOptsOverride?.[key];
      let opts = overriddenOpts ?? r.opts;
      // female/other: strip beard options from facial row
      if (key === 'facial' && (gender === 'female' || gender === 'other')) {
        opts = opts.filter(o => !BEARD_OPTS.has(o));
      }
      return { label: r.label, key, opts };
    }),
    // STEP 2: 新增五個外貌細節 row（繁中 hardcode，gender-neutral，唔需要 locale / override）
    { label: '眼睛大小', key: 'eyeSize'   as keyof AppearanceOptions, opts: ['大眼', '細眼', '丹鳳眼', '圓眼'] },
    { label: '嘴型',     key: 'mouthSize' as keyof AppearanceOptions, opts: ['櫻桃小嘴', '厚唇', '薄唇', '標準'] },
    { label: '鼻型',     key: 'noseShape' as keyof AppearanceOptions, opts: ['挺鼻', '小巧', '鷹鉤鼻', '標準'] },
    { label: '眉型',     key: 'eyebrows'  as keyof AppearanceOptions, opts: ['濃眉', '細眉', '劍眉', '彎眉'] },
    { label: '臉部特徵', key: 'faceDetail' as keyof AppearanceOptions, opts: ['高顴骨', '尖下巴', '方下巴'] },
    // STEP 3: 離散元素型四個新 row（繁中 hardcode，gender-neutral，唔需要 locale / gender filter）
    { label: '年齡感',   key: 'ageLook'   as keyof AppearanceOptions, opts: ['少女', '青年', '中年', '老年'] },
    { label: '妝容',     key: 'makeup'    as keyof AppearanceOptions, opts: ['素顏', '淡妝', '濃妝', '紅唇', '煙燻妝'] },
    { label: '配件',     key: 'accessory' as keyof AppearanceOptions, opts: ['耳環', '頸鏈', '帽', '頭飾'] },
    { label: '面部標記', key: 'faceMark'  as keyof AppearanceOptions, opts: ['痣', '雀斑', '疤痕', '酒渦'] },
  ];

  const accentColor = mode === 'drama' ? 'primary' : 'accent';

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { uploadFile(f, 'img'); e.target.value = ''; } }}
      />
      <input
        ref={refInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          files.forEach(f => uploadFile(f, 'refs'));
          e.target.value = '';
        }}
      />

      {/* Fix 2: Avatar picker modal — shows on avatar click */}
      {showAvatarModal && (
        <div className="bg-card rounded-xl border border-primary/30 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink flex items-center gap-2">
              <Camera size={14} className="text-primary" /> 設定角色頭像
            </p>
            <button onClick={() => setShowAvatarModal(false)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>

          {/* Option A: Upload new */}
          <button
            onClick={() => { setShowAvatarModal(false); avatarInputRef.current?.click(); }}
            disabled={uploading}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-line hover:border-primary bg-bg-soft hover:bg-primary/5 transition-all text-left disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Upload size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">上傳新相片</p>
              <p className="text-xs text-muted">從裝置選擇圖片檔案</p>
            </div>
          </button>

          {/* Option B: Pick from uploaded assets */}
          <div>
            <p className="text-xs font-semibold text-muted mb-2">從已上傳素材揀選</p>
            {assetsLoading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw size={16} className="text-muted animate-spin" />
              </div>
            ) : s1Assets.filter(a => a.file_type.startsWith('image')).length === 0 ? (
              <p className="text-xs text-muted text-center py-4 border border-dashed border-line rounded-xl">
                尚無已上傳圖片，請先在 S1 上傳素材或使用「上傳新相片」。
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {s1Assets.filter(a => a.file_type.startsWith('image')).map(a => (
                  <button
                    key={a.id}
                    onClick={() => { onImgChange?.(a.file_url); setShowAvatarModal(false); }}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    title={a.file_name}
                  >
                    <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex gap-4 mb-4">
          {/* Fix 2: Avatar — entire area is clickable, opens avatar picker modal */}
          <div className="relative flex-shrink-0 group cursor-pointer" onClick={openAvatarModal}>
            {img ? (
              <img src={img} alt={name} className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={28} className="text-primary/30" />
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading
                ? <RefreshCw size={16} className="text-white animate-spin" />
                : <Camera size={16} className="text-white" />
              }
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm">
              <Camera size={9} />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charNameLabel : tr.creator.legacy.s2.nameLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={name}
                  onChange={e => onNameChange?.(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charRoleLabel : tr.creator.legacy.s2.roleLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={role}
                  onChange={e => onRoleChange?.(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{s2tr.charAgeLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={age}
                  onChange={e => onAgeChange?.(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charBgLabel : tr.creator.legacy.s2.bgLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={bg}
                  onChange={e => onBgChange?.(e.target.value)}
                />
              </div>
            </div>

            {/* 性別選擇 + 保存掣（同一行）*/}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex items-center gap-1.5 flex-1">
                <label className="text-xs text-muted whitespace-nowrap">{s2tr.genderLabel}：</label>
                <div className="flex gap-1">
                  {(['male', 'female', 'other'] as const).map(g => {
                    const label = g === 'male' ? s2tr.genderMale : g === 'female' ? s2tr.genderFemale : s2tr.genderOther;
                    const isSelected = gender === g;
                    return (
                      <button
                        key={g}
                        onClick={() => {
                          const newGender = isSelected ? undefined : g;
                          onGenderChange?.(newGender);
                          // FIX 2: 切換 gender 時，若新 gender 係 female/other，清空 beard 殘留
                          // male → female/other: 若 facial 係鬚款式，清空
                          // 任何 → undefined: 不清（保留用戶已揀的值）
                          if (newGender === 'female' || newGender === 'other') {
                            if (BEARD_VALUES.has(appearance.facial ?? '')) {
                              const clearedApp = { ...appearance, facial: '' };
                              setAppearance(clearedApp);
                              onAppearanceChange?.(clearedApp);
                            }
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'border-line text-muted hover:border-primary hover:text-primary bg-bg-soft'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* 保存角色掣 */}
              <button
                onClick={() => {
                  onSaveChar?.();
                  setSaveCharSaved(true);
                  setTimeout(() => setSaveCharSaved(false), 2000);
                }}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium flex-shrink-0 ${
                  saveCharSaved
                    ? 'bg-green-50 text-green-600 border-green-300'
                    : 'bg-bg-soft text-ink border-line hover:border-primary hover:text-primary'
                }`}
              >
                <Save size={11} />
                {saveCharSaved ? s2tr.saveCharDone : s2tr.saveCharBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Upload refs — 參考相 */}
        <div className="space-y-2">
          {/* 已上傳參考相預覽 */}
          {(refs ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(refs ?? []).map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-line group">
                  <img src={url} alt={`ref-${i}`} className="w-full h-full object-cover" />
                  {/* D2: hover overlay — 刪除 or 設為頭像 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                    <button
                      onClick={() => onImgChange?.(url)}
                      className="text-[9px] text-white bg-primary/80 rounded px-1.5 py-0.5 hover:bg-primary leading-tight"
                      title="設為頭像"
                    >
                      設為頭像
                    </button>
                    <button
                      onClick={() => onRefsChange?.((refs ?? []).filter((_, idx) => idx !== i))}
                      className="text-[9px] text-white bg-red-500/80 rounded px-1.5 py-0.5 hover:bg-red-600 leading-tight"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 上傳 / 從素材庫揀 */}
          <div className="flex gap-2">
            <button
              onClick={() => refInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 border border-dashed border-line rounded-lg p-3 text-center hover:border-primary transition-colors disabled:opacity-50"
            >
              <Upload size={14} className="mx-auto text-muted mb-1" />
              <p className="text-xs text-muted">{mode === 'drama' ? s2tr.uploadRef : tr.creator.legacy.s2.uploadRef}</p>
            </button>
            <button
              onClick={() => openAssetPicker('refs')}
              className="flex-shrink-0 border border-dashed border-line rounded-lg px-3 py-2 text-center hover:border-primary transition-colors"
              title="從已上傳素材揀選"
            >
              <Image size={14} className="mx-auto text-muted mb-1" />
              <p className="text-[10px] text-muted">素材庫</p>
            </button>
          </div>
        </div>
      </div>

      {/* S1 素材庫 Picker Modal */}
      {showAssetPicker && (
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">從已上傳素材揀選</p>
            <button onClick={() => setShowAssetPicker(false)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
          {s1Assets.length === 0 ? (
            <p className="text-xs text-muted text-center py-4">尚無已上傳素材，請先在 S1 上傳。</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {s1Assets.filter(a => a.file_type.startsWith('image')).map(a => (
                <div key={a.id} className="relative group">
                  <button
                    onClick={() => {
                      if (assetPickerTarget === 'img') {
                        onImgChange?.(a.file_url);
                      } else {
                        onRefsChange?.([...(refs ?? []), a.file_url]);
                      }
                      setShowAssetPicker(false);
                    }}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all w-full"
                  >
                    <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover" />
                  </button>
                  {/* D2: 從素材庫揀時，refs 模式額外顯示「設為頭像」 */}
                  {assetPickerTarget === 'refs' && (
                    <button
                      onClick={() => { onImgChange?.(a.file_url); setShowAssetPicker(false); }}
                      className="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] text-white bg-primary/80 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight"
                    >
                      設為頭像
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 性格特質 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-ink">{s2tr.traitsLabel}</label>
          <span className="text-xs text-muted">{mode === 'drama' ? s2tr.traitsSubtitle : tr.creator.legacy.s2.traitsSubtitle}</span>
        </div>

        {/* Active traits */}
        <div className="flex flex-wrap gap-2 mb-3">
          {traits.map(t => (
            <span
              key={t}
              className={`inline-flex items-center gap-1 bg-${accentColor}/10 text-${accentColor} text-xs px-3 py-1 rounded-full font-medium group`}
            >
              {t}
              <button onClick={() => removeTrait(t)} className="opacity-40 hover:opacity-100 transition-opacity ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          {!addingTrait && (
            <button
              onClick={() => setAddingTrait(true)}
              className="text-xs text-muted border border-dashed border-line px-3 py-1 rounded-full hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            >
              <Plus size={10} /> {s2tr.addTrait}
            </button>
          )}
        </div>

        {/* Add trait input */}
        {addingTrait && (
          <div className="flex gap-2 mb-3">
            <input
              autoFocus
              className="flex-1 border border-primary rounded-lg px-3 py-1.5 text-sm bg-bg-soft focus:outline-none"
              placeholder={s2tr.traitInputPlaceholder}
              value={newTrait}
              onChange={e => setNewTrait(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTrait(); if (e.key === 'Escape') setAddingTrait(false); }}
            />
            <button onClick={addTrait} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg">{s2tr.traitConfirm}</button>
            <button onClick={() => setAddingTrait(false)} className="text-muted text-xs px-2 py-1.5 rounded-lg hover:bg-bg-soft">{s2tr.traitCancel}</button>
          </div>
        )}

        {/* Preset suggestions */}
        <div>
          <p className="text-xs text-muted mb-1.5">{s2tr.quickAdd}</p>
          <div className="flex flex-wrap gap-1.5">
            {TRAIT_PRESETS.filter(p => !traits.includes(p)).map(p => (
              <button
                key={p}
                onClick={() => addPresetTrait(p)}
                className="text-[11px] text-muted border border-line px-2.5 py-0.5 rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 外型設定 */}
      <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
        <button
          onClick={() => setShowAppearance(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-bg-soft transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <span className="text-sm font-semibold text-ink">{s2tr.appearanceTitle}</span>
            <span className="text-xs text-muted">{s2tr.appearanceSubtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {Object.values(appearance).filter(Boolean).length > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                {s2tr.appearanceSet} {Object.values(appearance).filter(Boolean).length} 項
              </span>
            )}
            <ChevronDown size={16} className={`text-muted transition-transform ${showAppearance ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showAppearance && (
          <div className="px-5 pb-5 border-t border-line pt-4 space-y-4">
            {appearanceRows.map(row => (
              <div key={row.key}>
                <label className="text-xs font-semibold text-ink mb-1.5 block">{row.label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {row.opts.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setApp(row.key, opt)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        appearance[row.key] === opt
                          ? 'bg-primary text-white border-primary'
                          : 'border-line text-muted hover:border-primary hover:text-primary bg-bg-soft'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Free text supplement */}
            <div>
              <label className="text-xs font-semibold text-ink mb-1.5 block">{s2tr.supplement}</label>
              <textarea
                className="w-full border border-line rounded-lg px-3 py-2 text-xs bg-bg-soft focus:outline-none focus:border-primary resize-none"
                rows={2}
                placeholder={s2tr.supplementPlaceholder}
                value={appearance.extraNote}
                onChange={e => setAppText('extraNote', e.target.value)}
              />
            </div>

            {/* Preview summary */}
            {Object.entries(appearance).some(([k, v]) => k !== 'extraNote' && v) && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-primary font-semibold mb-1">{s2tr.appearancePreview}</p>
                <p className="text-xs text-ink leading-relaxed">{buildAppearanceSummary(appearance)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D3: AI 角色一致性圖像生成 → 生成 front → 設為頭像自動串連其餘三角度 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-primary" />
          <label className="text-sm font-semibold text-ink">AI 生成一致性角色圖</label>
        </div>
        <p className="text-xs text-muted mb-3">
          根據外貌設定生成一致性 front 圖；設為頭像後自動串連生成四分三面、側面、背面。
        </p>

        {/* ① 似度選項（已固定為 70%，隱藏 UI）*/}
        {/* STEP 1: similarity 三檔實測分唔開（50% 仍同樣面孔），固定 mid。UI 隱藏，data/state 保留供將來恢復。*/}

        {/* ② 頭像預覽 + 生成按鈕 */}
        <div className="flex gap-3 items-start mb-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-line flex-shrink-0 bg-primary/5 flex items-center justify-center">
            {img ? (
              <img src={img} alt="current avatar" className="w-full h-full object-cover" />
            ) : (
              <Users size={22} className="text-primary/30" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[11px] text-muted leading-snug">
              {buildAppearanceSummary(appearance) || '請先在「外型設定」填寫角色外貌特徵，再生成圖像。'}
            </p>
            <button
              onClick={async () => {
                const prompt = buildAppearanceSummary(appearance);
                if (!prompt) { setImageGenError('請先填寫角色外貌設定。'); return; }
                setImageGenLoading(true);
                setImageGenResult(null);
                setImageGenError(null);
                try {
                  // STEP 1: similarity 固定 70%（mid），唔再讀 angleSimMode
                  // Merge avatar (img) + refs[], deduplicate, cap at 3
                  const allRefs = [...new Set([img, ...(refs ?? [])].filter(Boolean))].slice(0, 3);
                  const body: Record<string, unknown> = {
                    appearanceSummary: prompt,
                    charName: name,
                    age,
                    role,
                    projectId: projectId ?? 'global',
                    similarity: '70%', // fixed mid
                  };
                  if (allRefs.length > 0) body.referenceImageUrls = allRefs;
                  console.log('[imageGen] calling /api/ai/image-gen (front only), body keys=', Object.keys(body));
                  const res = await fetch('/api/ai/image-gen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });
                  const data = await res.json() as { ok: boolean; fileUrl?: string; error?: string };
                  console.log('[imageGen] result ok=', data.ok, 'fileUrl=', data.fileUrl?.slice(0, 60));
                  if (!data.ok || !data.fileUrl) throw new Error(data.error ?? 'Generation failed');
                  setImageGenResult(data.fileUrl);
                } catch (e) {
                  setImageGenError(e instanceof Error ? e.message : '生成失敗，請稍後再試。');
                } finally {
                  setImageGenLoading(false);
                }
              }}
              disabled={imageGenLoading || isLoopRunning}
              className="flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {imageGenLoading
                ? <><RefreshCw size={12} className="animate-spin" /> 生成中…</>
                : <><Sparkles size={12} /> 生成一致性角色圖</>
              }
            </button>
          </div>
        </div>

        {/* Error */}
        {imageGenError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="flex-shrink-0" /> {imageGenError}
          </div>
        )}

        {/* ③ 生成結果：設為頭像觸發串連 */}
        {imageGenResult && (
          <div className="border border-primary/30 rounded-xl overflow-hidden bg-primary/3">
            <img
              src={imageGenResult}
              alt="AI generated character"
              className="w-full max-h-64 object-contain cursor-pointer"
              onClick={() => setLightboxUrl(imageGenResult)}
            />
            <div className="flex gap-2 p-2">
              <button
                onClick={async () => {
                  console.log('[setAsAvatar] clicked, imageGenResult=', imageGenResult);
                  if (!imageGenResult) return;
                  const frontUrl = imageGenResult;
                  // (a) 設為主頭像（更新 draft img in-memory）
                  onImgChange?.(frontUrl);
                  setImageGenResult(null);
                  // (b) 即時更新 front 格為 done
                  setAngleMedia(prev => ({ ...prev, front: frontUrl }));
                  setAngleStatus(prev => ({ ...prev, front: 'done' }));
                  // (c-i) 寫 asset_media(role='front')
                  if (charId) {
                    fetch('/api/asset-media', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        asset_id: charId,
                        file_url: frontUrl,
                        role: 'front',
                        sort_order: 0,
                      }),
                    }).catch(e => console.warn('[setAsAvatar] asset_media front write failed:', e));
                  }
                  // (c-ii) BUG 2 FIX: 同步更新 characters 表 img 欄 (PATCH 單一欄位)
                  // onImgChange 已更新 draft in-memory；PATCH 令 D1 img 欄即時正確，
                  // 確保登出後 loadCharactersFromD1 讀回正確縮圖。
                  if (charId) {
                    fetch('/api/characters', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: charId, img: frontUrl }),
                    }).catch(e => console.warn('[setAsAvatar] characters img PATCH failed:', e));
                  }
                  // (d) FIX A+B: startRemainingAngles 先清掉舊三角度再以 frontUrl 串連重生
                  await startRemainingAngles(frontUrl);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-xs py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Check size={12} /> 設為頭像並生成其餘角度
              </button>
              <button
                onClick={() => { onRefsChange?.([...(refs ?? []), imageGenResult]); setImageGenResult(null); }}
                className="flex items-center justify-center gap-1.5 bg-bg-soft border border-line text-ink text-xs py-2 px-3 rounded-lg hover:border-primary transition-colors"
              >
                <Image size={12} /> 加入參考相
              </button>
              <button
                onClick={() => setImageGenResult(null)}
                className="px-2 text-muted hover:text-red-500 transition-colors"
                title="棄用"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

      {/* ── 角色設定圖（多角度）── */}
      {charId && (
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          {/* Header — no main generate button; triggered by 設為頭像 in section above */}
          <div className="flex items-center gap-2 mb-1">
            <Layers size={15} className="text-primary" />
            <span className="text-sm font-semibold text-ink">角色設定圖</span>
            {isAngleSetComplete && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Check size={9} /> 完整
              </span>
            )}
          </div>
          <p className="text-xs text-muted mb-3">
            設為頭像後自動生成四分三面、側面、背面；可個別重試失敗格。
          </p>

          {/* ── NO-FRONT BLOCK: show when front not yet set ── */}
          {angleStatus['front'] !== 'done' ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-line bg-bg-soft text-center">
              <Users size={28} className="text-muted/30" />
              <p className="text-xs text-muted leading-snug max-w-[220px]">
                請先在上方「一致性角色圖」生成正面圖，<br />
                然後點「設為頭像並生成其餘角度」。
              </p>
            </div>
          ) : (
            <>
              {/* ── 補齊橫額：front done 但有 idle 角度時顯示（離開再入後用）── */}
              {hasIdleRemainingAngles && !isLoopRunning && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-600" />
                    <span className="text-[11px] text-amber-800 font-medium">部分角度尚未生成</span>
                  </div>
                  <button
                    onClick={fillIdleAngles}
                    disabled={isLoopRunning || !buildAppearanceSummary(appearance)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={10} /> 補齊其餘角度
                  </button>
                </div>
              )}

              {/* Progress bar — total reflects 3 remaining angles (three-quarter/side/back) */}
              {loopProgress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                    <span>生成中 {loopProgress.current}/{loopProgress.total}：{loopProgress.roleName}…</span>
                    <span>{Math.round((loopProgress.current - 1) / loopProgress.total * 100)}%</span>
                  </div>
                  <div className="w-full bg-bg-soft rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((loopProgress.current - 1) / loopProgress.total * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 2×2 angle grid */}
              <div className="grid grid-cols-2 gap-3">
                {CHAR_ANGLE_ROLES.map(r => {
                  const status = angleStatus[r] ?? 'idle';
                  const mediaUrl = angleMedia[r];
                  const errMsg = angleError[r];
                  const isFront = r === 'front';
                  return (
                    <div
                      key={r}
                      className={`rounded-xl border overflow-hidden flex flex-col ${
                        status === 'error' ? 'border-red-300 bg-red-50'
                        : status === 'done' ? 'border-primary/30 bg-primary/3'
                        : 'border-line bg-bg-soft'
                      }`}
                    >
                      {/* Image or placeholder */}
                      <div className="w-full aspect-[3/4] flex items-center justify-center bg-bg-soft relative overflow-hidden">
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt={CHAR_ANGLE_LABELS[r]}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxUrl(mediaUrl)}
                          />
                        ) : status === 'loading' ? (
                          <RefreshCw size={24} className="text-primary/40 animate-spin" />
                        ) : (
                          <Users size={24} className="text-muted/30" />
                        )}
                        {/* Loading overlay on top of existing image (re-gen) */}
                        {status === 'loading' && mediaUrl && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <RefreshCw size={20} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      {/* Label + status + action row */}
                      <div className="px-2 py-1.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[11px] font-semibold text-ink truncate">{CHAR_ANGLE_LABELS[r]}</span>
                          {isFront && (
                            <span className="text-[9px] text-muted/70 flex-shrink-0">(主頭像)</span>
                          )}
                        </div>
                        {status === 'done' && <Check size={11} className="text-green-500 flex-shrink-0" />}
                        {/* idle non-front: show individual generate button */}
                        {status === 'idle' && !isFront && (
                          <button
                            onClick={() => retryAngle(r)}
                            disabled={isLoopRunning || !buildAppearanceSummary(appearance)}
                            className="text-[10px] flex items-center gap-0.5 text-primary hover:text-primary/80 font-medium flex-shrink-0 disabled:opacity-40"
                          >
                            <Sparkles size={10} /> 生成
                          </button>
                        )}
                        {/* error non-front: retry button */}
                        {status === 'error' && !isFront && (
                          <button
                            onClick={() => retryAngle(r)}
                            disabled={isLoopRunning}
                            className="text-[10px] flex items-center gap-0.5 text-red-600 hover:text-red-800 font-medium flex-shrink-0 disabled:opacity-40"
                            title={errMsg}
                          >
                            <RefreshCw size={10} /> 重試
                          </button>
                        )}
                        {/* front angle: no action button — set via 一致性角色圖 section */}
                      </div>
                      {status === 'error' && errMsg && (
                        <p className="px-2 pb-1.5 text-[10px] text-red-500 leading-tight line-clamp-2">{errMsg}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
