// ==========================================================================
// 전곽: THE BEST — Procedural Web Audio Synthesizer & Dynamic BGM Engine
// (림버스 컴퍼니 / 라이브러리 오브 루이나 스타일 타격·합·진동폭발 SFX & 3채널 프로시저럴 BGM)
//
// 신호 흐름:  [SFX voices] → sfxGain ┐
//             [BGM voices] → bgmGain ┴→ masterGain → DynamicsCompressor(리미터) → destination
// ==========================================================================

const SoundFX = (() => {
  let ctx = null;
  let masterGain = null;
  let sfxGain = null;
  let bgmGain = null;
  let limiter = null;
  let noiseBuf = null;

  let sfxEnabled = true;
  let bgmEnabled = true;
  let voiceEnabled = true;
  let currentBgmMode = null; // 'title' | 'lobby' | 'normal' | 'boss' | null
  let bgmStep = 0;
  let bgmIntervalId = null;

  // 사용자 볼륨 (0..1) — AudioContext 생성 전에도 저장되고 init 시 적용
  const volumes = { master: 1, sfx: 1, bgm: 0.8 };
  const MASTER_HEADROOM = 0.82; // 기존 마스터 레벨 유지용 내부 스케일

  const clampVol = (v, d) => {
    const n = Number(v);
    if (!isFinite(n)) return d;
    return n < 0 ? 0 : (n > 1 ? 1 : n);
  };

  function hasWindow() {
    return typeof window !== 'undefined' && window;
  }

  function init() {
    if (!ctx) {
      const w = hasWindow();
      const AC = w ? (w.AudioContext || w.webkitAudioContext) : null;
      if (AC) {
        try {
          ctx = new AC();
          masterGain = ctx.createGain();
          sfxGain = ctx.createGain();
          bgmGain = ctx.createGain();
          masterGain.gain.value = volumes.master * MASTER_HEADROOM;
          sfxGain.gain.value = volumes.sfx;
          bgmGain.gain.value = volumes.bgm;

          sfxGain.connect(masterGain);
          bgmGain.connect(masterGain);

          if (typeof ctx.createDynamicsCompressor === 'function') {
            limiter = ctx.createDynamicsCompressor();
            try {
              limiter.threshold.value = -12;
              limiter.knee.value = 10;
              limiter.ratio.value = 8;
              limiter.attack.value = 0.003;
              limiter.release.value = 0.2;
            } catch (_) { /* ignore */ }
            masterGain.connect(limiter);
            limiter.connect(ctx.destination);
          } else {
            masterGain.connect(ctx.destination);
          }
        } catch (_) {
          ctx = null;
          masterGain = sfxGain = bgmGain = limiter = null;
        }
      }
    }
    if (ctx && ctx.state === 'suspended') {
      try { ctx.resume().catch(() => {}); } catch (_) { /* ignore */ }
    }
  }

  function outNode(bus = 'sfx') {
    if (bus === 'bgm' && bgmGain) return bgmGain;
    if (bus !== 'bgm' && sfxGain) return sfxGain;
    return masterGain || (ctx && ctx.destination);
  }

  // 버스별 재생 가능 여부 (SFX는 init 시도, BGM은 running 상태 필요)
  function canPlay(bus) {
    if (bus === 'bgm') {
      return bgmEnabled && sfxEnabled && !!ctx && ctx.state === 'running';
    }
    if (!sfxEnabled) return false;
    init();
    return !!ctx;
  }

  function setParam(param, value) {
    if (!param) return;
    try {
      const now = ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.setTargetAtTime(value, now, 0.015);
    } catch (_) {
      try { param.value = value; } catch (__) { /* ignore */ }
    }
  }

  function applyVolumes() {
    if (!ctx) return;
    if (masterGain) setParam(masterGain.gain, volumes.master * MASTER_HEADROOM);
    if (sfxGain) setParam(sfxGain.gain, volumes.sfx);
    if (bgmGain) setParam(bgmGain.gain, volumes.bgm);
  }

  function setMasterVolume(v) { volumes.master = clampVol(v, volumes.master); applyVolumes(); return volumes.master; }
  function setSfxVolume(v) { volumes.sfx = clampVol(v, volumes.sfx); applyVolumes(); return volumes.sfx; }
  function setBgmVolume(v) { volumes.bgm = clampVol(v, volumes.bgm); applyVolumes(); return volumes.bgm; }
  function getVolumes() { return { master: volumes.master, sfx: volumes.sfx, bgm: volumes.bgm }; }
  function setVoiceEnabled(on) {
    voiceEnabled = !!on;
    if (!voiceEnabled) {
      const w = hasWindow();
      try { if (w && w.speechSynthesis) w.speechSynthesis.cancel(); } catch (_) { /* ignore */ }
    }
    return voiceEnabled;
  }
  function isVoiceEnabled() { return voiceEnabled; }

  function toggle() {
    sfxEnabled = !sfxEnabled;
    if (!sfxEnabled) {
      bgmEnabled = false;
      stopBgm();
    } else {
      bgmEnabled = true;
      if (currentBgmMode) {
        const mode = currentBgmMode;
        currentBgmMode = null;
        playBgm(mode);
      }
    }
    return sfxEnabled;
  }

  function toggleBgm() {
    init();
    bgmEnabled = !bgmEnabled;
    if (!bgmEnabled) {
      if (bgmIntervalId) {
        clearInterval(bgmIntervalId);
        bgmIntervalId = null;
      }
    } else {
      const targetMode = currentBgmMode || 'lobby';
      currentBgmMode = null;
      playBgm(targetMode);
    }
    return bgmEnabled;
  }

  // ------------------------------------------------------------------------
  // 보이스 프리미티브
  // ------------------------------------------------------------------------
  function playTone(freq, type = 'sine', duration = 0.15, vol = 0.15, slideTo = null, delaySec = 0, bus = 'sfx') {
    if (!canPlay(bus)) return;
    try {
      const now = ctx.currentTime + delaySec;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), now);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
      osc.connect(gain);
      gain.connect(outNode(bus));
      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (_) { /* ignore */ }
  }

  // 필터 · 어택 · 홀드 · 디튠을 지원하는 범용 보이스 (브라스/패드/그로울용)
  function voice(o) {
    const bus = o.bus || 'sfx';
    if (!canPlay(bus)) return;
    try {
      const now = ctx.currentTime + (o.delay || 0);
      const dur = Math.max(0.03, o.dur || 0.2);
      const atk = Math.min(dur * 0.8, o.attack || 0.008);
      const vol = o.vol || 0.1;
      const osc = ctx.createOscillator();
      osc.type = o.type || 'sawtooth';
      osc.frequency.setValueAtTime(Math.max(20, o.freq || 440), now);
      if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slideTo), now + dur);
      if (o.detune && osc.detune) osc.detune.setValueAtTime(o.detune, now);

      let node = osc;
      if (o.cutoff) {
        const f = ctx.createBiquadFilter();
        f.type = o.filterType || 'lowpass';
        f.frequency.setValueAtTime(o.cutoff, now);
        if (o.cutoffTo) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.cutoffTo), now + (o.cutoffTime || dur));
        f.Q.setValueAtTime(o.q || 1, now);
        osc.connect(f);
        node = f;
      }
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + atk);
      if (o.hold) {
        const hold = Math.min(o.hold, Math.max(0, dur - atk - 0.02));
        g.gain.setValueAtTime(vol, now + atk + hold);
      }
      g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
      node.connect(g);
      g.connect(outNode(bus));
      osc.start(now);
      osc.stop(now + dur + 0.03);
    } catch (_) { /* ignore */ }
  }

  // 브라스풍 신스 (디튠 쏘우 2개 + 열리는 로우패스)
  function brass(freq, dur = 0.5, vol = 0.06, delay = 0, bus = 'sfx') {
    const common = {
      freq, type: 'sawtooth', dur, vol, delay, bus,
      attack: 0.04, hold: dur * 0.45,
      cutoff: 380, cutoffTo: 2600, cutoffTime: 0.09, q: 1.6
    };
    voice(Object.assign({}, common, { detune: -7 }));
    voice(Object.assign({}, common, { detune: 7, vol: vol * 0.8 }));
  }

  function playBgmNote(freq, type = 'triangle', duration = 0.25, vol = 0.05, cutoff = 1400, delaySec = 0, attack = 0.015) {
    if (!canPlay('bgm')) return;
    try {
      const now = ctx.currentTime + delaySec;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(24, freq), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.setValueAtTime(1.8, now);

      const atk = Math.min(duration * 0.7, Math.max(0.005, attack));
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + atk);
      gain.gain.exponentialRampToValueAtTime(0.0006, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(outNode('bgm'));

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (_) { /* ignore */ }
  }

  // 2초짜리 화이트 노이즈 버퍼를 캐시해 랜덤 오프셋으로 재사용 (매번 버퍼 생성 X → CPU 절약)
  function getNoiseBuffer() {
    if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
    const len = Math.max(1, Math.floor(ctx.sampleRate * 2));
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function noiseSource(now, duration) {
    const src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer();
    if (duration >= 1.9) {
      src.loop = true;
      src.start(now);
    } else {
      src.start(now, Math.random() * (2 - duration - 0.05));
    }
    src.stop(now + duration + 0.02);
    return src;
  }

  function playNoise(duration = 0.15, vol = 0.2, filterFreq = 1200, filterType = 'bandpass', delaySec = 0, isBgm = false) {
    const bus = isBgm ? 'bgm' : 'sfx';
    if (!canPlay(bus)) return;
    try {
      const now = ctx.currentTime + delaySec;
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFreq, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const noise = noiseSource(now, duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(outNode(bus));
    } catch (_) { /* ignore */ }
  }

  // 필터 스윕 노이즈 (휙 / 쉬익)
  function playWhoosh(duration = 0.3, vol = 0.2, f0 = 400, f1 = 3000, delaySec = 0, q = 1.2, bus = 'sfx') {
    if (!canPlay(bus)) return;
    try {
      const now = ctx.currentTime + delaySec;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(q, now);
      filter.frequency.setValueAtTime(Math.max(30, f0), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(30, f1), now + duration);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + duration * 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      const src = noiseSource(now, duration);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(outNode(bus));
    } catch (_) { /* ignore */ }
  }

  // ========================================================================
  // 프로시저럴 BGM 시퀀서 (타이틀 / 메피스토텔레스 대기실 / 일반 교전 / ALEPH 보스전)
  // ========================================================================
  const MIDI_TO_HZ = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // D minor / C minor 다크 인더스트리얼-오케스트라 모티프
  const BGM_PATTERNS = {
    title: {
      stepMs: 440,
      // 마디별 코드 진행 Dm → B♭ → Gm → A
      roots:  [38, 34, 31, 33],
      chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]],
      bass: [38, 0, 0, 0, 0, 0, 0, 0, 38, 0, 0, 0, 0, 0, 0, 0],
      arp:  [0, 74, 0, 77, 0, 81, 0, 77, 0, 74, 0, 77, 0, 81, 0, 86],
      lead: [69, 0, 0, 0, 72, 0, 70, 0, 69, 0, 0, 0, 65, 0, 67, 0]
    },
    lobby: {
      stepMs: 360,
      bass: [38, 0, 38, 0, 41, 0, 36, 0, 34, 0, 34, 0, 33, 0, 38, 0],
      arp:  [62, 65, 69, 65, 62, 65, 70, 69, 60, 64, 67, 64, 57, 61, 64, 69],
      lead: [0,  0,  74, 0,  77, 76, 74, 0,  0,  0,  72, 0,  70, 69, 67, 69]
    },
    normal: {
      stepMs: 185,
      bass: [38, 38, 0, 38, 41, 38, 43, 38, 34, 34, 0, 34, 33, 33, 36, 37],
      arp:  [62, 65, 69, 74, 62, 65, 70, 74, 58, 62, 65, 70, 57, 61, 64, 69],
      lead: [74, 0,  74, 76, 77, 0,  74, 0,  70, 0,  72, 70, 69, 0,  73, 76]
    },
    boss: {
      stepMs: 145,
      bass: [36, 36, 48, 36, 39, 36, 43, 42, 32, 32, 44, 32, 31, 31, 43, 38],
      arp:  [60, 63, 67, 72, 63, 67, 72, 75, 56, 60, 63, 68, 55, 59, 62, 67],
      lead: [72, 0,  75, 74, 72, 79, 78, 75, 68, 0,  72, 70, 67, 71, 74, 79]
    }
  };

  // 부드러운 패드 (디튠된 쏘우 2개, 느린 어택)
  function padChord(notes, dur, vol, cutoff = 900) {
    for (const n of notes) {
      const f = MIDI_TO_HZ(n);
      playBgmNote(f * 0.997, 'sawtooth', dur, vol, cutoff, 0, dur * 0.35);
      playBgmNote(f * 1.003, 'sawtooth', dur, vol * 0.8, cutoff, 0, dur * 0.35);
    }
  }

  function tickBgm() {
    if (!bgmEnabled || !sfxEnabled || !currentBgmMode) return;
    if (!ctx || ctx.state !== 'running') return;

    const pat = BGM_PATTERNS[currentBgmMode] || BGM_PATTERNS.lobby;
    const idx = bgmStep % 16;
    const bar = Math.floor(bgmStep / 16);

    const bNote = pat.bass[idx];
    const aNote = pat.arp[idx];
    const lNote = pat.lead[idx];

    if (currentBgmMode === 'title') {
      // 장엄한 타이틀: 팀파니 + 패드 코드 + 느린 금관 멜로디 + 종소리
      const ci = bar % 4;
      const chord = pat.chords[ci];
      const root = pat.roots[ci];
      const stepSec = pat.stepMs / 1000;
      if (idx === 0) {
        playTone(MIDI_TO_HZ(root - 12) * 2, 'sine', 0.9, 0.07, MIDI_TO_HZ(root - 12) * 1.4, 0, 'bgm');
        playNoise(0.5, 0.05, 180, 'lowpass', 0, true);
        padChord(chord, stepSec * 16 * 0.98, 0.010, 1000);
        playBgmNote(MIDI_TO_HZ(root), 'sawtooth', stepSec * 8, 0.034, 300, 0, 0.12);
      } else if (idx === 8) {
        playBgmNote(MIDI_TO_HZ(root), 'sawtooth', stepSec * 8, 0.03, 300, 0, 0.12);
      }
      if (ci === 3 && idx >= 12) {
        // 마디 끝 팀파니 롤
        playNoise(0.12, 0.03 + (idx - 12) * 0.008, 220, 'lowpass', 0, true);
      }
      if (lNote && bar % 2 === 1) {
        playBgmNote(MIDI_TO_HZ(lNote), 'sawtooth', stepSec * 3.2, 0.022, 1500, 0, 0.08);
        playBgmNote(MIDI_TO_HZ(lNote - 12), 'triangle', stepSec * 3.2, 0.018, 1200, 0, 0.08);
      }
      if (aNote && bar % 2 === 0) {
        playBgmNote(MIDI_TO_HZ(aNote), 'sine', stepSec * 2.5, 0.014, 3200, 0, 0.005);
      }
    } else if (currentBgmMode === 'lobby') {
      // 잔잔한 시계추 틱 + 어두운 첼로/벨 아르페지오 + 은은한 패드
      if (idx % 4 === 0) {
        playNoise(0.03, 0.018, idx === 0 ? 2800 : 1900, 'bandpass', 0, true);
      }
      if ((idx === 0 || idx === 8) && bNote) {
        padChord([bNote + 12, bNote + 19], (pat.stepMs / 1000) * 7.5, 0.006, 800);
      }
      if (bNote) {
        playBgmNote(MIDI_TO_HZ(bNote), 'sawtooth', 0.65, 0.038, 340);
      }
      if (aNote) {
        playBgmNote(MIDI_TO_HZ(aNote), 'triangle', 0.34, 0.025, 1600);
      }
      if (bar % 2 === 1 && lNote) {
        playBgmNote(MIDI_TO_HZ(lNote), 'sine', 0.52, 0.028, 2400);
      }
    } else if (currentBgmMode === 'normal') {
      // 긴박한 전술 교전 비트
      if (idx % 4 === 0) {
        // Kick
        playTone(115, 'sine', 0.13, 0.055, 36, 0, 'bgm');
      } else if (idx % 4 === 2) {
        // Hi-hat / Snare
        playNoise(0.06, 0.028, idx % 8 === 4 ? 1600 : 4200, 'bandpass', 0, true);
      }
      if ((idx === 0 || idx === 8) && bNote) {
        padChord([bNote + 24, bNote + 31], (pat.stepMs / 1000) * 7.5, 0.004, 1100);
      }
      if (bNote) {
        playBgmNote(MIDI_TO_HZ(bNote), 'sawtooth', 0.17, 0.042, 520);
      }
      if (aNote) {
        playBgmNote(MIDI_TO_HZ(aNote), 'triangle', 0.16, 0.024, 1900);
      }
      if (bar % 2 === 1 && lNote) {
        playBgmNote(MIDI_TO_HZ(lNote), 'sawtooth', 0.24, 0.026, 1500);
      }
    } else if (currentBgmMode === 'boss') {
      // ALEPH / THE BEST 고밀도 보스전 오르간-신스 오스티나토
      if (idx % 4 === 0 || idx === 14) {
        playTone(135, 'sine', 0.12, 0.065, 34, 0, 'bgm');
      }
      if (idx % 4 === 2) {
        playNoise(0.08, 0.038, 2200, 'bandpass', 0, true);
      } else if (idx % 2 === 1) {
        playNoise(0.03, 0.016, 5200, 'highpass', 0, true);
      }
      if (bNote) {
        playBgmNote(MIDI_TO_HZ(bNote), 'sawtooth', 0.14, 0.048, 680);
      }
      if (aNote) {
        playBgmNote(MIDI_TO_HZ(aNote), 'square', 0.13, 0.020, 1800);
      }
      if (lNote && (bar % 2 === 0 ? idx < 8 : true)) {
        playBgmNote(MIDI_TO_HZ(lNote), 'sawtooth', 0.22, 0.032, 2400);
        playBgmNote(MIDI_TO_HZ(lNote - 12), 'triangle', 0.22, 0.022, 1400);
      }
    }

    bgmStep++;
  }

  function playBgm(mode = 'lobby') {
    init();
    if (!BGM_PATTERNS[mode]) mode = 'lobby';
    if (currentBgmMode === mode && bgmIntervalId) return;
    currentBgmMode = mode;
    bgmStep = 0;
    if (bgmIntervalId) {
      clearInterval(bgmIntervalId);
      bgmIntervalId = null;
    }
    if (!bgmEnabled || !sfxEnabled) return;
    if (typeof setInterval !== 'function') return;
    const pat = BGM_PATTERNS[mode];
    bgmIntervalId = setInterval(tickBgm, pat.stepMs);
  }

  function stopBgm() {
    if (bgmIntervalId) {
      clearInterval(bgmIntervalId);
      bgmIntervalId = null;
    }
  }

  return {
    init,
    toggle,
    toggleBgm,
    playBgm,
    stopBgm,
    isEnabled: () => sfxEnabled,
    isBgmEnabled: () => bgmEnabled && sfxEnabled,
    getBgmMode: () => currentBgmMode,

    // --- 볼륨 / 보이스 설정 ---
    setMasterVolume,
    setSfxVolume,
    setBgmVolume,
    getVolumes,
    setVoiceEnabled,
    isVoiceEnabled,

    uiClick() {
      playTone(700, 'triangle', 0.055, 0.075, 960);
    },

    chainLink() {
      playTone(540, 'triangle', 0.07, 0.09, 810);
      playTone(1080, 'sine', 0.09, 0.06, 1320, 0.03);
    },

    resonanceChime(isAbs = false) {
      if (isAbs) {
        playTone(587.33, 'triangle', 0.25, 0.11, 587.33);
        playTone(880.0, 'sine', 0.28, 0.11, 880.0, 0.05);
        playTone(1174.66, 'sine', 0.36, 0.12, 1318.5, 0.10);
      } else {
        playTone(523.25, 'sine', 0.18, 0.09, 659.25);
        playTone(783.99, 'sine', 0.22, 0.08, 1046.5, 0.05);
      }
    },

    coinHeads() {
      // 맑은 황금 코인 앞면 링 사운드
      playTone(1360, 'sine', 0.13, 0.12, 1820);
      playTone(2720, 'sine', 0.17, 0.08, 2720, 0.03);
    },

    coinTails() {
      // 둔탁한 뒷면 코인 사운드
      playTone(330, 'triangle', 0.12, 0.10, 205);
    },

    clashClang(clashCount = 1) {
      // 합 횟수가 누적될수록 피치가 고조되는 프문 특유의 금속 충돌음!
      const pitchMult = 1 + Math.min(10, Math.max(0, clashCount - 1)) * 0.055;
      playNoise(0.11, 0.22, 2400 * pitchMult);
      playTone(960 * pitchMult, 'sawtooth', 0.12, 0.14, 420 * pitchMult);
      playTone(1860 * pitchMult, 'square', 0.09, 0.09, 1120 * pitchMult);
    },

    clashWin() {
      // 상대 코인 파쇄음
      playNoise(0.16, 0.26, 1950);
      playTone(540, 'sawtooth', 0.18, 0.16, 140);
      playTone(1520, 'sine', 0.20, 0.12, 2280, 0.035);
    },

    hitSlash() {
      playNoise(0.14, 0.24, 3300);
      playTone(920, 'sawtooth', 0.14, 0.15, 185);
    },

    hitBlunt() {
      playNoise(0.18, 0.28, 580);
      playTone(185, 'square', 0.20, 0.22, 52);
    },

    hitPierce() {
      playNoise(0.12, 0.22, 2100);
      playTone(1260, 'sawtooth', 0.14, 0.15, 250);
    },

    critHit() {
      // 호흡 크리티컬 작렬 차임
      playTone(1567.98, 'sine', 0.16, 0.14, 2093.0);
      playTone(2349.32, 'triangle', 0.22, 0.11, 3135.96, 0.03);
    },

    evadeWhoosh() {
      playNoise(0.16, 0.18, 2800, 'highpass');
      playTone(620, 'sine', 0.14, 0.09, 1280);
    },

    guardBlock() {
      playNoise(0.10, 0.18, 900);
      playTone(290, 'triangle', 0.15, 0.16, 190);
      playTone(580, 'sine', 0.12, 0.10, 440);
    },

    tremorBurst() {
      // 림버스 상징 사운드: 진동 폭발 묵직한 종소리 + 저음 충격파!
      playNoise(0.28, 0.28, 420);
      playTone(164.81, 'sawtooth', 0.42, 0.24, 65.41);
      playTone(659.25, 'triangle', 0.38, 0.18, 622.25);
      playTone(1318.5, 'sine', 0.44, 0.13, 1244.5, 0.015);
    },

    cannonBlast() {
      // 과구리 대포 폭발음
      playNoise(0.45, 0.35, 380);
      playTone(145, 'sawtooth', 0.45, 0.28, 34);
      playNoise(0.34, 0.24, 820, 'bandpass', 0.085);
    },

    laserBeam() {
      // 제록쌤 7색 안광 레이저 / 종삼 BEST 광선
      playTone(1680, 'sawtooth', 0.36, 0.16, 410);
      playTone(820, 'sine', 0.36, 0.14, 2480);
    },

    staggerBreak() {
      // 흐트러짐! 유리 거울 산산조각 파열음
      playNoise(0.30, 0.32, 3900);
      playTone(1980, 'sawtooth', 0.15, 0.16, 620);
      playTone(1440, 'square', 0.18, 0.14, 410, 0.055);
      playTone(2460, 'sine', 0.24, 0.13, 880, 0.105);
    },

    egoAwaken() {
      // E.G.O 각성 웅장한 화음
      playNoise(0.25, 0.18, 1500);
      playTone(220, 'sawtooth', 0.62, 0.16, 440);
      playTone(329.63, 'triangle', 0.62, 0.14, 659.25);
      playTone(440, 'sine', 0.72, 0.15, 880);
    },

    egoCorrode() {
      // E.G.O 침식 불협화음 경보 & 심연 드롭
      playNoise(0.38, 0.26, 620);
      playTone(233.08, 'sawtooth', 0.68, 0.19, 77.78);
      playTone(311.13, 'square', 0.62, 0.14, 103.83);
      playTone(622.25, 'sawtooth', 0.45, 0.12, 207.65, 0.06);
    },

    coinFlip(isHeads = true) {
      if (isHeads) this.coinHeads();
      else this.coinTails();
    },

    clashSpark(clashCount = 1) {
      this.clashClang(clashCount);
    },

    cannonBoom() {
      this.cannonBlast();
    },

    hitImpact(typeOrHeavy = false) {
      if (typeOrHeavy === 'pierce') this.hitPierce();
      else if (typeOrHeavy === 'blunt' || typeOrHeavy === true) this.hitBlunt();
      else this.hitSlash();
    },

    victoryFanfare() {
      playTone(523.25, 'triangle', 0.22, 0.15, 523.25);
      playTone(659.25, 'triangle', 0.22, 0.15, 659.25, 0.11);
      playTone(783.99, 'triangle', 0.26, 0.16, 783.99, 0.22);
      playTone(1046.5, 'sine', 0.58, 0.19, 1046.5, 0.34);
    },

    defeatDirge() {
      playTone(293.66, 'sawtooth', 0.35, 0.14, 277.18);
      playTone(261.63, 'triangle', 0.38, 0.14, 246.94, 0.18);
      playTone(220.0, 'sawtooth', 0.65, 0.16, 146.83, 0.38);
    },

    // --- Tekken / 2D Arcade Fighting SFX Extensions ---
    whiff() {
      playNoise(0.08, 0.11, 1450, 'bandpass');
      playTone(320, 'sine', 0.07, 0.06, 160);
    },

    lightHit() {
      playNoise(0.08, 0.24, 2200, 'bandpass');
      playTone(280, 'triangle', 0.09, 0.20, 95);
    },

    heavyHit() {
      playNoise(0.16, 0.34, 980, 'lowpass');
      playTone(175, 'sawtooth', 0.18, 0.28, 42);
      playTone(920, 'square', 0.06, 0.11, 260, 0.01);
    },

    launcherHit() {
      playNoise(0.20, 0.32, 1300, 'bandpass');
      playTone(150, 'sawtooth', 0.24, 0.28, 48);
      playTone(340, 'triangle', 0.24, 0.18, 980, 0.02);
    },

    wallSplat() {
      playNoise(0.28, 0.38, 520, 'lowpass');
      playTone(115, 'sawtooth', 0.30, 0.30, 32);
      playNoise(0.18, 0.22, 2600, 'bandpass', 0.04);
    },

    koBoom() {
      playNoise(0.55, 0.42, 420, 'lowpass');
      playTone(130, 'sawtooth', 0.68, 0.34, 26);
      playTone(523.25, 'triangle', 0.55, 0.20, 261.63, 0.04);
    },

    roundBell() {
      playTone(880, 'triangle', 0.38, 0.18, 880);
      playTone(1760, 'sine', 0.32, 0.12, 1740, 0.01);
    },

    // --- 신규 전투 SFX ---
    burst() {
      // 콤보 브레이커: 거대한 휙 + 저음 충격 + 상승 차임
      playWhoosh(0.5, 0.3, 300, 4200, 0, 0.9);
      playNoise(0.3, 0.26, 260, 'lowpass');
      playTone(95, 'sawtooth', 0.42, 0.24, 38);
      playTone(880, 'sine', 0.36, 0.1, 1760, 0.08);
      playTone(1318.5, 'triangle', 0.4, 0.08, 2637, 0.14);
      playTone(1760, 'sine', 0.45, 0.06, 3520, 0.2);
    },

    guardCancel() {
      // 금속 클랭 + 스냅
      playNoise(0.08, 0.25, 3200, 'bandpass');
      playTone(1240, 'square', 0.12, 0.1, 980);
      playTone(2480, 'sine', 0.3, 0.07, 2460);
      playTone(620, 'triangle', 0.16, 0.12, 520);
      playNoise(0.035, 0.26, 6000, 'highpass', 0.05);
      playTone(1800, 'triangle', 0.05, 0.1, 600, 0.05);
    },

    punish() {
      // 날카로운 2연타
      playNoise(0.06, 0.3, 2600, 'bandpass');
      playTone(300, 'triangle', 0.08, 0.24, 90);
      playTone(1400, 'square', 0.05, 0.08, 500);
      playNoise(0.08, 0.34, 3200, 'bandpass', 0.075);
      playTone(380, 'sawtooth', 0.1, 0.24, 80, 0.075);
      playTone(1800, 'square', 0.05, 0.09, 600, 0.075);
    },

    countdownTick() {
      playTone(1000, 'sine', 0.06, 0.12, 1000);
      playTone(2000, 'triangle', 0.04, 0.05, 2000);
    },

    fightStart() {
      // 묵직한 공(gong) + 금관 스탭
      playNoise(0.45, 0.3, 600, 'lowpass');
      playTone(98, 'sawtooth', 0.6, 0.24, 58);
      brass(146.83, 0.55, 0.06);
      brass(220, 0.55, 0.05);
      brass(293.66, 0.55, 0.05);
      playTone(1174.66, 'sine', 0.8, 0.05, 1160, 0.02);
      playTone(587.33, 'triangle', 0.9, 0.05, 580, 0.02);
    },

    menuMove() {
      playTone(1200, 'triangle', 0.035, 0.05, 1350);
    },

    menuConfirm() {
      playTone(880, 'triangle', 0.08, 0.1, 880);
      playTone(1318.5, 'sine', 0.12, 0.08, 1318.5, 0.05);
      playTone(1760, 'sine', 0.16, 0.07, 1760, 0.1);
    },

    menuBack() {
      playTone(700, 'triangle', 0.09, 0.08, 420);
      playNoise(0.03, 0.04, 1800, 'bandpass');
    },

    vsSlam() {
      // VS 스플래시: 깊은 붐 + 금속 링
      playTone(70, 'sine', 0.7, 0.4, 32);
      playNoise(0.5, 0.35, 400, 'lowpass');
      playNoise(0.06, 0.2, 3000, 'bandpass');
      playTone(1560, 'square', 0.5, 0.045, 1500, 0.01);
      playTone(2340, 'sine', 0.7, 0.06, 2330, 0.01);
      playTone(780, 'triangle', 0.6, 0.06, 770, 0.01);
    },

    jump() {
      playWhoosh(0.14, 0.12, 600, 2200, 0, 1.4);
      playTone(320, 'sine', 0.08, 0.04, 520);
    },

    land() {
      playNoise(0.1, 0.22, 300, 'lowpass');
      playTone(120, 'sine', 0.1, 0.18, 60);
    },

    dashStep() {
      playWhoosh(0.12, 0.14, 2400, 800, 0, 1.1);
      playNoise(0.04, 0.12, 400, 'lowpass');
    },

    slotSelect(n = 1) {
      const slot = Math.max(1, Math.min(4, Math.round(Number(n) || 1)));
      const steps = [0, 3, 7, 12];
      const f = 523.25 * Math.pow(2, steps[slot - 1] / 12);
      playTone(f, 'triangle', 0.09, 0.1, f * 1.02);
      playTone(f * 2, 'sine', 0.12, 0.05, f * 2, 0.03);
    },

    meterFull() {
      // 상승 스파클
      const notes = [1046.5, 1318.5, 1568, 2093, 2637];
      notes.forEach((f, i) => playTone(f, 'sine', 0.16, 0.07, f * 1.01, i * 0.045));
      playNoise(0.22, 0.05, 8000, 'highpass', 0.05);
    },

    rageAwaken() {
      // 저음 그로울 드롭 + 차임
      voice({ freq: 180, slideTo: 45, type: 'sawtooth', dur: 0.75, vol: 0.24, cutoff: 900, cutoffTo: 200, q: 4 });
      voice({ freq: 90, slideTo: 40, type: 'square', dur: 0.65, vol: 0.09, detune: 12, cutoff: 600 });
      playNoise(0.5, 0.25, 300, 'lowpass');
      playTone(1318.5, 'sine', 0.6, 0.07, 1318.5, 0.25);
      playTone(1975.5, 'triangle', 0.5, 0.05, 1975.5, 0.28);
    },

    titleStinger() {
      // 약 1초 극적인 금관풍 신스 코드 (D minor add9)
      playTone(55, 'sine', 1.2, 0.3, 40);
      playNoise(0.6, 0.22, 200, 'lowpass');
      [146.83, 220, 293.66, 349.23, 440].forEach((f, i) => brass(f, 1.1, i < 2 ? 0.06 : 0.045, i * 0.012));
      playTone(659.25, 'triangle', 1.0, 0.03, 659.25, 0.08);
      playTone(1760, 'sine', 1.0, 0.03, 1750, 0.1);
    },

    comboFinish(hits = 1) {
      const h = Math.max(1, Math.min(30, Math.round(Number(hits) || 1)));
      const m = 1 + Math.min(1, (h - 1) / 20); // 1..2
      playNoise(0.12, 0.25, 2000 * m, 'bandpass');
      playTone(220 * m, 'sawtooth', 0.2, 0.2, 80);
      playTone(880 * m, 'sine', 0.25, 0.06 + 0.04 * (m - 1), 1320 * m, 0.03);
      if (h >= 5) playTone(1320 * m, 'triangle', 0.3, 0.05, 1760 * m, 0.08);
      if (h >= 10) {
        playTone(1760 * m, 'sine', 0.35, 0.05, 2640 * m, 0.13);
        playNoise(0.2, 0.05, 9000, 'highpass', 0.1);
      }
    },

    announce(phrase) {
      const w = hasWindow();
      if (!voiceEnabled || !sfxEnabled || !w || !w.speechSynthesis) return;
      try {
        w.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(phrase);
        ut.lang = 'en-US';
        ut.rate = 1.12;
        ut.pitch = 0.78;
        ut.volume = Math.max(0, Math.min(1, 0.72 * (0.25 + 0.75 * volumes.master)));
        w.speechSynthesis.speak(ut);
      } catch (_) { /* ignore */ }
    }
  };
})();
