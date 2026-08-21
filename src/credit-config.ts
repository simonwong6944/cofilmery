/**
 * CoFilmery Credit Configuration
 * SINGLE SOURCE OF TRUTH — do not hardcode money strings in components.
 * All credit ↔ HKD math must use CREDIT.pointToHKD.
 */
export const CREDIT = {
  pointToHKD: 0.196,              // 1 point = HK$0.196
  productionBudgetHKD: 5000,      // production tier budget in HKD
  productionBudgetPoints: 5000,   // production tier budget in points
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
