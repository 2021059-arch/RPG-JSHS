// ==========================================================================
// 전곽: IRON FIST — 60fps 2D Fighting Game Canvas VFX Engine (1600x720 Stage)
// (철권식 전기 히트스파크 · 카운터 번개 · 가드 육각 파장 · 어퍼 런처 기둥 · 바운드 충격파 ·
//  벽 꽝 균열 · 7색 레이저 · 과구리 대포 · 황금 날개 · 위더 스컬 · K.O. 임팩트 플래시)
// ==========================================================================

const FightVFX = (() => {
  const STAGE_W = 1600;
  const STAGE_H = 720;
  const GROUND_Y = 605;

  let canvas = null;
  let ctx = null;
  let currentTheme = 'bg-corridor';

  const ambient = [];
  const particles = [];
  const effects = [];

  const RAINBOW_7 = [
    '#ff2a36', '#ff8c00', '#f5d76e', '#2ecc71', '#00e5ff', '#3b82f6', '#a55eea'
  ];

  const THEME_AMBIENT = {
    'bg-corridor':   { col1: 'rgba(255, 56, 68, 0.50)',  col2: 'rgba(245, 215, 110, 0.38)', vx: 10,  vy: -20, count: 38 },
    'bg-auditorium': { col1: 'rgba(245, 215, 110, 0.55)', col2: 'rgba(255, 243, 196, 0.40)', vx: 6,   vy: -24, count: 42 },
    'bg-cafeteria':  { col1: 'rgba(255, 159, 67, 0.48)',  col2: 'rgba(231, 76, 60, 0.36)',  vx: -8,  vy: -26, count: 34 },
    'bg-studyroom':  { col1: 'rgba(0, 229, 255, 0.52)',   col2: 'rgba(116, 185, 255, 0.36)', vx: 2,   vy: -16, count: 38 },
    'bg-biolab':     { col1: 'rgba(46, 204, 113, 0.52)',  col2: 'rgba(0, 229, 255, 0.38)',   vx: 5,   vy: -22, count: 40 },
    'bg-udon':       { col1: 'rgba(245, 215, 110, 0.55)', col2: 'rgba(255, 42, 54, 0.44)',   vx: -12, vy: -18, count: 40 }
  };

  function bindCanvas(theme = 'bg-corridor') {
    canvas = document.getElementById('fight-fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    currentTheme = theme;
    particles.length = 0;
    effects.length = 0;
    seedAmbient();
  }

  function seedAmbient() {
    ambient.length = 0;
    const cfg = THEME_AMBIENT[currentTheme] || THEME_AMBIENT['bg-corridor'];
    for (let i = 0; i < cfg.count; i++) {
      ambient.push({
        x: Math.random() * STAGE_W,
        y: Math.random() * STAGE_H,
        r: 1.4 + Math.random() * 2.8,
        vx: cfg.vx + (Math.random() - 0.5) * 18,
        vy: cfg.vy * (0.5 + Math.random() * 0.9),
        phase: Math.random() * Math.PI * 2,
        sub: Math.random() < 0.42
      });
    }
  }

  function clearAll() {
    particles.length = 0;
    effects.length = 0;
  }

  // 철권식 전기 번개 볼트 생성기
  function spawnLightningBolt(x, y, radius = 90, color = '#ff2a36', branches = 5) {
    for (let b = 0; b < branches; b++) {
      const baseAng = (Math.PI * 2 * b) / branches + (Math.random() - 0.5) * 0.6;
      const pts = [{ x, y }];
      const segs = 5;
      for (let s = 1; s <= segs; s++) {
        const dist = (radius * s) / segs;
        const jitter = (Math.random() - 0.5) * 26;
        pts.push({
          x: x + Math.cos(baseAng) * dist - Math.sin(baseAng) * jitter,
          y: y + Math.sin(baseAng) * dist + Math.cos(baseAng) * jitter
        });
      }
      effects.push({
        kind: 'lightning',
        pts,
        color,
        age: 0,
        life: 0.16 + Math.random() * 0.08
      });
    }
  }

  function spawnSparks(x, y, count, colors, spdMin, spdMax, sizeMin = 2.5, sizeMax = 6.5, gravity = 420, lifeMax = 0.42) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = spdMin + Math.random() * (spdMax - spdMin);
      particles.push({
        kind: 'spark',
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        gravity,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color: colors[i % colors.length],
        age: 0,
        life: 0.18 + Math.random() * (lifeMax - 0.18)
      });
    }
  }

  // 1. 타격 히트스파크 (약 / 강 / 카운터 / 런처 / 레이지 아츠)
  function spawnHitSpark(x, y, dir = 1, kind = 'light', accentColor = '#ff2a36') {
    const isHeavy = kind === 'heavy' || kind === 'special' || kind === 'rage';
    const isCounter = kind === 'counter';
    const isLauncher = kind === 'launcher';

    const ringMax = kind === 'rage' ? 165 : (isCounter || isLauncher ? 120 : (isHeavy ? 88 : 54));
    const mainCol = isCounter ? '#ff1e38' : (isLauncher ? '#00e5ff' : accentColor);

    effects.push({
      kind: 'ring',
      x, y,
      r0: 10,
      r1: ringMax,
      color: mainCol,
      width: isHeavy || isCounter ? 6 : 3.5,
      age: 0,
      life: 0.24
    });

    effects.push({
      kind: 'starburst',
      x, y,
      len: isHeavy || isCounter ? 86 : 48,
      angle: Math.random() * Math.PI,
      color: '#fff5cc',
      subColor: mainCol,
      age: 0,
      life: 0.18
    });

    if (isHeavy || isCounter || isLauncher) {
      effects.push({
        kind: 'crescent',
        x, y,
        dir,
        radius: kind === 'rage' ? 92 : 62,
        color: mainCol,
        age: 0,
        life: 0.22
      });
      spawnLightningBolt(x, y, kind === 'rage' ? 140 : 95, mainCol, isCounter ? 7 : 4);
    }

    if (isLauncher) {
      effects.push({
        kind: 'pillar',
        x,
        y: GROUND_Y,
        w: 96,
        h: 360,
        color: '#00e5ff',
        age: 0,
        life: 0.30
      });
    }

    spawnSparks(
      x, y,
      kind === 'rage' ? 42 : (isHeavy || isCounter ? 26 : 14),
      ['#ffffff', '#fff3c4', '#f5d76e', mainCol],
      160,
      kind === 'rage' ? 680 : (isHeavy ? 520 : 340),
      2.5,
      isHeavy ? 7 : 4.5,
      460,
      0.42
    );

    if (isCounter || kind === 'rage') {
      effects.push({
        kind: 'flash',
        color: isCounter ? 'rgba(255, 30, 56, 0.20)' : 'rgba(245, 215, 110, 0.24)',
        age: 0,
        life: 0.12
      });
    }
  }

  // 2. 가드 / 저스트 가드(패링) / 가드 크러시 이펙트
  function spawnBlockSpark(x, y, isParry = false, isCrush = false) {
    if (isCrush) {
      effects.push({
        kind: 'ring',
        x, y, r0: 14, r1: 145, color: '#f1c40f', width: 6, age: 0, life: 0.32
      });
      effects.push({
        kind: 'flash',
        color: 'rgba(241, 196, 15, 0.24)', age: 0, life: 0.16
      });
      // 유리 파편 폭발
      for (let i = 0; i < 22; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 150 + Math.random() * 380;
        particles.push({
          kind: 'shard',
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 80,
          gravity: 520,
          rot: Math.random() * 6.28,
          vrot: (Math.random() - 0.5) * 16,
          size: 6 + Math.random() * 9,
          color: i % 2 === 0 ? '#f1c40f' : '#00e5ff',
          age: 0,
          life: 0.52
        });
      }
      return;
    }

    const col = isParry ? '#00e5ff' : '#74b9ff';
    effects.push({
      kind: 'hex_shield',
      x, y,
      r: isParry ? 68 : 48,
      color: col,
      age: 0,
      life: isParry ? 0.28 : 0.20
    });
    spawnSparks(x, y, isParry ? 24 : 12, ['#ffffff', col, '#ffeaa7'], 120, 340, 2, 4.5, 320, 0.28);
  }

  // 3. 바닥 먼지 / 대시 잔상 / 바운드 충격파 / 벽 꽝(Wall Splat)
  function spawnDust(x, y = GROUND_Y, dir = 1, count = 6, color = 'rgba(230, 222, 206, 0.45)') {
    for (let i = 0; i < count; i++) {
      particles.push({
        kind: 'dust',
        x: x + (Math.random() - 0.5) * 22,
        y: y - Math.random() * 10,
        vx: -dir * (35 + Math.random() * 90) + (Math.random() - 0.5) * 30,
        vy: -16 - Math.random() * 36,
        size: 6 + Math.random() * 10,
        color,
        age: 0,
        life: 0.26 + Math.random() * 0.20
      });
    }
  }

  function spawnGroundSlam(x, color = '#f39c12', maxRx = 115) {
    effects.push({
      kind: 'ground_oval',
      x,
      y: GROUND_Y + 4,
      rx: maxRx,
      ry: maxRx * 0.28,
      color,
      age: 0,
      life: 0.34
    });
    spawnDust(x, GROUND_Y, 1, 7);
    spawnDust(x, GROUND_Y, -1, 7);
  }

  function spawnWallSplat(wallX, y) {
    effects.push({
      kind: 'wall_crack',
      x: wallX,
      y,
      dir: wallX < STAGE_W * 0.5 ? 1 : -1,
      age: 0,
      life: 0.48
    });
    spawnLightningBolt(wallX, y, 85, '#ff9f43', 4);
    spawnSparks(wallX, y, 28, ['#fff3c4', '#ff9f43', '#ff4757'], 140, 460, 3, 7, 520, 0.45);
  }

  // 4. 캐릭터 고유 필살기 / 빔 / 포격 연출
  function spawnSignatureBeam(x1, y1, x2, y2, style = 'cannon') {
    if (style === 'rainbow') {
      RAINBOW_7.forEach((col, idx) => {
        const off = (idx - 3) * 5;
        effects.push({
          kind: 'beam',
          x1, y1: y1 + off * 0.4,
          x2, y2: y2 + off,
          color: col,
          width: idx === 3 ? 9 : 5,
          age: 0,
          life: 0.30
        });
      });
    } else if (style === 'sky_wings') {
      for (let i = -2; i <= 2; i++) {
        effects.push({
          kind: 'beam',
          x1: x2 + i * 26 - 40,
          y1: -20,
          x2: x2 + i * 22,
          y2: GROUND_Y + 10,
          color: i % 2 === 0 ? '#f5d76e' : '#fff3c4',
          width: i === 0 ? 16 : 8,
          age: 0,
          life: 0.36
        });
      }
      spawnGroundSlam(x2, '#f5d76e', 130);
    } else if (style === 'cannon' || style === 'nuclear') {
      const big = style === 'nuclear';
      effects.push({
        kind: 'beam',
        x1, y1, x2, y2,
        color: big ? '#fff3c4' : '#ff5252',
        width: big ? 34 : 18,
        age: 0,
        life: big ? 0.42 : 0.26
      });
      effects.push({
        kind: 'ring',
        x: x2, y: y2, r0: 16, r1: big ? 220 : 120,
        color: '#ff4757', width: big ? 9 : 5, age: 0, life: 0.36
      });
    } else if (style === 'claws') {
      const dir = x2 >= x1 ? 1 : -1;
      [-22, 0, 22].forEach(oy => {
        effects.push({
          kind: 'beam',
          x1: x2 - dir * 75, y1: y2 - 52 + oy,
          x2: x2 + dir * 75, y2: y2 + 52 + oy,
          color: '#ff1e38',
          width: 6,
          age: 0,
          life: 0.28
        });
      });
    } else {
      effects.push({
        kind: 'beam',
        x1, y1, x2, y2,
        color: '#00e5ff',
        width: 12,
        age: 0,
        life: 0.26
      });
    }
  }

  function spawnKoExplosion(x, y) {
    effects.push({
      kind: 'flash',
      color: 'rgba(255, 42, 54, 0.38)',
      age: 0,
      life: 0.28
    });
    effects.push({
      kind: 'ring',
      x, y, r0: 20, r1: 380, color: '#fff3c4', width: 10, age: 0, life: 0.52
    });
    effects.push({
      kind: 'ring',
      x, y, r0: 15, r1: 260, color: '#ff2a36', width: 7, age: 0, life: 0.44
    });
    spawnLightningBolt(x, y, 220, '#f5d76e', 8);
    spawnSparks(x, y, 65, ['#ffffff', '#f5d76e', '#ff4757', '#00e5ff'], 180, 780, 3, 9, 360, 0.72);
  }

  // 5. 메인 60fps 렌더링 (장풍 투사체 배열까지 함께 렌더링)
  function updateAndDraw(dt, projectiles = [], debugHitboxes = null) {
    if (!ctx) return;
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);

    // A. 배경 앰비언트 입자
    const cfg = THEME_AMBIENT[currentTheme] || THEME_AMBIENT['bg-corridor'];
    for (const a of ambient) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.phase += dt * 2.5;
      if (a.y < -10) { a.y = STAGE_H + 10; a.x = Math.random() * STAGE_W; }
      if (a.x < -10) a.x = STAGE_W + 10;
      if (a.x > STAGE_W + 10) a.x = -10;

      ctx.save();
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(a.phase);
      ctx.fillStyle = a.sub ? cfg.col2 : cfg.col1;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // B. 실시간 장풍 / 투사체 렌더링
    for (const pr of projectiles) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      const dir = pr.vx >= 0 ? 1 : -1;
      ctx.scale(dir, 1);

      if (pr.visual === 'wither') {
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#0e1726';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.fillRect(-20, -20, 40, 40);
        ctx.strokeRect(-20, -20, 40, 40);
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(-10, -8, 7, 7);
        ctx.fillRect(5, -8, 7, 7);
      } else if (pr.visual === 'wing_spear') {
        ctx.shadowColor = '#f5d76e';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath();
        ctx.moveTo(38, 0);
        ctx.lineTo(-28, -14);
        ctx.lineTo(-14, 0);
        ctx.lineTo(-28, 14);
        ctx.closePath();
        ctx.fill();
      } else if (pr.visual === 'cannon_ball') {
        ctx.shadowColor = '#ff2a36';
        ctx.shadowBlur = 22;
        const grad = ctx.createRadialGradient(4, 0, 4, 0, 0, 28);
        grad.addColorStop(0, '#fff3c4');
        grad.addColorStop(0.55, '#ff4757');
        grad.addColorStop(1, 'rgba(255,42,54,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 검기 / 파동
        ctx.shadowColor = pr.color || '#00e5ff';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = pr.color || '#00e5ff';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(-10, 0, 32, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-8, 0, 32, -Math.PI * 0.32, Math.PI * 0.32);
        ctx.stroke();
      }
      ctx.restore();
    }

    // C. 이펙트 프리미티브
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.age += dt;
      if (e.age >= e.life) {
        effects.splice(i, 1);
        continue;
      }
      const t = e.age / e.life;
      const ease = 1 - Math.pow(1 - t, 3);
      ctx.save();

      if (e.kind === 'flash') {
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = e.color;
        ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      } else if (e.kind === 'ring') {
        const r = e.r0 + (e.r1 - e.r0) * ease;
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = Math.max(1, e.width * (1 - t * 0.65));
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.kind === 'ground_oval') {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 5 * (1 - t * 0.6);
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, e.rx * ease, e.ry * ease, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.kind === 'pillar') {
        const w = e.w * (1 - t * 0.55);
        ctx.globalAlpha = (1 - t) * 0.78;
        const grad = ctx.createLinearGradient(e.x, e.y, e.x, e.y - e.h);
        grad.addColorStop(0, '#fff3c4');
        grad.addColorStop(0.5, e.color);
        grad.addColorStop(1, 'rgba(0,229,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(e.x - w * 0.5, e.y - e.h * ease, w, e.h * ease);
      } else if (e.kind === 'starburst') {
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.globalAlpha = 1 - t;
        const l = e.len * (0.6 + ease * 0.6);
        ctx.strokeStyle = e.subColor;
        ctx.lineWidth = 8 * (1 - t);
        ctx.beginPath();
        ctx.moveTo(-l, 0); ctx.lineTo(l, 0);
        ctx.moveTo(0, -l * 0.75); ctx.lineTo(0, l * 0.75);
        ctx.stroke();
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3 * (1 - t);
        ctx.beginPath();
        ctx.moveTo(-l * 0.8, 0); ctx.lineTo(l * 0.8, 0);
        ctx.moveTo(0, -l * 0.6); ctx.lineTo(0, l * 0.6);
        ctx.stroke();
      } else if (e.kind === 'crescent') {
        ctx.translate(e.x, e.y);
        ctx.scale(e.dir, 1);
        ctx.globalAlpha = 1 - t;
        const r = e.radius * (0.75 + ease * 0.4);
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 12 * (1 - t * 0.6);
        ctx.beginPath();
        ctx.arc(-14, 0, r, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.stroke();
        ctx.strokeStyle = '#fff5cc';
        ctx.lineWidth = 4 * (1 - t * 0.5);
        ctx.beginPath();
        ctx.arc(-10, 0, r, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();
      } else if (e.kind === 'lightning') {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4 * (1 - t * 0.5);
        ctx.beginPath();
        e.pts.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (e.kind === 'hex_shield') {
        ctx.translate(e.x, e.y);
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = e.color;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.14)';
        ctx.lineWidth = 3.5;
        const r = e.r * (0.85 + ease * 0.25);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.kind === 'wall_crack') {
        ctx.translate(e.x, e.y);
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = '#ff9f43';
        ctx.lineWidth = 3;
        for (let c = -2; c <= 2; c++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(e.dir * (38 + Math.abs(c) * 14), c * 28);
          ctx.lineTo(e.dir * (68 + Math.abs(c) * 10), c * 46);
          ctx.stroke();
        }
      } else if (e.kind === 'beam') {
        ctx.globalAlpha = 1 - Math.pow(t, 1.5);
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = e.width * (1 - t * 0.45);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e.x1, e.y1);
        ctx.lineTo(e.x2, e.y2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, e.width * 0.35 * (1 - t * 0.45));
        ctx.stroke();
      }
      ctx.restore();
    }

    // D. 스파크 · 파편 · 먼지 파티클
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      const t = p.age / p.life;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;

      ctx.save();
      ctx.globalAlpha = 1 - t;
      if (p.kind === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.7 + t * 0.65), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'shard') {
        p.rot += p.vrot * dt;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.75, p.size * 0.65);
        ctx.lineTo(-p.size * 0.75, p.size * 0.45);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size * (1 - t * 0.5)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // E. 트레이닝 룸 히트박스/허트박스 디버그 뷰 (활성화 시)
    if (debugHitboxes) {
      debugHitboxes.forEach(box => {
        ctx.save();
        ctx.strokeStyle = box.color;
        ctx.fillStyle = box.fill;
        ctx.lineWidth = 2;
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.restore();
      });
    }
  }

  return {
    STAGE_W,
    STAGE_H,
    GROUND_Y,
    bindCanvas,
    clearAll,
    spawnHitSpark,
    spawnBlockSpark,
    spawnDust,
    spawnGroundSlam,
    spawnWallSplat,
    spawnSignatureBeam,
    spawnKoExplosion,
    updateAndDraw
  };
})();
