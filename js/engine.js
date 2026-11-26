/**
 * LumièreTree - 3D Particle Christmas Tree Rendering Engine
 * Self-contained, zero-dependency, high-DPI Canvas2D + Additive Bloom 3D engine.
 * Designed to run identically in the Studio and in exported standalone HTML gifts.
 */
window.createParticleTreeEngine = function createParticleTreeEngine(canvas, initialConfig) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let width = 1;
  let height = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let config = JSON.parse(JSON.stringify(initialConfig));
  let rafId = null;
  let lastTime = performance.now();
  let elapsed = 0;

  // Camera & interaction state
  let rotY = 0;
  let targetRotX = 0.14;
  let rotX = 0.14;
  let zoom = 1.0;
  let targetZoom = 1.0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragMoved = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let velRotY = 0;
  let pinchDist = 0;

  // Morphing state ('tree' | 'text' | 'scatter')
  let morphMode = 'tree';
  let scattered = false;
  let scatterProgress = 0;
  let textMorphProgress = 0;
  let gatherProgress = 1;
  let beatPulse = 0;

  // Particle collections
  let treeParticles = [];
  let ribbonParticles = [];
  let ornamentParticles = [];
  let groundParticles = [];
  let snowParticles = [];
  let bgStars = [];
  let shootingStars = [];
  let fireworks = [];
  let photoCards = [];
  let loadedImages = new Map();

  // Offscreen sprite cache: key -> canvas
  let spriteCache = {};

  function hexToRgb(hex) {
    const clean = (hex || '#ffffff').replace('#', '');
    const full = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean.padEnd(6, 'f');
    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgba(hex, a) {
    const c = hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  function makeSprite(colorHex, shape) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const half = size / 2;
    const rgb = hexToRgb(colorHex);
    const core = 'rgba(255,255,255,0.92)';
    const mid = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.62)';
    const edge = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)';

    if (shape === 'glow') {
      const grad = g.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, core);
      grad.addColorStop(0.14, mid);
      grad.addColorStop(0.42, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.14)');
      grad.addColorStop(1, edge);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
    } else if (shape === 'bokeh') {
      const grad = g.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.08)');
      grad.addColorStop(0.62, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.22)');
      grad.addColorStop(0.8, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.72)');
      grad.addColorStop(0.9, 'rgba(255,255,255,0.55)');
      grad.addColorStop(1, edge);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(half, half, half - 1, 0, Math.PI * 2);
      g.fill();
    } else if (shape === 'star') {
      const grad = g.createRadialGradient(half, half, 0, half, half, half * 0.72);
      grad.addColorStop(0, core);
      grad.addColorStop(0.22, mid);
      grad.addColorStop(1, edge);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(half, half, half * 0.72, 0, Math.PI * 2);
      g.fill();

      g.save();
      g.translate(half, half);
      g.fillStyle = 'rgba(' + Math.min(255, rgb.r + 90) + ',' + Math.min(255, rgb.g + 90) + ',' + Math.min(255, rgb.b + 90) + ',0.85)';
      for (let i = 0; i < 4; i++) {
        g.rotate(Math.PI / 2);
        g.beginPath();
        g.moveTo(0, -half * 0.85);
        g.quadraticCurveTo(2, -2, half * 0.13, 0);
        g.quadraticCurveTo(2, 2, 0, half * 0.85);
        g.quadraticCurveTo(-2, 2, -half * 0.13, 0);
        g.quadraticCurveTo(-2, -2, 0, -half * 0.85);
        g.fill();
      }
      g.restore();
    } else if (shape === 'diamond') {
      const grad = g.createRadialGradient(half, half, 0, half, half, half * 0.78);
      grad.addColorStop(0, core);
      grad.addColorStop(0.32, mid);
      grad.addColorStop(1, edge);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);

      g.save();
      g.translate(half, half);
      g.fillStyle = 'rgba(' + Math.min(255, rgb.r + 80) + ',' + Math.min(255, rgb.g + 80) + ',' + Math.min(255, rgb.b + 80) + ',0.82)';
      g.beginPath();
      g.moveTo(0, -half * 0.56);
      g.lineTo(half * 0.36, 0);
      g.lineTo(0, half * 0.56);
      g.lineTo(-half * 0.36, 0);
      g.closePath();
      g.fill();
      g.restore();
    } else if (shape === 'snowflake') {
      const grad = g.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, 'rgba(255,255,255,0.65)');
      grad.addColorStop(0.45, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.25)');
      grad.addColorStop(1, edge);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);

      g.save();
      g.translate(half, half);
      g.strokeStyle = 'rgba(255,255,255,0.92)';
      g.lineWidth = 2;
      g.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        g.rotate(Math.PI / 3);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0, -half * 0.72);
        g.moveTo(0, -half * 0.42);
        g.lineTo(half * 0.18, -half * 0.58);
        g.moveTo(0, -half * 0.42);
        g.lineTo(-half * 0.18, -half * 0.58);
        g.stroke();
      }
      g.restore();
    } else if (shape === 'heart') {
      const grad = g.createRadialGradient(half, half, 0, half, half, half * 0.85);
      grad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.38)');
      grad.addColorStop(0.55, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.12)');
      grad.addColorStop(1, edge);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);

      g.save();
      g.translate(half, half + 2);
      const hs = half * 0.52;
      g.fillStyle = 'rgba(' + Math.min(255, rgb.r + 75) + ',' + Math.min(255, rgb.g + 75) + ',' + Math.min(255, rgb.b + 75) + ',0.9)';
      g.beginPath();
      g.moveTo(0, hs * 0.85);
      g.bezierCurveTo(-hs * 1.35, hs * 0.1, -hs * 1.25, -hs * 0.95, 0, -hs * 0.35);
      g.bezierCurveTo(hs * 1.25, -hs * 0.95, hs * 1.35, hs * 0.1, 0, hs * 0.85);
      g.closePath();
      g.fill();
      g.restore();
    }
    return c;
  }

  function rebuildSprites() {
    spriteCache = {};
    const palette = {
      primary: config.colors.primary,
      secondary: config.colors.secondary,
      accent: config.colors.accent,
      star: config.colors.star,
      white: '#ffffff'
    };
    const shapes = ['glow', 'star', 'bokeh', 'diamond', 'snowflake', 'heart'];
    Object.keys(palette).forEach(role => {
      shapes.forEach(shape => {
        spriteCache[role + ':' + shape] = makeSprite(palette[role], shape);
      });
    });
  }

  function pickParticleShape(index) {
    const s = config.particle.style;
    if (s !== 'mixed') return s;
    const r = (index * 17) % 100;
    if (r < 58) return 'glow';
    if (r < 80) return 'star';
    if (r < 92) return 'bokeh';
    return 'diamond';
  }

  function buildTreeGeometry() {
    const count = Math.max(600, Math.min(6000, config.particle.count || 3000));
    const shape = config.scene.treeShape || 'layered';
    const treeHeight = 420;
    const baseRadius = 175;
    treeParticles = [];

    for (let i = 0; i < count; i++) {
      const u = i / count; // 0 (top) -> 1 (bottom)
      let x = 0, y = 0, z = 0;
      let role = 'primary';
      let sizeMul = 0.65 + Math.random() * 1.05;

      // Subtle glowing trunk at the very bottom (4% of particles)
      if (i < count * 0.04) {
        const ty = treeHeight * 0.48 + Math.random() * 58;
        const tr = 12 + Math.random() * 14;
        const ta = Math.random() * Math.PI * 2;
        x = Math.cos(ta) * tr;
        y = ty;
        z = Math.sin(ta) * tr;
        role = Math.random() < 0.7 ? 'secondary' : 'accent';
        sizeMul = 0.7 + Math.random() * 0.6;
      } else if (shape === 'layered') {
        // 6 graceful pine tiers with natural drooping branch silhouettes
        const tiers = 6;
        const hNorm = Math.pow(Math.random(), 0.72); // denser near bottom
        const tierPos = hNorm * tiers;
        const tierFrac = tierPos - Math.floor(tierPos);
        const tierEnvelope = 0.56 + 0.56 * Math.pow(tierFrac, 0.85);
        const coneR = baseRadius * (0.04 + 0.96 * hNorm) * tierEnvelope;
        // Favor outer shell for crisp silhouette, with soft inner volume
        const radialFill = Math.random() < 0.72 ? (0.72 + Math.random() * 0.28) : (0.18 + Math.random() * 0.58);
        const r = coneR * radialFill;
        const angle = Math.random() * Math.PI * 2;
        const droop = Math.pow(r / (baseRadius + 1), 1.4) * 18;

        x = Math.cos(angle) * r;
        y = (hNorm - 0.5) * treeHeight + droop;
        z = Math.sin(angle) * r;

        const cr = Math.random();
        if (radialFill > 0.88 && cr < 0.34) role = 'secondary';
        else if (cr < 0.14) role = 'accent';
        else if (cr < 0.22) role = 'white';
        else role = 'primary';
      } else if (shape === 'spiral') {
        // Iconic viral Douyin golden spiral cone
        const hNorm = Math.pow(u, 0.78);
        const arms = 5;
        const armIdx = i % arms;
        const spiralTurns = 6.5;
        const baseAngle = hNorm * Math.PI * 2 * spiralTurns + (armIdx * Math.PI * 2) / arms;
        const jitterA = (Math.random() - 0.5) * (0.45 + hNorm * 0.4);
        const coneR = baseRadius * (0.03 + 0.97 * hNorm);
        const radial = Math.random() < 0.78 ? (0.82 + Math.random() * 0.2) : (0.2 + Math.random() * 0.65);
        const r = coneR * radial;

        x = Math.cos(baseAngle + jitterA) * r;
        y = (hNorm - 0.5) * treeHeight + (Math.random() - 0.5) * 10;
        z = Math.sin(baseAngle + jitterA) * r;

        const cr = Math.random();
        if (armIdx === 0 && cr < 0.65) role = 'secondary';
        else if (cr < 0.16) role = 'accent';
        else if (cr < 0.26) role = 'white';
        else role = 'primary';
      } else if (shape === 'helix') {
        // Double-helix luminous crystal tree
        const hNorm = Math.pow(u, 0.85);
        const strand = i % 2;
        const turns = 5.5;
        const angle = hNorm * Math.PI * 2 * turns + strand * Math.PI;
        const coneR = baseRadius * (0.05 + 0.95 * hNorm);
        const isBridge = i % 11 === 0;
        const spread = isBridge ? Math.random() : (0.86 + Math.random() * 0.18);
        const r = coneR * spread;
        const jitter = isBridge ? 0 : (Math.random() - 0.5) * 14;

        x = Math.cos(angle) * r + jitter;
        y = (hNorm - 0.5) * treeHeight + (Math.random() - 0.5) * 8;
        z = Math.sin(angle) * r + jitter;

        role = isBridge ? 'white' : (strand === 0 ? 'primary' : 'secondary');
        if (Math.random() < 0.12) role = 'accent';
      } else {
        // Galaxy Nebula Vortex Tree
        const hNorm = Math.pow(Math.random(), 0.75);
        const arms = 3;
        const arm = i % arms;
        const swirl = hNorm * 9.0 + (arm * Math.PI * 2) / arms;
        const r = baseRadius * 1.08 * Math.pow(hNorm, 0.9) * (0.45 + Math.random() * 0.65);
        const angle = swirl + (Math.random() - 0.5) * 0.65;

        x = Math.cos(angle) * r;
        y = (hNorm - 0.5) * treeHeight + (Math.random() - 0.5) * 18;
        z = Math.sin(angle) * r;

        const cr = Math.random();
        if (cr < 0.48) role = 'primary';
        else if (cr < 0.8) role = 'secondary';
        else if (cr < 0.92) role = 'accent';
        else role = 'white';
      }

      // Scattered galaxy target position (3D spherical nebula)
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      const sDist = 170 + Math.random() * 440;
      const sx = sDist * Math.sin(sPhi) * Math.cos(sTheta);
      const sy = sDist * Math.cos(sPhi) * 0.72;
      const sz = sDist * Math.sin(sPhi) * Math.sin(sTheta);

      treeParticles.push({
        tx: x, ty: y, tz: z,
        sx: sx, sy: sy, sz: sz,
        mx: sx, my: sy, mz: sz,
        role: role,
        shape: pickParticleShape(i),
        size: (1.7 + sizeMul * 2.2),
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 3.0,
        hNorm: (y + treeHeight * 0.5) / treeHeight
      });
    }

    buildTextTargets((config.animation && config.animation.morphText) || 'Merry Xmas');

    // Build Spiral Light Ribbon
    ribbonParticles = [];
    const ribbonCount = 520;
    for (let i = 0; i < ribbonCount; i++) {
      const t = i / ribbonCount;
      const strand = i % 2;
      const turns = 4.6;
      const angle = t * Math.PI * 2 * turns + strand * Math.PI;
      const r = baseRadius * (0.07 + 0.98 * t) + 8;
      const y = (t - 0.5) * treeHeight;

      const sTheta = Math.random() * Math.PI * 2;
      const sDist = 240 + Math.random() * 320;
      ribbonParticles.push({
        tx: Math.cos(angle) * r,
        ty: y,
        tz: Math.sin(angle) * r,
        sx: Math.cos(sTheta) * sDist,
        sy: (Math.random() - 0.5) * 340,
        sz: Math.sin(sTheta) * sDist,
        role: strand === 0 ? 'secondary' : 'star',
        size: 3.0 + Math.sin(t * Math.PI) * 2.4,
        phase: t * 14,
        t: t
      });
    }

    // Build Glowing Ornaments
    ornamentParticles = [];
    const ornCount = 46;
    for (let i = 0; i < ornCount; i++) {
      const hNorm = 0.14 + (i / ornCount) * 0.82;
      const angle = i * 2.3999632; // golden angle
      const r = baseRadius * (0.08 + 0.9 * hNorm) * 0.96;
      const y = (hNorm - 0.5) * treeHeight;
      const roles = ['accent', 'secondary', 'star'];
      const sDist = 200 + Math.random() * 360;
      ornamentParticles.push({
        tx: Math.cos(angle) * r,
        ty: y,
        tz: Math.sin(angle) * r,
        sx: Math.cos(angle * 2) * sDist,
        sy: (Math.random() - 0.5) * 360,
        sz: Math.sin(angle * 2) * sDist,
        role: roles[i % roles.length],
        size: 6.5 + Math.random() * 4.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Build Ground Galaxy Ripple Particles
    groundParticles = [];
    const gCount = 420;
    for (let i = 0; i < gCount; i++) {
      const ring = (i % 6) + 1;
      const baseR = 52 + ring * 44 + (Math.random() - 0.5) * 18;
      const angle = Math.random() * Math.PI * 2;
      groundParticles.push({
        baseR: baseR,
        angle: angle,
        speed: (0.12 + (7 - ring) * 0.04) * (ring % 2 === 0 ? 1 : -1),
        y: treeHeight * 0.5 + 54,
        role: ring % 2 === 0 ? 'primary' : 'secondary',
        size: 1.5 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Build 3D Snowfall
    snowParticles = [];
    const snowCount = 240;
    for (let i = 0; i < snowCount; i++) {
      snowParticles.push({
        x: (Math.random() - 0.5) * 1100,
        y: (Math.random() - 0.5) * 780,
        z: (Math.random() - 0.5) * 800,
        vy: 18 + Math.random() * 34,
        swayAmp: 12 + Math.random() * 24,
        swayFreq: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        size: 1.8 + Math.random() * 4.2,
        shape: Math.random() < 0.35 ? 'snowflake' : 'glow'
      });
    }

    // Build Deep Background Stars
    bgStars = [];
    for (let i = 0; i < 160; i++) {
      bgStars.push({
        x: Math.random(),
        y: Math.random() * 0.78,
        size: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 2.2
      });
    }

    syncPhotos();
  }

  function buildTextTargets(rawText) {
    const text = String(rawText || 'Merry Xmas').trim() || 'Merry Xmas';
    const off = document.createElement('canvas');
    const ow = 520;
    const oh = 200;
    off.width = ow;
    off.height = oh;
    const g = off.getContext('2d');
    g.clearRect(0, 0, ow, oh);
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    let fontSize = text.length <= 6 ? 96 : (text.length <= 10 ? 74 : 56);
    g.font = '700 ' + fontSize + 'px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", Georgia, serif';
    const measured = g.measureText(text).width;
    if (measured > ow - 36) {
      fontSize = Math.max(28, Math.floor(fontSize * ((ow - 36) / measured)));
      g.font = '700 ' + fontSize + 'px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", Georgia, serif';
    }
    g.fillText(text, ow / 2, oh / 2);

    const imgData = g.getImageData(0, 0, ow, oh).data;
    const pts = [];
    const step = 3;
    for (let y = 0; y < oh; y += step) {
      for (let x = 0; x < ow; x += step) {
        const alpha = imgData[(y * ow + x) * 4 + 3];
        if (alpha > 110) {
          pts.push({
            x: (x - ow / 2) * 1.12,
            y: (y - oh / 2) * 1.12
          });
        }
      }
    }

    if (!pts.length) return;
    for (let i = 0; i < treeParticles.length; i++) {
      const pt = treeParticles[i];
      if (i < treeParticles.length * 0.88) {
        const pick = pts[(i * 7 + (i % 13)) % pts.length];
        pt.mx = pick.x + (Math.random() - 0.5) * 3.5;
        pt.my = pick.y + (Math.random() - 0.5) * 3.5;
        pt.mz = (Math.random() - 0.5) * 26;
      } else {
        // Remaining 12% form a delicate starry halo framing the 3D text
        const a = Math.random() * Math.PI * 2;
        const rx = 250 + Math.random() * 140;
        const ry = 105 + Math.random() * 90;
        pt.mx = Math.cos(a) * rx;
        pt.my = Math.sin(a) * ry;
        pt.mz = (Math.random() - 0.5) * 160;
      }
    }
  }

  function syncPhotos() {
    const photos = Array.isArray(config.photos) ? config.photos : [];
    photoCards = photos.map((src, idx) => {
      if (!loadedImages.has(src)) {
        const img = new Image();
        img.src = src;
        loadedImages.set(src, img);
      }
      const angle = (idx / Math.max(1, photos.length)) * Math.PI * 2;
      const radius = 215 + (idx % 2) * 38;
      const y = -90 + ((idx % 3) * 85);
      return {
        src: src,
        angle: angle,
        radius: radius,
        y: y,
        phase: idx * 1.4
      };
    });
  }

  function spawnFirework(screenX, screenY) {
    if (!config.scene.fireworks) return;
    const roles = ['primary', 'secondary', 'accent', 'star', 'white'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const burst = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
      const spd = 65 + Math.random() * 190;
      burst.push({
        x: screenX,
        y: screenY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 20,
        life: 1.0,
        decay: 0.7 + Math.random() * 0.65,
        size: 3 + Math.random() * 4.5,
        role: Math.random() < 0.75 ? role : 'white'
      });
    }
    fireworks.push(burst);
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: width * (0.15 + Math.random() * 0.75),
      y: height * (0.04 + Math.random() * 0.28),
      vx: -340 - Math.random() * 260,
      vy: 140 + Math.random() * 120,
      life: 1.0,
      len: 75 + Math.random() * 85
    });
  }

  function project(x, y, z, fov, camDist) {
    // Rotate around Y then X
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const depth = camDist + z2;
    if (depth < 40) return null;
    const scale = (fov / depth) * zoom;
    return {
      x: width * 0.5 + x1 * scale,
      y: height * 0.49 + y2 * scale,
      scale: scale,
      z: z2
    };
  }

  function drawBackdrop(t) {
    const trail = Math.max(0, Math.min(0.85, config.particle.trail || 0));
    if (trail > 0.02) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = rgba(config.colors.bgTop, 1 - trail * 0.78);
      ctx.fillRect(0, 0, width, height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, config.colors.bgTop);
      bgGrad.addColorStop(1, config.colors.bgBottom);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Subtle radial ambient glow behind the tree
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cx = width * 0.5;
    const cy = height * 0.52;
    const ambR = Math.min(width, height) * 0.52;
    const amb = ctx.createRadialGradient(cx, cy, 0, cx, cy, ambR);
    amb.addColorStop(0, rgba(config.colors.primary, 0.09));
    amb.addColorStop(0.5, rgba(config.colors.secondary, 0.035));
    amb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = amb;
    ctx.fillRect(0, 0, width, height);

    // Aurora Borealis Curtains
    if (config.scene.aurora) {
      for (let i = 0; i < 2; i++) {
        const ax = width * (0.3 + i * 0.4) + Math.sin(t * 0.25 + i * 2) * width * 0.12;
        const ay = height * (0.22 + i * 0.08) + Math.cos(t * 0.2 + i) * 35;
        const ar = Math.max(width, height) * 0.45;
        const aGrad = ctx.createRadialGradient(ax, ay, 0, ax, ay, ar);
        const col = i === 0 ? config.colors.auroraA : config.colors.auroraB;
        aGrad.addColorStop(0, rgba(col, 0.22));
        aGrad.addColorStop(0.55, rgba(col, 0.07));
        aGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aGrad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // Background distant starfield
    for (let i = 0; i < bgStars.length; i++) {
      const s = bgStars[i];
      const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(s.x * width, s.y * height, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawStarTopper(t, fov, camDist, morphFactor, textFactor) {
    if (!config.scene.starTopper) return;
    const visibility = Math.max(0, 1 - textFactor * 1.4);
    if (visibility <= 0.02) return;
    const apexY = -222 - morphFactor * 120;
    const p = project(0, apexY, 0, fov, camDist);
    if (!p) return;

    const style = (config.scene && config.scene.topperStyle) || 'star';
    const pulse = (0.88 + 0.16 * Math.sin(t * 3.2)) * (1 + beatPulse * 0.28);
    const baseSize = 25 * p.scale * pulse * (0.75 + config.particle.glow * 0.32);

    ctx.save();
    ctx.globalAlpha = visibility;
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);

    // Outer halo bloom
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, baseSize * 2.8);
    halo.addColorStop(0, 'rgba(255,255,255,0.92)');
    halo.addColorStop(0.22, rgba(config.colors.star, 0.68));
    halo.addColorStop(0.55, rgba(config.colors.secondary, 0.22));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, baseSize * 2.8, 0, Math.PI * 2);
    ctx.fill();

    if (style === 'heart') {
      ctx.save();
      ctx.rotate(Math.sin(t * 1.3) * 0.08);
      const hs = baseSize * 0.92;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, hs * 0.85);
      ctx.bezierCurveTo(-hs * 1.35, hs * 0.1, -hs * 1.25, -hs * 0.95, 0, -hs * 0.32);
      ctx.bezierCurveTo(hs * 1.25, -hs * 0.95, hs * 1.35, hs * 0.1, 0, hs * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (style === 'snowflake') {
      ctx.save();
      ctx.rotate(t * 0.35);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.8, baseSize * 0.11);
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -baseSize * 1.15);
        ctx.moveTo(0, -baseSize * 0.62);
        ctx.lineTo(baseSize * 0.3, -baseSize * 0.88);
        ctx.moveTo(0, -baseSize * 0.62);
        ctx.lineTo(-baseSize * 0.3, -baseSize * 0.88);
        ctx.stroke();
      }
      ctx.restore();
    } else if (style === 'crown') {
      ctx.save();
      ctx.rotate(Math.sin(t * 1.1) * 0.06);
      const cw = baseSize * 1.05;
      const ch = baseSize * 0.82;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-cw * 0.78, ch * 0.55);
      ctx.lineTo(-cw * 0.92, -ch * 0.45);
      ctx.lineTo(-cw * 0.36, ch * 0.05);
      ctx.lineTo(0, -ch * 0.78);
      ctx.lineTo(cw * 0.36, ch * 0.05);
      ctx.lineTo(cw * 0.92, -ch * 0.45);
      ctx.lineTo(cw * 0.78, ch * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // Classic 5-point Bethlehem Star + rotating cross flare
      ctx.save();
      ctx.rotate(t * 0.45);
      ctx.fillStyle = rgba(config.colors.star, 0.85);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -baseSize * 1.85);
        ctx.quadraticCurveTo(baseSize * 0.12, -baseSize * 0.12, baseSize * 0.22, 0);
        ctx.quadraticCurveTo(baseSize * 0.12, baseSize * 0.12, 0, baseSize * 1.85);
        ctx.quadraticCurveTo(-baseSize * 0.12, baseSize * 0.12, -baseSize * 0.22, 0);
        ctx.quadraticCurveTo(-baseSize * 0.12, -baseSize * 0.12, 0, -baseSize * 1.85);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.rotate(Math.sin(t * 1.1) * 0.12);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? baseSize * 0.92 : baseSize * 0.38;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const sx = Math.cos(a) * r;
        const sy = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPhotoCards(t, fov, camDist, morphFactor) {
    if (!photoCards.length) return;
    const projected = [];
    for (let i = 0; i < photoCards.length; i++) {
      const card = photoCards[i];
      const img = loadedImages.get(card.src);
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      const orbitA = card.angle + t * 0.22;
      const r = card.radius * (1 + morphFactor * 0.65);
      const x = Math.cos(orbitA) * r;
      const z = Math.sin(orbitA) * r;
      const y = card.y + Math.sin(t * 1.2 + card.phase) * 14;
      const p = project(x, y, z, fov, camDist);
      if (p) projected.push({ p, img, card });
    }
    projected.sort((a, b) => b.p.z - a.p.z);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < projected.length; i++) {
      const item = projected[i];
      const w = 64 * item.p.scale;
      const h = 76 * item.p.scale;
      if (w < 8) continue;
      const alpha = Math.max(0.25, Math.min(0.95, 1 - (item.p.z + 200) / 900));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(item.p.x, item.p.y);
      ctx.rotate(Math.sin(t * 0.8 + item.card.phase) * 0.08);

      // Polaroid white card frame with subtle glow
      ctx.fillStyle = 'rgba(255,252,245,0.95)';
      ctx.shadowColor = rgba(config.colors.secondary, 0.5);
      ctx.shadowBlur = 12;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.shadowBlur = 0;

      const pad = w * 0.08;
      const imgW = w - pad * 2;
      const imgH = w - pad * 2;
      ctx.drawImage(item.img, -imgW / 2, -h / 2 + pad, imgW, imgH);
      ctx.restore();
    }
    ctx.restore();
  }

  function render(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    elapsed += dt;

    const animMode = config.animation.mode || 'rotate';
    const speed = config.animation.speed != null ? config.animation.speed : 1.0;

    // Decay audio-reactive beat pulse
    beatPulse *= Math.pow(0.018, dt);

    // Smooth camera rotation & inertia
    if (!isDragging) {
      if (morphMode === 'text') {
        // Gently face front so 3D particle text is legible with subtle parallax sway
        const normRot = ((rotY + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        const targetFront = Math.sin(elapsed * 0.65) * 0.18;
        rotY = normRot + (targetFront - normRot) * Math.min(1, dt * 3.8);
        velRotY *= Math.pow(0.04, dt);
      } else {
        const autoSpin = animMode === 'vortex' ? 0.55 : 0.24;
        rotY += (autoSpin * speed + velRotY) * dt;
        velRotY *= Math.pow(0.06, dt);
      }
    }
    if (config.animation.cameraSway && !isDragging) {
      targetRotX = morphMode === 'text' ? Math.sin(elapsed * 0.5) * 0.05 : (0.13 + Math.sin(elapsed * 0.45) * 0.09);
    }
    rotX += (targetRotX - rotX) * Math.min(1, dt * 5);
    zoom += (targetZoom - zoom) * Math.min(1, dt * 6);

    // Gather intro easing
    if (gatherProgress < 1) {
      gatherProgress = Math.min(1, gatherProgress + dt * 0.42);
    }
    const easeGather = 1 - Math.pow(1 - gatherProgress, 3);

    // Scatter & Text morph easing
    const targetScatter = morphMode === 'scatter' ? 1 : 0;
    const targetText = morphMode === 'text' ? 1 : 0;
    scatterProgress += (targetScatter - scatterProgress) * Math.min(1, dt * 3.2);
    textMorphProgress += (targetText - textMorphProgress) * Math.min(1, dt * 3.6);
    const morphFactor = Math.max(scatterProgress, 1 - easeGather);
    const textFactor = textMorphProgress;

    const minDim = Math.min(width, height);
    const fov = Math.max(460, minDim * 0.82);
    const camDist = 660;

    drawBackdrop(elapsed);

    const drawList = [];
    const sizeBase = config.particle.size || 1.0;
    const glowMul = config.particle.glow || 1.0;
    const twinkleMul = config.particle.twinkle != null ? config.particle.twinkle : 1.0;

    // 1. Ground Galaxy Ripple
    if (config.scene.groundRipple) {
      for (let i = 0; i < groundParticles.length; i++) {
        const gp = groundParticles[i];
        const a = gp.angle + elapsed * gp.speed * speed;
        const ripple = Math.sin(gp.baseR * 0.045 - elapsed * 2.2) * (7 + beatPulse * 10);
        const r = gp.baseR * (1 + morphFactor * 0.55 + beatPulse * 0.04);
        const p = project(Math.cos(a) * r, gp.y + ripple, Math.sin(a) * r, fov, camDist);
        if (!p) continue;
        const tw = 0.45 + 0.55 * Math.sin(elapsed * 2.4 + gp.phase);
        drawList.push({
          x: p.x, y: p.y, z: p.z,
          r: gp.size * p.scale * sizeBase * (2.2 + beatPulse * 0.6),
          alpha: (0.28 + tw * 0.45) * (1 - morphFactor * 0.55) * (1 - textFactor * 0.72),
          sprite: spriteCache[gp.role + ':glow']
        });
      }
    }

    // 2. Main Tree Particles
    const beatScale = 1 + beatPulse * 0.055;
    const breatheScale = (animMode === 'breathe' ? (1 + Math.sin(elapsed * 2.1 * speed) * 0.085) : 1.0) * beatScale;
    const wavePos = (elapsed * 0.45 * speed) % 1.4 - 0.2;

    for (let i = 0; i < treeParticles.length; i++) {
      const pt = treeParticles[i];
      let px = pt.tx * (1 - morphFactor) + pt.sx * morphFactor;
      let py = pt.ty * (1 - morphFactor) + pt.sy * morphFactor;
      let pz = pt.tz * (1 - morphFactor) + pt.sz * morphFactor;

      if (textFactor > 0.005) {
        px = px * (1 - textFactor) + pt.mx * textFactor;
        py = py * (1 - textFactor) + pt.my * textFactor;
        pz = pz * (1 - textFactor) + pt.mz * textFactor;
      }

      if (morphFactor > 0.01 && textFactor < 0.5) {
        // Gentle cosmic swirl during gather/scatter
        const swirlA = morphFactor * 2.6 * (1 - pt.hNorm * 0.4) * (1 - textFactor);
        const cs = Math.cos(swirlA);
        const sn = Math.sin(swirlA);
        const nx = px * cs - pz * sn;
        const nz = pz * cs + px * sn;
        px = nx;
        pz = nz;
      }

      if (textFactor < 0.6) {
        if (animMode === 'breathe') {
          const localB = 1 + Math.sin(elapsed * 2.1 * speed - pt.hNorm * 3.5) * 0.075;
          px *= localB * breatheScale;
          pz *= localB * breatheScale;
        } else if (beatPulse > 0.01) {
          px *= beatScale;
          pz *= beatScale;
        }
        if (animMode === 'vortex') {
          const twist = Math.sin(elapsed * 1.6 * speed + pt.hNorm * 5) * 0.35 * (1 - textFactor);
          const ct = Math.cos(twist);
          const st = Math.sin(twist);
          const vx = px * ct - pz * st;
          const vz = pz * ct + px * st;
          px = vx;
          pz = vz;
        }
      }

      const p = project(px, py, pz, fov, camDist);
      if (!p) continue;

      let tw = twinkleMul > 0
        ? (0.55 + 0.45 * Math.sin(elapsed * pt.twinkleSpeed * twinkleMul + pt.phase))
        : 0.88;

      let waveBoost = 1.0;
      if (animMode === 'wave') {
        const distWave = Math.abs((1 - pt.hNorm) - wavePos);
        if (distWave < 0.16) {
          waveBoost = 1 + (1 - distWave / 0.16) * 0.95;
        }
      }

      const depthAlpha = Math.max(0.18, Math.min(1, 1.02 - (p.z + 220) / 860));
      const beatGlow = 1 + beatPulse * 0.32;
      drawList.push({
        x: p.x,
        y: p.y,
        z: p.z,
        r: pt.size * p.scale * sizeBase * (1.02 + glowMul * 0.42) * (waveBoost > 1 ? 1.15 : 1) * (1 + beatPulse * 0.18) * (textFactor > 0.5 ? 0.88 : 1),
        alpha: Math.min(0.76, tw * depthAlpha * (0.24 + glowMul * 0.16) * waveBoost * beatGlow * (1 + textFactor * 0.25)),
        sprite: spriteCache[pt.role + ':' + pt.shape] || spriteCache['primary:glow']
      });
    }

    // 3. Spiral Light Ribbon
    if (config.scene.ribbon && textFactor < 0.95) {
      const ribFade = 1 - textFactor;
      for (let i = 0; i < ribbonParticles.length; i++) {
        const rp = ribbonParticles[i];
        const flowOffset = (elapsed * 0.35 * speed) % 1;
        const flowGlow = 0.55 + 0.45 * Math.sin((rp.t - flowOffset) * Math.PI * 10);
        const px = rp.tx * (1 - morphFactor) + rp.sx * morphFactor;
        const py = rp.ty * (1 - morphFactor) + rp.sy * morphFactor;
        const pz = rp.tz * (1 - morphFactor) + rp.sz * morphFactor;
        const p = project(px, py, pz, fov, camDist);
        if (!p) continue;
        drawList.push({
          x: p.x, y: p.y, z: p.z,
          r: rp.size * p.scale * sizeBase * (1.05 + glowMul * 0.35) * (1 + beatPulse * 0.18),
          alpha: Math.min(0.68, (0.26 + flowGlow * 0.32) * (0.65 + glowMul * 0.2)) * ribFade,
          sprite: spriteCache[rp.role + ':glow']
        });
      }
    }

    // 4. Glowing Ornaments
    if (config.scene.ornaments && textFactor < 0.95) {
      const ornFade = 1 - textFactor;
      for (let i = 0; i < ornamentParticles.length; i++) {
        const op = ornamentParticles[i];
        const px = op.tx * (1 - morphFactor) + op.sx * morphFactor;
        const py = op.ty * (1 - morphFactor) + op.sy * morphFactor;
        const pz = op.tz * (1 - morphFactor) + op.sz * morphFactor;
        const p = project(px, py, pz, fov, camDist);
        if (!p) continue;
        const pulse = (0.85 + 0.2 * Math.sin(elapsed * 2.5 + op.phase)) * (1 + beatPulse * 0.2);
        drawList.push({
          x: p.x, y: p.y, z: p.z,
          r: op.size * p.scale * sizeBase * 1.45 * pulse,
          alpha: 0.72 * ornFade,
          sprite: spriteCache[op.role + ':bokeh']
        });
      }
    }

    // 5. 3D Snowfall
    if (config.scene.snow) {
      for (let i = 0; i < snowParticles.length; i++) {
        const sn = snowParticles[i];
        sn.y += sn.vy * dt * (0.6 + speed * 0.4);
        if (sn.y > 410) {
          sn.y = -410;
          sn.x = (Math.random() - 0.5) * 1100;
        }
        const sx = sn.x + Math.sin(elapsed * sn.swayFreq + sn.phase) * sn.swayAmp;
        const p = project(sx, sn.y, sn.z, fov, camDist);
        if (!p) continue;
        drawList.push({
          x: p.x, y: p.y, z: p.z,
          r: sn.size * p.scale * 2.1,
          alpha: Math.max(0.18, Math.min(0.85, 0.85 - (p.z + 350) / 1100)),
          sprite: spriteCache['white:' + sn.shape]
        });
      }
    }

    // Draw all glowing particles with additive blending
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < drawList.length; i++) {
      const d = drawList[i];
      if (!d.sprite || d.r < 0.6 || d.alpha <= 0.01) continue;
      if (d.x < -d.r || d.x > width + d.r || d.y < -d.r || d.y > height + d.r) continue;
      ctx.globalAlpha = d.alpha;
      ctx.drawImage(d.sprite, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
    }
    ctx.restore();

    // 6. Floating Polaroid Memory Cards (if any)
    drawPhotoCards(elapsed, fov, camDist, morphFactor);

    // 7. 3D Star Topper
    drawStarTopper(elapsed, fov, camDist, morphFactor, textFactor);

    // 8. Shooting Stars
    if (config.scene.shootingStars) {
      if (Math.random() < dt * 0.35 && shootingStars.length < 3) {
        spawnShootingStar();
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const st = shootingStars[i];
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.life -= dt * 0.85;
        if (st.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }
        const mag = Math.hypot(st.vx, st.vy);
        const tx = st.x - (st.vx / mag) * st.len * st.life;
        const ty = st.y - (st.vy / mag) * st.len * st.life;
        const grad = ctx.createLinearGradient(st.x, st.y, tx, ty);
        grad.addColorStop(0, 'rgba(255,255,255,' + st.life.toFixed(2) + ')');
        grad.addColorStop(0.35, rgba(config.colors.star, st.life * 0.6));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Interactive Click Fireworks
    if (fireworks.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let b = fireworks.length - 1; b >= 0; b--) {
        const burst = fireworks[b];
        let alive = false;
        for (let i = 0; i < burst.length; i++) {
          const f = burst[i];
          if (f.life <= 0) continue;
          alive = true;
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.vy += 120 * dt;
          f.vx *= Math.pow(0.25, dt);
          f.life -= f.decay * dt;
          if (f.life > 0) {
            const spr = spriteCache[f.role + ':star'] || spriteCache['star:glow'];
            const r = f.size * (0.6 + f.life * 1.4);
            ctx.globalAlpha = Math.max(0, f.life);
            ctx.drawImage(spr, f.x - r, f.y - r, r * 2, r * 2);
          }
        }
        if (!alive) fireworks.splice(b, 1);
      }
      ctx.restore();
    }

    rafId = requestAnimationFrame(render);
  }

  function resize() {
    const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    width = Math.max(1, Math.floor(rect.width || window.innerWidth));
    height = Math.max(1, Math.floor(rect.height || window.innerHeight));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Pointer & Touch Interactions
  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    isDragging = true;
    dragMoved = false;
    dragStartX = lastPointerX = e.clientX;
    dragStartY = lastPointerY = e.clientY;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > 6) {
      dragMoved = true;
    }
    rotY += dx * 0.0075;
    velRotY = dx * 0.03;
    targetRotX = Math.max(-0.55, Math.min(0.68, targetRotX + dy * 0.005));
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  }

  function onPointerUp(e) {
    if (isDragging && !dragMoved) {
      const rect = canvas.getBoundingClientRect();
      spawnFirework(e.clientX - rect.left, e.clientY - rect.top);
    }
    isDragging = false;
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    targetZoom = Math.max(0.55, Math.min(2.1, targetZoom + delta));
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      onPointerDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchDist > 0) {
        targetZoom = Math.max(0.55, Math.min(2.1, targetZoom * (d / pinchDist)));
      }
      pinchDist = d;
    } else if (e.touches.length === 1) {
      onPointerMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }

  function onTouchEnd(e) {
    if (e.touches.length === 0) {
      if (isDragging && !dragMoved && e.changedTouches && e.changedTouches[0]) {
        const rect = canvas.getBoundingClientRect();
        spawnFirework(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
      }
      isDragging = false;
      pinchDist = 0;
    }
  }

  function onDblClick() {
    toggleScatter();
  }

  function updateConfig(nextConfig, options) {
    const prev = config;
    config = JSON.parse(JSON.stringify(nextConfig));
    const opts = options || {};

    const colorsChanged = JSON.stringify(prev.colors) !== JSON.stringify(config.colors);
    const geomChanged =
      prev.particle.count !== config.particle.count ||
      prev.particle.style !== config.particle.style ||
      prev.scene.treeShape !== config.scene.treeShape;
    const photosChanged = JSON.stringify(prev.photos) !== JSON.stringify(config.photos);
    const morphTextChanged = (prev.animation && prev.animation.morphText) !== (config.animation && config.animation.morphText);

    if (colorsChanged || opts.forceSprites) rebuildSprites();
    if (geomChanged || opts.forceGeometry) buildTreeGeometry();
    else {
      if (photosChanged) syncPhotos();
      if (morphTextChanged) buildTextTargets(config.animation && config.animation.morphText);
    }

    if (opts.replayGather || (prev.animation.mode !== 'gather' && config.animation.mode === 'gather')) {
      replayGather();
    }
  }

  function replayGather() {
    morphMode = 'tree';
    scattered = false;
    scatterProgress = 0;
    textMorphProgress = 0;
    gatherProgress = 0;
  }

  function setMorphMode(mode) {
    morphMode = mode === 'text' || mode === 'scatter' ? mode : 'tree';
    scattered = morphMode === 'scatter';
    return morphMode;
  }

  function getMorphMode() {
    return morphMode;
  }

  function toggleScatter(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : (morphMode !== 'scatter');
    setMorphMode(next ? 'scatter' : 'tree');
    return scattered;
  }

  function toggleTextMorph(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : (morphMode !== 'text');
    setMorphMode(next ? 'text' : 'tree');
    return morphMode === 'text';
  }

  function isScattered() {
    return morphMode === 'scatter';
  }

  function pulseBeat(amount) {
    beatPulse = Math.max(beatPulse, Math.min(1.2, amount || 0.75));
  }

  function start() {
    resize();
    rebuildSprites();
    buildTreeGeometry();
    if (config.animation.mode === 'gather') {
      gatherProgress = 0;
    }
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDblClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    lastTime = performance.now();
    rafId = requestAnimationFrame(render);
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('dblclick', onDblClick);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
  }

  return {
    start,
    destroy,
    resize,
    updateConfig,
    replayGather,
    setMorphMode,
    getMorphMode,
    toggleScatter,
    toggleTextMorph,
    isScattered,
    pulseBeat,
    spawnFirework
  };
};
