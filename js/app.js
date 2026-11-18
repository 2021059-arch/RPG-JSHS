// ==========================================================================
// 전곽: IRON FIST (THE BEST) v3 — App Controller
// 타이틀 · 캐릭터/팀 선택 · 설정 · 전적 기록 · 화면 전환 · 모달 · 토스트 관리
// ==========================================================================

const AppController = (() => {
  const LS_SETTINGS = 'jg_ironfist_settings_v3';
  const LS_RECORDS = 'jg_ironfist_records_v3';
  const LS_SELECT = 'jg_ironfist_select_v3';

  let currentScreen = 'title'; // 'title' | 'select' | 'fight'
  let gameMode = 'vs_cpu';      // 'vs_cpu' | 'brawl' | 'arcade' | 'vs_2p' | 'training'
  let difficulty = 'normal';    // 'easy' | 'normal' | 'hard'
  let stageId = 'bg-corridor';

  // 1v1 선택 상태
  let p1CharId = 'changjin';
  let p2CharId = 'yangwoo';
  let p1PreviewPose = 'idle';
  let p2PreviewPose = 'idle';
  let activeCursor = 1; // 1: Left(1P/Blue) | 2: Right(2P/Red)
  let gridFocusIdx = 0; // 키보드 로스터 포커스

  // 다대다 팀 난전(Brawl) 편성 상태 (각 팀 1~5인 자유 편성)
  let brawlControl = 'player'; // 'player' | 'spectate'
  let team1Ids = ['changjin', 'jiwon', 'hyunmin'];
  let team2Ids = ['yangwoo', 'jerok', 'yonghae'];

  let touchPadOpen = false;

  // 타이틀 상태
  let titleStage = 'press'; // 'press' | 'menu'
  let titleIdx = 0;

  const DEFAULT_SETTINGS = {
    master: 0.85, sfx: 0.9, bgm: 0.6,
    voice: true, shakeScale: 1, flashes: true, damageNumbers: true, quality: 'high'
  };
  let settings = { ...DEFAULT_SETTINGS };

  const DEFAULT_RECORDS = {
    matches: 0, wins: 0, losses: 0,
    bestCombo: 0, bestComboDmg: 0, bestDamage: 0,
    arcadeClears: 0, brawlWins: 0, totalKos: 0,
    grades: { S: 0, A: 0, B: 0, C: 0, D: 0 },
    charUse: {}, charWins: {},
    modeCount: {}, streak: 0, bestStreak: 0,
    lastPlayed: null
  };
  let records = JSON.parse(JSON.stringify(DEFAULT_RECORDS));

  // ==========================================================================
  // 저장소 (localStorage — file:// 환경에서도 동작, 실패 시 무시)
  // ==========================================================================
  function lsGet(key) {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function lsSet(key, val) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(val));
    } catch (_) { /* 저장 불가 환경 무시 */ }
  }

  function loadPersisted() {
    const s = lsGet(LS_SETTINGS);
    if (s) settings = { ...DEFAULT_SETTINGS, ...s };
    const r = lsGet(LS_RECORDS);
    if (r) records = { ...JSON.parse(JSON.stringify(DEFAULT_RECORDS)), ...r, grades: { ...DEFAULT_RECORDS.grades, ...(r.grades || {}) } };
    const sel = lsGet(LS_SELECT);
    if (sel) {
      const valid = (id) => CHARACTER_DB.some(c => c.id === id);
      if (sel.gameMode) gameMode = sel.gameMode;
      if (sel.difficulty) difficulty = sel.difficulty;
      if (sel.stageId && FIGHT_STAGES.some(st => st.id === sel.stageId)) stageId = sel.stageId;
      if (valid(sel.p1CharId)) p1CharId = sel.p1CharId;
      if (valid(sel.p2CharId)) p2CharId = sel.p2CharId;
      if (Array.isArray(sel.team1Ids) && sel.team1Ids.filter(valid).length) team1Ids = sel.team1Ids.filter(valid).slice(0, 5);
      if (Array.isArray(sel.team2Ids) && sel.team2Ids.filter(valid).length) team2Ids = sel.team2Ids.filter(valid).slice(0, 5);
      if (sel.brawlControl) brawlControl = sel.brawlControl;
    }
  }

  function saveSelection() {
    lsSet(LS_SELECT, { gameMode, difficulty, stageId, p1CharId, p2CharId, team1Ids, team2Ids, brawlControl });
  }

  function applySettingsEverywhere() {
    if (typeof SoundFX.setMasterVolume === 'function') SoundFX.setMasterVolume(settings.master);
    if (typeof SoundFX.setSfxVolume === 'function') SoundFX.setSfxVolume(settings.sfx);
    if (typeof SoundFX.setBgmVolume === 'function') SoundFX.setBgmVolume(settings.bgm);
    if (typeof SoundFX.setVoiceEnabled === 'function') SoundFX.setVoiceEnabled(settings.voice);
    if (typeof FightEngine !== 'undefined' && FightEngine.applySettings) {
      FightEngine.applySettings({
        shakeScale: settings.shakeScale,
        damageNumbers: settings.damageNumbers,
        flashes: settings.flashes,
        quality: settings.quality
      });
    }
    const appEl = document.getElementById('app');
    if (appEl) appEl.classList.toggle('low-quality', settings.quality === 'low');
  }

  // ==========================================================================
  // 초기화
  // ==========================================================================
  function init() {
    loadPersisted();
    applySettingsEverywhere();
    renderTitleCast();
    renderSelectScreen();
    bindGlobalKeys();
    syncAudioButtons();

    const unlockAudio = () => {
      SoundFX.init();
      applySettingsEverywhere();
      if (currentScreen === 'select') SoundFX.playBgm('lobby');
      else if (currentScreen === 'title' && titleStage === 'menu') SoundFX.playBgm('title');
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);

    const pressEl = document.getElementById('title-press');
    if (pressEl) pressEl.addEventListener('click', () => openTitleMenu());
    const titleScr = document.getElementById('screen-title');
    if (titleScr) {
      titleScr.addEventListener('click', (e) => {
        if (titleStage === 'press' && !e.target.closest('.title-menu')) openTitleMenu();
      });
    }
  }

  function renderTitleCast() {
    const strip = document.getElementById('title-cast-strip');
    if (!strip) return;
    const picks = [...CHARACTER_DB].sort(() => Math.random() - 0.5).slice(0, 7);
    strip.innerHTML = picks.map((c, i) => {
      const prof = FIGHTER_PROFILES[c.id] || FIGHTER_PROFILES.changjin;
      return `
        <div class="cast-card" style="--cast-accent:${prof.accent};--cast-delay:${(i * 0.12).toFixed(2)}s;--cast-i:${i};">
          <img src="${CharacterSprites.getPoseFileSrc(c.id, i % 2 === 0 ? 'ego' : 'skill2')}" alt="${c.name}" draggable="false" />
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 화면 전환 (와이프 연출은 순수 장식 — 상태 전환은 즉시 동기 처리)
  // ==========================================================================
  function playWipe() {
    const w = document.getElementById('screen-wipe');
    if (!w) return;
    w.classList.remove('play');
    void w.offsetWidth;
    w.classList.add('play');
    if (!w.dataset.bound && w.addEventListener) {
      w.dataset.bound = '1';
      w.addEventListener('animationend', () => w.classList.remove('play'));
    }
  }

  function showScreen(name) {
    currentScreen = name;
    ['title', 'select', 'fight'].forEach(n => {
      const el = document.getElementById(`screen-${n}`);
      if (el) el.classList.toggle('active', n === name);
    });
    playWipe();
  }

  function openTitleMenu() {
    if (titleStage === 'menu') return;
    SoundFX.init();
    applySettingsEverywhere();
    titleStage = 'menu';
    const scr = document.getElementById('screen-title');
    if (scr) scr.classList.add('menu-open');
    if (typeof SoundFX.titleStinger === 'function') SoundFX.titleStinger();
    else SoundFX.clashWin();
    SoundFX.playBgm('title');
    updateTitleFocus();
  }

  function updateTitleFocus() {
    document.querySelectorAll('[data-title-idx]').forEach(btn => {
      btn.classList.toggle('focused', Number(btn.dataset.titleIdx) === titleIdx);
    });
  }

  function titleSelect(idx) {
    titleIdx = idx;
    updateTitleFocus();
    menuSfx('confirm');
    if (idx === 0) goToSelect();
    else if (idx === 1) openModal('guide-modal');
    else if (idx === 2) openModal('records-modal');
    else if (idx === 3) openModal('settings-modal');
  }

  function goToSelect() {
    showScreen('select');
    SoundFX.playBgm('lobby');
    renderSelectScreen();
  }

  function backToTitle() {
    menuSfx('back');
    if (typeof FightEngine !== 'undefined') FightEngine.stopEngine();
    closeAllModals();
    showScreen('title');
    renderTitleCast();
    if (titleStage === 'menu') SoundFX.playBgm('title');
  }

  function menuSfx(kind) {
    if (kind === 'move') {
      if (typeof SoundFX.menuMove === 'function') SoundFX.menuMove(); else SoundFX.uiClick();
    } else if (kind === 'confirm') {
      if (typeof SoundFX.menuConfirm === 'function') SoundFX.menuConfirm(); else SoundFX.chainLink();
    } else if (kind === 'back') {
      if (typeof SoundFX.menuBack === 'function') SoundFX.menuBack(); else SoundFX.uiClick();
    }
  }

  // ==========================================================================
  // 전역 키 입력 (캡처 단계: 모달 > 타이틀 > 선택 화면 순으로 우선 처리)
  // ==========================================================================
  function anyOverlayOpen() {
    return Array.from(document.querySelectorAll('.overlay-modal')).some(m => m.classList.contains('active'));
  }

  function bindGlobalKeys() {
    window.addEventListener('keydown', (e) => {
      // 1. 오버레이 모달이 열려 있으면 ESC로 닫고, 게임 입력은 차단
      if (anyOverlayOpen()) {
        if (e.code === 'Escape' || (e.code === 'Enter' && !e.repeat)) {
          e.preventDefault();
          closeTopModal();
        }
        e.stopImmediatePropagation();
        return;
      }

      if (currentScreen === 'title') {
        handleTitleKey(e);
        e.stopImmediatePropagation();
        return;
      }
      if (currentScreen === 'select') {
        handleSelectKey(e);
        e.stopImmediatePropagation();
      }
    }, true);
  }

  function handleTitleKey(e) {
    if (e.repeat) return;
    if (titleStage === 'press') {
      if (['Enter', 'Space', 'NumpadEnter'].includes(e.code)) {
        e.preventDefault();
        openTitleMenu();
      }
      return;
    }
    if (['ArrowUp', 'KeyW'].includes(e.code)) {
      e.preventDefault();
      titleIdx = (titleIdx + 3) % 4;
      updateTitleFocus();
      menuSfx('move');
    } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
      e.preventDefault();
      titleIdx = (titleIdx + 1) % 4;
      updateTitleFocus();
      menuSfx('move');
    } else if (['Enter', 'Space', 'NumpadEnter'].includes(e.code)) {
      e.preventDefault();
      titleSelect(titleIdx);
    }
  }

  function handleSelectKey(e) {
    const cols = 5;
    const total = CHARACTER_DB.length;
    const moveFocus = (delta) => {
      gridFocusIdx = (gridFocusIdx + delta + total) % total;
      menuSfx('move');
      updateGridFocus();
    };
    switch (e.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (e.repeat) return;
        e.preventDefault();
        launchFight();
        break;
      case 'Space':
        if (e.repeat) return;
        e.preventDefault();
        pickCharacter(CHARACTER_DB[gridFocusIdx].id);
        break;
      case 'Tab':
        e.preventDefault();
        setCursorSlot(activeCursor === 1 ? 2 : 1);
        break;
      case 'Escape':
        e.preventDefault();
        backToTitle();
        break;
      case 'ArrowLeft': case 'KeyA': e.preventDefault(); moveFocus(-1); break;
      case 'ArrowRight': case 'KeyD': e.preventDefault(); moveFocus(1); break;
      case 'ArrowUp': case 'KeyW': e.preventDefault(); moveFocus(-cols); break;
      case 'ArrowDown': case 'KeyS': e.preventDefault(); moveFocus(cols); break;
      case 'KeyR':
        if (!e.repeat) randomizeCharacters();
        break;
      default:
        break;
    }
  }

  function updateGridFocus() {
    document.querySelectorAll('.fighter-cell').forEach((cell, idx) => {
      cell.classList.toggle('kb-focus', idx === gridFocusIdx);
    });
  }

  // ==========================================================================
  // 모달 (가이드 · 설정 · 기록)
  // ==========================================================================
  const modalStack = [];

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    if (id === 'settings-modal') renderSettingsBody();
    if (id === 'records-modal') renderRecordsBody();
    m.classList.add('active');
    if (!modalStack.includes(id)) modalStack.push(id);
    SoundFX.uiClick();
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
    const idx = modalStack.indexOf(id);
    if (idx >= 0) modalStack.splice(idx, 1);
    menuSfx('back');
  }

  function closeTopModal() {
    const top = modalStack[modalStack.length - 1];
    if (top) closeModal(top);
    else document.querySelectorAll('.overlay-modal.active').forEach(m => m.classList.remove('active'));
  }

  function closeAllModals() {
    ['pause-modal', 'result-modal', 'guide-modal', 'settings-modal', 'records-modal'].forEach(id => {
      const m = document.getElementById(id);
      if (m) m.classList.remove('active');
    });
    modalStack.length = 0;
  }

  function renderSettingsBody() {
    const body = document.getElementById('settings-body');
    if (!body) return;
    const slider = (key, label, min, max, step, fmt) => `
      <label class="set-row">
        <span class="set-lbl">${label}</span>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${settings[key]}"
               oninput="AppController.updateSetting('${key}', parseFloat(this.value)); this.nextElementSibling.textContent = (${fmt})(parseFloat(this.value));" />
        <span class="set-val">${fmt(settings[key])}</span>
      </label>
    `;
    const pct = (v) => `${Math.round(v * 100)}%`;
    const toggle = (key, label, desc) => `
      <div class="set-row toggle-row" onclick="AppController.updateSetting('${key}', ${!settings[key]}); AppController.openModal('settings-modal');">
        <span class="set-lbl">${label}<small>${desc}</small></span>
        <span class="set-switch ${settings[key] ? 'on' : ''}"><i></i></span>
      </div>
    `;
    body.innerHTML = `
      <div class="set-section">🔊 사운드</div>
      ${slider('master', '마스터 볼륨', 0, 1, 0.05, pct)}
      ${slider('sfx', '효과음', 0, 1, 0.05, pct)}
      ${slider('bgm', '배경음악', 0, 1, 0.05, pct)}
      ${toggle('voice', '아나운서 음성', 'ROUND 1 · FIGHT! · K.O. 음성 안내')}
      <div class="set-section">🎬 화면 · 이펙트</div>
      ${slider('shakeScale', '화면 흔들림', 0, 1.5, 0.05, pct)}
      ${toggle('flashes', '섬광 이펙트', '임팩트 프레임 · 화면 번쩍임 (광과민 시 끄기)')}
      ${toggle('damageNumbers', '데미지 숫자', '타격 시 떠오르는 데미지 표시')}
      <div class="set-row toggle-row" onclick="AppController.updateSetting('quality', '${settings.quality === 'high' ? 'low' : 'high'}'); AppController.openModal('settings-modal');">
        <span class="set-lbl">그래픽 품질<small>저사양 PC는 LOW 권장 (파티클 절반)</small></span>
        <span class="set-chip">${settings.quality === 'high' ? 'HIGH' : 'LOW'}</span>
      </div>
    `;
  }

  function updateSetting(key, value) {
    settings[key] = value;
    lsSet(LS_SETTINGS, settings);
    applySettingsEverywhere();
    if (key === 'sfx' || key === 'master') SoundFX.uiClick();
  }

  function resetSettings() {
    settings = { ...DEFAULT_SETTINGS };
    lsSet(LS_SETTINGS, settings);
    applySettingsEverywhere();
    renderSettingsBody();
    toast('설정을 기본값으로 되돌렸습니다.');
  }

  function renderRecordsBody() {
    const body = document.getElementById('records-body');
    if (!body) return;
    const r = records;
    const rate = r.matches > 0 ? Math.round((r.wins / r.matches) * 100) : 0;
    const topChars = Object.entries(r.charUse).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const charHtml = topChars.length ? topChars.map(([cid, cnt]) => {
      const c = CHARACTER_DB.find(x => x.id === cid);
      if (!c) return '';
      const w = r.charWins[cid] || 0;
      return `
        <div class="rec-char">
          <img src="${CharacterSprites.getPoseFileSrc(cid, 'idle')}" alt="${c.name}" />
          <div><strong>${c.name.split(' (')[0]}</strong><span>${cnt}전 ${w}승 · ${Math.round((w / cnt) * 100)}%</span></div>
        </div>
      `;
    }).join('') : '<div class="rec-empty">아직 플레이 기록이 없습니다. 첫 대전을 시작해 보세요!</div>';
    const gradeHtml = ['S', 'A', 'B', 'C', 'D'].map(g => `
      <div class="rec-grade"><span class="grade-badge mini grade-${g}">${g}</span><strong>${r.grades[g] || 0}</strong></div>
    `).join('');
    body.innerHTML = `
      <div class="rec-hero">
        <div class="rec-ring" style="--rate:${rate};"><span>${rate}%</span><small>승률</small></div>
        <div class="rec-hero-stats">
          <div><span>총 대전</span><strong>${r.matches}</strong></div>
          <div><span>승 / 패</span><strong>${r.wins} / ${r.losses}</strong></div>
          <div><span>최고 연승</span><strong>${r.bestStreak}</strong></div>
          <div><span>아케이드 클리어</span><strong>${r.arcadeClears}</strong></div>
          <div><span>팀 난전 승리</span><strong>${r.brawlWins}</strong></div>
          <div><span>총 K.O.</span><strong>${r.totalKos}</strong></div>
          <div><span>최대 콤보</span><strong>${r.bestCombo} HIT</strong></div>
          <div><span>최대 콤보 딜</span><strong>${r.bestComboDmg}</strong></div>
        </div>
      </div>
      <div class="rec-section">등급 분포</div>
      <div class="rec-grades">${gradeHtml}</div>
      <div class="rec-section">애용 캐릭터</div>
      <div class="rec-chars">${charHtml}</div>
      ${r.lastPlayed ? `<div class="rec-foot">마지막 플레이: ${r.lastPlayed}</div>` : ''}
    `;
  }

  function resetRecords() {
    records = JSON.parse(JSON.stringify(DEFAULT_RECORDS));
    lsSet(LS_RECORDS, records);
    renderRecordsBody();
    toast('전적 기록을 초기화했습니다.');
  }

  // FightEngine이 매치 종료 시 호출
  function recordMatch(summary) {
    if (!summary) return;
    const r = records;
    r.matches++;
    if (summary.won) {
      r.wins++;
      r.streak++;
      r.bestStreak = Math.max(r.bestStreak, r.streak);
    } else {
      r.losses++;
      r.streak = 0;
    }
    const prevBestCombo = r.bestCombo;
    r.bestCombo = Math.max(r.bestCombo, summary.maxCombo || 0);
    r.bestComboDmg = Math.max(r.bestComboDmg, summary.maxComboDmg || 0);
    r.bestDamage = Math.max(r.bestDamage, summary.damage || 0);
    r.totalKos += summary.kos || 0;
    if (summary.arcadeCleared) r.arcadeClears++;
    if (summary.mode === 'brawl' && summary.won) r.brawlWins++;
    if (summary.grade && r.grades[summary.grade] !== undefined) r.grades[summary.grade]++;
    const cid = summary.charId;
    if (cid) {
      r.charUse[cid] = (r.charUse[cid] || 0) + 1;
      if (summary.won) r.charWins[cid] = (r.charWins[cid] || 0) + 1;
    }
    r.modeCount[summary.mode] = (r.modeCount[summary.mode] || 0) + 1;
    try {
      r.lastPlayed = new Date().toLocaleString('ko-KR');
    } catch (_) {
      r.lastPlayed = String(Date.now());
    }
    lsSet(LS_RECORDS, r);
    if ((summary.maxCombo || 0) > prevBestCombo && summary.maxCombo >= 5) {
      toast(`🏅 최대 콤보 기록 갱신! ${summary.maxCombo} HIT`);
    }
  }

  // ==========================================================================
  // 토스트 알림
  // ==========================================================================
  function toast(msg, ms = 2400) {
    const stack = document.getElementById('toast-stack');
    if (!stack || !stack.appendChild) return;
    const t = document.createElement('div');
    t.className = 'toast-item';
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(() => { if (t.classList) t.classList.add('out'); }, ms);
    setTimeout(() => { if (t.remove) t.remove(); }, ms + 400);
  }

  // ==========================================================================
  // 선택 화면 상태 변경
  // ==========================================================================
  function setMode(mode) {
    menuSfx('move');
    gameMode = mode;
    saveSelection();
    renderSelectScreen();
  }

  function setDifficulty(diff) {
    SoundFX.uiClick();
    difficulty = diff;
    saveSelection();
    renderSelectScreen();
  }

  function setStage(sId) {
    SoundFX.uiClick();
    stageId = sId;
    saveSelection();
    renderSelectScreen();
  }

  function setCursorSlot(slot) {
    SoundFX.uiClick();
    activeCursor = slot;
    renderSelectScreen();
  }

  function setBrawlControl(ctrlMode) {
    SoundFX.uiClick();
    brawlControl = ctrlMode;
    saveSelection();
    renderSelectScreen();
  }

  function pickCharacter(charId, forceSlot = null) {
    SoundFX.chainLink();
    const targetSlot = forceSlot || activeCursor;
    const idx = CHARACTER_DB.findIndex(c => c.id === charId);
    if (idx >= 0) gridFocusIdx = idx;

    if (gameMode === 'brawl') {
      const list = targetSlot === 1 ? team1Ids : team2Ids;
      const pos = list.indexOf(charId);
      if (pos >= 0) {
        if (list.length > 1) list.splice(pos, 1);
      } else if (list.length < 5) {
        list.push(charId);
      } else {
        list[list.length - 1] = charId;
      }
      saveSelection();
      renderSelectScreen();
      return;
    }

    if (targetSlot === 1) {
      p1CharId = charId;
      p1PreviewPose = 'idle';
    } else {
      p2CharId = charId;
      p2PreviewPose = 'idle';
    }
    saveSelection();
    renderSelectScreen();
  }

  function clearTeamToLeader(teamNum) {
    SoundFX.uiClick();
    if (teamNum === 1) team1Ids = [team1Ids[0]];
    else team2Ids = [team2Ids[0]];
    activeCursor = teamNum;
    saveSelection();
    renderSelectScreen();
  }

  function removeTeamMember(teamNum, idx, ev) {
    if (ev) ev.stopPropagation();
    const list = teamNum === 1 ? team1Ids : team2Ids;
    if (list.length <= 1) return;
    SoundFX.uiClick();
    list.splice(idx, 1);
    saveSelection();
    renderSelectScreen();
  }

  function promoteTeamLeader(idx) {
    if (idx <= 0 || idx >= team1Ids.length) return;
    SoundFX.chainLink();
    const picked = team1Ids.splice(idx, 1)[0];
    team1Ids.unshift(picked);
    saveSelection();
    renderSelectScreen();
  }

  function swapBrawlTeams() {
    SoundFX.chainLink();
    const tmp = [...team1Ids];
    team1Ids = [...team2Ids];
    team2Ids = tmp;
    saveSelection();
    renderSelectScreen();
  }

  function applyBrawlPreset(presetKey) {
    SoundFX.coinHeads();
    const allIds = CHARACTER_DB.map(c => c.id);
    const shuffled = () => [...allIds].sort(() => Math.random() - 0.5);

    if (presetKey === '3v3') {
      const s = shuffled();
      team1Ids = s.slice(0, 3);
      team2Ids = s.slice(3, 6);
    } else if (presetKey === '5v5') {
      const s = shuffled();
      team1Ids = s.slice(0, 5);
      team2Ids = s.slice(5, 10);
    } else if (presetKey === 'faction') {
      team1Ids = ['changjin', 'mingi', 'jiwon', 'hyunmin', 'hyunwoo'];
      team2Ids = ['yangwoo', 'jerok', 'yonghae', 'einstein', 'samchongsa'];
      stageId = 'bg-corridor';
    } else if (presetKey === 'raid') {
      team1Ids = ['changjin', 'jiwon', 'hyunmin', 'minji', 'seojangwon'];
      team2Ids = ['yangwoo'];
      stageId = 'bg-corridor';
    } else if (presetKey === 'my_raid') {
      team1Ids = ['mingi'];
      team2Ids = ['yangwoo', 'jerok', 'yonghae', 'einstein', 'park_clones'];
      brawlControl = 'player';
      stageId = 'bg-auditorium';
    }
    saveSelection();
    renderSelectScreen();
  }

  function randomizeCharacters() {
    if (gameMode === 'brawl') {
      applyBrawlPreset('3v3');
      return;
    }
    SoundFX.coinHeads();
    const ids = CHARACTER_DB.map(c => c.id);
    p1CharId = ids[Math.floor(Math.random() * ids.length)];
    const pool2 = ids.filter(id => id !== p1CharId);
    p2CharId = pool2[Math.floor(Math.random() * pool2.length)];
    p1PreviewPose = 'idle';
    p2PreviewPose = 'idle';
    stageId = FIGHT_STAGES[Math.floor(Math.random() * FIGHT_STAGES.length)].id;
    saveSelection();
    renderSelectScreen();
  }

  function previewFighterAnim(slot, animState) {
    if (animState === 'ego') SoundFX.egoAwaken();
    else if (animState === 'skill2') SoundFX.heavyHit();
    else if (animState === 'slash') SoundFX.lightHit();
    else SoundFX.uiClick();

    if (slot === 1) p1PreviewPose = animState;
    else p2PreviewPose = animState;

    const charId = slot === 1 ? p1CharId : p2CharId;
    const el = document.getElementById(`showcase-stage-${slot}`);
    if (el) CharacterSprites.setRigState(el, charId, animState);

    document.querySelectorAll(`[data-pose-btn="${slot}"]`).forEach(b => {
      b.classList.toggle('active', b.dataset.poseVal === animState);
    });
  }

  function launchFight() {
    if (typeof SoundFX.menuConfirm === 'function') SoundFX.menuConfirm();
    SoundFX.clashWin();
    saveSelection();
    closeAllModals();
    showScreen('fight');

    FightEngine.startMatch({
      mode: gameMode,
      difficulty,
      stageId,
      p1CharId,
      p2CharId,
      brawlControl,
      team1Ids: [...team1Ids],
      team2Ids: [...team2Ids]
    });
  }

  function backToSelect() {
    SoundFX.uiClick();
    FightEngine.stopEngine();
    closeAllModals();
    showScreen('select');
    SoundFX.playBgm('lobby');
    renderSelectScreen();
  }

  function syncAudioButtons() {
    const sfxBtn = document.getElementById('audio-toggle-btn');
    const bgmBtn = document.getElementById('bgm-toggle-btn');
    if (sfxBtn) sfxBtn.textContent = SoundFX.isEnabled() ? 'SFX: ON' : 'SFX: OFF';
    if (bgmBtn) bgmBtn.textContent = SoundFX.isBgmEnabled() ? 'BGM: ON' : 'BGM: OFF';
  }

  function toggleBgm() {
    SoundFX.toggleBgm();
    syncAudioButtons();
  }

  function toggleAudio() {
    SoundFX.toggle();
    syncAudioButtons();
  }

  function toggleTouchPad() {
    SoundFX.uiClick();
    touchPadOpen = !touchPadOpen;
    const pad = document.getElementById('virtual-arcade-pad');
    const btn = document.getElementById('btn-touchpad-toggle');
    if (pad) pad.classList.toggle('visible', touchPadOpen);
    if (btn) btn.classList.toggle('active', touchPadOpen);
  }

  // ==========================================================================
  // 셀렉트 화면 렌더링 (1v1 쇼케이스 & 다대다 팀 난전 빌더 통합)
  // ==========================================================================
  function renderStatPips(val, color) {
    return [1, 2, 3, 4, 5].map(i =>
      `<span class="stat-pip ${i <= val ? 'filled' : ''}" style="${i <= val ? `background:${color};box-shadow:0 0 6px ${color};` : ''}"></span>`
    ).join('');
  }

  function render1v1Showcase(slot, charId) {
    const c = CHARACTER_DB.find(x => x.id === charId) || CHARACTER_DB[0];
    const prof = FIGHTER_PROFILES[c.id] || FIGHTER_PROFILES.changjin;
    const facing = slot === 1 ? 'right' : 'left';
    const curPose = slot === 1 ? p1PreviewPose : p2PreviewPose;
    const sp1Name = c.skills[1] ? c.skills[1].name : c.skills[0].name;
    const sp2Name = c.skills[2] ? c.skills[2].name : '파워 크러시';
    const rageName = (c.skills[3] ? c.skills[3].name : '레이지 아츠').replace(/^\[E\.G\.O\]\s*/, '');
    const sigQuote = (c.skills[3] && c.skills[3].quote) || (c.skills[0] && c.skills[0].quote) || '';
    const charWins = records.charWins[c.id] || 0;
    const charUse = records.charUse[c.id] || 0;

    const badgeText = slot === 1
      ? '1P PLAYER'
      : (gameMode === 'arcade' ? 'ARCADE LADDER (5 STAGES)' : (gameMode === 'vs_2p' ? '2P PLAYER' : (gameMode === 'training' ? 'TRAINING DUMMY' : `CPU (${difficulty.toUpperCase()})`)));

    return `
      <div class="fighter-showcase slot-${slot} ${activeCursor === slot ? 'cursor-focus' : ''}"
           style="--fighter-accent:${prof.accent};"
           onclick="AppController.setCursorSlot(${slot})">
        <div class="showcase-top-row">
          <span class="player-slot-pill s${slot}">${badgeText}</span>
          <span class="arch-pill" style="border-color:${prof.accent};color:${prof.accent};">${prof.arch} · ${prof.tag}</span>
        </div>

        <div id="showcase-stage-${slot}" class="showcase-sprite-box">
          <div class="showcase-pedestal" style="--pedestal-col:${prof.accent};"></div>
          <div class="showcase-sprite-inner">
            ${CharacterSprites.render(c.id, facing, curPose)}
          </div>
          ${sigQuote ? `<div class="showcase-quote-chip">“${sigQuote}”</div>` : ''}
        </div>

        <div class="pose-preview-strip" onclick="event.stopPropagation()">
          <button data-pose-btn="${slot}" data-pose-val="idle" class="${curPose === 'idle' ? 'active' : ''}" onclick="AppController.previewFighterAnim(${slot}, 'idle')">대기</button>
          <button data-pose-btn="${slot}" data-pose-val="slash" class="${curPose === 'slash' ? 'active' : ''}" onclick="AppController.previewFighterAnim(${slot}, 'slash')">러시</button>
          <button data-pose-btn="${slot}" data-pose-val="skill2" class="${curPose === 'skill2' ? 'active' : ''}" onclick="AppController.previewFighterAnim(${slot}, 'skill2')">필살기</button>
          <button data-pose-btn="${slot}" data-pose-val="ego" class="${curPose === 'ego' ? 'active' : ''}" onclick="AppController.previewFighterAnim(${slot}, 'ego')">초필살</button>
        </div>

        <div class="showcase-identity">
          <h2>${c.name}</h2>
          <div class="showcase-sub">${c.title}</div>
        </div>

        <div class="showcase-stats-box">
          <div class="stat-line"><span>POWER</span><div class="pip-row">${renderStatPips(prof.stats[0], prof.accent)}</div></div>
          <div class="stat-line"><span>SPEED</span><div class="pip-row">${renderStatPips(prof.stats[1], prof.accent)}</div></div>
          <div class="stat-line"><span>REACH</span><div class="pip-row">${renderStatPips(prof.stats[2], prof.accent)}</div></div>
          <div class="stat-line meta"><span>HP ${prof.hp}</span><span>GUARD ${prof.guard}</span><span>${charUse ? `${charUse}전 ${charWins}승` : '첫 출전'}</span></div>
        </div>

        <div class="showcase-moves-box">
          <div class="mv-row"><span class="mv-key">${slot === 1 ? '1~2+Enter' : 'Num1~2'}</span> <strong>속공 3연타 · 라이징 어퍼</strong></div>
          <div class="mv-row"><span class="mv-key">${slot === 1 ? '3 + Enter' : 'Num3'}</span> <strong>${sp1Name}</strong></div>
          <div class="mv-row"><span class="mv-key armor">${slot === 1 ? '4 + Enter' : 'Num4'}</span> <strong>${sp2Name}</strong> <em>(슈퍼아머)</em></div>
          <div class="mv-row"><span class="mv-key rage">${slot === 1 ? '숫자 [5]' : 'Num5'}</span> <strong>🔥 ${rageName}</strong> <em>(게이지)</em></div>
        </div>
      </div>
    `;
  }

  function renderBrawlTeamPanel(teamNum) {
    const isBlue = teamNum === 1;
    const ids = isBlue ? team1Ids : team2Ids;
    const oppIds = isBlue ? team2Ids : team1Ids;
    const isSoloRaid = ids.length === 1 && oppIds.length >= 3;

    const rowsHtml = ids.map((cid, idx) => {
      const c = CHARACTER_DB.find(x => x.id === cid) || CHARACTER_DB[0];
      const prof = FIGHTER_PROFILES[c.id] || FIGHTER_PROFILES.changjin;
      const isLeader = isBlue && idx === 0 && brawlControl === 'player';
      return `
        <div class="brawl-roster-slot ${isLeader ? 'leader-slot' : ''}"
             style="--slot-accent:${prof.accent};"
             onclick="event.stopPropagation(); ${isBlue ? `AppController.promoteTeamLeader(${idx})` : `AppController.setCursorSlot(2)`}"
             title="${isBlue ? '클릭하여 1P 선봉 조작 캐릭터로 지정' : ''}">
          <div class="slot-num-badge ${isBlue ? 'blue' : 'red'}">${isLeader ? '1P' : `#${idx + 1}`}</div>
          <img src="${CharacterSprites.getPoseFileSrc(c.id, 'idle')}" class="${isBlue ? '' : 'flip-x'}" alt="${c.name}" />
          <div class="slot-char-meta">
            <div class="slot-char-name">
              ${c.name.split(' (')[0]}
              ${isLeader ? '<span class="leader-tag">직접 조작</span>' : ''}
              ${isSoloRaid ? '<span class="raid-tag">👑 레이드보스</span>' : ''}
            </div>
            <div class="slot-char-sub" style="color:${prof.accent};">${prof.arch} · ${prof.tag}</div>
          </div>
          ${ids.length > 1 ? `
            <button class="slot-remove-btn" onclick="AppController.removeTeamMember(${teamNum}, ${idx}, event)" title="팀에서 제외">✕</button>
          ` : ''}
        </div>
      `;
    }).join('');

    const emptySlotsCount = Math.max(0, 5 - ids.length);
    const emptyHtml = Array.from({ length: emptySlotsCount }).map((_, i) => `
      <div class="brawl-roster-slot empty" onclick="event.stopPropagation(); AppController.setCursorSlot(${teamNum})">
        <span>+ 빈 슬롯 #${ids.length + i + 1} (중앙에서 캐릭터 선택)</span>
      </div>
    `).join('');

    const teamPower = ids.reduce((s, cid) => s + ((FIGHTER_PROFILES[cid] || FIGHTER_PROFILES.changjin).hp), 0);

    return `
      <div class="fighter-showcase brawl-panel ${activeCursor === teamNum ? 'cursor-focus' : ''}"
           style="--fighter-accent:${isBlue ? '#00d2ff' : '#ff3b4e'};"
           onclick="AppController.setCursorSlot(${teamNum})">
        <div class="showcase-top-row" onclick="event.stopPropagation()">
          <span class="player-slot-pill s${teamNum}">
            ${isBlue ? `BLUE TEAM (${ids.length}/5)` : `RED TEAM (${ids.length}/5)`}
          </span>
          <div style="display:flex;gap:4px;align-items:center;">
            ${ids.length > 1 ? `<button class="swap-teams-btn" onclick="AppController.clearTeamToLeader(${teamNum})" title="선봉 1명만 남기고 비우기">초기화</button>` : ''}
            ${isBlue ? `
              <div class="brawl-ctrl-toggle">
                <button class="${brawlControl === 'player' ? 'active' : ''}" onclick="AppController.setBrawlControl('player')">🎮 직접</button>
                <button class="${brawlControl === 'spectate' ? 'active' : ''}" onclick="AppController.setBrawlControl('spectate')">🍿 관전</button>
              </div>
            ` : `
              <button class="swap-teams-btn" onclick="AppController.swapBrawlTeams()">⇄ 맞교대</button>
            `}
          </div>
        </div>

        <div class="brawl-slots-list">
          ${rowsHtml}
          ${emptyHtml}
        </div>

        <div class="brawl-panel-footer">
          <span class="team-power">총 체력 ${teamPower.toLocaleString()}</span>
          ${isSoloRaid
            ? `<span style="color:#f5d76e;font-weight:900;">👑 1 vs ${oppIds.length} 보스 레이드! 단독 체력 x${Math.min(2.7, 1 + (oppIds.length - 1) * 0.42).toFixed(1)}배</span>`
            : (isBlue
                ? '💡 전투 중 [Tab] / [Q]로 생존 아군 교대 조작'
                : '💡 중앙 초상화 우클릭 = RED 팀 즉시 편성')}
        </div>
      </div>
    `;
  }

  function renderSelectScreen() {
    const selScr = document.getElementById('screen-select');
    if (selScr) selScr.dataset.stageTheme = stageId;

    document.querySelectorAll('[data-mode-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.modeBtn === gameMode);
    });
    document.querySelectorAll('[data-diff-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diffBtn === difficulty);
    });
    const diffWrap = document.getElementById('difficulty-selector-wrap');
    if (diffWrap) {
      diffWrap.style.display = (gameMode === 'vs_2p' || gameMode === 'training') ? 'none' : 'flex';
    }

    const leftBox = document.getElementById('select-p1-panel');
    const rightBox = document.getElementById('select-p2-panel');
    const centerBox = document.getElementById('select-center-panel');
    if (!leftBox || !rightBox || !centerBox) return;

    const isBrawl = (gameMode === 'brawl');
    leftBox.innerHTML = isBrawl ? renderBrawlTeamPanel(1) : render1v1Showcase(1, p1CharId);
    rightBox.innerHTML = isBrawl ? renderBrawlTeamPanel(2) : render1v1Showcase(2, p2CharId);

    const gridHtml = CHARACTER_DB.map((c, idx) => {
      const prof = FIGHTER_PROFILES[c.id] || FIGHTER_PROFILES.changjin;
      let isP1 = false;
      let isP2 = false;
      let badge1 = '';
      let badge2 = '';

      if (isBrawl) {
        const idx1 = team1Ids.indexOf(c.id);
        const idx2 = team2Ids.indexOf(c.id);
        isP1 = idx1 >= 0;
        isP2 = idx2 >= 0;
        if (isP1) badge1 = `<span class="cell-tag p1">B${idx1 + 1}</span>`;
        if (isP2) badge2 = `<span class="cell-tag p2">R${idx2 + 1}</span>`;
      } else {
        isP1 = c.id === p1CharId;
        isP2 = c.id === p2CharId;
        if (isP1) badge1 = '<span class="cell-tag p1">1P</span>';
        if (isP2) badge2 = '<span class="cell-tag p2">2P</span>';
      }

      return `
        <div class="fighter-cell ${isP1 ? 'sel-p1' : ''} ${isP2 ? 'sel-p2' : ''} ${idx === gridFocusIdx ? 'kb-focus' : ''}"
             style="--cell-accent:${prof.accent};--cell-i:${idx};"
             onclick="AppController.pickCharacter('${c.id}')"
             oncontextmenu="AppController.pickCharacter('${c.id}', 2); return false;"
             title="${c.name} — 좌클릭: ${activeCursor === 1 ? '좌측(1P·BLUE)' : '우측(2P·RED)'} 편성 / 우클릭: 우측 즉시 편성">
          <img src="${CharacterSprites.getPoseFileSrc(c.id, 'idle')}" alt="${c.name}" draggable="false" />
          <div class="cell-name">${c.name.split(' (')[0]}</div>
          <div class="cell-arch" style="color:${prof.accent};">${prof.arch}</div>
          ${badge1}
          ${badge2}
        </div>
      `;
    }).join('');

    const curStageObj = FIGHT_STAGES.find(s => s.id === stageId) || FIGHT_STAGES[0];
    const stagesHtml = FIGHT_STAGES.map(s => `
      <button class="stage-pill ${s.id === stageId ? 'active' : ''}"
              onclick="AppController.setStage('${s.id}')"
              title="${s.sub}">
        ${s.name}
      </button>
    `).join('');

    const topBarHtml = isBrawl ? `
      <div class="cursor-switch-bar brawl-presets-bar">
        <div class="cursor-tabs">
          <button class="cursor-tab p1 ${activeCursor === 1 ? 'active' : ''}" onclick="AppController.setCursorSlot(1)">
            BLUE 팀 편성 (${team1Ids.length}/5)
          </button>
          <button class="cursor-tab p2 ${activeCursor === 2 ? 'active' : ''}" onclick="AppController.setCursorSlot(2)">
            RED 팀 편성 (${team2Ids.length}/5)
          </button>
        </div>
        <div class="preset-btns-row">
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('3v3')">🎲 3v3</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('5v5')">🔥 5v5</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('faction')">🏫 대항전</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('raid')">👑 5v1 레이드</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('my_raid')">⚡ 1v5 무쌍</button>
        </div>
      </div>
    ` : `
      <div class="cursor-switch-bar">
        <div class="cursor-tabs">
          <button class="cursor-tab p1 ${activeCursor === 1 ? 'active' : ''}" onclick="AppController.setCursorSlot(1)">
            1P 내 캐릭터
          </button>
          <button class="cursor-tab p2 ${activeCursor === 2 ? 'active' : ''}" onclick="AppController.setCursorSlot(2)">
            2P / 상대 캐릭터 [Tab]
          </button>
        </div>
        <button class="cursor-tab random" onclick="AppController.randomizeCharacters()">
          🎲 랜덤 [R]
        </button>
      </div>
    `;

    centerBox.innerHTML = `
      ${topBarHtml}

      <div class="roster-20-grid">
        ${gridHtml}
      </div>

      <div class="stage-select-strip">
        <span class="stage-lbl">STAGE · ${curStageObj.sub}</span>
        <div class="stage-pills-wrap">${stagesHtml}</div>
      </div>

      <div class="select-key-hints">
        <span><kbd>←↑↓→</kbd> 캐릭터 이동</span>
        <span><kbd>Space</kbd> 선택</span>
        <span><kbd>Tab</kbd> 슬롯 전환</span>
        <span><kbd>Enter</kbd> 대전 시작</span>
        <span><kbd>Esc</kbd> 타이틀</span>
      </div>

      <button class="giant-fight-btn" onclick="AppController.launchFight()">
        <span>${isBrawl ? `🔥 ${team1Ids.length} VS ${team2Ids.length} ALL-OUT TEAM BRAWL START!` : '⚔️ GET READY FOR THE NEXT BATTLE — FIGHT!'}</span>
        <small>[ENTER] 즉시 ${isBrawl ? '팀 난전 개시' : '대전 시작'}</small>
      </button>
    `;
  }

  window.addEventListener('DOMContentLoaded', init);

  return {
    setMode,
    setDifficulty,
    setStage,
    setCursorSlot,
    setBrawlControl,
    pickCharacter,
    clearTeamToLeader,
    removeTeamMember,
    promoteTeamLeader,
    swapBrawlTeams,
    applyBrawlPreset,
    randomizeCharacters,
    previewFighterAnim,
    launchFight,
    backToSelect,
    backToTitle,
    goToSelect,
    titleSelect,
    openTitleMenu,
    toggleBgm,
    toggleAudio,
    toggleTouchPad,
    openModal,
    closeModal,
    updateSetting,
    resetSettings,
    resetRecords,
    recordMatch,
    toast,
    getRecords: () => records,
    getSettings: () => ({ ...settings })
  };
})();
