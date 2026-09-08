// Shared appearance constants — extracted from DramaWorkflow.tsx (pre-work for CharacterProfileCard split)

export type AppearanceOptions = {
  height: string; build: string; skin: string;
  hair: string; hairColor: string; hairLength: string;
  face: string; eyes: string; eyewear: string;
  facial: string; posture: string; style: string;
  extraNote: string; // 補充描述（自由填寫）
  // STEP 2: 新增五個外貌細節欄（全部 gender-neutral，default ''，空值唔輸出）
  eyeSize: string;   // 眼睛大小
  mouthSize: string; // 嘴型
  noseShape: string; // 鼻型
  eyebrows: string;  // 眉型
  faceDetail: string; // 臉部特徵（非鬚）
  // STEP 3: 離散元素型（gender-neutral，default ''，空值唔輸出）
  ageLook: string;   // 年齡感
  makeup: string;    // 妝容
  accessory: string; // 配件
  faceMark: string;  // 面部標記
};

export const DEFAULT_APPEARANCE: AppearanceOptions = {
  height: '', build: '', skin: '', hair: '', hairColor: '', hairLength: '',
  face: '', eyes: '', eyewear: '', facial: '', posture: '', style: '',
  extraNote: '',
  // STEP 2: 新增 field 全部 default ''（空值唔輸出，不像 facial 咁有特殊 token）
  eyeSize: '', mouthSize: '', noseShape: '', eyebrows: '', faceDetail: '',
  // STEP 3: 離散元素型（default ''，空值唔輸出，唔套用 facial 特殊 token）
  ageLook: '', makeup: '', accessory: '', faceMark: '',
};

// 鬚鬚選項中屬於劃鬚颩鬚的值（女角/other 總唔會產生，但万一有落地都加以拦截）
export const BEARD_VALUES = new Set(['\u77ed鬚', '山羊鬚', '八字鬚', '滿臉鬚', '短鬋鬋', '鬋鬋清清', 'Stubble', 'Goatee', 'Moustache', 'Full Beard']);

// 將 AppearanceOptions 轉成中文摘要字串供 AI prompt 導入
// facial 欄位特殊處理：
//   - 空値 or '無鬚' or '無鬚鬚' or 'No Beard' → 輸出 '無鬋鬋' （明確告知 AI 唔要鬚）
//   - 有鬚款式 → 照輸出
//   - 非鬚暴特徵（酒穩、皺紋等）→ 照輸出
export function buildAppearanceSummary(a: AppearanceOptions): string {
  // Resolve facial field: always emit something so AI doesn't invent beard
  let facialToken = '';
  const f = a.facial?.trim() ?? '';
  if (!f || f === '無鬚' || f === '無鬚鬚' || f === 'No Beard' || f === '無鬋鬋') {
    facialToken = '無鬋鬋'; // explicitly tell AI: no beard
  } else {
    facialToken = f; // bearded style OR non-beard feature (dimples, wrinkles, etc.)
  }

  return [
    a.height, a.build,
    a.skin ? a.skin + '膚色' : '',
    a.hairLength && a.hairColor ? `${a.hairColor}${a.hairLength}${a.hair || ''}` : (a.hair || ''),
    a.face ? a.face + '臉型' : '',
    // STEP 2: 新增面部細節（空值唔輸出，唔加任何預設 token）
    a.eyeSize   || '',   // 眼睛大小：大眼/細眼/丹鳳眼/圓眼
    a.eyebrows  || '',   // 眉型：濃眉/細眉/劍眉/彎眉
    a.noseShape || '',   // 鼻型：挺鼻/小巧/鷹鉤鼻/標準
    a.mouthSize || '',   // 嘴型：櫻桃小嘴/厚唇/薄唇/標準
    a.faceDetail || '',  // 臉部特徵：高顴骨/尖下巴/方下巴
    // STEP 3: 離散元素型（空值唔輸出，無特殊 token）
    a.ageLook   || '',   // 年齡感：少女/青年/中年/老年
    a.makeup    || '',   // 妝容：素顏/淡妝/濃妝/紅唇/煙燻妝
    a.accessory || '',   // 配件：耳環/頸鏈/帽/頭飾
    a.faceMark  || '',   // 面部標記：痣/雀斑/疤痕/酒渦
    // ── 以下沿用原有邏輯 ──
    a.eyewear && a.eyewear !== '無眼鏡' ? a.eyewear : '',
    facialToken,
    a.eyes, a.posture, a.style,
    a.extraNote,
  ].filter(Boolean).join('，');
}

// ── Angle roles for character reference sheet generation ──
export const CHAR_ANGLE_ROLES = ['front', 'three-quarter', 'side', 'back'] as const;
export type CharAngleRole = typeof CHAR_ANGLE_ROLES[number];
export const CHAR_ANGLE_LABELS: Record<CharAngleRole, string> = {
  'front': '正面',
  'three-quarter': '四分三面',
  'side': '側面',
  'back': '背面',
};
