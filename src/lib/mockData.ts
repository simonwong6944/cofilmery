/** CoFilmery Mock Data — ≥6 projects (3 Drama + 3 Legacy), used throughout the app */

export const MOCK_DRAMA_SERIES = [
  {
    id: 'drama-001',
    title: '街市情緣',
    mode: 'drama' as const,
    status: 'published' as const,
    episodes: 30,
    completedEpisodes: 18,
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
    creator: { id: 'c1', name: '李美華', age: 24, tier: 'certified' as const },
    views: 12500,
    esgScore: 8.5,
    description: '以大埔街市為背景，記錄一位七十年代老街坊的日常生活與人情故事。',
    tags: ['家庭', '街市', '懷舊', '粵語對白'],
    publishedAt: '2026-08-15',
    duration: 30,
  },
  {
    id: 'drama-002',
    title: '涼茶世家',
    mode: 'drama' as const,
    status: 'reviewing' as const,
    episodes: 50,
    completedEpisodes: 8,
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop',
    creator: { id: 'c2', name: '陳志明', age: 27, tier: 'senior' as const },
    views: 8200,
    esgScore: 9.2,
    description: '三代傳承的涼茶舖，見證香港半個世紀的變遷。',
    tags: ['傳承', '中醫', '家族', '香港故事'],
    publishedAt: '2026-07-20',
    duration: 45,
  },
  {
    id: 'drama-003',
    title: '獅子山下',
    mode: 'drama' as const,
    status: 'published' as const,
    episodes: 70,
    completedEpisodes: 70,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    creator: { id: 'c3', name: '王小龍', age: 22, tier: 'certified' as const },
    views: 32100,
    esgScore: 9.0,
    description: '以獅子山精神為主題，呈現六十年代草根港人奮鬥的故事。',
    tags: ['奮鬥', '懷舊', '香港精神', '六十年代'],
    publishedAt: '2026-06-01',
    duration: 60,
  },
];

export const MOCK_LEGACY_SERIES = [
  {
    id: 'legacy-001',
    title: '陳伯的街市歲月',
    mode: 'legacy' as const,
    status: 'published' as const,
    episodes: 1,
    completedEpisodes: 1,
    thumbnail: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&h=225&fit=crop',
    creator: { id: 'c1', name: '李美華', age: 24, tier: 'certified' as const },
    subject: { name: '陳先生', age: 82, relation: '受訪長者', location: '大埔原居民' },
    views: 4500,
    esgScore: 9.5,
    description: '八十二歲的陳先生分享在大埔街市工作五十年的人生回憶。',
    tags: ['長者故事', '街市文化', '大埔', '口述歷史'],
    publishedAt: '2026-08-10',
    duration: 8,
  },
  {
    id: 'legacy-002',
    title: '海邊老友記',
    mode: 'legacy' as const,
    status: 'draft' as const,
    episodes: 3,
    completedEpisodes: 1,
    thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=225&fit=crop',
    creator: { id: 'c4', name: '黃小明', age: 26, tier: 'trainee' as const },
    subject: { name: '李女士', age: 75, relation: '社區義工', location: '西貢' },
    views: 0,
    esgScore: 0,
    description: '七十五歲的李女士四十年來在西貢義教基層兒童的故事。',
    tags: ['義工', '教育', '西貢', '奉獻精神'],
    publishedAt: '',
    duration: 10,
  },
  {
    id: 'legacy-003',
    title: '中藥世家三代傳',
    mode: 'legacy' as const,
    status: 'reviewing' as const,
    episodes: 2,
    completedEpisodes: 2,
    thumbnail: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&h=225&fit=crop',
    creator: { id: 'c2', name: '陳志明', age: 27, tier: 'senior' as const },
    subject: { name: '陳師傅', age: 78, relation: '中藥傳承人', location: '上環' },
    views: 2100,
    esgScore: 8.8,
    description: '上環百年中藥舖的三代傳承故事，記錄瀕臨失傳的中醫藥知識。',
    tags: ['中醫藥', '傳承', '上環', '非物質文化遺產'],
    publishedAt: '2026-07-30',
    duration: 9,
  },
];

