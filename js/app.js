// ==========================================================================
// 전곽: IRON FIST (THE BEST) — Arcade 1v1 & Multi-Team Brawl Select Controller
// ==========================================================================

const AppController = (() => {
  let currentScreen = 'select'; // 'select' | 'fight'
  let gameMode = 'vs_cpu';      // 'vs_cpu' | 'brawl' | 'arcade' | 'vs_2p' | 'training'
  let difficulty = 'normal';    // 'easy' | 'normal' | 'hard'
  let stageId = 'bg-corridor';

  // 1v1 선택 상태
  let p1CharId = 'changjin';
  let p2CharId = 'yangwoo';
  let p1PreviewPose = 'idle';
  let p2PreviewPose = 'idle';
  let activeCursor = 1; // 1: Left(1P/Blue) | 2: Right(2P/Red)

  // 다대다 팀 난전(Brawl) 편성 상태 (각 팀 1~5인 자유 편성)
  let brawlControl = 'player'; // 'player' | 'spectate'
  let team1Ids = ['changjin', 'jiwon', 'hyunmin'];
  let team2Ids = ['yangwoo', 'jerok', 'yonghae'];

  let touchPadOpen = false;

  function init() {
    renderSelectScreen();
    bindSelectShortcuts();

    const unlockAudio = () => {
      SoundFX.init();
      if (currentScreen === 'select') {
        SoundFX.playBgm('lobby');
      }
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
  }

  function bindSelectShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (currentScreen !== 'select') return;
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        launchFight();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        setCursorSlot(activeCursor === 1 ? 2 : 1);
      }
    });
  }

  function setMode(mode) {
    SoundFX.uiClick();
    gameMode = mode;
    renderSelectScreen();
  }

  function setDifficulty(diff) {
    SoundFX.uiClick();
    difficulty = diff;
    renderSelectScreen();
  }

  function setStage(sId) {
    SoundFX.uiClick();
    stageId = sId;
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
    renderSelectScreen();
  }

  function pickCharacter(charId, forceSlot = null) {
    SoundFX.chainLink();
    const targetSlot = forceSlot || activeCursor;

    if (gameMode === 'brawl') {
      const list = targetSlot === 1 ? team1Ids : team2Ids;
      const idx = list.indexOf(charId);
      if (idx >= 0) {
        if (list.length > 1) list.splice(idx, 1);
      } else {
        if (list.length < 5) {
          list.push(charId);
        } else {
          list[list.length - 1] = charId;
        }
      }
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
    renderSelectScreen();
  }

  function clearTeamToLeader(teamNum) {
    SoundFX.uiClick();
    if (teamNum === 1) team1Ids = [team1Ids[0]];
    else team2Ids = [team2Ids[0]];
    activeCursor = teamNum;
    renderSelectScreen();
  }

  function removeTeamMember(teamNum, idx, ev) {
    if (ev) ev.stopPropagation();
    const list = teamNum === 1 ? team1Ids : team2Ids;
    if (list.length <= 1) return;
    SoundFX.uiClick();
    list.splice(idx, 1);
    renderSelectScreen();
  }

  function promoteTeamLeader(idx) {
    if (idx <= 0 || idx >= team1Ids.length) return;
    SoundFX.chainLink();
    const picked = team1Ids.splice(idx, 1)[0];
    team1Ids.unshift(picked);
    renderSelectScreen();
  }

  function swapBrawlTeams() {
    SoundFX.chainLink();
    const tmp = [...team1Ids];
    team1Ids = [...team2Ids];
    team2Ids = tmp;
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
    SoundFX.clashWin();
    currentScreen = 'fight';
    document.getElementById('screen-select').classList.remove('active');
    document.getElementById('screen-fight').classList.add('active');
    document.getElementById('pause-modal').classList.remove('active');
    document.getElementById('result-modal').classList.remove('active');

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
    currentScreen = 'select';
    document.getElementById('pause-modal').classList.remove('active');
    document.getElementById('result-modal').classList.remove('active');
    document.getElementById('screen-fight').classList.remove('active');
    document.getElementById('screen-select').classList.add('active');
    SoundFX.playBgm('lobby');
    renderSelectScreen();
  }

  function toggleBgm() {
    const on = SoundFX.toggleBgm();
    const btn = document.getElementById('bgm-toggle-btn');
    if (btn) btn.textContent = on ? 'BGM: ON' : 'BGM: OFF';
  }

  function toggleAudio() {
    const on = SoundFX.toggle();
    const sfxBtn = document.getElementById('audio-toggle-btn');
    const bgmBtn = document.getElementById('bgm-toggle-btn');
    if (sfxBtn) sfxBtn.textContent = on ? 'SFX: ON' : 'SFX: OFF';
    if (bgmBtn) bgmBtn.textContent = SoundFX.isBgmEnabled() ? 'BGM: ON' : 'BGM: OFF';
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
          <button data-pose-btn="${slot}" data-pose-val="ego" class="${curPose === 'ego' ? 'active' : ''}" onclick="AppController.previewFighterAnim(${slot}, 'ego')">레이지 아츠</button>
        </div>

        <div class="showcase-identity">
          <h2>${c.name}</h2>
          <div class="showcase-sub">${c.title}</div>
        </div>

        <div class="showcase-stats-box">
          <div class="stat-line"><span>POWER</span><div class="pip-row">${renderStatPips(prof.stats[0], prof.accent)}</div></div>
          <div class="stat-line"><span>SPEED</span><div class="pip-row">${renderStatPips(prof.stats[1], prof.accent)}</div></div>
          <div class="stat-line"><span>REACH</span><div class="pip-row">${renderStatPips(prof.stats[2], prof.accent)}</div></div>
        </div>

        <div class="showcase-moves-box">
          <div class="mv-row"><span class="mv-key">${slot === 1 ? '1~2+Enter' : 'Num1~2'}</span> <strong>속공 3연타 · 라이징 어퍼</strong></div>
          <div class="mv-row"><span class="mv-key">${slot === 1 ? '3 + Enter' : 'Num3'}</span> <strong>${sp1Name}</strong></div>
          <div class="mv-row"><span class="mv-key armor">${slot === 1 ? '4 + Enter' : 'Num4'}</span> <strong>${sp2Name}</strong> <em>(슈퍼아머)</em></div>
          <div class="mv-row"><span class="mv-key rage">${slot === 1 ? '숫자 [5]' : 'Num5'}</span> <strong>🔥 ${rageName}</strong> <em>(즉시발동)</em></div>
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
        <span>+ 빈 슬롯 #${ids.length + i + 1} (중앙에서 캐릭터 클릭)</span>
      </div>
    `).join('');

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
          ${isSoloRaid
            ? `<span style="color:#f5d76e;font-weight:900;">👑 1 vs ${oppIds.length} 보스 레이드! 단독 체력 x${Math.min(2.8, 1 + (oppIds.length - 1) * 0.45).toFixed(1)}배 강화 적용</span>`
            : (isBlue
                ? '💡 전투 중 [Tab] 또는 [Q] 키로 생존 아군 누구든 즉시 교대 조작 가능!'
                : '💡 중앙 초상화를 우클릭하면 바로 RED 팀에 추가·제외됩니다.')}
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

    const gridHtml = CHARACTER_DB.map(c => {
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
        <div class="fighter-cell ${isP1 ? 'sel-p1' : ''} ${isP2 ? 'sel-p2' : ''}"
             style="--cell-accent:${prof.accent};"
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
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('5v5')">🔥 5v5 총력전</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('faction')">🏫 정통 대항전</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('raid')">👑 5v1 양우레이드</button>
          <button class="preset-chip" onclick="AppController.applyBrawlPreset('my_raid')">⚡ 1v5 무쌍도전</button>
        </div>
      </div>
    ` : `
      <div class="cursor-switch-bar">
        <div class="cursor-tabs">
          <button class="cursor-tab p1 ${activeCursor === 1 ? 'active' : ''}" onclick="AppController.setCursorSlot(1)">
            1P 내 캐릭터 선택
          </button>
          <button class="cursor-tab p2 ${activeCursor === 2 ? 'active' : ''}" onclick="AppController.setCursorSlot(2)">
            2P / 상대 캐릭터 선택 [Tab]
          </button>
        </div>
        <button class="cursor-tab random" onclick="AppController.randomizeCharacters()">
          🎲 랜덤 매치업
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

      <button class="giant-fight-btn" onclick="AppController.launchFight()">
        <span>${isBrawl ? `🔥 ${team1Ids.length} VS ${team2Ids.length} ALL-OUT TEAM BRAWL START!` : '⚔️ GET READY FOR THE NEXT BATTLE — FIGHT!'}</span>
        <small>[SPACE / ENTER] 즉시 ${isBrawl ? '팀 난전 개시' : '대전 시작'}</small>
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
    toggleBgm,
    toggleAudio,
    toggleTouchPad
  };
})();
