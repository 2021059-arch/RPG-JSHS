// ==========================================================================
// 전곽: THE BEST — Procedural Web Audio Synthesizer & Dynamic BGM Engine
// (림버스 컴퍼니 / 라이브러리 오브 루이나 스타일 타격·합·진동폭발 SFX & 3채널 프로시저럴 BGM)
// ==========================================================================

const SoundFX = (() => {
  let ctx = null;
  let masterGain = null;
  let sfxEnabled = true;
  let bgmEnabled = true;
  let currentBgmMode = null; // 'lobby' | 'normal' | 'boss' | null
  let bgmStep = 0;
  let bgmIntervalId = null;

  function init() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.82;
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function outNode() {
    return masterGain || (ctx && ctx.destination);
  }

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

  function playTone(freq, type = 'sine', duration = 0.15, vol = 0.15, slideTo = null, delaySec = 0) {
    if (!sfxEnabled) return;
    init();
    if (!ctx) return;

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
    gain.connect(outNode());
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  function playBgmNote(freq, type = 'triangle', duration = 0.25, vol = 0.05, cutoff = 1400, delaySec = 0) {
    if (!bgmEnabled || !sfxEnabled || !ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(24, freq), now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);
    filter.Q.setValueAtTime(1.8, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0006, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(outNode());

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playNoise(duration = 0.15, vol = 0.2, filterFreq = 1200, filterType = 'bandpass', delaySec = 0, isBgm = false) {
    if (isBgm ? (!bgmEnabled || !sfxEnabled) : !sfxEnabled) return;
    init();
    if (!ctx || (isBgm && ctx.state !== 'running')) return;

    const now = ctx.currentTime + delaySec;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(outNode());

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }

  // ========================================================================
  // 프로시저럴 BGM 시퀀서 (메피스토텔레스 대기실 / 일반 교전 / ALEPH 보스전)
  // ========================================================================
  const MIDI_TO_HZ = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // D minor / C minor 다크 인더스트리얼-오케스트라 모티프
  const BGM_PATTERNS = {
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

  function tickBgm() {
    if (!bgmEnabled || !sfxEnabled || !currentBgmMode) return;
    if (!ctx || ctx.state !== 'running') return;

    const pat = BGM_PATTERNS[currentBgmMode] || BGM_PATTERNS.lobby;
    const idx = bgmStep % 16;
    const bar = Math.floor(bgmStep / 16);

    const bNote = pat.bass[idx];
    const aNote = pat.arp[idx];
    const lNote = pat.lead[idx];

    if (currentBgmMode === 'lobby') {
      // 잔잔한 시계추 틱 + 어두운 첼로/벨 아르페지오
      if (idx % 4 === 0) {
        playNoise(0.03, 0.018, idx === 0 ? 2800 : 1900, 'bandpass', 0, true);
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
        playTone(115, 'sine', 0.13, 0.055, 36);
      } else if (idx % 4 === 2) {
        // Hi-hat / Snare
        playNoise(0.06, 0.028, idx % 8 === 4 ? 1600 : 4200, 'bandpass', 0, true);
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
        playTone(135, 'sine', 0.12, 0.065, 34);
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
    if (currentBgmMode === mode && bgmIntervalId) return;
    currentBgmMode = mode;
    bgmStep = 0;
    if (bgmIntervalId) {
      clearInterval(bgmIntervalId);
      bgmIntervalId = null;
    }
    if (!bgmEnabled || !sfxEnabled) return;
    const pat = BGM_PATTERNS[mode] || BGM_PATTERNS.lobby;
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

    announce(phrase) {
      if (!sfxEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(phrase);
        ut.lang = 'en-US';
        ut.rate = 1.12;
        ut.pitch = 0.78;
        ut.volume = 0.72;
        window.speechSynthesis.speak(ut);
      } catch (_) {}
    }
  };
})();
