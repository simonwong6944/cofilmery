/**
 * CoFilmery Credit Configuration
 * SINGLE SOURCE OF TRUTH — do not hardcode money strings in components.
 * All credit ↔ HKD math must use CREDIT.pointToHKD.
 */
export const CREDIT = {
  pointToHKD: 0.196,              // 1 point = HK$0.196
  productionBudgetHKD: 5000,      // production tier budget in HKD
  productionBudgetPoints: 5000,   // production tier budget in points
  aiScript: 50,                   // points per AI script generation
  aiVoice: 10,                    // points per minute of TTS voiceover
  aiImage: 5,                     // points per AI image frame
  aiStoryboard: 20,               // points per AI storyboard scene
  aiEdit: 15,                     // points per minute of AI edit
  // ── Story Architect（文字階段，成本極低，鼓勵嘗試）──────────────────
  architectTopic: 2,              // 選題方向生成（練習池優先）
  architectOutline: 3,            // 全劇大綱生成（練習池優先）
  architectCharacters: 3,         // 角色卡生成（每次，練習池優先）
  architectEpisode: 2,            // 單集故事卡展開/重生成（練習池優先）
  architectAccept: 0,             // 手動編輯 / 接受 — 免費
  architectEdit: 0,               // 手動編輯 — 免費
} as const;

/** Convert points to HKD string, e.g. creditToHKD(2450) → "HK$480" */
export function creditToHKD(points: number): string {
  const amount = Math.round(points * CREDIT.pointToHKD);
  return `HK$${amount.toLocaleString()}`;
}

/** Convert HKD to points, e.g. hkdToCredit(196) → 1000 */
export function hkdToCredit(hkd: number): number {
  return Math.round(hkd / CREDIT.pointToHKD);
}

/** Pricing tiers (separate from conversion constant) */
export const PRICING_TIERS = [
  {
    id: 'free',
    nameKey: 'pricing.tier.free.name',
    priceHKD: 0,
    priceLabel: 'HK$0/月',
    practiceCredits: 1000,
    productionCredits: 0,
    revenueShare: 0,
    highlighted: false,
  },
  {
    id: 'indie',
    nameKey: 'pricing.tier.indie.name',
    priceHKD: 298,
    priceLabel: 'HK$298/月',
    practiceCredits: 0,
    productionCredits: 5000,
    revenueShare: 70,
    highlighted: true,
  },
  {
    id: 'pro',
    nameKey: 'pricing.tier.pro.name',
    priceHKD: 998,
    priceLabel: 'HK$998/月',
    practiceCredits: 0,
    productionCredits: 20000,
    revenueShare: 80,
    highlighted: false,
  },
  {
    id: 'enterprise',
    nameKey: 'pricing.tier.enterprise.name',
    priceHKD: null,
    priceLabel: '自訂報價',
    practiceCredits: -1, // unlimited
    productionCredits: -1,
    revenueShare: null,
    highlighted: false,
  },
] as const;
