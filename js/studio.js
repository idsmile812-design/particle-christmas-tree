/**
 * LumièreTree Studio - Interactive Customizer Controller
 */
(function () {
  const P = window.LumierePresets;
  const Icons = window.LumiereIcons;
  Icons.render();

  // UTF-8 safe Base64URL helpers for #cfg= share links
  function encodeConfigHash(cfg) {
    const slim = P.cloneConfig(cfg);
    slim.photos = []; // Keep URL compact; offline HTML export embeds photos
    const json = JSON.stringify(slim);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeConfigHash(hashStr) {
    try {
      const match = String(hashStr || '').match(/cfg=([A-Za-z0-9_-]+)/);
      if (!match) return null;
      let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const parsed = JSON.parse(new TextDecoder().decode(bytes));
      return {
        theme: parsed.theme || P.DEFAULT_CONFIG.theme,
        colors: Object.assign({}, P.DEFAULT_CONFIG.colors, parsed.colors),
        particle: Object.assign({}, P.DEFAULT_CONFIG.particle, parsed.particle),
        scene: Object.assign({}, P.DEFAULT_CONFIG.scene, parsed.scene),
        animation: Object.assign({}, P.DEFAULT_CONFIG.animation, parsed.animation),
        gift: Object.assign({}, P.DEFAULT_CONFIG.gift, parsed.gift),
        photos: []
      };
    } catch {
      return null;
    }
  }

  const sharedConfig = decodeConfigHash(window.location.hash);
  const openedViaShareLink = !!sharedConfig;
  let config = sharedConfig || P.cloneConfig(P.DEFAULT_CONFIG);

  const canvas = document.getElementById('treeCanvas');
  const engine = window.createParticleTreeEngine(canvas, config);
  const music = window.createMusicBox();
  music.onBeat(intensity => {
    if (config.gift && config.gift.audioReactive !== false) {
      engine.pulseBeat(intensity);
    }
  });
  engine.start();

  // Toast helper
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  function fontStack(style) {
    if (style === 'romantic') {
      return "'Snell Roundhand', 'Apple Chancery', 'Brush Script MT', 'Segoe Script', 'KaiTi', 'STKaiti', cursive";
    }
    if (style === 'modern') {
      return "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif";
    }
    return "'Didot', 'Bodoni MT', 'Playfair Display', 'Songti SC', 'STSong', Georgia, serif";
  }

  // Update WYSIWYG gift text overlay
  function syncGiftOverlay() {
    const g = config.gift;
    const c = config.colors;
    const overlay = document.getElementById('giftOverlay');
    const toEl = document.getElementById('previewTo');
    const titleEl = document.getElementById('previewTitle');
    const subEl = document.getElementById('previewSubtitle');
    const fromEl = document.getElementById('previewFrom');

    overlay.classList.toggle('is-hidden', !g.showText);
    toEl.textContent = g.recipient ? ('TO · ' + g.recipient) : '';
    toEl.style.display = g.recipient ? '' : 'none';
    titleEl.textContent = g.title || 'Merry Christmas';
    titleEl.style.fontFamily = fontStack(g.fontStyle);
    titleEl.style.backgroundImage = 'linear-gradient(120deg, #ffffff 10%, ' + c.secondary + ' 55%, ' + c.primary + ' 100%)';
    titleEl.style.filter = 'drop-shadow(0 0 18px ' + c.secondary + '66)';
    subEl.textContent = g.subtitle || '';
    subEl.style.display = g.subtitle ? '' : 'none';
    fromEl.textContent = (g.showText && g.sender) ? ('From ' + g.sender) : '';
    fromEl.style.display = (g.showText && g.sender) ? '' : 'none';
  }

  function applyUpdate(options) {
    engine.updateConfig(config, options);
    syncGiftOverlay();
  }

  // Build Theme Grid
  const themeGrid = document.getElementById('themeGrid');
  Object.values(P.THEMES).forEach(theme => {
    const btn = document.createElement('button');
    btn.className = 'theme-card';
    btn.dataset.themeId = theme.id;
    btn.innerHTML =
      '<div class="theme-dots">' +
      '<span class="theme-dot" style="background:' + theme.primary + '"></span>' +
      '<span class="theme-dot" style="background:' + theme.secondary + '"></span>' +
      '<span class="theme-dot" style="background:' + theme.accent + '"></span>' +
      '<span class="theme-dot" style="background:' + theme.bgBottom + '"></span>' +
      '</div>' +
      '<div class="theme-name">' + theme.name + '</div>';
    btn.addEventListener('click', () => {
      config.theme = theme.id;
      config.colors = {
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
        star: theme.star,
        bgTop: theme.bgTop,
        bgBottom: theme.bgBottom,
        auroraA: theme.auroraA,
        auroraB: theme.auroraB
      };
      syncControlsFromConfig();
      applyUpdate({ forceSprites: true });
    });
    themeGrid.appendChild(btn);
  });

  // Build Option Pill Grids
  function buildPills(containerId, items, onSelect) {
    const el = document.getElementById(containerId);
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'opt-pill';
      btn.dataset.val = item.id;
      btn.textContent = item.label;
      if (item.icon) {
        btn.dataset.icon = item.icon;
        btn.insertAdjacentHTML('afterbegin', Icons.svg(item.icon));
      }
      btn.addEventListener('click', () => onSelect(item.id));
      el.appendChild(btn);
    });
  }

  buildPills('particleStyleGrid', P.PARTICLE_STYLES, id => {
    config.particle.style = id;
    syncControlsFromConfig();
    applyUpdate({ forceGeometry: true });
  });

  buildPills('treeShapeGrid', P.TREE_SHAPES, id => {
    config.scene.treeShape = id;
    syncControlsFromConfig();
    applyUpdate({ forceGeometry: true });
  });

  buildPills('topperStyleGrid', P.TOPPER_STYLES, id => {
    config.scene.topperStyle = id;
    syncControlsFromConfig();
    applyUpdate();
  });

  buildPills('animModeGrid', P.ANIMATION_MODES, id => {
    config.animation.mode = id;
    syncControlsFromConfig();
    applyUpdate({ replayGather: id === 'gather' });
  });

  // Populate Selects
  const selFont = document.getElementById('selFontStyle');
  P.FONT_STYLES.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.label;
    selFont.appendChild(opt);
  });

  const selMusic = document.getElementById('selMusic');
  P.MUSIC_TRACKS.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label;
    selMusic.appendChild(opt);
  });

  // Tabs switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Color Pickers
  const colorMap = [
    ['colPrimary', 'primary'],
    ['colSecondary', 'secondary'],
    ['colAccent', 'accent'],
    ['colStar', 'star'],
    ['colBgTop', 'bgTop'],
    ['colBgBottom', 'bgBottom']
  ];
  colorMap.forEach(([id, key]) => {
    document.getElementById(id).addEventListener('input', e => {
      config.theme = 'custom';
      config.colors[key] = e.target.value;
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      applyUpdate({ forceSprites: true });
    });
  });

  // Sliders
  function bindSlider(id, valId, fmt, getter, setter, opts) {
    const el = document.getElementById(id);
    const valEl = document.getElementById(valId);
    el.addEventListener('input', () => {
      const v = parseFloat(el.value);
      setter(v);
      valEl.textContent = fmt(v);
      applyUpdate(opts);
    });
    return () => {
      const v = getter();
      el.value = v;
      valEl.textContent = fmt(v);
    };
  }

  const syncSliders = [
    bindSlider('rngCount', 'valCount', v => Math.round(v), () => config.particle.count, v => { config.particle.count = Math.round(v); }, { forceGeometry: true }),
    bindSlider('rngSize', 'valSize', v => v.toFixed(2) + 'x', () => config.particle.size, v => { config.particle.size = v; }),
    bindSlider('rngGlow', 'valGlow', v => v.toFixed(2), () => config.particle.glow, v => { config.particle.glow = v; }),
    bindSlider('rngTwinkle', 'valTwinkle', v => v.toFixed(2), () => config.particle.twinkle, v => { config.particle.twinkle = v; }),
    bindSlider('rngTrail', 'valTrail', v => v.toFixed(2), () => config.particle.trail, v => { config.particle.trail = v; }),
    bindSlider('rngSpeed', 'valSpeed', v => v.toFixed(2) + 'x', () => config.animation.speed, v => { config.animation.speed = v; })
  ];

  // Checkboxes
  const checkboxBindings = [
    ['chkRibbon', () => config.scene.ribbon, v => { config.scene.ribbon = v; }],
    ['chkStarTopper', () => config.scene.starTopper, v => { config.scene.starTopper = v; }],
    ['chkOrnaments', () => config.scene.ornaments, v => { config.scene.ornaments = v; }],
    ['chkSnow', () => config.scene.snow, v => { config.scene.snow = v; }],
    ['chkGroundRipple', () => config.scene.groundRipple, v => { config.scene.groundRipple = v; }],
    ['chkShootingStars', () => config.scene.shootingStars, v => { config.scene.shootingStars = v; }],
    ['chkAurora', () => config.scene.aurora, v => { config.scene.aurora = v; }],
    ['chkFireworks', () => config.scene.fireworks, v => { config.scene.fireworks = v; }],
    ['chkCameraSway', () => config.animation.cameraSway, v => { config.animation.cameraSway = v; }],
    ['chkShowText', () => config.gift.showText, v => { config.gift.showText = v; }],
    ['chkUnwrapIntro', () => config.gift.unwrapIntro !== false, v => { config.gift.unwrapIntro = v; }],
    ['chkAudioReactive', () => config.gift.audioReactive !== false, v => { config.gift.audioReactive = v; }]
  ];
  checkboxBindings.forEach(([id, , setter]) => {
    document.getElementById(id).addEventListener('change', e => {
      setter(e.target.checked);
      applyUpdate();
    });
  });

  // Gift Text Inputs
  const textBindings = [
    ['inpRecipient', 'recipient'],
    ['inpTitle', 'title'],
    ['inpSubtitle', 'subtitle'],
    ['inpSender', 'sender']
  ];
  textBindings.forEach(([id, key]) => {
    document.getElementById(id).addEventListener('input', e => {
      config.gift[key] = e.target.value;
      syncGiftOverlay();
    });
  });

  const inpMorphText = document.getElementById('inpMorphText');
  inpMorphText.addEventListener('input', e => {
    config.animation.morphText = e.target.value;
    applyUpdate();
  });

  selFont.addEventListener('change', e => {
    config.gift.fontStyle = e.target.value;
    syncGiftOverlay();
  });

  selMusic.addEventListener('change', e => {
    config.gift.music = e.target.value;
    music.setTrack(config.gift.music);
    syncMusicBtn();
  });

  // Photo Uploader with lightweight square JPEG compression
  const photoInput = document.getElementById('photoInput');
  const photoThumbs = document.getElementById('photoThumbs');
  document.getElementById('btnAddPhoto').addEventListener('click', () => photoInput.click());

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = 240;
          const c = document.createElement('canvas');
          c.width = size;
          c.height = size;
          const g = c.getContext('2d');
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          g.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          resolve(c.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoThumbs() {
    photoThumbs.innerHTML = '';
    config.photos.forEach((src, idx) => {
      const div = document.createElement('div');
      div.className = 'photo-thumb';
      div.innerHTML = '<img src="' + src + '" alt="memory" /><button title="移除">×</button>';
      div.querySelector('button').addEventListener('click', () => {
        config.photos.splice(idx, 1);
        renderPhotoThumbs();
        applyUpdate();
      });
      photoThumbs.appendChild(div);
    });
  }

  photoInput.addEventListener('change', async e => {
    const files = Array.from(e.target.files || []);
    const remaining = Math.max(0, 6 - config.photos.length);
    for (const file of files.slice(0, remaining)) {
      try {
        const dataUrl = await compressImage(file);
        config.photos.push(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
    photoInput.value = '';
    renderPhotoThumbs();
    applyUpdate();
    if (files.length) showToast('已添加环绕记忆相框（导出 HTML 时自动内嵌）');
  });

  // Stage & Animation Controls
  const stageScatterBtn = document.getElementById('stageScatterBtn');
  const stageTextBtn = document.getElementById('stageTextBtn');
  const stageReplayBtn = document.getElementById('stageReplayBtn');
  const stageMusicBtn = document.getElementById('stageMusicBtn');

  function syncMorphUI() {
    const mode = engine.getMorphMode();
    Icons.set(stageScatterBtn, mode === 'scatter' ? 'christmas-tree' : 'sparkles', mode === 'scatter' ? '汇聚圣诞树' : '散开星河');
    stageScatterBtn.classList.toggle('active', mode === 'scatter');
    Icons.set(stageTextBtn, mode === 'text' ? 'christmas-tree' : 'typography', mode === 'text' ? '变回圣诞树' : '粒子文字');
    stageTextBtn.classList.toggle('active', mode === 'text');
  }

  function syncMusicBtn() {
    const playing = music.isPlaying();
    Icons.set(stageMusicBtn, playing ? 'player-pause' : 'player-play', playing ? '暂停音乐' : '试听音乐盒');
    stageMusicBtn.classList.toggle('active', playing);
    stageMusicBtn.style.display = config.gift.music === 'none' ? 'none' : '';
  }

  stageScatterBtn.addEventListener('click', () => {
    engine.toggleScatter();
    syncMorphUI();
  });
  stageTextBtn.addEventListener('click', () => {
    engine.toggleTextMorph();
    syncMorphUI();
  });
  document.getElementById('btnAnimScatter').addEventListener('click', () => {
    engine.toggleScatter();
    syncMorphUI();
  });
  document.getElementById('btnAnimText').addEventListener('click', () => {
    engine.toggleTextMorph();
    syncMorphUI();
  });
  stageReplayBtn.addEventListener('click', () => {
    engine.replayGather();
    syncMorphUI();
  });
  document.getElementById('btnAnimGather').addEventListener('click', () => {
    engine.replayGather();
    syncMorphUI();
  });
  stageMusicBtn.addEventListener('click', () => {
    music.toggle(config.gift.music);
    syncMusicBtn();
  });

  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      engine.toggleScatter();
      syncMorphUI();
    }
  });

  // Studio Gift Unwrap Overlay (for Preview Mode & Shared Links)
  const studioUnwrap = document.getElementById('studioUnwrapOverlay');
  const btnStudioUnwrap = document.getElementById('btnStudioUnwrap');

  function openUnwrapExperience() {
    document.getElementById('unwrapTo').textContent = config.gift.recipient ? ('TO · ' + config.gift.recipient) : '';
    document.getElementById('unwrapDesc').textContent = config.gift.sender
      ? ('来自 ' + config.gift.sender + ' 的专属星河圣诞树')
      : '一棵为你定制的 3D 发光星河圣诞树';
    studioUnwrap.classList.remove('closing');
    studioUnwrap.classList.add('active');
    engine.setMorphMode('scatter');
    syncMorphUI();
  }

  btnStudioUnwrap.addEventListener('click', () => {
    studioUnwrap.classList.add('closing');
    engine.replayGather();
    syncMorphUI();
    engine.spawnFirework(window.innerWidth * 0.5, window.innerHeight * 0.44);
    setTimeout(() => {
      engine.spawnFirework(window.innerWidth * 0.36, window.innerHeight * 0.36);
      engine.spawnFirework(window.innerWidth * 0.64, window.innerHeight * 0.36);
    }, 240);
    if (config.gift.music && config.gift.music !== 'none') {
      music.start(config.gift.music);
      syncMusicBtn();
    }
    setTimeout(() => {
      studioUnwrap.classList.remove('active', 'closing');
    }, 650);
  });

  // Panel Collapse / Preview Gift Mode
  const reopenBtn = document.getElementById('reopenPanelBtn');
  document.getElementById('btnCollapse').addEventListener('click', () => {
    document.body.classList.add('panel-hidden');
  });
  document.getElementById('btnPreviewGift').addEventListener('click', () => {
    document.body.classList.add('preview-mode');
    Icons.set(reopenBtn, 'palette', '返回编辑');
    if (config.gift.unwrapIntro !== false) {
      openUnwrapExperience();
    } else {
      engine.replayGather();
      syncMorphUI();
      showToast('正在预览圣诞礼物效果，点击右上角可返回编辑');
    }
  });
  reopenBtn.addEventListener('click', () => {
    studioUnwrap.classList.remove('active', 'closing');
    document.body.classList.remove('panel-hidden', 'preview-mode');
    Icons.set(reopenBtn, 'palette', '返回编辑');
  });

  // Save High-Res Poster PNG (Canvas + Glowing Greeting Text)
  document.getElementById('btnSavePoster').addEventListener('click', () => {
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const g = out.getContext('2d');
    g.drawImage(canvas, 0, 0);

    if (config.gift.showText !== false) {
      const w = out.width;
      const h = out.height;
      const dprScale = Math.min(window.devicePixelRatio || 1, 2);
      g.save();
      g.textAlign = 'center';
      if (config.gift.recipient) {
        g.fillStyle = 'rgba(255,255,255,0.75)';
        g.font = '500 ' + Math.round(14 * dprScale) + 'px -apple-system, "PingFang SC", sans-serif';
        g.fillText('TO · ' + config.gift.recipient, w / 2, 46 * dprScale);
      }
      const titleSize = Math.round(Math.min(54, w / dprScale * 0.055) * dprScale);
      const grad = g.createLinearGradient(w * 0.3, 0, w * 0.7, 0);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.55, config.colors.secondary);
      grad.addColorStop(1, config.colors.primary);
      g.fillStyle = grad;
      g.shadowColor = config.colors.secondary;
      g.shadowBlur = 18 * dprScale;
      g.font = '600 ' + titleSize + 'px ' + fontStack(config.gift.fontStyle);
      g.fillText(config.gift.title || 'Merry Christmas', w / 2, 92 * dprScale);
      g.shadowBlur = 0;

      if (config.gift.subtitle) {
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.font = '400 ' + Math.round(16 * dprScale) + 'px -apple-system, "PingFang SC", sans-serif';
        g.fillText(config.gift.subtitle, w / 2, 126 * dprScale);
      }
      if (config.gift.sender) {
        g.fillStyle = 'rgba(255,255,255,0.72)';
        g.font = '400 ' + Math.round(14 * dprScale) + 'px -apple-system, "PingFang SC", sans-serif';
        g.fillText('From ' + config.gift.sender, w / 2, h - 34 * dprScale);
      }
      g.restore();
    }

    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'lumiere-christmas-poster.png';
    a.click();
    showToast('高清圣诞海报 PNG 已保存！');
  });

  // Record 8-Second Loop Video (WebM)
  const btnRecord = document.getElementById('btnRecordVideo');
  let isRecording = false;
  btnRecord.addEventListener('click', () => {
    if (isRecording) return;
    if (typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      showToast('当前浏览器不支持内置录屏，请使用 Chrome / Edge');
      return;
    }
    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        isRecording = false;
        btnRecord.classList.remove('recording');
        Icons.set(btnRecord, 'video', '录制 8s 视频');
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lumiere-christmas-tree.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast('8 秒高清圣诞树视频已导出！');
      };

      isRecording = true;
      let left = 8;
      btnRecord.classList.add('recording');
      Icons.set(btnRecord, 'video', '录制中 ' + left + 's');
      recorder.start();
      showToast('开始录制 8 秒圣诞树视频，可以旋转或点击烟花');

      const iv = setInterval(() => {
        left -= 1;
        if (left > 0) {
          Icons.set(btnRecord, 'video', '录制中 ' + left + 's');
        } else {
          clearInterval(iv);
          if (recorder.state !== 'inactive') recorder.stop();
        }
      }, 1000);
    } catch {
      isRecording = false;
      showToast('录制初始化失败，请重试');
    }
  });

  // Generate Shareable URL Hash Link
  document.getElementById('btnShareLink').addEventListener('click', async () => {
    const encoded = encodeConfigHash(config);
    const base = window.location.href.split('#')[0];
    const shareUrl = base + '#cfg=' + encoded;
    try {
      await navigator.clipboard.writeText(shareUrl);
      const photoNote = config.photos.length ? '（相框照片请用离线 HTML 导出）' : '';
      showToast('专属分享链接已复制！' + photoNote);
    } catch {
      window.location.hash = 'cfg=' + encoded;
      showToast('已更新地址栏为专属分享链接，直接复制即可');
    }
  });

  // Randomize Inspiration
  document.getElementById('btnRandomize').addEventListener('click', () => {
    const themeList = Object.values(P.THEMES);
    const theme = themeList[Math.floor(Math.random() * themeList.length)];
    const style = P.PARTICLE_STYLES[Math.floor(Math.random() * P.PARTICLE_STYLES.length)].id;
    const shape = P.TREE_SHAPES[Math.floor(Math.random() * P.TREE_SHAPES.length)].id;
    const topper = P.TOPPER_STYLES[Math.floor(Math.random() * P.TOPPER_STYLES.length)].id;
    const anim = P.ANIMATION_MODES[Math.floor(Math.random() * P.ANIMATION_MODES.length)].id;

    config.theme = theme.id;
    config.colors = {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      star: theme.star,
      bgTop: theme.bgTop,
      bgBottom: theme.bgBottom,
      auroraA: theme.auroraA,
      auroraB: theme.auroraB
    };
    config.particle.style = style;
    config.scene.treeShape = shape;
    config.scene.topperStyle = topper;
    config.animation.mode = anim;
    syncControlsFromConfig();
    applyUpdate({ forceSprites: true, forceGeometry: true, replayGather: true });
    showToast('已切换灵感风格：' + theme.name);
  });

  // Reset to Default
  document.getElementById('btnReset').addEventListener('click', () => {
    config = P.cloneConfig(P.DEFAULT_CONFIG);
    syncControlsFromConfig();
    applyUpdate({ forceSprites: true, forceGeometry: true, replayGather: true });
    showToast('已恢复默认圣诞树配置');
  });

  // Export Standalone HTML Gift
  document.getElementById('btnExportHtml').addEventListener('click', () => {
    window.LumiereExporter.downloadHTML(config);
    showToast('独立 HTML 圣诞礼物已导出！可直接发给好友双击打开');
  });

  // Copy HTML Source
  document.getElementById('btnCopyHtml').addEventListener('click', async () => {
    const html = window.LumiereExporter.generateHTML(config);
    try {
      await navigator.clipboard.writeText(html);
      showToast('完整独立 HTML 源码已复制到剪贴板');
    } catch {
      showToast('剪贴板权限受限，请直接使用「一键导出」按钮');
    }
  });

  // JSON Preset Export / Import
  document.getElementById('btnExportJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumiere-tree-preset.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('预设配置 JSON 已导出');
  });

  const jsonInput = document.getElementById('jsonInput');
  document.getElementById('btnImportJson').addEventListener('click', () => jsonInput.click());
  jsonInput.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        config = Object.assign(P.cloneConfig(P.DEFAULT_CONFIG), parsed);
        syncControlsFromConfig();
        applyUpdate({ forceSprites: true, forceGeometry: true, replayGather: true });
        showToast('预设配置已导入');
      } catch {
        showToast('JSON 文件格式无效');
      }
    };
    reader.readAsText(file);
    jsonInput.value = '';
  });

  // Sync all UI controls with current config
  function syncControlsFromConfig() {
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.toggle('active', c.dataset.themeId === config.theme);
    });
    colorMap.forEach(([id, key]) => {
      document.getElementById(id).value = config.colors[key];
    });
    document.querySelectorAll('#particleStyleGrid .opt-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.val === config.particle.style);
    });
    document.querySelectorAll('#treeShapeGrid .opt-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.val === config.scene.treeShape);
    });
    document.querySelectorAll('#topperStyleGrid .opt-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.val === (config.scene.topperStyle || 'star'));
    });
    document.querySelectorAll('#animModeGrid .opt-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.val === config.animation.mode);
    });
    syncSliders.forEach(fn => fn());
    checkboxBindings.forEach(([id, getter]) => {
      document.getElementById(id).checked = !!getter();
    });
    textBindings.forEach(([id, key]) => {
      document.getElementById(id).value = config.gift[key] || '';
    });
    inpMorphText.value = (config.animation && config.animation.morphText) || 'Merry Xmas';
    selFont.value = config.gift.fontStyle || 'elegant';
    selMusic.value = config.gift.music || 'jingle';
    renderPhotoThumbs();
    syncGiftOverlay();
    syncMorphUI();
    syncMusicBtn();
  }

  syncControlsFromConfig();

  // If opened via #cfg=... share link, enter Gift Mode automatically!
  if (openedViaShareLink) {
    document.body.classList.add('preview-mode');
    Icons.set(reopenBtn, 'christmas-tree', '我也要做一个');
    if (config.gift.unwrapIntro !== false) {
      openUnwrapExperience();
    }
  }
})();
