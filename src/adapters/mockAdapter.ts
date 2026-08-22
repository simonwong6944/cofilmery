import type {
  AIAdapter, AITextRequest, AITextResponse,
  AIScriptRequest, AIScriptResponse,
  AIVoiceRequest, AIVoiceResponse,
  ArchitectRequest, ArchitectResponse,
  TopicOption, CharacterCard, EpisodeStoryCard,
} from './types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Mock AI adapter — returns realistic responses without real API calls */
export const mockAdapter: AIAdapter = {
  async generateText(req: AITextRequest): Promise<AITextResponse> {
    await delay(800);
    return {
      text: `根據您的要求，我建議將對白調整為更符合五十五歲以上觀眾的語言習慣。建議使用七十年代常見的粵語詞彙，加入當時流行的語氣助詞，令長者觀眾更有共鳴。\n\n修改後的對白：「今日菜心非常新鮮，價錢又公道，實在難得！」`,
      tokensUsed: 256,
      creditsConsumed: 5,
      provider: 'mock',
    };
  },

  async generateScript(req: AIScriptRequest): Promise<AIScriptResponse> {
    await delay(1200);
    return {
      text: '劇本生成完成',
      tokensUsed: 1024,
      creditsConsumed: 50,
      provider: 'mock',
      scenes: [
        { sceneNumber: 1, title: '街市清晨', dialogue: ['陳先生：今日菜心非常新鮮！', '街坊：是呀，每日清早就要來才有好貨。'], duration: 15 },
        { sceneNumber: 2, title: '舊友重逢', dialogue: ['李先生：多年不見，你依然精神！', '陳先生：還好，每日來街市走走，身體自然好。'], duration: 30 },
        { sceneNumber: 3, title: '溫馨收檔', dialogue: ['陳先生：又是收檔的時候了，感謝各位街坊今日的光顧。'], duration: 15 },
      ],
    };
  },

  async generateVoice(req: AIVoiceRequest): Promise<AIVoiceResponse> {
    await delay(1500);
    return {
      audioUrl: '/mock/audio/sample-cantonese.mp3',
      durationSeconds: 30,
      creditsConsumed: 80,
      provider: 'mock',
    };
  },

  async generateArchitect(req: ArchitectRequest): Promise<ArchitectResponse> {
    await delay(1000);
    const { stage, context } = req;

    // ── 選題方向 ────────────────────────────────
    if (stage === 'topic') {
      const topics: TopicOption[] = [
        {
          id: 'topic-1',
          title_i18n: {
            'zh-HK': '街市情緣：豬肉佬的廚師夢',
            'en': 'Market Bonds: A Butcher\'s Culinary Dream',
            'zh-CN': '街市情缘：猪肉佬的厨师梦',
          },
          logline_i18n: {
            'zh-HK': `一位在${context.seriesTitle || '灣仔'}街市做咗四十年嘅老師傅，退休前最後一個月，終於鼓起勇氣圓咗年輕時嘅廚師夢。`,
            'en': 'A veteran market butcher dares to pursue his lifelong dream of becoming a chef in his final month before retirement.',
            'zh-CN': '一位在街市工作了四十年的老师傅，退休前最后一个月，终于鼓起勇气圆了年轻时的厨师梦。',
          },
          hook_i18n: {
            'zh-HK': '呢個係每位長者都明白嘅故事——人到暮年，終於可以為自己活一次。',
            'en': 'Every elder understands this — finally living for yourself in your golden years.',
            'zh-CN': '这是每位长者都明白的故事——人到暮年，终于可以为自己活一次。',
          },
        },
        {
          id: 'topic-2',
          title_i18n: {
            'zh-HK': '舊區重生：唐樓裡的守護者',
            'en': 'District Revival: Guardian of the Old Tenement',
            'zh-CN': '旧区重生：唐楼里的守护者',
          },
          logline_i18n: {
            'zh-HK': '一位堅守舊區唐樓數十年的老街坊，面對清拆壓力，以獨特方式喚起整個社區對本土記憶的珍惜。',
            'en': 'A longtime resident fights to preserve her beloved old tenement building, awakening the community\'s appreciation for local heritage.',
            'zh-CN': '一位坚守旧区唐楼数十年的老街坊，面对清拆压力，以独特方式唤起整个社区对本土记忆的珍惜。',
          },
          hook_i18n: {
            'zh-HK': '城市在變，有些記憶不能丟。長者觀眾最能體會那份守護的心。',
            'en': 'Cities change, but some memories must not be lost — elders understand this guardian spirit best.',
            'zh-CN': '城市在变，有些记忆不能丢。长者观众最能体会那份守护的心。',
          },
        },
        {
          id: 'topic-3',
          title_i18n: {
            'zh-HK': '跨代同行：爺孫的咖啡館初體驗',
            'en': 'Across Generations: Grandpa\'s First Café Adventure',
            'zh-CN': '跨代同行：爷孙的咖啡馆初体验',
          },
          logline_i18n: {
            'zh-HK': '退休後與孫女同住的老伯，陰差陽錯成為咖啡館義工，在咖啡香中找回對生活的熱情。',
            'en': 'A retired grandfather accidentally becomes a café volunteer, rediscovering his zest for life alongside his granddaughter.',
            'zh-CN': '退休后与孙女同住的老伯，阴差阳错成为咖啡馆义工，在咖啡香中找回对生活的热情。',
          },
          hook_i18n: {
            'zh-HK': '年紀大唔代表不能嘗試新事物，呢個主題最能引起跨代共鳴。',
            'en': 'Age is no barrier to new experiences — a theme that resonates across all generations.',
            'zh-CN': '年纪大不代表不能尝试新事物，这个主题最能引起跨代共鸣。',
          },
        },
      ];
      return { stage, topics, tokensUsed: 320, creditsConsumed: 2, provider: 'mock' };
    }

    // ── 全劇大綱 ────────────────────────────────
    if (stage === 'outline') {
      const count = context.episodeCount || 10;
      const outline = Array.from({ length: count }, (_, i) => ({
        episodeNumber: i + 1,
        title_i18n: {
          'zh-HK': i === 0 ? '第一集：街市清晨' : i === count - 1 ? `第${count}集：夢想實現` : `第${i + 1}集：${['重遇舊友','家人誤解','廚藝初試','街坊支持','低谷時刻','轉機出現','決心重燃','關鍵一役','和解時刻','盛放時刻'][i % 10]}`,
          'en': i === 0 ? 'Ep 1: Market Dawn' : i === count - 1 ? `Ep ${count}: Dream Fulfilled` : `Ep ${i + 1}: ${['Old Friend Returns','Family Misunderstanding','First Cooking Attempt','Neighbours\' Support','Dark Valley','Turning Point','Rekindled Resolve','Crucial Moment','Reconciliation','Full Bloom'][i % 10]}`,
          'zh-CN': i === 0 ? '第一集：街市清晨' : i === count - 1 ? `第${count}集：梦想实现` : `第${i + 1}集：${['重遇旧友','家人误解','厨艺初试','街坊支持','低谷时刻','转机出现','决心重燃','关键一役','和解时刻','盛放时刻'][i % 10]}`,
        },
        oneLine_i18n: {
          'zh-HK': i === 0 ? '陳伯在清晨街市邂逅年輕廚師，兒時的廚師夢悄然甦醒。' : `第${i + 1}集的核心情節在此展開，推進整體故事弧線。`,
          'en': i === 0 ? 'Mr Chan meets a young chef at the dawn market; his childhood dream quietly stirs.' : `The core plot of episode ${i + 1} unfolds, advancing the overall story arc.`,
          'zh-CN': i === 0 ? '陈伯在清晨街市邂逅年轻厨师，儿时的厨师梦悄然苏醒。' : `第${i + 1}集的核心情节在此展开，推进整体故事弧线。`,
        },
      }));
      return { stage, outline, tokensUsed: 480, creditsConsumed: 3, provider: 'mock' };
    }

    // ── 角色深化 ────────────────────────────────
    if (stage === 'characters') {
      const characters: CharacterCard[] = [
        {
          id: 'char-1',
          name_i18n: { 'zh-HK': '陳伯（陳錦榮）', 'en': 'Mr Chan (Chan Kam-wing)', 'zh-CN': '陈伯（陈锦荣）' },
          identityTag_i18n: {
            'zh-HK': '四十年豬肉佬，心底藏著廚師夢的老師傅',
            'en': 'Veteran butcher of 40 years with a hidden dream of becoming a chef',
            'zh-CN': '四十年猪肉佬，心底藏着厨师梦的老师傅',
          },
          coreDesire_i18n: {
            'zh-HK': req.humanInput ? `${req.humanInput}（由創作者提供）` : '在退休前，用自己的廚藝令家人一次感到驕傲',
            'en': req.humanInput ? `${req.humanInput} (from creator)` : 'Make his family proud with his cooking before he retires',
            'zh-CN': req.humanInput ? `${req.humanInput}（由创作者提供）` : '在退休前，用自己的厨艺令家人一次感到骄傲',
          },
          traitsConflict_i18n: {
            'zh-HK': '外表堅硬、話少，內心細膩。致命弱點：自尊心強，不肯輕易認輸，令他錯過不少機會。',
            'en': 'Outwardly tough and quiet, inwardly sensitive. Fatal flaw: too proud to admit defeat, missing many opportunities.',
            'zh-CN': '外表坚硬、话少，内心细腻。致命弱点：自尊心强，不肯轻易认输，令他错过不少机会。',
          },
          arc_i18n: {
            'zh-HK': '從封閉自我到勇於表達，從「我唔值得」到「我有資格追夢」。',
            'en': 'From self-isolation to self-expression; from "I\'m not worthy" to "I deserve to dream."',
            'zh-CN': '从封闭自我到勇于表达，从「我不值得」到「我有资格追梦」。',
          },
          speechStyle_i18n: {
            'zh-HK': '七十年代舊式粵語，句末慣用「架」「囉」「喎」，偶爾夾英文詞如「chef」「recipe」。',
            'en': 'Old-fashioned 1970s Cantonese with "gaa", "lo", "wo" sentence endings; occasional English words like "chef" or "recipe".',
            'zh-CN': '七十年代旧式粤语，句末惯用「架」「啰」「喎」，偶尔夹英文词如「chef」「recipe」。',
          },
          relations_i18n: {
            'zh-HK': '與兒子陳志遠關係緊張（兒子嫌佢守舊）；視年輕廚師阿明為傳承人；街坊視他為定海神針。',
            'en': 'Strained relationship with son (who sees him as old-fashioned); sees young chef Ah Ming as an apprentice; seen as the pillar of the community.',
            'zh-CN': '与儿子陈志远关系紧张（儿子嫌他守旧）；视年轻厨师阿明为传承人；街坊视他为定海神针。',
          },
          appearancePrompt_zh: '七十歲男性，短白髮，皮膚黝黑，雙手粗糙有力，慣穿藍色圍裙，眼神溫柔但帶威嚴',
          appearancePrompt_en: 'Male, 70s, short white hair, tanned skin, weathered strong hands, usually wears blue apron, gentle but authoritative eyes',
          personality: ['重情義', '傳統', '固執', '沉默寡言', '善解人意'],
          appearanceOptions: {
            height: '中等身高', build: '壯實', skin: '古銅色',
            hair: '直髮', hairColor: '全白', hairLength: '短髮',
            face: '方臉', eyes: '眼神溫和', eyewear: '無眼鏡',
            facial: '短鬚', posture: '昂首挺胸', style: '廚師圍裙',
            extraNote: '雙手粗糙有力，慣穿藍色圍裙',
          },
          similarityLevel: '極似',
          humanEdited: false,
        },
        {
          id: 'char-2',
          name_i18n: { 'zh-HK': '阿明（李志明）', 'en': 'Ah Ming (Lee Chi-ming)', 'zh-CN': '阿明（李志明）' },
          identityTag_i18n: {
            'zh-HK': '年輕廚師，初出茅廬，在傳統街市尋找靈感',
            'en': 'Young chef, fresh out of culinary school, seeking inspiration in the traditional market',
            'zh-CN': '年轻厨师，初出茅庐，在传统街市寻找灵感',
          },
          coreDesire_i18n: {
            'zh-HK': '創作一道融合傳統與創新的菜式，在比賽中脫穎而出',
            'en': 'Create a dish blending tradition and innovation to stand out in a competition',
            'zh-CN': '创作一道融合传统与创新的菜式，在比赛中脱颖而出',
          },
          traitsConflict_i18n: {
            'zh-HK': '熱情衝動、勇於嘗試，致命弱點：急於求成，輕視傳統智慧。',
            'en': 'Passionate and bold, fatal flaw: impatient and dismissive of traditional wisdom.',
            'zh-CN': '热情冲动、勇于尝试，致命弱点：急于求成，轻视传统智慧。',
          },
          arc_i18n: {
            'zh-HK': '從輕視老一代到深深敬佩，從「創新才是出路」到「根是最好的養分」。',
            'en': 'From dismissing elders to deep admiration; from "innovation is the only way" to "roots are the best nourishment."',
            'zh-CN': '从轻视老一代到深深敬佩，从「创新才是出路」到「根是最好的养分」。',
          },
          speechStyle_i18n: {
            'zh-HK': '現代廣東話，慣用英語借詞，語速快，有活力，偶爾用「好正呀」「勁嘅」等潮語。',
            'en': 'Modern Cantonese with frequent English borrowings, fast-paced and energetic, uses slang like "hou jeng" and "geng ge".',
            'zh-CN': '现代广东话，惯用英语借词，语速快，有活力，偶尔用「好正呀」「劲嘅」等潮语。',
          },
          relations_i18n: {
            'zh-HK': '視陳伯為意外的恩師；與陳伯兒子陳志遠係同學，藉此帶出家庭矛盾。',
            'en': 'Sees Mr Chan as an unexpected mentor; classmates with Chan\'s son, which surfaces family tension.',
            'zh-CN': '视陈伯为意外的恩师；与陈伯儿子陈志远是同学，借此带出家庭矛盾。',
          },
          appearancePrompt_zh: '二十五歲男性，身形修長，白色廚師服，戴黑框眼鏡，表情充滿熱情，手腕有小廚刀紋身',
          appearancePrompt_en: 'Male, 25, slim build, white chef uniform, black-rimmed glasses, expressive enthusiastic face, small chef knife tattoo on wrist',
          personality: ['開朗樂觀', '勵志', '勇於嘗試', '好勝', '念舊'],
          appearanceOptions: {
            height: '高挑', build: '纖細', skin: '白皙',
            hair: '直髮', hairColor: '黑色', hairLength: '短髮',
            face: '瓜子臉', eyes: '眼神銳利', eyewear: '細框眼鏡',
            facial: '無鬚', posture: '輕鬆隨意', style: '廚師圍裙',
            extraNote: '手腕有小廚刀紋身',
          },
          similarityLevel: '70%',
          humanEdited: false,
        },
      ];
      return { stage, characters, tokensUsed: 640, creditsConsumed: 3, provider: 'mock' };
    }

    // ── 分集故事卡 ───────────────────────────────
    if (stage === 'episodes') {
      const epNum = req.targetEpisode ?? 1;
      const storyCard: EpisodeStoryCard = {
        episodeNumber: epNum,
        title_i18n: {
          'zh-HK': epNum === 1 ? '街市清晨' : `第${epNum}集`,
          'en': epNum === 1 ? 'Market Dawn' : `Episode ${epNum}`,
          'zh-CN': epNum === 1 ? '街市清晨' : `第${epNum}集`,
        },
        coreEmotion_i18n: {
          'zh-HK': '久違的期待感——一個被壓抑的夢，在最意外的地方悄然甦醒',
          'en': 'The return of long-lost anticipation — a suppressed dream quietly awakens in the most unexpected place',
          'zh-CN': '久违的期待感——一个被压抑的梦，在最意外的地方悄然苏醒',
        },
        hook_i18n: {
          'zh-HK': '天未光，陳伯站在熟悉的肉枱前，手握豬肉刀，眼望着對面新開嘅廚藝課，若有所思。',
          'en': 'Before dawn, Mr Chan stands at his familiar butcher\'s block, cleaver in hand, staring thoughtfully at the newly opened cooking class across the way.',
          'zh-CN': '天未光，陈伯站在熟悉的肉台前，手握猪肉刀，眼望着对面新开的厨艺课，若有所思。',
        },
        body_i18n: {
          'zh-HK': `清晨五點，灣仔街市已是一片熱鬧。陳伯像往常一樣，六點前便到檔口準備開市。四十年的習慣，連身體都記得。

對面那個新店，昨天才貼出招牌——「明記廚藝班」。陳伯假裝不在意，眼角卻不自覺地往那邊掃。

一個年輕人慌慌張張地跑過來，手上拿着幾袋食材，差點撞上陳伯的肉枱。「阿叔，唔好意思！」年輕人（阿明）急忙道歉，食材散落一地。

陳伯蹲下來幫他執拾，一眼認出材料：「你買嘅薑係老薑，煮乜嘢用架？」阿明訝異地看着他：「你識揀薑？」

陳伯沉默片刻，指了指自己的豬肉檔，沒有多說。但那個晚上，他翻出了一個藏在床底多年的舊筆記本——裡面是他年輕時抄錄的菜譜。`,
          'en': `At 5 AM, the Wan Chai market is already buzzing. As always, Mr Chan arrives before 6 to prepare for opening. Forty years of habit, his body knows the way.

The new shop across the way just put up its sign yesterday — "Ming's Cooking Studio." Mr Chan pretends not to notice, but his eyes drift over involuntarily.

A young man comes rushing past, arms full of ingredients, nearly crashing into Mr Chan's butcher block. "Sorry, uncle!" Ah Ming apologizes as the ingredients scatter.

Mr Chan crouches to help gather them, immediately recognising what's there. "You bought old ginger — what are you making?" Ah Ming looks at him in surprise: "You know about ginger?"

Mr Chan pauses, gestures at his butcher stall, says nothing more. But that evening, he pulls out a notebook hidden under his bed for years — full of recipes he copied down when he was young.`,
          'zh-CN': `清晨五点，湾仔街市已是一片热闹。陈伯像往常一样，六点前便到档口准备开市。四十年的习惯，连身体都记得。

对面那个新店，昨天才贴出招牌——「明记厨艺班」。陈伯假装不在意，眼角却不自觉地往那边扫。

一个年轻人慌慌张张地跑过来，手上拿着几袋食材，差点撞上陈伯的肉台。「阿叔，唔好意思！」年轻人（阿明）急忙道歉，食材散落一地。

陈伯蹲下来帮他执拾，一眼认出材料：「你买嘅姜系老姜，煮乜嘢用架？」阿明讶异地看着他：「你识揀姜？」

陈伯沉默片刻，指了指自己的猪肉档，没有多说。但那个晚上，他翻出了一个藏在床底多年的旧笔记本——里面是他年轻时抄录的菜谱。`,
        },
        turningPoint_i18n: {
          'zh-HK': '陳伯翻出那本塵封的菜譜本，觀眾第一次看到他眼裡的光——那份壓抑已久的渴望，終於在一個陌生年輕人的出現中，找到了出口。',
          'en': 'Mr Chan opens that dusty recipe book, and for the first time viewers see a light in his eyes — his long-suppressed longing finally finds an outlet in this unexpected young stranger.',
          'zh-CN': '陈伯翻出那本尘封的菜谱本，观众第一次看到他眼里的光——那份压抑已久的渴望，终于在一个陌生年轻人的出现中，找到了出口。',
        },
        linkPrevNext_i18n: {
          'zh-HK': '承接：S0 確立的系列設定（街市背景、陳伯身份）。伏筆：菜譜本將成為整劇的重要道具；阿明的廚藝班是下一集的主要場景。',
          'en': 'From: The series setup established in S0 (market setting, Mr Chan\'s identity). Setup: The recipe book becomes a key prop throughout the series; Ah Ming\'s cooking class is the main setting for the next episode.',
          'zh-CN': '承接：S0确立的系列设定（街市背景、陈伯身份）。伏笔：菜谱本将成为整剧的重要道具；阿明的厨艺班是下一集的主要场景。',
        },
        characterIds: ['char-1', 'char-2'],
        humanEdited: false,
      };
      return { stage, storyCard, tokensUsed: 520, creditsConsumed: 2, provider: 'mock' };
    }

    return { stage, tokensUsed: 0, creditsConsumed: 0, provider: 'mock' };
  },

  async getStatus() {
    await delay(100);
    return { healthy: true, provider: 'mock', latencyMs: 100 };
  },
};

// NOTE: openRouterAdapter and aiAdapter are now in src/adapters/openRouterAdapter.ts
// and src/adapters/index.ts respectively. They are controlled by VITE_AI_MODE env var.
// This file only exports the pure mock implementation.
