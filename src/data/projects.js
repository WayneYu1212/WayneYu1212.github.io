// 世界内容的唯一来源。改这里就等于改宇宙。
// links 里留空的数组不会渲染按钮，拿到正式链接后直接填进来即可。

export const OBSERVER_NAME = 'WAYNE YU'
export const OBSERVER_TAGLINE = 'A small atlas of things I chose to make.'
export const OBSERVER_TAGLINE_CN = '我做过的一些微小世界。'

export const observerStop = {
  id: 'observer',
  title: '欢迎进入我的个人宇宙',
  copy: [
    '我是 Wayne，一名叙事设计与独立开发者。',
    '继续向下滚动，你会沿着航线依次靠近我正在制作的项目。',
    '每次停靠都可以进入阅读，也可以继续前往下一站。',
  ],
  world: {
    position: [7, 7.5, 8],
    model: '/media/models/explorer-1.glb',
    displaySize: 4.8,
  },
  assetSource: 'NASA/JPL-Caltech · Explorer 1 3D Model',
  license: 'NASA media usage guidelines',
  fallbackStyle: 'antenna-probe',
}

export const projects = [
  {
    id: 'yongshu',
    index: '01',
    title: '佣书',
    titleEn: 'CHRONICLE',
    kind: '历史悬疑互动游戏',
    kindEn: 'HISTORICAL MYSTERY / INTERACTIVE FICTION',
    observed: '2026',
    field: 'fragments',
    accent: '#C9A227',
    paper: '#E8E0D0',
    positions: { time: [-26, 5, -52], theme: [-22, 9, -46], medium: [-20, 6, -44] },
    world: {
      planetStyle: 'archive-rock', radius: 2.25,
      orbit: { radius: 13, speed: 0.08, phase: 0.35 },
      surfacePalette: ['#5B4A31', '#C9A227', '#17130E'],
      features: ['paper-ridges', 'ink-basins'],
      assetType: 'texture',
      textureSet: 'media/celestial/yongshu-callisto.webp',
      assetSource: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Jupiter%20-%20Callisto/Jupiter%20-%20Callisto.jpg',
      license: 'NASA media guidelines',
      fallbackStyle: 'ochre-rock',
      entryCamera: { position: [0, 2.5, 8.5], target: [0, 0, 0] },
    },
    instrument: [
      ['TYPE', 'ARCHIVE FIELD'],
      ['PERIOD', '1644 – 1680'],
      ['REGION', '岭南 · 广州 / 南海 / 番禺'],
      ['STATE', 'PUBLIC DEMO'],
    ],
    lede: '玩家受雇替人誊写、查访、整理材料。最终留下来的「史实」，取决于你亲手处理过的每一张纸。',
    body: [
      '《佣书》把「史料处理」本身做成了玩法。故事发生在明末清初的岭南，玩家以受雇抄书、代查、整理材料的佣书人身份进入地方社会：看似琐碎的差事会不断把你引向商人、读书人、胥吏、船户、寺院与普通居民之间的关系网。',
      '你会拿到互相矛盾的口供、账页、书信与地方记录，也会被迫决定哪些材料值得保存，哪些可以出售，哪些应当销毁。局势恶化之后，最初只为挣钱和自保的记录，会逐渐变成一场关于「什么能被留下」的选择。',
      '游戏采用章节式多分支结构，通过人物对话、地点调查、舆图移动与材料取舍推进。玩家保留的每一片材料，都会改变后来可以被写出的历史。',
    ],
    credits: [
      ['ROLE', '概念 / 叙事设计 / 系统设计 / 开发'],
      ['MEDIUM', '网页端互动叙事'],
      ['DEVICE', '桌面端 Chrome / Edge'],
    ],
    manual: { label: '打开项目说明书 PDF', href: 'media/docs/yongshu-project-guide.pdf' },
    links: [{ label: '进入体验版', href: 'https://wayneyu1212.github.io/Chronicle' }],
    video: 'media/yongshu-pv.mp4',
    gallery: [
      { src: 'media/yongshu-cover.webp', caption: '主视觉 · 史料可疑' },
      { src: 'media/yongshu-atlas.webp', caption: '岭海舆图' },
      { src: 'media/yongshu-title.webp', caption: '开屏' },
      { src: 'media/yongshu-shot-01.webp', caption: '游戏内界面' },
      { src: 'media/yongshu-shot-02.webp', caption: '材料取舍' },
    ],
  },
  {
    id: 'apple',
    index: '02',
    title: '苹果落下之前',
    titleEn: 'BEFORE THE APPLE FELL',
    kind: '历史叙事游戏',
    kindEn: 'HISTORICAL NARRATIVE GAME',
    observed: '2026',
    field: 'trajectory',
    accent: '#8FB0C4',
    paper: '#DCE4E2',
    positions: { time: [8, -6, -78], theme: [4, 12, -70], medium: [14, 4, -66] },
    world: {
      planetStyle: 'scientific-terrestrial', radius: 3.15,
      orbit: { radius: 20, speed: 0.055, phase: 2.1 },
      surfacePalette: ['#4B5140', '#79624A', '#DCE4E2'],
      features: ['1666-orbit', '1696-orbit'],
      assetType: 'texture',
      textureSet: 'media/celestial/apple-iapetus.webp',
      assetSource: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Saturn%20-%20Iapetus/Saturn%20-%20Iapetus.jpg',
      license: 'NASA media guidelines',
      fallbackStyle: 'cool-stone',
      entryCamera: { position: [0, 3.1, 10.5], target: [0, 0, 0] },
    },
    instrument: [
      ['TYPE', 'TRAJECTORY FIELD'],
      ['PERIOD', '1666 / 1696'],
      ['REGION', 'Woolsthorpe · Grantham · London'],
      ['STATE', 'IN DEVELOPMENT'],
    ],
    lede: '瘟疫年的乡下，与二十年后的皇家铸币厅。同一个人，两次必须选择立场的时刻。',
    body: [
      '一部关于牛顿的历史叙事游戏，但它不讲「天才如何被苹果击中」。1666 年，剑桥因瘟疫关闭，二十几岁的牛顿回到伍尔索普；1696 年，他离开学术，进入皇家铸币厅追捕伪币犯。游戏把这两段时间并置，让玩家在其中来回移动。',
      '玩家面对的不是物理题，而是人：母亲、庄园管事、格兰瑟姆的药剂师与校长、听证书记、委员会委员，以及伪币高手威廉·查洛纳。每一次对话都在决定这个人会成为哪一种牛顿。',
      '空间上，这个项目的规则是轨迹：既定的轨道、一次偏离、于是出现多个本来也可能成立的世界。',
    ],
    credits: [
      ['ROLE', '概念 / 史料研究 / 叙事设计 / 美术方向'],
      ['MEDIUM', '互动叙事游戏'],
      ['PLATFORM', 'TapTap'],
    ],
    links: [],
    video: 'media/apple-pv.mp4',
    featureMedia: {
      hero: { src: 'media/apple-young-newton.webp', alt: '青年牛顿站在伍尔索普的书桌前' },
      timelinePortrait: { src: 'media/apple-newton.webp', alt: '1696 年的牛顿' },
      ensemble: { src: 'media/apple-cast-ensemble.webp', alt: '苹果落下之前主要人物群像' },
    },
    gallery: [
      { src: 'media/apple-newton.webp', caption: '1696 · 牛顿' },
      { src: 'media/apple-newton-portrait.webp', caption: '牛顿立绘' },
      { src: 'media/apple-mother.webp', caption: '牛顿母亲' },
      { src: 'media/apple-margaret.webp', caption: '玛格丽特' },
      { src: 'media/apple-chaloner.webp', caption: '威廉·查洛纳 · 伪币高手' },
      { src: 'media/apple-committee.webp', caption: '1696 · 委员会委员' },
    ],
  },
  {
    id: 'nearby',
    index: '03',
    title: '附近未见',
    titleEn: 'THE UNSEEN NEARBY',
    kind: '微信小程序',
    kindEn: 'WECHAT MINI PROGRAM',
    observed: '2026',
    field: 'scale',
    accent: '#EBD7E4',
    paper: '#F4F1F4',
    positions: { time: [30, 8, -34], theme: [26, -10, -40], medium: [-6, -12, -30] },
    world: {
      planetStyle: 'pearl-city', radius: 2.6,
      orbit: { radius: 27, speed: 0.04, phase: 3.65 },
      surfacePalette: ['#BBA8B7', '#F4F1F4', '#6C6570'],
      features: ['street-lights', 'five-hundred-metre-ring'],
      assetType: 'texture',
      textureSet: 'media/celestial/nearby-europa.webp',
      assetSource: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Jupiter%20-%20Europa/Jupiter%20-%20Europa.jpg',
      license: 'NASA media guidelines',
      fallbackStyle: 'pearl-ice',
      entryCamera: { position: [0, 2.8, 9.2], target: [0, 0, 0] },
    },
    instrument: [
      ['TYPE', 'SCALE COLLAPSE'],
      ['RADIUS', '500 m'],
      ['REGION', 'wherever you are standing'],
      ['STATE', 'LIVE'],
    ],
    lede: '宇宙可以无限大，值得注意的世界也可以只有五百米。',
    body: [
      '《附近未见》是一个把注意力交还给「附近」的小程序。它不做推荐、不做排行，只请你重新观察每天都经过、却从来没有真正看见的那几百米：早餐店、路口、树、招牌、光。',
      '它的界面刻意做得很轻：珍珠质地、柔光、低饱和，尽量不与你要看的世界争夺注意力。',
      '在这片宇宙里，它是唯一一个反方向的场。别的项目让你往外看，它让镜头一路缩小尺度，直到星点变成街灯。',
    ],
    credits: [
      ['ROLE', '概念 / 产品设计 / 视觉 / 开发'],
      ['MEDIUM', '微信小程序'],
      ['VISUAL', '珍珠 · 柔光 · 低饱和'],
    ],
    manual: { label: '打开项目说明书 PDF', href: 'media/docs/nearby-user-guide.pdf' },
    links: [],
    video: 'media/nearby-pv.mp4',
    gallery: [
      { src: 'media/nearby-cover.webp', caption: '主视觉' },
      { src: 'media/nearby-icon.webp', caption: '图标' },
      { src: 'media/nearby-poster.webp', caption: '宣传片画面' },
    ],
  },
]

// 星座关系：作品之间共享的母题。这是这个网站真正想说的部分。
export const constellations = [
  { from: 'yongshu', to: 'apple', label: 'HISTORY / COUNTERFACTUAL' },
  { from: 'yongshu', to: 'nearby', label: 'ARCHIVE / MEMORY' },
  { from: 'apple', to: 'nearby', label: 'NARRATIVE / PLACE' },
]

export const layouts = [
  { id: 'time', label: 'BY TIME', labelCn: '按时间' },
  { id: 'theme', label: 'BY THEME', labelCn: '按主题' },
  { id: 'medium', label: 'BY MEDIUM', labelCn: '按媒介' },
]

export const byId = (id) => projects.find((p) => p.id === id)