export const MOCK_ALL_SERIES = [...MOCK_DRAMA_SERIES, ...MOCK_LEGACY_SERIES];

export const MOCK_USERS = [
  { id: 'u1', name: '陳先生', role: 'elder' as const, age: 82, status: 'active' as const, monthlyViews: 45, lastActive: '今天 15:32', tier: '金會員' },
  { id: 'c1', name: '李美華', role: 'creator' as const, age: 24, status: 'active' as const, monthlyViews: 12500, lastActive: '三小時前', tier: 'certified', works: 3 },
  { id: 'c2', name: '陳志明', role: 'creator' as const, age: 27, status: 'active' as const, monthlyViews: 8200, lastActive: '今天 10:00', tier: 'senior', works: 5 },
  { id: 'c3', name: '王小龍', role: 'creator' as const, age: 22, status: 'active' as const, monthlyViews: 32100, lastActive: '一小時前', tier: 'certified', works: 2 },
  { id: 'c4', name: '黃小明', role: 'creator' as const, age: 26, status: 'active' as const, monthlyViews: 0, lastActive: '昨天', tier: 'trainee', works: 0 },
  { id: 's1', name: '張先生', role: 'sponsor' as const, age: 45, status: 'active' as const, monthlyViews: 32100, lastActive: '今天 10:00', tier: 'ESG 夥伴', works: 5 },
  { id: 'u2', name: '王大文', role: 'creator' as const, age: 30, status: 'suspended' as const, monthlyViews: 0, lastActive: '三十天前', tier: '-', reason: '違反社區指引' },
];

export const MOCK_CURRENT_CREATOR = {
  id: 'c1',
  name: '李美華',
  age: 24,
  email: 'limeiwah@cofilmery.com',
  tier: 'certified' as const,
  credits: 2450,
  practiceCredits: 800,
  esgScore: 240,
  esgScoreMax: 500,
  trainingHours: 12,
  stats: {
    inProgress: 8,
    monthlyRevenue: 45000,
    views: 12500,
  },
};

export const MOCK_ADMIN_STATS = {
  pendingReview: 47,
  activeCreators: 1247,
  monthlyViews: 285000,
  monthlyRevenue: 3250000,
  pendingEsg: 12,
};

export const MOCK_REVIEW_QUEUE = [
  { id: 'drama-002-ep5', title: '街市情緣 第五集', creator: '李美華', mode: 'drama', waitHours: 2, score: { safety: 8.5, language: 9.2, culture: 8.8, ethics: 9.5, commercial: 7.5 } },
  { id: 'legacy-002-ep2', title: '涼茶世家 第二集', creator: '陳志明', mode: 'legacy', waitHours: 5, score: { safety: 9.0, language: 8.5, culture: 9.0, ethics: 9.5, commercial: 8.5 } },
  { id: 'drama-003-ep12', title: '海邊老友記 第十二集', creator: '黃小明', mode: 'drama', waitHours: 5, score: { safety: 8.0, language: 7.5, culture: 8.5, ethics: 9.0, commercial: 8.0 } },
  { id: 'drama-001-ep8', title: '獅子山下 第八集', creator: '王小龍', mode: 'drama', waitHours: 5, score: { safety: 9.5, language: 9.0, culture: 9.5, ethics: 10, commercial: 9.0 } },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1', type: 'revision' as const,
    title: '街市情緣 第三集', reviewer: '王審批員',
    overallScore: 8.5,
    scores: { safety: 9, language: 8, culture: 10, ethics: 10, commercial: 6 },
    issue: '第三場景出現未經授權之品牌標誌，請予移除。',
    date: '八月二十日',
  },
  {
    id: 'n2', type: 'approved' as const,
    title: '獅子山下 第八集',
    date: '八月二十一日',
  },
  {
    id: 'n3', type: 'reviewing' as const,
    title: '涼茶世家 第二集',
    waitHours: 5,
    date: '八月二十一日',
  },
];

