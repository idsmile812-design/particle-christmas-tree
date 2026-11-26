/**
 * LumièreTree - Presets, Themes & Default Configuration
 * Open-source 3D Particle Christmas Tree Studio (MIT License)
 */
window.LumierePresets = (function () {
  const THEMES = {
    classic: {
      id: 'classic',
      name: '璀璨金绿',
      en: 'Classic Emerald & Gold',
      primary: '#22e58b',
      secondary: '#ffd452',
      accent: '#ff4d6d',
      star: '#fff3b0',
      bgTop: '#040814',
      bgBottom: '#0a1628',
      auroraA: '#0f5c4d',
      auroraB: '#1b2a59'
    },
    frozen: {
      id: 'frozen',
      name: '冰雪奇缘',
      en: 'Frozen Ice Blue',
      primary: '#64d8ff',
      secondary: '#e0f7ff',
      accent: '#5e7bff',
      star: '#ffffff',
      bgTop: '#030816',
      bgBottom: '#091b36',
      auroraA: '#124e78',
      auroraB: '#2b3a8c'
    },
    sakura: {
      id: 'sakura',
      name: '樱花玫瑰金',
      en: 'Sakura Rose Gold',
      primary: '#ff8fab',
      secondary: '#ffd6a5',
      accent: '#fff0f5',
      star: '#ffe5ec',
      bgTop: '#120512',
      bgBottom: '#240b24',
      auroraA: '#6b1d4a',
      auroraB: '#3b185f'
    },
    champagne: {
      id: 'champagne',
      name: '香槟鎏金',
      en: 'Champagne Luxury',
      primary: '#f7c948',
      secondary: '#fff1c1',
      accent: '#ff9e44',
      star: '#fffbe6',
      bgTop: '#0d0904',
      bgBottom: '#1c1408',
      auroraA: '#593d0e',
      auroraB: '#2e1f09'
    },
    aurora: {
      id: 'aurora',
      name: '极光幻境',
      en: 'Aurora Borealis',
      primary: '#00f5d4',
      secondary: '#9b5de5',
      accent: '#f15bb5',
      star: '#e0fbfc',
      bgTop: '#050514',
      bgBottom: '#0c122e',
      auroraA: '#0b6e66',
      auroraB: '#511f73'
    },
    cyberpunk: {
      id: 'cyberpunk',
      name: '赛博霓虹',
      en: 'Cyberpunk Neon',
      primary: '#ff2a85',
      secondary: '#00f0ff',
      accent: '#ffe600',
      star: '#ffffff',
      bgTop: '#080212',
      bgBottom: '#150629',
      auroraA: '#6e0d4d',
      auroraB: '#084c61'
    },
    crimson: {
      id: 'crimson',
      name: '烈焰圣诞红',
      en: 'Crimson Velvet',
      primary: '#ff385c',
      secondary: '#ffd166',
      accent: '#ffffff',
      star: '#ffe8a3',
      bgTop: '#140408',
      bgBottom: '#26080f',
      auroraA: '#6b1122',
      auroraB: '#3d150c'
    },
    matcha: {
      id: 'matcha',
      name: '森系微光',
      en: 'Forest Firefly',
      primary: '#80ed99',
      secondary: '#c7f9cc',
      accent: '#ffca3a',
      star: '#fff8d6',
      bgTop: '#040d09',
      bgBottom: '#0b2016',
      auroraA: '#1b4332',
      auroraB: '#2d6a4f'
    }
  };

  const PARTICLE_STYLES = [
    { id: 'mixed', label: '混合星尘' },
    { id: 'glow', label: '柔光光球' },
    { id: 'star', label: '四芒星辉' },
    { id: 'bokeh', label: '梦幻散景' },
    { id: 'diamond', label: '晶钻棱光' },
    { id: 'snowflake', label: '冰晶雪花' },
    { id: 'heart', label: '浪漫爱心' }
  ];

  const TREE_SHAPES = [
    { id: 'layered', label: '经典分层松塔' },
    { id: 'spiral', label: '梦幻螺旋锥' },
    { id: 'helix', label: '双螺旋星链' },
    { id: 'galaxy', label: '星云漩涡树' }
  ];

  const TOPPER_STYLES = [
    { id: 'star', label: '⭐ 经典圣星' },
    { id: 'heart', label: '💖 璀璨爱心' },
    { id: 'snowflake', label: '❄️ 冰晶雪花' },
    { id: 'crown', label: '👑 星耀皇冠' }
  ];

  const ANIMATION_MODES = [
    { id: 'rotate', label: '优雅环绕' },
    { id: 'gather', label: '星海汇聚' },
    { id: 'breathe', label: '呼吸律动' },
    { id: 'wave', label: '光波流转' },
    { id: 'vortex', label: '流光漩涡' }
  ];

  const MUSIC_TRACKS = [
    { id: 'jingle', label: '铃儿响叮当 (Jingle Bells)' },
    { id: 'wish', label: '祝你圣诞快乐 (We Wish You)' },
    { id: 'silent', label: '平安夜 (Silent Night)' },
    { id: 'none', label: '静音 (无音乐)' }
  ];

  const FONT_STYLES = [
    { id: 'elegant', label: '优雅衬线 (Serif)' },
    { id: 'romantic', label: '浪漫手写 (Script)' },
    { id: 'modern', label: '现代极简 (Sans)' }
  ];

  const DEFAULT_CONFIG = {
    theme: 'classic',
    colors: {
      primary: THEMES.classic.primary,
      secondary: THEMES.classic.secondary,
      accent: THEMES.classic.accent,
      star: THEMES.classic.star,
      bgTop: THEMES.classic.bgTop,
      bgBottom: THEMES.classic.bgBottom,
      auroraA: THEMES.classic.auroraA,
      auroraB: THEMES.classic.auroraB
    },
    particle: {
      style: 'mixed',
      count: 3000,
      size: 1.05,
      glow: 1.15,
      twinkle: 1.1,
      trail: 0.25
    },
    scene: {
      treeShape: 'layered',
      topperStyle: 'star',
      ribbon: true,
      starTopper: true,
      snow: true,
      groundRipple: true,
      ornaments: true,
      shootingStars: true,
      aurora: true,
      fireworks: true
    },
    animation: {
      mode: 'gather',
      speed: 1.0,
      cameraSway: true,
      morphText: 'Merry Xmas'
    },
    gift: {
      showText: true,
      unwrapIntro: true,
      audioReactive: true,
      title: 'Merry Christmas',
      subtitle: '愿星河璀璨，岁岁平安，圣诞快乐 ✨',
      recipient: '亲爱的你',
      sender: '圣诞老人',
      fontStyle: 'elegant',
      music: 'jingle'
    },
    photos: []
  };

  function cloneConfig(cfg) {
    return JSON.parse(JSON.stringify(cfg || DEFAULT_CONFIG));
  }

  return {
    THEMES,
    PARTICLE_STYLES,
    TREE_SHAPES,
    TOPPER_STYLES,
    ANIMATION_MODES,
    MUSIC_TRACKS,
    FONT_STYLES,
    DEFAULT_CONFIG,
    cloneConfig
  };
})();
