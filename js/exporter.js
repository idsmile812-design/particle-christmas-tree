/**
 * LumièreTree - Standalone Single-File HTML Gift Exporter
 * Generates a 100% offline-ready, zero-dependency HTML file containing:
 * - Optional Gift Unwrap Intro Overlay (triggers gather animation + auto-plays music)
 * - Full 3D Particle Christmas Tree Engine (with 3D Text Morph, Toppers & Beat Pulse)
 * - Built-in Web Audio Christmas Music Box
 * - Embedded user customization & optional compressed photos
 */
window.LumiereExporter = (function () {
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeJson(obj) {
    return JSON.stringify(obj).replace(/<\//g, '<\\/');
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

  function generateHTML(config) {
    const gift = config.gift || {};
    const colors = config.colors || {};
    const titleText = escapeHtml(gift.title || 'Merry Christmas');
    const subtitleText = escapeHtml(gift.subtitle || '');
    const recipientText = escapeHtml(gift.recipient || '');
    const senderText = escapeHtml(gift.sender || '');
    const showText = gift.showText !== false;
    const unwrapIntro = gift.unwrapIntro !== false;
    const hasMusic = gift.music && gift.music !== 'none';

    const engineSource = window.createParticleTreeEngine.toString();
    const audioSource = window.createMusicBox.toString();
    const configJson = safeJson(config);
    const titleFont = fontStack(gift.fontStyle);

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${titleText}${recipientText ? ' · To ' + recipientText : ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: ${colors.bgTop || '#040814'};
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    #stage {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: grab;
    }
    canvas:active { cursor: grabbing; }

    /* Gift Unwrap Intro Overlay */
    .unwrap-overlay {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at center, rgba(10, 18, 36, 0.55) 0%, rgba(4, 8, 20, 0.88) 100%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .unwrap-overlay.opened {
      opacity: 0;
      transform: scale(1.08);
      pointer-events: none;
    }
    .unwrap-card {
      text-align: center;
      padding: 36px 32px 32px;
      border-radius: 26px;
      max-width: min(90vw, 380px);
      background: rgba(14, 22, 42, 0.68);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 40px ${colors.secondary || '#ffd452'}22;
      animation: floatCard 3.2s ease-in-out infinite;
    }
    .unwrap-icon {
      width: 74px;
      height: 74px;
      margin: 0 auto 18px;
      border-radius: 22px;
      background: linear-gradient(135deg, ${colors.primary || '#22e58b'}, ${colors.secondary || '#ffd452'});
      display: grid;
      place-items: center;
      font-size: 36px;
      box-shadow: 0 12px 34px ${colors.secondary || '#ffd452'}44;
    }
    .unwrap-to {
      font-size: 12px;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 0.68);
      margin-bottom: 8px;
    }
    .unwrap-heading {
      font-family: ${titleFont};
      font-size: 26px;
      font-weight: 600;
      margin-bottom: 10px;
      background: linear-gradient(120deg, #ffffff 10%, ${colors.secondary || '#ffd452'} 65%, ${colors.primary || '#22e58b'} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .unwrap-desc {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .unwrap-btn {
      appearance: none;
      border: none;
      padding: 13px 28px;
      border-radius: 999px;
      background: linear-gradient(120deg, ${colors.primary || '#22e58b'}, ${colors.secondary || '#ffd452'});
      color: #07101c;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 28px ${colors.secondary || '#ffd452'}44;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .unwrap-btn:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 14px 34px ${colors.secondary || '#ffd452'}66;
    }
    @keyframes floatCard {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }

    .gift-header {
      position: fixed;
      top: max(22px, env(safe-area-inset-top));
      left: 0;
      right: 0;
      text-align: center;
      pointer-events: none;
      padding: 0 20px;
      z-index: 10;
      transition: opacity 0.8s ease;
      animation: fadeDown 1.4s ease both;
    }
    body.awaiting-unwrap .gift-header,
    body.awaiting-unwrap .gift-footer {
      opacity: 0;
      pointer-events: none;
    }
    .gift-to {
      font-size: 13px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.72);
      margin-bottom: 6px;
    }
    .gift-title {
      font-family: ${titleFont};
      font-size: clamp(28px, 6vw, 54px);
      font-weight: 600;
      letter-spacing: 2px;
      background: linear-gradient(120deg, #ffffff 10%, ${colors.secondary || '#ffd452'} 55%, ${colors.primary || '#22e58b'} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 18px ${colors.secondary || '#ffd452'}66);
      line-height: 1.2;
    }
    .gift-subtitle {
      margin-top: 8px;
      font-size: clamp(13px, 2.4vw, 16px);
      color: rgba(255, 255, 255, 0.82);
      letter-spacing: 1.2px;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.75);
    }

    .gift-footer {
      position: fixed;
      bottom: max(20px, env(safe-area-inset-bottom));
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      z-index: 10;
      pointer-events: none;
      padding: 0 16px;
      transition: opacity 0.8s ease;
    }
    .gift-from {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.68);
      letter-spacing: 1.5px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
    }
    .gift-controls {
      pointer-events: auto;
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(12, 18, 34, 0.52);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    }
    .ctrl-btn {
      appearance: none;
      border: none;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.92);
      font-size: 12px;
      padding: 7px 12px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }
    .ctrl-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-1px);
    }
    .ctrl-btn.active {
      background: ${colors.secondary || '#ffd452'}33;
      color: #ffffff;
      box-shadow: 0 0 14px ${colors.secondary || '#ffd452'}44;
    }
    .hint {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.42);
      letter-spacing: 0.8px;
    }
    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-14px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="${unwrapIntro ? 'awaiting-unwrap' : ''}">
  <div id="stage"><canvas id="treeCanvas"></canvas></div>

  ${unwrapIntro ? `<div class="unwrap-overlay" id="unwrapOverlay">
    <div class="unwrap-card">
      <div class="unwrap-icon">🎁</div>
      ${recipientText ? `<div class="unwrap-to">TO · ${recipientText}</div>` : ''}
      <div class="unwrap-heading">你收到一份圣诞惊喜</div>
      <div class="unwrap-desc">${senderText ? ('来自 ' + senderText + ' 的专属星河圣诞树') : '一棵为你定制的 3D 发光星河圣诞树'}</div>
      <button class="unwrap-btn" id="btnUnwrap">✨ 点击开启礼物</button>
    </div>
  </div>` : ''}

  ${showText ? `<header class="gift-header">
    ${recipientText ? `<div class="gift-to">TO · ${recipientText}</div>` : ''}
    <h1 class="gift-title">${titleText}</h1>
    ${subtitleText ? `<p class="gift-subtitle">${subtitleText}</p>` : ''}
  </header>` : ''}

  <footer class="gift-footer">
    ${showText && senderText ? `<div class="gift-from">From ${senderText} ✦</div>` : ''}
    <div class="gift-controls">
      <button class="ctrl-btn" id="btnScatter" title="散开为星河或汇聚为圣诞树">✨ 散开星河</button>
      <button class="ctrl-btn" id="btnTextMorph" title="粒子变形成发光文字">💬 粒子文字</button>
      <button class="ctrl-btn" id="btnReplay" title="重播汇聚动画">🔄 重播</button>
      ${hasMusic ? `<button class="ctrl-btn" id="btnMusic" title="播放或暂停八音盒音乐">🎵 播放音乐</button>` : ''}
    </div>
    <div class="hint">拖拽旋转 · 滚轮缩放 · 点击绽放烟花 · 双击散开星河</div>
  </footer>

  <script>
    const CONFIG = ${configJson};
    const createMusicBox = ${audioSource};
    const createParticleTreeEngine = ${engineSource};

    (function () {
      const canvas = document.getElementById('treeCanvas');
      const engine = createParticleTreeEngine(canvas, CONFIG);
      engine.start();

      const btnScatter = document.getElementById('btnScatter');
      const btnTextMorph = document.getElementById('btnTextMorph');
      const btnReplay = document.getElementById('btnReplay');
      const btnMusic = document.getElementById('btnMusic');
      const unwrapOverlay = document.getElementById('unwrapOverlay');
      const btnUnwrap = document.getElementById('btnUnwrap');

      const hasMusic = CONFIG.gift && CONFIG.gift.music && CONFIG.gift.music !== 'none';
      const music = hasMusic ? createMusicBox() : null;
      if (music && CONFIG.gift.audioReactive !== false) {
        music.onBeat(function (intensity) {
          engine.pulseBeat(intensity);
        });
      }

      function syncMusicUI(playing) {
        if (!btnMusic) return;
        btnMusic.textContent = playing ? '🔊 音乐播放中' : '🎵 播放音乐';
        btnMusic.classList.toggle('active', playing);
      }

      function syncMorphUI() {
        const mode = engine.getMorphMode();
        btnScatter.textContent = mode === 'scatter' ? '🎄 汇聚圣诞树' : '✨ 散开星河';
        btnScatter.classList.toggle('active', mode === 'scatter');
        btnTextMorph.textContent = mode === 'text' ? '🎄 变回圣诞树' : '💬 粒子文字';
        btnTextMorph.classList.toggle('active', mode === 'text');
      }

      if (unwrapOverlay && btnUnwrap) {
        engine.setMorphMode('scatter');
        syncMorphUI();
        btnUnwrap.addEventListener('click', function () {
          unwrapOverlay.classList.add('opened');
          document.body.classList.remove('awaiting-unwrap');
          engine.replayGather();
          syncMorphUI();
          engine.spawnFirework(window.innerWidth * 0.5, window.innerHeight * 0.44);
          setTimeout(function () {
            engine.spawnFirework(window.innerWidth * 0.36, window.innerHeight * 0.36);
            engine.spawnFirework(window.innerWidth * 0.64, window.innerHeight * 0.36);
          }, 260);
          if (music) {
            const playing = music.start(CONFIG.gift.music);
            syncMusicUI(playing);
          }
          setTimeout(function () { unwrapOverlay.remove(); }, 800);
        });
      }

      btnScatter.addEventListener('click', function () {
        engine.toggleScatter();
        syncMorphUI();
      });

      btnTextMorph.addEventListener('click', function () {
        engine.toggleTextMorph();
        syncMorphUI();
      });

      btnReplay.addEventListener('click', function () {
        engine.replayGather();
        syncMorphUI();
      });

      window.addEventListener('keydown', function (e) {
        if (e.code === 'Space') {
          e.preventDefault();
          engine.toggleScatter();
          syncMorphUI();
        }
      });

      if (btnMusic && music) {
        btnMusic.addEventListener('click', function () {
          const playing = music.toggle(CONFIG.gift.music);
          syncMusicUI(playing);
        });
      }
    })();
  </script>
</body>
</html>`;
  }

  function downloadHTML(config) {
    const html = generateHTML(config);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const rawName = (config.gift && config.gift.recipient) ? config.gift.recipient.trim() : 'christmas-tree';
    const safeName = rawName.replace(/[\\/:*?"<>|]+/g, '').slice(0, 24) || 'christmas-tree';
    const a = document.createElement('a');
    a.href = url;
    a.download = 'christmas-gift-' + safeName + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return html;
  }

  return { generateHTML, downloadHTML };
})();