export const MOCK_CREDIT_TRANSACTIONS = [
  { id: 't1', type: 'debit', description: '人工智能劇本生成', amount: -50, date: '2026-08-21 14:30' },
  { id: 't2', type: 'debit', description: '粵語配音生成 三十秒', amount: -80, date: '2026-08-21 11:15' },
  { id: 't3', type: 'credit', description: '街市情緣 第三集 觀看分紅', amount: 280, date: '2026-08-20 09:00' },
  { id: 't4', type: 'debit', description: '畫面生成 四個場景', amount: -200, date: '2026-08-19 16:45' },
  { id: 't5', type: 'credit', description: '每月訂閱補充', amount: 5000, date: '2026-08-01 00:00' },
];

export const MOCK_DRAMA_STORYBOARD = [
  { scene: 1, title: '買菜爭執', duration: 15, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=112&fit=crop' },
  { scene: 2, title: '溫馨晚飯', duration: 30, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=112&fit=crop' },
  { scene: 3, title: '茶樓開話', duration: 45, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=112&fit=crop' },
  { scene: 4, title: '懷舊獨白', duration: 15, image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&h=112&fit=crop' },
  { scene: 5, title: '重修舊好', duration: 30, image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=200&h=112&fit=crop' },
  { scene: 6, title: '街景夕陽', duration: 30, image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=200&h=112&fit=crop' },
];

export const MOCK_AI_MESSAGES = [
  { role: 'user', content: '第三集對白用語過於現代化，長者觀眾較難理解' },
  { role: 'assistant', content: '我建議改用七十年代粵語口語，加入當時流行的慣用語⋯⋯', suggestions: ['建議一：重寫開場白', '建議二：加入經典台詞', '建議三：調整語速'] },
  { role: 'user', content: 'AI 幫我檢查劇本' },
  { role: 'assistant', content: '好的，劇本檢查完成，建議增加更多衝突點。ESG 貢獻分具體火候，視覺，建議增加更多衝突點。' },
];

export const MOCK_VOICES = [
  { id: 'v1', label: '粵語男聲 六十歲以上', preview: '/mock/audio/male-60.mp3' },
  { id: 'v2', label: '粵語男聲 四十至五十歲', preview: '/mock/audio/male-40.mp3' },
  { id: 'v3', label: '粵語女聲 三十至四十歲', preview: '/mock/audio/female-30.mp3' },
  { id: 'v4', label: '粵語女聲 六十歲以上', preview: '/mock/audio/female-60.mp3' },
];

export const MOCK_ESG_TIERS = [
  { id: 'trainee', label: '見習', emoji: '🌱', unlocked: true, current: true },
  { id: 'certified', label: '認證創作者', emoji: '⭐', unlocked: false, current: false },
  { id: 'senior', label: '資深創作者', emoji: '💎', unlocked: false, current: false },
  { id: 'contracted', label: '簽約創作者', emoji: '🏆', unlocked: false, current: false },
];

export const MOCK_CHAPTERS_LEGACY = [
  { id: 'ch1', title: '童年往事', description: '在大埔墟的成長歲月', duration: 8, topic: '童年' },
  { id: 'ch2', title: '學師入行', description: '十六歲開始在街市工作', duration: 6, topic: '學師' },
  { id: 'ch3', title: '獨立創業', description: '二十歲自立門戶開檔', duration: 12, topic: '創業' },
  { id: 'ch4', title: '風雨同路', description: '八十年代的經濟低潮', duration: 5, topic: '轉型' },
  { id: 'ch5', title: '薪火相傳', description: '將手藝傳授下一代', duration: 4, topic: '傳承' },
];

// Alias for convenience
export const mockProjects = MOCK_ALL_SERIES;
