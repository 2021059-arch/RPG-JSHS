// ==========================================================================
// 전곽: IRON FIST — 60fps 2D Fighting Game Canvas VFX Engine (1600x720 Stage)
// (철권식 전기 히트스파크 · 카운터 번개 · 가드 육각 파장 · 어퍼 런처 기둥 · 바운드 충격파 ·
//  벽 꽝 균열 · 7색 레이저 · 과구리 대포 · 황금 날개 · 위더 스컬 · K.O. 임팩트 플래시 ·
//  무기 궤적 슬래시 · 만화 집중선 · 임팩트 프레임 · 버스트 · 가드 캔슬 · 대시 잔상 · 레이지 오라)
//
// 성능 원칙: 글로우는 shadowBlur 대신 globalCompositeOperation = 'lighter' (가산 합성)로 처리.
// 파티클 최대 700 / 이펙트 최대 260 (초과 시 가장 오래된 것부터 제거). 품질 'high' | 'low'.
// ==========================================================================

const FightVFX = (() => {
  const STAGE_W = 1600;
  const STAGE_H = 720;
  const GROUND_Y = 605;

  const MAX_PARTICLES = 700;
  const MAX_EFFECTS = 260;
  const TAU = Math.PI * 2;

  let canvas = null;
  let ctx = null;
  let currentTheme = 'bg-corridor';
  let quality = 'high';      // 'high' | 'low'
  let flashEnabled = true;   // 접근성: false면 전체화면 플래시 / 임팩트 프레임 생략
  let clock = 0;

  const vignette = { cur: 0, target: 0, color: 'rgba(255,0,30,1)' };

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

  // ------------------------------------------------------------------------
  // 유틸리티
  // ------------------------------------------------------------------------
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp01 = (v) => (v < 0 ? 0 : (v > 1 ? 1 : v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const isLow = () => quality === 'low';
  const fin = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);

  // 품질에 따른 개수 스케일 (low = 절반)
  function qn(n) {
    n = Math.max(0, Math.round(n));
    return isLow() ? Math.ceil(n * 0.5) : n;
  }

  function pushP(p) {
    if (!(p.life > 0)) p.life = 0.1;
    if (!p.age) p.age = 0;
    particles.push(p);
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
    return p;
  }

  function pushE(e) {
    if (e.age === undefined) e.age = 0;
    if (!(e.life > 0)) e.life = 0.1;
    effects.push(e);
    if (effects.length > MAX_EFFECTS) effects.splice(0, effects.length - MAX_EFFECTS);
    return e;
  }

  function pushFlash(color, life) {
    if (!flashEnabled) return;
    pushE({ kind: 'flash', color, life });
  }

  // 지연 실행 (멀티 스테이지 연출용) — 이펙트 업데이트 루프가 끝난 뒤 실행됨
  function after(delay, fn) {
    pushE({ kind: 'timer', age: -Math.max(0, delay), life: 0.001, fn });
  }

  // ------------------------------------------------------------------------
  // 캔버스 바인딩 / 앰비언트
  // ------------------------------------------------------------------------
  function bindCanvas(theme = 'bg-corridor') {
    if (typeof document === 'undefined' || !document || typeof document.getElementById !== 'function') return;
    canvas = document.getElementById('fight-fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    currentTheme = theme || 'bg-corridor';
    particles.length = 0;
    effects.length = 0;
    seedAmbient();
  }

  function seedAmbient() {
    ambient.length = 0;
    const cfg = THEME_AMBIENT[currentTheme] || THEME_AMBIENT['bg-corridor'];
    const count = isLow() ? Math.ceil(cfg.count * 0.6) : cfg.count;
    for (let i = 0; i < count; i++) {
      const z = rand(0.35, 1); // 깊이 (작을수록 멀리 · 느리게 · 흐리게)
      const spd = 0.45 + z * 0.75;
      ambient.push({
        x: Math.random() * STAGE_W,
        y: Math.random() * STAGE_H,
        z,
        r: (1.2 + Math.random() * 2.6) * (0.55 + z * 0.6),
        vx: (cfg.vx + (Math.random() - 0.5) * 18) * spd,
        vy: cfg.vy * (0.5 + Math.random() * 0.9) * spd,
        phase: Math.random() * TAU,
        sub: Math.random() < 0.42,
        bokeh: false,
        alpha: 0.45 + z * 0.55
      });
    }
    if (!isLow()) {
      for (let i = 0; i < 7; i++) {
        ambient.push({
          x: Math.random() * STAGE_W,
          y: Math.random() * STAGE_H,
          z: 0.2,
          r: rand(12, 30),
          vx: cfg.vx * 0.25 + rand(-5, 5),
          vy: cfg.vy * 0.18,
          phase: Math.random() * TAU,
          sub: Math.random() < 0.5,
          bokeh: true,
          alpha: rand(0.10, 0.2)
        });
      }
    }
  }

  function clearAll() {
    particles.length = 0;
    effects.length = 0;
  }

  // ------------------------------------------------------------------------
  // 설정 API
  // ------------------------------------------------------------------------
  function setQuality(level) {
    const next = level === 'low' ? 'low' : 'high';
    if (next === quality) return;
    quality = next;
    if (ctx) seedAmbient();
  }

  function setFlashEnabled(enabled) {
    flashEnabled = !!enabled;
    if (!flashEnabled) {
      for (let i = effects.length - 1; i >= 0; i--) {
        const k = effects[i].kind;
        if (k === 'flash' || k === 'impact_frame') effects.splice(i, 1);
      }
    }
  }

  function setVignette(strength = 0, color = 'rgba(255,0,30,1)') {
    vignette.target = clamp01(fin(strength, 0));
    if (typeof color === 'string' && color) vignette.color = color;
  }

  function getStats() {
    return { particles: particles.length, effects: effects.length };
  }

  // ------------------------------------------------------------------------
  // 파티클 스포너 (기본 빌딩 블록)
  // ------------------------------------------------------------------------
  // 속도 방향으로 늘어나는 스파크 스트릭. o.dir(±1)이면 그 방향 원뿔로 편향.
  function spawnStreaks(x, y, count, colors, spdMin, spdMax, o = {}) {
    const dir = o.dir || 0;
    const spread = o.spread !== undefined ? o.spread : 0.9;
    const bias = o.bias !== undefined ? o.bias : 0.75;
    for (let i = 0; i < count; i++) {
      let ang;
      if (o.angle !== undefined) ang = o.angle + (Math.random() - 0.5) * 2 * spread;
      else if (dir && Math.random() < bias) ang = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 2 * spread;
      else ang = Math.random() * TAU;
      const spd = rand(spdMin, spdMax);
      pushP({
        kind: o.kind || 'spark',
        x: x + (o.jitter ? rand(-o.jitter, o.jitter) : 0),
        y: y + (o.jitter ? rand(-o.jitter, o.jitter) : 0),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (o.lift !== undefined ? o.lift : 40),
        gravity: o.gravity !== undefined ? o.gravity : 460,
        drag: o.drag !== undefined ? o.drag : 2.2,
        size: rand(o.sizeMin || 2, o.sizeMax || 5),
        maxLen: o.maxLen || 42,
        color: colors[i % colors.length],
        life: rand(o.lifeMin || 0.16, o.lifeMax || 0.42)
      });
    }
  }

  // (구버전 호환) 전방위 스파크
  function spawnSparks(x, y, count, colors, spdMin, spdMax, sizeMin = 2.5, sizeMax = 6.5, gravity = 420, lifeMax = 0.42) {
    spawnStreaks(x, y, count, colors, spdMin, spdMax, {
      sizeMin, sizeMax, gravity, lifeMin: 0.18, lifeMax: Math.max(0.2, lifeMax)
    });
  }

  // 부드러운 가산 글로우 도트
  function spawnGlowDots(x, y, count, colors, spdMin, spdMax, o = {}) {
    for (let i = 0; i < count; i++) {
      const ang = o.angle !== undefined ? o.angle + (Math.random() - 0.5) * 2 * (o.spread || 0.6) : Math.random() * TAU;
      const spd = rand(spdMin, spdMax);
      pushP({
        kind: 'dot',
        x: x + rand(-(o.jitter || 0), o.jitter || 0),
        y: y + rand(-(o.jitter || 0), o.jitter || 0),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd + (o.vy || 0),
        gravity: o.gravity || 0,
        drag: o.drag !== undefined ? o.drag : 3,
        size: rand(o.sizeMin || 2.5, o.sizeMax || 6),
        color: colors[i % colors.length],
        life: rand(o.lifeMin || 0.2, o.lifeMax || 0.45)
      });
    }
  }

  function spawnEmbers(x, y, count, colors, w = 80, h = 40) {
    for (let i = 0; i < count; i++) {
      pushP({
        kind: 'ember',
        x: x + rand(-w * 0.5, w * 0.5),
        y: y - Math.random() * h,
        vx: rand(-25, 25),
        vy: -rand(60, 170),
        gravity: -30,
        drag: 0.6,
        size: rand(1.4, 3.6),
        color: colors[i % colors.length],
        seed: Math.random() * TAU,
        life: rand(0.45, 0.95)
      });
    }
  }

  function spawnDebris(x, y, count, colors, spdMin = 160, spdMax = 420) {
    for (let i = 0; i < count; i++) {
      const ang = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.2;
      const spd = rand(spdMin, spdMax);
      pushP({
        kind: 'shard',
        x: x + rand(-20, 20),
        y: y - 2,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        gravity: 1300,
        rot: Math.random() * TAU,
        vrot: (Math.random() - 0.5) * 18,
        size: rand(3, 7),
        color: colors[i % colors.length],
        floor: GROUND_Y + rand(2, 14),
        life: rand(0.5, 0.85)
      });
    }
  }

  // ------------------------------------------------------------------------
  // 번개 볼트
  // ------------------------------------------------------------------------
  function makeBolt(x, y, ang, radius, segs = 5, jit = 26) {
    const pts = [{ x, y }];
    for (let s = 1; s <= segs; s++) {
      const dist = (radius * s) / segs;
      const jitter = (Math.random() - 0.5) * jit;
      pts.push({
        x: x + Math.cos(ang) * dist - Math.sin(ang) * jitter,
        y: y + Math.sin(ang) * dist + Math.cos(ang) * jitter
      });
    }
    return pts;
  }

  function regenBolt(e) {
    e.pts = makeBolt(e.x, e.y, e.ang, e.radius);
    const m = e.pts[2] || e.pts[e.pts.length - 1];
    e.fork = (Math.random() < 0.7) ? makeBolt(m.x, m.y, e.ang + (Math.random() < 0.5 ? -0.7 : 0.7), e.radius * 0.45, 3, 18) : null;
  }

  // 철권식 전기 번개 볼트 생성기
  function spawnLightningBolt(x, y, radius = 90, color = '#ff2a36', branches = 5) {
    const n = isLow() ? Math.max(2, Math.ceil(branches * 0.6)) : branches;
    for (let b = 0; b < n; b++) {
      const e = {
        kind: 'lightning',
        x, y,
        ang: (TAU * b) / n + (Math.random() - 0.5) * 0.6,
        radius,
        color,
        life: 0.16 + Math.random() * 0.08
      };
      regenBolt(e);
      pushE(e);
    }
  }

  // ------------------------------------------------------------------------
  // 내부: 집중선 (화면 전체 or 국소)
  // ------------------------------------------------------------------------
  function speedLinesInternal(x, y, color, intensity, rOut, life, rInMin, rInMax) {
    if (isLow()) return;
    const I = Math.max(0.2, Math.min(3, fin(intensity, 1)));
    const count = Math.round(18 + 24 * I);
    const lines = [];
    for (let i = 0; i < count; i++) {
      lines.push({
        a: Math.random() * TAU,
        rIn: rand(rInMin, rInMax) / (0.75 + 0.25 * I),
        w: rand(1.5, 6) * (0.7 + 0.3 * I)
      });
    }
    pushE({ kind: 'speed_lines', x, y, color, lines, rOut, life });
  }

  // ------------------------------------------------------------------------
  // 1. 타격 히트스파크 (약 / 강 / 카운터 / 런처 / 레이지 아츠)
  // ------------------------------------------------------------------------
  function spawnHitSpark(x, y, dir = 1, kind = 'light', accentColor = '#ff2a36') {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 120);
    dir = dir < 0 ? -1 : 1;
    const isRage = kind === 'rage';
    const isHeavy = kind === 'heavy' || kind === 'special' || isRage;
    const isCounter = kind === 'counter';
    const isLauncher = kind === 'launcher';
    const big = isHeavy || isCounter || isLauncher;

    const ringMax = isRage ? 165 : (isCounter || isLauncher ? 120 : (isHeavy ? 88 : 54));
    const mainCol = isCounter ? '#ff1e38' : (isLauncher ? '#00e5ff' : (accentColor || '#ff2a36'));

    // 순간 백색 코어 플래시 디스크
    pushE({
      kind: 'core_flash', x, y,
      r0: ringMax * 0.18, r1: ringMax * (big ? 0.78 : 0.62),
      color: mainCol, life: big ? 0.1 : 0.07
    });

    // 레이어드 링
    pushE({ kind: 'ring', x, y, r0: 10, r1: ringMax, color: mainCol, width: big ? 6 : 3.5, life: 0.24 });
    pushE({ kind: 'ring', x, y, r0: 6, r1: ringMax * 0.6, color: '#ffffff', width: big ? 3 : 2, life: 0.14 });
    if (big) {
      pushE({ kind: 'ring', x, y, r0: ringMax * 0.4, r1: ringMax * 1.4, color: mainCol, width: 2.2, life: 0.32, age: -0.03 });
    }

    // 스파이크 스타버스트
    pushE({
      kind: 'starburst', x, y,
      len: isRage ? 120 : (big ? 92 : 50),
      spikes: big ? 10 : 7,
      angle: Math.random() * Math.PI,
      color: '#fff5cc',
      subColor: mainCol,
      life: big ? 0.17 : 0.12
    });

    if (big) {
      pushE({
        kind: 'crescent', x, y, dir,
        radius: isRage ? 92 : 62,
        color: mainCol,
        life: 0.22
      });
      spawnLightningBolt(x, y, isRage ? 140 : 95, mainCol, isCounter ? 7 : 4);
    }

    if (isLauncher) {
      pushE({ kind: 'pillar', x, y: GROUND_Y, w: 96, h: 360, color: '#00e5ff', life: 0.30 });
    }

    // 방향성 스파크 스트릭 (속도 방향으로 늘어남)
    spawnStreaks(
      x, y,
      qn(isRage ? 40 : (big ? 26 : 14)),
      ['#ffffff', '#fff3c4', '#f5d76e', mainCol],
      200,
      isRage ? 900 : (big ? 720 : 480),
      {
        dir, spread: big ? 0.85 : 0.65, bias: 0.8,
        sizeMin: 1.8, sizeMax: big ? 5.5 : 3.8,
        gravity: 520, drag: 3.2, maxLen: big ? 56 : 36,
        lifeMin: 0.14, lifeMax: big ? 0.42 : 0.3
      }
    );
    // 잔광 도트
    spawnGlowDots(x, y, qn(big ? 10 : 5), [mainCol, '#fff3c4'], 40, big ? 260 : 160, {
      sizeMin: 2, sizeMax: big ? 6 : 4, gravity: 180, lifeMin: 0.2, lifeMax: 0.5
    });

    // 강타 / 카운터 / 레이지: 국소 집중선
    if (isHeavy || isCounter || isRage) {
      speedLinesInternal(x, y, isCounter ? '#ffd6dc' : '#ffffff', isRage ? 1.3 : 0.8, ringMax * 3.2, 0.16, ringMax * 0.9, ringMax * 1.6);
    }

    if (isCounter || isRage) {
      pushFlash(isCounter ? 'rgba(255, 30, 56, 0.20)' : 'rgba(245, 215, 110, 0.24)', 0.12);
    }
  }

  // ------------------------------------------------------------------------
  // 2. 가드 / 저스트 가드(패링) / 가드 크러시 이펙트
  // ------------------------------------------------------------------------
  function spawnBlockSpark(x, y, isParry = false, isCrush = false) {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 120);
    if (isCrush) {
      pushE({ kind: 'core_flash', x, y, r0: 20, r1: 120, color: '#f1c40f', life: 0.12 });
      pushE({ kind: 'ring', x, y, r0: 14, r1: 145, color: '#f1c40f', width: 6, life: 0.32 });
      pushE({ kind: 'ring', x, y, r0: 10, r1: 90, color: '#ffffff', width: 3, life: 0.18 });
      pushE({ kind: 'hex_shield', x, y, r: 70, color: '#f1c40f', rot: Math.random(), shatter: true, life: 0.22 });
      pushFlash('rgba(241, 196, 15, 0.24)', 0.16);
      spawnLightningBolt(x, y, 110, '#f1c40f', 5);
      // 유리 파편 폭발
      const n = qn(22);
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * TAU;
        const spd = 150 + Math.random() * 380;
        pushP({
          kind: 'shard', x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 80,
          gravity: 520,
          rot: Math.random() * TAU,
          vrot: (Math.random() - 0.5) * 16,
          size: 6 + Math.random() * 9,
          color: i % 2 === 0 ? '#f1c40f' : '#00e5ff',
          glint: true,
          life: 0.52
        });
      }
      spawnStreaks(x, y, qn(18), ['#ffffff', '#f1c40f', '#00e5ff'], 220, 620, { sizeMin: 2, sizeMax: 4.5, gravity: 420, lifeMax: 0.38 });
      return;
    }

    const col = isParry ? '#00e5ff' : '#74b9ff';
    pushE({
      kind: 'hex_shield', x, y,
      r: isParry ? 68 : 48,
      color: col,
      rot: Math.random() * 0.5,
      life: isParry ? 0.28 : 0.20
    });
    pushE({ kind: 'ring', x, y, r0: 8, r1: isParry ? 96 : 60, color: col, width: isParry ? 4 : 2.5, life: isParry ? 0.24 : 0.16 });
    pushE({ kind: 'core_flash', x, y, r0: 8, r1: isParry ? 70 : 34, color: col, life: isParry ? 0.1 : 0.06 });

    if (isParry) {
      pushE({ kind: 'diamond', x, y, s0: 14, s1: 64, color: '#00e5ff', life: 0.22 });
      const lines = [];
      for (let i = 0; i < 4; i++) lines.push({ oy: rand(-30, 30), len: rand(90, 180), w: rand(1.5, 3.5) });
      pushE({ kind: 'hstreaks', x, y, color: '#bff8ff', lines, life: 0.2 });
    }

    spawnStreaks(x, y, qn(isParry ? 24 : 12), ['#ffffff', col, '#ffeaa7'], 160, isParry ? 520 : 380, {
      sizeMin: 1.6, sizeMax: 3.6, gravity: 360, drag: 3, lifeMin: 0.12, lifeMax: 0.3, maxLen: 30
    });
  }

  // ------------------------------------------------------------------------
  // 3. 바닥 먼지 / 대시 잔상 / 바운드 충격파 / 벽 꽝(Wall Splat)
  // ------------------------------------------------------------------------
  function spawnDust(x, y = GROUND_Y, dir = 1, count = 6, color = 'rgba(230, 222, 206, 0.45)') {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y);
    const n = qn(count);
    for (let i = 0; i < n; i++) {
      pushP({
        kind: 'dust',
        x: x + (Math.random() - 0.5) * 22,
        y: y - Math.random() * 10,
        vx: -dir * (35 + Math.random() * 90) + (Math.random() - 0.5) * 30,
        vy: -16 - Math.random() * 36,
        drag: 1.6,
        size: 6 + Math.random() * 10,
        color,
        life: 0.26 + Math.random() * 0.20
      });
    }
  }

  function makeGroundCracks(x, maxRx) {
    const cracks = [];
    const per = isLow() ? 2 : 3;
    for (const s of [-1, 1]) {
      for (let c = 0; c < per; c++) {
        const pts = [{ x: x + s * rand(4, 12), y: GROUND_Y + 2 }];
        const segs = 5;
        const len = maxRx * rand(0.75, 1.35);
        let px = pts[0].x;
        for (let k = 1; k <= segs; k++) {
          px += s * (len / segs) * rand(0.7, 1.25);
          pts.push({ x: px, y: GROUND_Y + 2 + c * k * 2.4 + rand(-2.5, 2.5) });
        }
        cracks.push(pts);
      }
    }
    return cracks;
  }

  function spawnGroundSlam(x, color = '#f39c12', maxRx = 115) {
    x = fin(x, STAGE_W * 0.5);
    maxRx = Math.max(20, fin(maxRx, 115));
    pushE({
      kind: 'ground_oval', x, y: GROUND_Y + 4,
      rx: maxRx, ry: maxRx * 0.28,
      color, life: 0.34
    });
    pushE({
      kind: 'ground_oval', x, y: GROUND_Y + 4,
      rx: maxRx * 1.45, ry: maxRx * 0.36,
      color, life: 0.46, age: -0.04, thin: true
    });
    pushE({ kind: 'core_flash', x, y: GROUND_Y - 6, r0: 10, r1: maxRx * 0.55, color, life: 0.1 });
    spawnDust(x, GROUND_Y, 1, 7);
    spawnDust(x, GROUND_Y, -1, 7);
    spawnDebris(x, GROUND_Y, qn(maxRx >= 120 ? 12 : 6), ['#8d7b68', '#5c4d3f', '#c9b79c', color]);
    spawnStreaks(x, GROUND_Y - 4, qn(10), ['#fff3c4', color], 200, 520, {
      angle: -Math.PI * 0.5, spread: 1.1, gravity: 900, sizeMin: 1.5, sizeMax: 3.5, lifeMax: 0.36
    });
    if (maxRx >= 120) {
      pushE({ kind: 'ground_crack', x, cracks: makeGroundCracks(x, maxRx * 1.2), color, life: 0.75 });
      pushE({ kind: 'pillar', x, y: GROUND_Y, w: maxRx * 0.7, h: 200, color, life: 0.22 });
    }
  }

  function spawnWallSplat(wallX, y) {
    wallX = fin(wallX, 0); y = fin(y, GROUND_Y - 150);
    const dir = wallX < STAGE_W * 0.5 ? 1 : -1;
    const branches = [];
    const nb = isLow() ? 5 : 8;
    for (let b = 0; b < nb; b++) {
      const ang = (-Math.PI * 0.5) + (Math.PI * b) / (nb - 1) + rand(-0.12, 0.12);
      const pts = [{ x: 0, y: 0 }];
      let px = 0, py = 0;
      const segs = 4;
      const len = rand(60, 120);
      for (let s = 1; s <= segs; s++) {
        px += Math.cos(ang) * (len / segs) * dir * 0.55 + rand(-4, 4);
        py += Math.sin(ang) * (len / segs) + rand(-6, 6);
        pts.push({ x: px, y: py });
      }
      branches.push(pts);
    }
    pushE({ kind: 'wall_crack', x: wallX, y, dir, branches, life: 0.55 });
    pushE({ kind: 'core_flash', x: wallX + dir * 6, y, r0: 12, r1: 110, color: '#ff9f43', life: 0.12 });
    spawnLightningBolt(wallX, y, 85, '#ff9f43', 4);
    spawnStreaks(wallX, y, qn(28), ['#fff3c4', '#ff9f43', '#ff4757'], 180, 560, {
      angle: dir > 0 ? 0 : Math.PI, spread: 1.3, sizeMin: 2, sizeMax: 5, gravity: 560, lifeMax: 0.45
    });
    spawnDebris(wallX + dir * 8, y + 20, qn(8), ['#6d5d4b', '#a89077', '#ff9f43'], 120, 320);
  }

  // ------------------------------------------------------------------------
  // 4. 캐릭터 고유 필살기 / 빔 / 포격 연출
  // ------------------------------------------------------------------------
  function spawnSignatureBeam(x1, y1, x2, y2, style = 'cannon') {
    x1 = fin(x1); y1 = fin(y1); x2 = fin(x2); y2 = fin(y2);
    if (style === 'rainbow') {
      RAINBOW_7.forEach((col, idx) => {
        const off = (idx - 3) * 5;
        pushE({
          kind: 'beam',
          x1, y1: y1 + off * 0.4,
          x2, y2: y2 + off,
          color: col,
          width: idx === 3 ? 9 : 5,
          halo: idx === 3,
          life: 0.30
        });
      });
      pushE({ kind: 'core_flash', x: x1, y: y1, r0: 8, r1: 60, color: '#ffffff', life: 0.12 });
      pushE({ kind: 'core_flash', x: x2, y: y2, r0: 10, r1: 90, color: '#a55eea', life: 0.16 });
      spawnGlowDots(x2, y2, qn(16), RAINBOW_7, 60, 300, { sizeMin: 2, sizeMax: 5 });
    } else if (style === 'sky_wings') {
      for (let i = -2; i <= 2; i++) {
        pushE({
          kind: 'beam',
          x1: x2 + i * 26 - 40,
          y1: -20,
          x2: x2 + i * 22,
          y2: GROUND_Y + 10,
          color: i % 2 === 0 ? '#f5d76e' : '#fff3c4',
          width: i === 0 ? 16 : 8,
          halo: i === 0,
          life: 0.36
        });
      }
      spawnGroundSlam(x2, '#f5d76e', 130);
      spawnEmbers(x2, GROUND_Y, qn(18), ['#fff3c4', '#f5d76e'], 160, 60);
    } else if (style === 'cannon' || style === 'nuclear') {
      const big = style === 'nuclear';
      pushE({
        kind: 'beam',
        x1, y1, x2, y2,
        color: big ? '#fff3c4' : '#ff5252',
        width: big ? 34 : 18,
        halo: true,
        life: big ? 0.42 : 0.26
      });
      pushE({
        kind: 'ring',
        x: x2, y: y2, r0: 16, r1: big ? 220 : 120,
        color: '#ff4757', width: big ? 9 : 5, life: 0.36
      });
      pushE({ kind: 'core_flash', x: x1, y: y1, r0: 10, r1: big ? 110 : 60, color: '#ff9f43', life: 0.12 });
      pushE({ kind: 'core_flash', x: x2, y: y2, r0: 16, r1: big ? 200 : 100, color: '#ff4757', life: 0.18 });
      spawnStreaks(x2, y2, qn(big ? 34 : 18), ['#ffffff', '#fff3c4', '#ff9f43', '#ff4757'], 220, big ? 820 : 560, {
        sizeMin: 2, sizeMax: 5.5, gravity: 520, lifeMax: 0.5
      });
      if (big) {
        pushE({ kind: 'ring', x: x2, y: y2, r0: 30, r1: 340, color: '#fff3c4', width: 6, life: 0.5, age: -0.06 });
        pushFlash('rgba(255, 243, 196, 0.22)', 0.16);
      }
    } else if (style === 'claws') {
      const dir = x2 >= x1 ? 1 : -1;
      [-22, 0, 22].forEach((oy, k) => {
        pushE({
          kind: 'beam',
          x1: x2 - dir * 75, y1: y2 - 52 + oy,
          x2: x2 + dir * 75, y2: y2 + 52 + oy,
          color: '#ff1e38',
          width: 6,
          life: 0.28,
          age: -k * 0.025
        });
      });
      spawnStreaks(x2, y2, qn(14), ['#ffffff', '#ff1e38'], 160, 460, { dir, spread: 0.9, sizeMin: 1.5, sizeMax: 3.5, lifeMax: 0.3 });
    } else {
      pushE({
        kind: 'beam',
        x1, y1, x2, y2,
        color: '#00e5ff',
        width: 12,
        halo: true,
        life: 0.26
      });
      pushE({ kind: 'core_flash', x: x2, y: y2, r0: 10, r1: 80, color: '#00e5ff', life: 0.14 });
    }
  }

  function spawnKoExplosion(x, y) {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 120);
    // Stage 1 — 순간 임팩트
    spawnImpactFrame(1.4);
    pushFlash('rgba(255, 42, 54, 0.38)', 0.28);
    pushE({ kind: 'core_flash', x, y, r0: 30, r1: 280, color: '#fff3c4', life: 0.18 });
    pushE({ kind: 'ring', x, y, r0: 20, r1: 380, color: '#fff3c4', width: 10, life: 0.52 });
    pushE({ kind: 'ring', x, y, r0: 15, r1: 260, color: '#ff2a36', width: 7, life: 0.44, age: -0.04 });
    pushE({ kind: 'ring', x, y, r0: 10, r1: 180, color: '#ffffff', width: 4, life: 0.22 });
    pushE({ kind: 'starburst', x, y, len: 220, spikes: 14, angle: Math.random() * Math.PI, color: '#ffffff', subColor: '#ff2a36', life: 0.24 });
    spawnLightningBolt(x, y, 240, '#f5d76e', 10);
    spawnStreaks(x, y, qn(70), ['#ffffff', '#f5d76e', '#ff4757', '#00e5ff'], 240, 1100, {
      sizeMin: 2.5, sizeMax: 7, gravity: 380, drag: 1.8, maxLen: 70, lifeMin: 0.25, lifeMax: 0.8
    });
    spawnGlowDots(x, y, qn(24), ['#fff3c4', '#ff4757', '#f5d76e'], 60, 420, { sizeMin: 3, sizeMax: 9, gravity: 120, lifeMax: 0.8 });
    speedLinesInternal(x, y, '#ffffff', 1.8, 1200, 0.4, 220, 380);

    // Stage 2 — 2차 폭발 파동
    after(0.1, () => {
      pushE({ kind: 'ring', x, y, r0: 40, r1: 560, color: '#f5d76e', width: 5, life: 0.7 });
      pushE({ kind: 'core_flash', x, y, r0: 20, r1: 180, color: '#ff4757', life: 0.16 });
      spawnLightningBolt(x, y, 180, '#ff2a36', 6);
      spawnStreaks(x, y, qn(40), ['#ffffff', '#ff9f43', '#ff2a36'], 200, 760, { sizeMin: 2, sizeMax: 6, gravity: 420, lifeMax: 0.7 });
      spawnEmbers(x, y + 60, qn(26), ['#ff2a36', '#ff9f43', '#fff3c4'], 220, 160);
    });

    // Stage 3 — 지면 충격 + 잔불
    after(0.24, () => {
      spawnGroundSlam(x, '#ff2a36', 170);
      spawnEmbers(x, GROUND_Y, qn(20), ['#ff9f43', '#f5d76e'], 320, 30);
    });
  }

  // ------------------------------------------------------------------------
  // 5. 신규 연출 API
  // ------------------------------------------------------------------------
  // 무기 궤적 슬래시 아크
  function spawnSlashArc(x, y, dir, color = '#ffffff', radius = 110, kind = 'slash') {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 120);
    dir = dir < 0 ? -1 : 1;
    radius = Math.max(20, fin(radius, 110));
    color = color || '#ffffff';

    if (kind === 'pierce') {
      pushE({ kind: 'thrust', x, y, dir, color, radius, life: 0.18 });
      spawnStreaks(x + dir * radius * 0.9, y, qn(6), ['#ffffff', color], 260, 560, {
        dir, spread: 0.25, bias: 1, gravity: 0, lift: 0, drag: 5, sizeMin: 1.2, sizeMax: 2.6, lifeMax: 0.18, maxLen: 48
      });
      return;
    }

    if (kind === 'blunt') {
      pushE({
        kind: 'slash_arc', x, y, dir, color,
        r: radius * 0.72, a0: -1.0, a1: 0.8, maxW: radius * 0.42, squash: 0.9,
        life: 0.18
      });
      const px = x + dir * radius * 0.78;
      pushE({ kind: 'ring', x: px, y, r0: 6, r1: radius * 0.55, color, width: 4, life: 0.18 });
      pushE({ kind: 'core_flash', x: px, y, r0: 6, r1: radius * 0.35, color, life: 0.08 });
      for (let i = 0; i < qn(5); i++) {
        const a = Math.random() * TAU;
        const s = rand(40, 120);
        pushP({
          kind: 'dust', x: px, y,
          vx: Math.cos(a) * s + dir * 40, vy: Math.sin(a) * s * 0.6,
          drag: 3, size: rand(5, 10), color: 'rgba(255,255,255,0.28)', life: rand(0.2, 0.32)
        });
      }
      return;
    }

    if (kind === 'ego') {
      pushE({
        kind: 'slash_arc', x, y, dir, color: '#f5d76e',
        r: radius * 1.15, a0: -2.2, a1: 1.2, maxW: radius * 0.26, squash: 0.8,
        life: 0.24
      });
      pushE({
        kind: 'slash_arc', x, y, dir, color,
        r: radius * 0.9, a0: 1.3, a1: -1.9, maxW: radius * 0.22, squash: 0.72,
        life: 0.24, age: -0.035
      });
      pushE({ kind: 'core_flash', x: x + dir * radius * 0.6, y, r0: 10, r1: radius * 0.5, color: '#f5d76e', life: 0.1 });
      spawnGlowDots(x + dir * radius * 0.7, y, qn(12), ['#fff3c4', '#f5d76e', color], 60, 240, {
        angle: dir > 0 ? 0 : Math.PI, spread: 1.2, jitter: radius * 0.4, sizeMin: 2, sizeMax: 4.5, lifeMax: 0.4
      });
      return;
    }

    // 기본 'slash' — 넓고 얇은 초승달
    pushE({
      kind: 'slash_arc', x, y, dir, color,
      r: radius, a0: -1.85, a1: 1.05, maxW: radius * 0.18, squash: 0.8,
      life: 0.18
    });
  }

  // 만화 집중선 (화면 바깥에서 (x,y) 방향으로 수렴)
  function spawnSpeedLines(x, y, color = '#ffffff', intensity = 1) {
    x = fin(x, STAGE_W * 0.5); y = fin(y, STAGE_H * 0.5);
    speedLinesInternal(x, y, color || '#ffffff', intensity, 1150, 0.25, 160, 320);
  }

  // 애니메 임팩트 프레임 (초단기 고대비 전체화면 플래시)
  function spawnImpactFrame(intensity = 1) {
    if (!flashEnabled) return;
    const I = Math.max(0.2, Math.min(2, fin(intensity, 1)));
    pushE({ kind: 'impact_frame', intensity: I, life: 0.07 + 0.03 * Math.min(1, I) });
  }

  // 콤보 브레이커 버스트
  function spawnBurstWave(x, y, color = '#00e5ff') {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 120);
    color = color || '#00e5ff';
    pushE({ kind: 'core_flash', x, y, r0: 30, r1: 210, color, life: 0.16 });
    pushE({ kind: 'ring', x, y, r0: 30, r1: 460, color, width: 16, life: 0.5 });
    pushE({ kind: 'ring', x, y, r0: 20, r1: 330, color: '#ffffff', width: 8, life: 0.42, age: -0.06 });
    pushE({ kind: 'ring', x, y, r0: 10, r1: 220, color, width: 4, life: 0.25 });
    pushE({ kind: 'hex_shield', x, y, r: 120, color, rot: 0, life: 0.3 });
    pushFlash('rgba(200, 250, 255, 0.22)', 0.14);

    const nh = qn(18);
    for (let i = 0; i < nh; i++) {
      const a = Math.random() * TAU;
      const s = rand(220, 620);
      pushP({
        kind: 'hex', x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60,
        gravity: 200, drag: 2.2,
        rot: Math.random() * TAU, vrot: (Math.random() - 0.5) * 12,
        size: rand(6, 14), color: i % 3 === 0 ? '#ffffff' : color,
        life: rand(0.35, 0.55)
      });
    }
    const nu = qn(32);
    for (let i = 0; i < nu; i++) {
      pushP({
        kind: 'spark',
        x: x + rand(-60, 60), y: y + rand(-30, 50),
        vx: rand(-160, 160), vy: -rand(320, 760),
        gravity: 620, drag: 1.2,
        size: rand(1.8, 4.2), maxLen: 50,
        color: pick(['#ffffff', color, '#bff8ff']),
        life: rand(0.3, 0.55)
      });
    }
    speedLinesInternal(x, y, '#e6fdff', 1.2, 1150, 0.3, 200, 340);
  }

  // 가드 캔슬 (마름모 플래시 + 수평 스트릭)
  function spawnGuardCancel(x, y, color = '#00e5ff') {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 120);
    color = color || '#00e5ff';
    pushE({ kind: 'diamond', x, y, s0: 18, s1: 92, color, life: 0.3 });
    pushE({ kind: 'diamond', x, y, s0: 8, s1: 54, color: '#ffffff', life: 0.16, thin: true });
    pushE({ kind: 'core_flash', x, y, r0: 10, r1: 80, color, life: 0.09 });
    const lines = [];
    const n = isLow() ? 4 : 7;
    for (let i = 0; i < n; i++) lines.push({ oy: rand(-46, 46), len: rand(120, 300), w: rand(1.5, 4) });
    pushE({ kind: 'hstreaks', x, y, color, lines, life: 0.3 });
    spawnStreaks(x, y, qn(12), ['#ffffff', color], 220, 520, {
      angle: 0, spread: 0.18, gravity: 0, lift: 0, drag: 4, sizeMin: 1.4, sizeMax: 3, lifeMax: 0.25, maxLen: 50
    });
    spawnStreaks(x, y, qn(12), ['#ffffff', color], 220, 520, {
      angle: Math.PI, spread: 0.18, gravity: 0, lift: 0, drag: 4, sizeMin: 1.4, sizeMax: 3, lifeMax: 0.25, maxLen: 50
    });
  }

  // 대시 잔상 스트릭 (y = 가슴 높이)
  function spawnDashTrail(x, y, dir, color = 'rgba(0,229,255,0.6)') {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y - 100);
    dir = dir < 0 ? -1 : 1;
    const lines = [];
    const n = 4 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) {
      lines.push({ oy: rand(-75, 60), len: rand(70, 150), off: rand(10, 50), w: rand(1.8, 4.5) });
    }
    pushE({ kind: 'dash_streaks', x, y, dir, color: color || 'rgba(0,229,255,0.6)', lines, life: 0.2 });
  }

  // 레이지 오라 — 매 프레임 호출 (x,y = 발 위치)
  function emitRageAura(x, y, color = '#ff2a36') {
    if (!isFinite(x) || !isFinite(y)) return;
    let n = 0;
    const p1 = isLow() ? 0.28 : 0.55;
    if (Math.random() < p1) n++;
    if (!isLow() && Math.random() < 0.18) n++;
    const col = color || '#ff2a36';
    for (let i = 0; i < n; i++) {
      const big = Math.random() < 0.08;
      pushP({
        kind: 'ember',
        x: x + rand(-48, 48),
        y: y - Math.random() * 180,
        vx: rand(-20, 20),
        vy: -rand(70, 170),
        gravity: -40,
        drag: 0.8,
        size: big ? rand(3.5, 5.5) : rand(1.3, 3.2),
        color: Math.random() < 0.6 ? col : (Math.random() < 0.6 ? '#ff9f43' : '#fff3c4'),
        seed: Math.random() * TAU,
        life: rand(0.45, 0.9)
      });
    }
  }

  // 점프 착지 먼지
  function spawnLandingPuff(x, y = GROUND_Y) {
    x = fin(x, STAGE_W * 0.5); y = fin(y, GROUND_Y);
    const n = qn(5);
    for (const s of [-1, 1]) {
      for (let i = 0; i < n; i++) {
        pushP({
          kind: 'dust',
          x: x + s * rand(4, 18),
          y: y - rand(0, 6),
          vx: s * rand(60, 170),
          vy: -rand(8, 34),
          drag: 3.2,
          size: rand(4, 8),
          color: 'rgba(230, 222, 206, 0.4)',
          life: rand(0.22, 0.36)
        });
      }
    }
    pushE({ kind: 'ground_oval', x, y: y + 3, rx: 54, ry: 11, color: 'rgba(240, 232, 214, 0.75)', thin: true, life: 0.22 });
  }

  // ------------------------------------------------------------------------
  // 6. 렌더링 헬퍼
  // ------------------------------------------------------------------------
  function starPath(n, ro, ri) {
    ctx.beginPath();
    for (let k = 0; k < n * 2; k++) {
      const r = (k % 2 === 0) ? ro * (k % 4 === 0 ? 1 : 0.6) : ri;
      const a = (k * Math.PI) / n;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function hexPath(r) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function diamondPath(w, h) {
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(w, 0);
    ctx.lineTo(0, h);
    ctx.lineTo(-w, 0);
    ctx.closePath();
  }

  // 꼬리→머리로 가늘어지는 초승달 띠 (머리쪽 굵게, 양끝 뾰족)
  function crescentPath(r, tail, head, maxW, squash) {
    const N = isLow() ? 10 : 18;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const a = tail + (head - tail) * u;
      const w = maxW * Math.sin(Math.PI * Math.pow(u, 1.8));
      const rr = r + w * 0.5;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr * squash;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    for (let i = N; i >= 0; i--) {
      const u = i / N;
      const a = tail + (head - tail) * u;
      const w = maxW * Math.sin(Math.PI * Math.pow(u, 1.8));
      const rr = r - w * 0.5;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * squash);
    }
    ctx.closePath();
  }

  function strokePolyline(pts) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y); else ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }

  function projectileColor(pr) {
    if (pr.visual === 'wither') return '#00e5ff';
    if (pr.visual === 'wing_spear') return '#f5d76e';
    if (pr.visual === 'cannon_ball') return '#ff5a3c';
    return pr.color || '#00e5ff';
  }

  // ------------------------------------------------------------------------
  // 7. 업데이트 (ctx 없이도 동작)
  // ------------------------------------------------------------------------
  function updateAmbient(dt) {
    for (const a of ambient) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.phase += dt * 2.5;
      const m = a.r + 10;
      if (a.y < -m) { a.y = STAGE_H + m; a.x = Math.random() * STAGE_W; }
      if (a.y > STAGE_H + m) a.y = -m;
      if (a.x < -m) a.x = STAGE_W + m;
      if (a.x > STAGE_W + m) a.x = -m;
    }
  }

  function emitProjectileTrails(projectiles, dt) {
    if (!(dt > 0)) return;
    const rate = isLow() ? 32 : 70;
    for (const pr of projectiles) {
      if (!pr || !isFinite(pr.x) || !isFinite(pr.y)) continue;
      const vx = fin(pr.vx, 0);
      const dir = vx >= 0 ? 1 : -1;
      const col = projectileColor(pr);
      const want = rate * dt;
      let n = Math.floor(want) + (Math.random() < want - Math.floor(want) ? 1 : 0);
      if (n > 6) n = 6;
      const isCannon = pr.visual === 'cannon_ball';
      for (let i = 0; i < n; i++) {
        pushP({
          kind: 'dot',
          x: pr.x - dir * rand(8, 24) + rand(-4, 4),
          y: pr.y + rand(-10, 10) * (isCannon ? 1.4 : 1),
          vx: -vx * rand(0.05, 0.18) + rand(-20, 20),
          vy: rand(-30, 30),
          drag: 3,
          size: rand(3, isCannon ? 9 : 7),
          color: Math.random() < 0.25 ? '#ffffff' : col,
          life: rand(0.2, 0.38)
        });
      }
      // 연기 / 그을음
      if ((isCannon || pr.visual === 'wither') && Math.random() < dt * 14) {
        pushP({
          kind: 'dust',
          x: pr.x - dir * rand(14, 30),
          y: pr.y + rand(-8, 8),
          vx: -vx * 0.08 + rand(-15, 15),
          vy: -rand(10, 40),
          drag: 1.5,
          size: rand(8, 14),
          color: isCannon ? 'rgba(70, 60, 60, 0.35)' : 'rgba(14, 23, 38, 0.45)',
          life: rand(0.35, 0.6)
        });
      }
    }
  }

  function updateEffects(dt) {
    const fired = [];
    let w = 0;
    for (let i = 0; i < effects.length; i++) {
      const e = effects[i];
      e.age += dt;
      if (e.kind === 'timer') {
        if (e.age >= 0) { if (typeof e.fn === 'function') fired.push(e.fn); continue; }
        effects[w++] = e;
        continue;
      }
      if (e.age >= e.life) continue;
      effects[w++] = e;
    }
    effects.length = w;
    for (const fn of fired) {
      try { fn(); } catch (_) { /* ignore */ }
    }
  }

  function updateParticles(dt) {
    let w = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) continue;
      if (dt > 0) {
        if (p.drag) {
          const k = Math.max(0, 1 - p.drag * dt);
          p.vx *= k; p.vy *= k;
        }
        if (p.gravity) p.vy += p.gravity * dt;
        if (p.kind === 'ember') p.vx += Math.sin(p.age * 7 + p.seed) * 40 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.floor !== undefined && p.y > p.floor) {
          p.y = p.floor;
          p.vy = -Math.abs(p.vy) * 0.32;
          p.vx *= 0.6;
          if (p.vrot) p.vrot *= 0.5;
        }
        if (p.vrot) p.rot += p.vrot * dt;
      }
      particles[w++] = p;
    }
    particles.length = w;
  }

  // ------------------------------------------------------------------------
  // 8. 드로잉
  // ------------------------------------------------------------------------
  function drawAmbient() {
    const cfg = THEME_AMBIENT[currentTheme] || THEME_AMBIENT['bg-corridor'];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const a of ambient) {
      const tw = 0.6 + 0.4 * Math.sin(a.phase);
      const col = a.sub ? cfg.col2 : cfg.col1;
      if (a.bokeh) {
        ctx.globalAlpha = a.alpha * (0.7 + 0.3 * tw);
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r);
        g.addColorStop(0, col);
        g.addColorStop(0.6, col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
      } else {
        ctx.globalAlpha = (0.12 + 0.3 * tw) * a.alpha;
        ctx.fillStyle = col;
      }
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawProjectiles(projectiles) {
    for (const pr of projectiles) {
      if (!pr || !isFinite(pr.x) || !isFinite(pr.y)) continue;
      const dir = fin(pr.vx, 0) >= 0 ? 1 : -1;
      const col = projectileColor(pr);
      const pulse = 1 + 0.1 * Math.sin(clock * 32 + pr.x * 0.013);

      ctx.save();
      ctx.translate(pr.x, pr.y);

      // 가산 글로우 헤일로
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55;
      const haloR = (pr.visual === 'cannon_ball' ? 58 : 48) * pulse;
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, haloR);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, haloR, 0, TAU);
      ctx.fill();
      // 진행 반대 방향으로 늘어진 꼬리 글로우
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(-dir * 30, 0, 42, 10 * pulse, 0, 0, TAU);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.scale(dir, 1);

      if (pr.visual === 'wither') {
        ctx.fillStyle = '#0e1726';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.fillRect(-20, -20, 40, 40);
        ctx.strokeRect(-20, -20, 40, 40);
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#00e5ff';
        ctx.globalAlpha = 0.85 + 0.15 * Math.sin(clock * 40);
        ctx.fillRect(-10, -8, 7, 7);
        ctx.fillRect(5, -8, 7, 7);
        ctx.globalAlpha = 0.3;
        ctx.fillRect(-13, -11, 13, 13);
        ctx.fillRect(2, -11, 13, 13);
      } else if (pr.visual === 'wing_spear') {
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath();
        ctx.moveTo(38, 0);
        ctx.lineTo(-28, -14);
        ctx.lineTo(-14, 0);
        ctx.lineTo(-28, 14);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(36, 0);
        ctx.lineTo(-20, 0);
        ctx.stroke();
      } else if (pr.visual === 'cannon_ball') {
        const grad = ctx.createRadialGradient(4, 0, 4, 0, 0, 28);
        grad.addColorStop(0, '#fff3c4');
        grad.addColorStop(0.55, '#ff4757');
        grad.addColorStop(1, 'rgba(255,42,54,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.6 + 0.4 * Math.random();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(5, 0, 8 * pulse, 0, TAU);
        ctx.fill();
      } else {
        // 검기 / 파동
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(-10, 0, 32, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-8, 0, 32, -Math.PI * 0.32, Math.PI * 0.32);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawEffect(e) {
    const t = clamp01(e.age / e.life);
    const ease = easeOut(t);
    const k = e.kind;
    ctx.save();

    if (k === 'ring') {
      ctx.globalCompositeOperation = 'lighter';
      const r = Math.max(0.5, e.r0 + (e.r1 - e.r0) * ease);
      const a = 1 - t;
      const lw = Math.max(1, e.width * (1 - t * 0.65));
      ctx.strokeStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, TAU);
      if (!isLow()) {
        ctx.globalAlpha = a * 0.22;
        ctx.lineWidth = lw * 2.8;
        ctx.stroke();
      }
      ctx.globalAlpha = a;
      ctx.lineWidth = lw;
      ctx.stroke();
    } else if (k === 'core_flash') {
      ctx.globalCompositeOperation = 'lighter';
      const r = Math.max(1, e.r0 + (e.r1 - e.r0) * ease);
      ctx.globalAlpha = (1 - t) * (1 - t);
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.3, '#ffffff');
      g.addColorStop(0.62, e.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, TAU);
      ctx.fill();
    } else if (k === 'starburst') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(e.x, e.y);
      const rot = e.angle + t * 0.5;
      ctx.rotate(rot);
      const a = 1 - t;
      const L = e.len * (0.55 + ease * 0.6);
      const n = e.spikes || 8;
      ctx.globalAlpha = a;
      starPath(n, L, L * 0.15);
      ctx.fillStyle = e.subColor;
      ctx.fill();
      starPath(n, L * 0.6, L * 0.09);
      ctx.fillStyle = e.color;
      ctx.fill();
      // 아나모픽 플레어
      ctx.rotate(-rot);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.8, 2.6 * (1 - t));
      ctx.beginPath();
      ctx.moveTo(-L * 1.7, 0);
      ctx.lineTo(L * 1.7, 0);
      ctx.stroke();
    } else if (k === 'crescent') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(e.x, e.y);
      ctx.scale(e.dir, 1);
      const a = 1 - t;
      const r = e.radius * (0.75 + ease * 0.4);
      ctx.strokeStyle = e.color;
      ctx.beginPath();
      ctx.arc(-14, 0, r, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.globalAlpha = a * 0.3;
      ctx.lineWidth = 26 * (1 - t * 0.6);
      ctx.stroke();
      ctx.globalAlpha = a;
      ctx.lineWidth = 12 * (1 - t * 0.6);
      ctx.stroke();
      ctx.strokeStyle = '#fff5cc';
      ctx.lineWidth = 4 * (1 - t * 0.5);
      ctx.beginPath();
      ctx.arc(-10, 0, r, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
    } else if (k === 'lightning') {
      if (Math.random() < 0.35) regenBolt(e); // 깜빡이는 전류
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const a = (1 - t) * (0.75 + 0.25 * Math.random());
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = a * 0.3;
      ctx.lineWidth = 9 * (1 - t * 0.5);
      strokePolyline(e.pts);
      ctx.globalAlpha = a;
      ctx.lineWidth = 3.5 * (1 - t * 0.5);
      strokePolyline(e.pts);
      if (e.fork) {
        ctx.lineWidth = 2;
        strokePolyline(e.fork);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      strokePolyline(e.pts);
    } else if (k === 'ground_oval') {
      ctx.globalCompositeOperation = 'lighter';
      const a = 1 - t;
      ctx.strokeStyle = e.color;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, Math.max(0.5, e.rx * ease), Math.max(0.5, e.ry * ease), 0, 0, TAU);
      if (e.thin) {
        ctx.globalAlpha = a * 0.7;
        ctx.lineWidth = 2.2 * (1 - t * 0.5);
        ctx.stroke();
      } else {
        ctx.globalAlpha = a * 0.25;
        ctx.lineWidth = 14 * (1 - t * 0.6);
        ctx.stroke();
        ctx.globalAlpha = a;
        ctx.lineWidth = 5 * (1 - t * 0.6);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, Math.max(0.5, e.rx * ease * 0.62), Math.max(0.5, e.ry * ease * 0.62), 0, 0, TAU);
        ctx.stroke();
      }
    } else if (k === 'pillar') {
      ctx.globalCompositeOperation = 'lighter';
      const w = e.w * (1 - t * 0.55);
      const h = e.h * ease;
      ctx.globalAlpha = (1 - t) * 0.78;
      const grad = ctx.createLinearGradient(e.x, e.y, e.x, e.y - e.h);
      grad.addColorStop(0, '#fff3c4');
      grad.addColorStop(0.5, e.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(e.x - w * 0.5, e.y - h, w, h);
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.fillRect(e.x - w * 0.14, e.y - h, w * 0.28, h);
    } else if (k === 'hex_shield') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(e.x, e.y);
      ctx.rotate((e.rot || 0) + t * 0.6);
      const a = 1 - t;
      const r = e.r * (0.85 + ease * 0.25);
      hexPath(r);
      ctx.globalAlpha = a * 0.22;
      ctx.fillStyle = e.color;
      ctx.fill();
      ctx.globalAlpha = a;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      hexPath(r * 0.62);
      ctx.stroke();
      if (e.shatter) {
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const ang = (Math.PI / 3) * s + 0.3;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.stroke();
      }
    } else if (k === 'wall_crack') {
      ctx.translate(e.x, e.y);
      const reveal = Math.min(1, t / 0.18);
      const a = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const branches = e.branches || [];
      // 어두운 균열
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = 'rgba(30, 14, 6, 0.9)';
      ctx.lineWidth = 4;
      for (const pts of branches) {
        const n = Math.max(2, Math.ceil(pts.length * reveal));
        strokePolyline(pts.slice(0, n));
      }
      // 발광 코어
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a * (1 - t);
      ctx.strokeStyle = '#ff9f43';
      ctx.lineWidth = 2;
      for (const pts of branches) {
        const n = Math.max(2, Math.ceil(pts.length * reveal));
        strokePolyline(pts.slice(0, n));
      }
    } else if (k === 'ground_crack') {
      const reveal = Math.min(1, t / 0.15);
      const a = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = a * 0.75;
      ctx.strokeStyle = 'rgba(20, 10, 5, 0.9)';
      ctx.lineWidth = 3.5;
      for (const pts of e.cracks) {
        const n = Math.max(2, Math.ceil(pts.length * reveal));
        strokePolyline(pts.slice(0, n));
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a * Math.max(0, 1 - t * 1.6);
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 1.6;
      for (const pts of e.cracks) {
        const n = Math.max(2, Math.ceil(pts.length * reveal));
        strokePolyline(pts.slice(0, n));
      }
    } else if (k === 'beam') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const a = 1 - Math.pow(t, 1.5);
      const flick = 0.82 + Math.random() * 0.36;
      const w = Math.max(1, e.width * (1 - t * 0.45) * flick);
      ctx.strokeStyle = e.color;
      ctx.beginPath();
      ctx.moveTo(e.x1, e.y1);
      ctx.lineTo(e.x2, e.y2);
      if (!isLow()) {
        ctx.globalAlpha = a * (e.halo ? 0.28 : 0.18);
        ctx.lineWidth = w * 3.2;
        ctx.stroke();
      }
      ctx.globalAlpha = a;
      ctx.lineWidth = w;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, w * 0.36);
      ctx.stroke();
      if (e.halo) {
        ctx.fillStyle = e.color;
        ctx.globalAlpha = a * 0.4;
        ctx.beginPath();
        ctx.arc(e.x2, e.y2, w * 1.7, 0, TAU);
        ctx.arc(e.x1, e.y1, w * 1.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = a * 0.8;
        ctx.beginPath();
        ctx.arc(e.x2, e.y2, w * 0.6, 0, TAU);
        ctx.fill();
      }
    } else if (k === 'speed_lines') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (1 - t) * 0.85;
      ctx.fillStyle = e.color;
      const shrink = 1.15 - 0.35 * ease;
      ctx.beginPath();
      for (const l of e.lines) {
        const c = Math.cos(l.a), s = Math.sin(l.a);
        const rIn = l.rIn * shrink;
        const ox = e.x + c * e.rOut, oy = e.y + s * e.rOut;
        const ix = e.x + c * rIn, iy = e.y + s * rIn;
        const hw = l.w;
        ctx.moveTo(ox - s * hw, oy + c * hw);
        ctx.lineTo(ix, iy);
        ctx.lineTo(ox + s * hw, oy - c * hw);
      }
      ctx.closePath();
      ctx.fill();
    } else if (k === 'slash_arc') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(e.x, e.y);
      ctx.scale(e.dir, 1);
      const span = e.a1 - e.a0;
      const head = e.a0 + span * easeOut(Math.min(1, t / 0.4));
      const tail = e.a0 + span * Math.max(0, (t - 0.25) / 0.75);
      if (Math.abs(head - tail) > 0.02) {
        const a = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
        ctx.fillStyle = e.color;
        if (!isLow()) {
          ctx.globalAlpha = a * 0.3;
          crescentPath(e.r, tail, head, e.maxW * 2.1, e.squash);
          ctx.fill();
        }
        ctx.globalAlpha = a;
        crescentPath(e.r, tail, head, e.maxW, e.squash);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = a * 0.9;
        crescentPath(e.r + e.maxW * 0.12, tail + (head - tail) * 0.35, head, e.maxW * 0.42, e.squash);
        ctx.fill();
      }
    } else if (k === 'thrust') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(e.x, e.y);
      ctx.scale(e.dir, 1);
      const r = e.radius;
      const ex = easeOut(Math.min(1, t / 0.35));
      const a = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;
      const tip = r * (0.4 + 1.3 * ex);
      const base = r * 0.05 + r * 0.6 * Math.max(0, (t - 0.3) / 0.7);
      const hw = r * 0.13 * (1 - t * 0.5);
      ctx.fillStyle = e.color;
      if (!isLow()) {
        ctx.globalAlpha = a * 0.3;
        ctx.beginPath();
        ctx.moveTo(base, -hw * 2);
        ctx.lineTo(tip + r * 0.15, 0);
        ctx.lineTo(base, hw * 2);
        ctx.quadraticCurveTo(base - r * 0.2, 0, base, -hw * 2);
        ctx.fill();
      }
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(base, -hw);
      ctx.lineTo(tip, 0);
      ctx.lineTo(base, hw);
      ctx.quadraticCurveTo(base - r * 0.12, 0, base, -hw);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = a * 0.95;
      ctx.beginPath();
      ctx.moveTo(base + r * 0.1, -hw * 0.35);
      ctx.lineTo(tip - r * 0.04, 0);
      ctx.lineTo(base + r * 0.1, hw * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = a * 0.8;
      ctx.beginPath();
      ctx.moveTo(base + r * 0.2, -hw * 1.9);
      ctx.lineTo(tip * 0.8, -hw * 1.1);
      ctx.moveTo(base + r * 0.2, hw * 1.9);
      ctx.lineTo(tip * 0.8, hw * 1.1);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.8, 2.5 * (1 - t));
      ctx.beginPath();
      ctx.ellipse(tip, 0, Math.max(0.5, hw * 0.7 * (1 + ex)), Math.max(0.5, hw * 2.2 * (1 + ex * 0.6)), 0, 0, TAU);
      ctx.stroke();
    } else if (k === 'diamond') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(e.x, e.y);
      const s = Math.max(1, e.s0 + (e.s1 - e.s0) * ease);
      const a = 1 - t;
      diamondPath(s, s * 1.4);
      if (!e.thin) {
        ctx.globalAlpha = a * 0.22;
        ctx.fillStyle = e.color;
        ctx.fill();
      }
      ctx.globalAlpha = a;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = (e.thin ? 2 : 5) * (1 - t) + 1;
      ctx.stroke();
      if (!e.thin && t < 0.5) {
        diamondPath(s * 0.5, s * 0.7);
        ctx.globalAlpha = 1 - t * 2;
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    } else if (k === 'hstreaks') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = 1 - t;
      for (const l of e.lines) {
        const half = l.len * (0.3 + ease * 0.7) * 0.5;
        ctx.lineWidth = Math.max(0.6, l.w * (1 - t));
        ctx.beginPath();
        ctx.moveTo(e.x - half, e.y + l.oy);
        ctx.lineTo(e.x + half, e.y + l.oy);
        ctx.stroke();
      }
    } else if (k === 'dash_streaks') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = 1 - t;
      for (let i = 0; i < e.lines.length; i++) {
        const l = e.lines[i];
        const x0 = e.x - e.dir * (l.off + 60 * ease);
        const x1 = x0 - e.dir * l.len * (1 - t * 0.6);
        ctx.lineWidth = Math.max(0.6, l.w * (1 - t * 0.5));
        ctx.beginPath();
        ctx.moveTo(x0, e.y + l.oy);
        ctx.lineTo(x1, e.y + l.oy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawOverlay(e) {
    if (!flashEnabled) return;
    const t = clamp01(e.age / e.life);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    if (e.kind === 'flash') {
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = e.color;
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    } else if (e.kind === 'impact_frame') {
      const I = e.intensity || 1;
      if (t < 0.55) {
        ctx.globalAlpha = Math.min(0.78, 0.4 + 0.25 * I) * (1 - (t / 0.55) * 0.3);
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.globalAlpha = Math.min(0.45, 0.22 * I);
        ctx.fillStyle = '#05010a';
      }
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    // Pass 1: 일반 합성 (먼지 · 파편)
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const t = p.age / p.life;
      if (p.kind === 'dust') {
        ctx.globalAlpha = (1 - t) * (1 - t * 0.3);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.7 + t * 0.65), 0, TAU);
        ctx.fill();
      } else if (p.kind === 'shard') {
        ctx.globalAlpha = 1 - t;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.75, p.size * 0.65);
        ctx.lineTo(-p.size * 0.75, p.size * 0.45);
        ctx.closePath();
        ctx.fill();
        if (p.glint && Math.sin((p.rot || 0) * 3) > 0.6) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Pass 2: 가산 합성 (스파크 · 글로우 · 불씨 · 육각 파편)
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const t = p.age / p.life;
      const k = p.kind;
      if (k === 'spark') {
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
        const len = Math.min(p.maxLen || 42, sp * 0.035) * (1 - t * 0.4) + p.size;
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.8, p.size * 0.6 * (1 - t * 0.6));
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.vx / sp) * len, p.y - (p.vy / sp) * len);
        ctx.stroke();
      } else if (k === 'dot') {
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.size * (1 - t * 0.6)), 0, TAU);
        ctx.fill();
      } else if (k === 'ember') {
        const fl = 0.55 + 0.45 * Math.sin(p.age * 38 + p.seed);
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        ctx.globalAlpha = Math.max(0, fade * fl);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.size * (1 - t * 0.5)), 0, TAU);
        ctx.fill();
        if (p.size > 3.2) {
          ctx.globalAlpha *= 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.4, 0, TAU);
          ctx.fill();
        }
      } else if (k === 'hex') {
        ctx.globalAlpha = 1 - t;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        hexPath(p.size * (1 - t * 0.4));
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawVignette() {
    if (vignette.cur <= 0.003) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = Math.min(1, vignette.cur);
    const cx = STAGE_W * 0.5, cy = STAGE_H * 0.5;
    const g = ctx.createRadialGradient(cx, cy, 230, cx, cy, 900);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.35, 'rgba(0,0,0,0)');
    g.addColorStop(1, vignette.color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    ctx.restore();
  }

  // ------------------------------------------------------------------------
  // 9. 메인 60fps 루프 (장풍 투사체 배열까지 함께 렌더링)
  // ------------------------------------------------------------------------
  function updateAndDraw(dt, projectiles = [], debugHitboxes = null) {
    dt = fin(dt, 0);
    if (dt < 0) dt = 0;
    if (dt > 0.1) dt = 0.1; // 탭 복귀 등 큰 프레임 간격 방지
    clock += dt;
    const projs = Array.isArray(projectiles) ? projectiles : [];

    // --- 시뮬레이션 (ctx 유무와 무관) ---
    vignette.cur += (vignette.target - vignette.cur) * (1 - Math.exp(-dt * 7));
    updateAmbient(dt);
    emitProjectileTrails(projs, dt);
    updateEffects(dt);
    updateParticles(dt);

    if (!ctx) return;

    // --- 렌더 ---
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);

    // A. 배경 앰비언트 입자 (깊이감 + 보케)
    drawAmbient();

    // B. 실시간 장풍 / 투사체 렌더링
    drawProjectiles(projs);

    // C. 이펙트 프리미티브
    for (let i = 0; i < effects.length; i++) {
      const e = effects[i];
      if (e.kind === 'timer' || e.age < 0 || e.kind === 'flash' || e.kind === 'impact_frame') continue;
      drawEffect(e);
    }

    // D. 스파크 · 파편 · 먼지 파티클
    drawParticles();

    // E. 전체화면 오버레이 (플래시 · 임팩트 프레임)
    if (flashEnabled) {
      for (let i = 0; i < effects.length; i++) {
        const e = effects[i];
        if ((e.kind === 'flash' || e.kind === 'impact_frame') && e.age >= 0) drawOverlay(e);
      }
    }

    // F. 비네트 (저체력 맥동 등)
    drawVignette();

    // G. 트레이닝 룸 히트박스/허트박스 디버그 뷰 (활성화 시)
    if (Array.isArray(debugHitboxes)) {
      debugHitboxes.forEach(box => {
        if (!box) return;
        ctx.save();
        ctx.strokeStyle = box.color;
        ctx.fillStyle = box.fill;
        ctx.lineWidth = 2;
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.restore();
      });
    }
    ctx.restore();
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
    updateAndDraw,
    // --- 신규 ---
    spawnSlashArc,
    spawnSpeedLines,
    spawnImpactFrame,
    spawnBurstWave,
    spawnGuardCancel,
    spawnDashTrail,
    emitRageAura,
    spawnLandingPuff,
    setVignette,
    setQuality,
    setFlashEnabled,
    getStats,
    getQuality: () => quality,
    isFlashEnabled: () => flashEnabled
  };
})();
