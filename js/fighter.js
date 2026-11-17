// ==========================================================================
// 전곽: IRON FIST (THE BEST) — 60fps 2D Fighting & Multi-Team Brawl Engine
// [조작 패치 & 밸런스 패치 적용본]
// · 이동 / 점프 / 숙이기: WASD 및 화살표키 동시 지원
// · 가드: 스페이스바 (Space, 숙이기+Space 하단 가드 & 저스트 가드)
// · 기술 슬롯: [1] [2] [3] [4] 숫자키로 슬롯 선택 유지 ➔ [Enter] 키로 해당 슬롯 기술 연속 발동! (초저쿨타임)
// · 초필살기: [5] 숫자키를 눌렀을 때만 즉시 발동! (게이지 100% 또는 체력 30% 이하 RAGE 각성)
// ==========================================================================

const FIGHT_STAGES = [
  { id: 'bg-corridor',   name: '창의관 최상층',   sub: '현지기압 1013.7hPa · 결전의 회랑', bgm: 'boss' },
  { id: 'bg-auditorium', name: '개학식 대강당',   sub: '쿠데타의 연단 특설 링',           bgm: 'normal' },
  { id: 'bg-cafeteria',  name: '점심 급식실',     sub: '숙청의 배식대 데스매치',           bgm: 'normal' },
  { id: 'bg-studyroom',  name: '4층 심야 면학실', sub: '새벽 1시 사감 순찰 구역',          bgm: 'normal' },
  { id: 'bg-biolab',     name: '생실 & R&E실',    sub: '케르베로스 배양 실험실',           bgm: 'normal' },
  { id: 'bg-udon',       name: '우동집 특이점',   sub: '시간 대칭성 왜곡 아레나',          bgm: 'boss' }
];

// [밸런스 패치] 전 캐릭터 총합 스탯 예산(12점) 균등화 + 아키타입별 체력·가드 내구도 차별화
const FIGHTER_PROFILES = {
  changjin:    { arch: 'ALL-ROUND', tag: '과구리 정권 포격가',     stats: [4, 4, 4], hp: 1020, guard: 105, accent: '#ff4757', sp1: 'proj_cannon',  sp2: 'cannon_rush' },
  yangwoo:     { arch: 'POWER',     tag: '창의관 절대 지배자',     stats: [5, 3, 4], hp: 1080, guard: 115, accent: '#f5d76e', sp1: 'heavy_lunge',  sp2: 'gravity_slam' },
  jerok:       { arch: 'ZONER',     tag: '7색 레이저 & 신축팔',    stats: [4, 3, 5], hp: 940,  guard: 95,  accent: '#00e5ff', sp1: 'beam_rainbow', sp2: 'pierce_lance' },
  yonghae:     { arch: 'POWER',     tag: '물리학 중력 파쇄가',     stats: [5, 3, 4], hp: 1070, guard: 110, accent: '#3498db', sp1: 'proj_wave',    sp2: 'gravity_slam' },
  jiwon:       { arch: 'RUSHDOWN',  tag: '갤럭시 S펜 초고속 발도',  stats: [4, 5, 3], hp: 960,  guard: 100, accent: '#00e5ff', sp1: 'rush_slash',   sp2: 'flash_cut' },
  park_clones: { arch: 'TECHNICAL', tag: '하이브 분신 협공술',     stats: [4, 4, 4], hp: 1000, guard: 105, accent: '#a55eea', sp1: 'proj_wave',    sp2: 'cannon_rush' },
  seojangwon:  { arch: 'RUSHDOWN',  tag: '1시 면학 폭주 인파이터',  stats: [4, 5, 3], hp: 960,  guard: 95,  accent: '#a55eea', sp1: 'rush_slash',   sp2: 'flash_cut' },
  einstein:    { arch: 'RUSHDOWN',  tag: '심야 사감 암습 추격자',   stats: [4, 5, 3], hp: 960,  guard: 100, accent: '#00cec9', sp1: 'rush_slash',   sp2: 'flash_cut' },
  jongsam:     { arch: 'ZONER',     tag: '황금 6익 [언어] 마법사',  stats: [4, 3, 5], hp: 930,  guard: 95,  accent: '#f5d76e', sp1: 'proj_wing',    sp2: 'sky_wings' },
  minji:       { arch: 'RUSHDOWN',  tag: '산혼철조 혈투 어쌔신',    stats: [4, 5, 3], hp: 950,  guard: 95,  accent: '#ff2a36', sp1: 'rush_claws',   sp2: 'flash_cut' },
  hyunmin:     { arch: 'DEFENSE',   tag: '켐벨 철벽 가드 & 계승권', stats: [4, 4, 4], hp: 1060, guard: 135, accent: '#2ecc71', sp1: 'proj_cannon',  sp2: 'cannon_rush' },
  shelly:      { arch: 'POWER',     tag: '괴력 용병 브롤러',       stats: [5, 3, 4], hp: 1100, guard: 110, accent: '#ff6b6b', sp1: 'heavy_lunge',  sp2: 'gravity_slam' },
  yongsun:     { arch: 'DEFENSE',   tag: '모스 경도 금강 권법가',   stats: [4, 4, 4], hp: 1060, guard: 135, accent: '#f39c12', sp1: 'heavy_lunge',  sp2: 'cannon_rush' },
  samchongsa:  { arch: 'POWER',     tag: '진명 케르베로스 괴수',    stats: [5, 3, 4], hp: 1080, guard: 110, accent: '#00e5ff', sp1: 'proj_wither',  sp2: 'gravity_slam' },
  donggyun:    { arch: 'GRAPPLER',  tag: '장팔 리치 파쇄 파이터',   stats: [4, 3, 5], hp: 1050, guard: 105, accent: '#a55eea', sp1: 'heavy_lunge',  sp2: 'pierce_lance' },
  hyunseung:   { arch: 'POWER',     tag: '우동집 특급 식객 무투가', stats: [5, 4, 3], hp: 1060, guard: 105, accent: '#f1c40f', sp1: 'heavy_lunge',  sp2: 'gravity_slam' },
  hyunwoo:     { arch: 'RUSHDOWN',  tag: '초고속 카피 아츠 격투가', stats: [4, 5, 3], hp: 980,  guard: 100, accent: '#8e44ad', sp1: 'proj_cannon',  sp2: 'flash_cut' },
  seungdae:    { arch: 'POWER',     tag: '호통 중저음 충격파',     stats: [5, 3, 4], hp: 1090, guard: 115, accent: '#e67e22', sp1: 'heavy_lunge',  sp2: 'gravity_slam' },
  jusook:      { arch: 'TECHNICAL', tag: '화실의 우아한 카운터',    stats: [3, 4, 5], hp: 980,  guard: 115, accent: '#ff9ff3', sp1: 'proj_wave',    sp2: 'pierce_lance' },
  mingi:       { arch: 'RUSHDOWN',  tag: '[규칙] 불가시 초고속신',  stats: [4, 5, 3], hp: 950,  guard: 95,  accent: '#00e5ff', sp1: 'rush_slash',   sp2: 'flash_cut' }
};

const FightEngine = (() => {
  const STAGE_W = 1600;
  const STAGE_H = 720;
  const GROUND_Y = 605;
  const WALL_LEFT = 95;
  const WALL_RIGHT = 1505;
  const GRAVITY = 2480;
  const MAX_JUGGLE_HITS = 4; // 무한 공중 콤보 방지 상한

  // 초저쿨타임 설정 (요청 반영: 기술 쿨타임 최소화!)
  const SLOT_COOLDOWNS = {
    1: 0.00, // 1번 속공 연타: 완전 무쿨
    2: 0.25, // 2번 어퍼 & 가드파쇄: 0.25초 초저쿨
    3: 0.40, // 3번 고유 기술 1: 0.40초 초저쿨
    4: 0.55  // 4번 고유 강습기 2: 0.55초 초저쿨
  };

  let rafId = null;
  let lastTs = 0;
  let running = false;
  let paused = false;
  let showHitboxes = false;
  let brawlSpeed = 1.0;
  let lastAiSfxTs = 0;

  let matchConfig = {
    mode: 'vs_cpu',        // 'vs_cpu' | 'brawl' | 'arcade' | 'vs_2p' | 'training'
    difficulty: 'normal',  // 'easy' | 'normal' | 'hard'
    stageId: 'bg-corridor',
    brawlControl: 'player',// 'player' | 'spectate'
    team1Ids: ['changjin', 'hyunmin', 'jiwon'],
    team2Ids: ['yangwoo', 'jerok', 'yonghae'],
    arcadeStageIdx: 0,
    arcadeLadder: []
  };

  let roundNum = 1;
  let roundTimer = 60;
  let roundPhase = 'intro'; // 'intro' | 'fight' | 'ko_freeze' | 'round_over' | 'match_over'
  let phaseTimer = 0;
  let hitstopTimer = 0;
  let rageFreezeTimer = 0;
  let slowMoFactor = 1.0;

  let team1 = [];
  let team2 = [];
  let allFighters = [];
  let controlledFighter = null;
  let p2Fighter = null;
  let team1RoundsWon = 0;
  let team2RoundsWon = 0;
  let projectiles = [];

  const cam = { zoom: 1.0, x: 0, y: 0, shake: 0 };
  const keysDown = new Set();
  const tapTracker = { p1Left: -9999, p1Right: -9999, p2Left: -9999, p2Right: -9999 };
  let inputsBound = false;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const isBrawlMode = () => matchConfig.mode === 'brawl';

  function getCharData(charId) {
    return CHARACTER_DB.find(c => c.id === charId) || CHARACTER_DB[0];
  }

  function getProfile(charId) {
    return FIGHTER_PROFILES[charId] || FIGHTER_PROFILES.changjin;
  }

  function canPlaySfxFor(attacker, defender) {
    if (!isBrawlMode()) return true;
    if ((attacker && !attacker.isCpu) || (defender && !defender.isCpu)) return true;
    const now = performance.now();
    if (now - lastAiSfxTs < 52) return false;
    lastAiSfxTs = now;
    return true;
  }

  // ==========================================================================
  // 1. 밸런스 패치된 기술 데이터 (슬롯 1~4 + 5번 초필살기)
  // ==========================================================================
  function buildMoveSet(charId) {
    const db = getCharData(charId);
    const prof = getProfile(charId);
    const reachBonus = (prof.stats[2] - 4) * 18;
    // 과도한 딜 격차를 줄인 정밀 공격력 배율 (0.94x ~ 1.06x)
    const pwrMult = 0.88 + prof.stats[0] * 0.035;
    const spdTrim = prof.stats[1] >= 5 ? 0.90 : (prof.stats[1] <= 3 ? 1.06 : 0.98);

    const s1Name = db.skills[0] ? db.skills[0].name : '속공 연타';
    const s2Name = db.skills[1] ? db.skills[1].name : '비기 연격';
    const s3Name = db.skills[2] ? db.skills[2].name : '초강습 파쇄';
    const egoSk = db.skills[3] || { name: '초필살기', quote: '이걸로 끝이다!' };
    const rageName = egoSk.name.replace(/^\[E\.G\.O\]\s*/, '');

    const isRangedSp1 = prof.sp1.startsWith('proj_') || prof.sp1.startsWith('beam_');

    return {
      // [슬롯 1 - 1타]
      jab1: {
        id: 'jab1', slotNum: 1, name: '속공 1타', height: 'high',
        startup: 0.07 * spdTrim, active: 0.08, recovery: 0.14,
        dmg: Math.round(30 * pwrMult), chip: 2, guardDmg: 7, meterGain: 8,
        range: 148 + reachBonus, hitYOff: -95, hitH: 95,
        pushHit: 95, pushBlock: 85, launchVy: 0, airPopVy: -490,
        hitstun: 0.28, blockstun: 0.14, hitstop: 0.04,
        lungeVx: 145,
        poses: ['slash', 'slash', 'idle'], vfx: 'slash', spark: 'light',
        cancels: ['jab2', 'low', 'launcher', 'sp1', 'sp2', 'rage']
      },
      // [슬롯 1 - 2타]
      jab2: {
        id: 'jab2', slotNum: 1, name: '속공 2타', height: 'mid',
        startup: 0.08 * spdTrim, active: 0.09, recovery: 0.16,
        dmg: Math.round(38 * pwrMult), chip: 3, guardDmg: 10, meterGain: 9,
        range: 164 + reachBonus, hitYOff: -98, hitH: 100,
        pushHit: 135, pushBlock: 105, launchVy: 0, airPopVy: -510,
        hitstun: 0.32, blockstun: 0.16, hitstop: 0.05,
        lungeVx: 205,
        poses: ['pierce', 'action', 'idle'], vfx: 'pierce', spark: 'light',
        cancels: ['jab3', 'launcher', 'sp1', 'sp2', 'rage']
      },
      // [슬롯 1 - 3타 피니시]
      jab3: {
        id: 'jab3', slotNum: 1, name: s1Name, height: 'mid',
        startup: 0.10 * spdTrim, active: 0.11, recovery: 0.24,
        dmg: Math.round(56 * pwrMult), chip: 5, guardDmg: 16, meterGain: 12,
        range: 184 + reachBonus, hitYOff: -100, hitH: 110,
        pushHit: 390, pushBlock: 180, launchVy: -330, airPopVy: -420,
        causesKnockdown: true, causesBoundInAir: true, wallSplats: true,
        hitstun: 0.44, blockstun: 0.20, hitstop: 0.075,
        lungeVx: 270,
        poses: ['action', 'skill1', 'guard'], vfx: 'blunt', spark: 'heavy',
        cancels: ['sp1', 'sp2', 'rage']
      },
      // [슬롯 1 + 숙이기(S/↓)] 하단 스윕 킥 (서서 가드 파훼!)
      low: {
        id: 'low', slotNum: 1, name: '하단 스윕 킥', height: 'low',
        startup: 0.11 * spdTrim, active: 0.10, recovery: 0.24,
        dmg: Math.round(46 * pwrMult), chip: 4, guardDmg: 14, meterGain: 10,
        range: 176 + reachBonus, hitYOff: -45, hitH: 65,
        pushHit: 175, pushBlock: 130, launchVy: -280, airPopVy: -410,
        causesKnockdown: true, crouchAnim: true,
        hitstun: 0.40, blockstun: 0.20, hitstop: 0.06,
        lungeVx: 210,
        poses: ['guard', 'dash2', 'guard'], vfx: 'slash', spark: 'heavy',
        cancels: ['sp1', 'sp2', 'rage']
      },
      // [슬롯 1 + 대시] 대시 강습
      dash_atk: {
        id: 'dash_atk', slotNum: 1, name: '대시 어설트', height: 'mid',
        startup: 0.09 * spdTrim, active: 0.11, recovery: 0.22,
        dmg: Math.round(58 * pwrMult), chip: 5, guardDmg: 18, meterGain: 12,
        range: 188 + reachBonus, hitYOff: -100, hitH: 110,
        pushHit: 420, pushBlock: 200, launchVy: -340, airPopVy: -490,
        causesKnockdown: true, wallSplats: true,
        hitstun: 0.42, blockstun: 0.18, hitstop: 0.07,
        lungeVx: 480,
        poses: ['dash2', 'blunt', 'guard'], vfx: 'blunt', spark: 'heavy',
        cancels: ['sp1', 'sp2', 'rage']
      },
      // [공중 Enter] 점프 오버헤드 타격 (숙여 가드 파훼!)
      air_atk: {
        id: 'air_atk', slotNum: 1, name: '점프 오버헤드', height: 'overhead',
        startup: 0.08, active: 0.17, recovery: 0.12,
        dmg: Math.round(54 * pwrMult), chip: 5, guardDmg: 16, meterGain: 11,
        range: 168 + reachBonus, hitYOff: -70, hitH: 115,
        pushHit: 165, pushBlock: 130, launchVy: 0, airPopVy: 400,
        causesBoundInAir: true,
        hitstun: 0.40, blockstun: 0.20, hitstop: 0.065,
        lungeVx: 0,
        poses: ['dash2', 'slash', 'action'], vfx: 'slash', spark: 'heavy',
        cancels: []
      },

      // [슬롯 2] 라이징 어퍼 & 가드 파쇄 (공중 콤보 시동 + 높은 가드 데미지!)
      launcher: {
        id: 'launcher', slotNum: 2, name: '라이징 어퍼', height: 'mid',
        cooldown: SLOT_COOLDOWNS[2],
        startup: 0.13 * spdTrim, active: 0.11, recovery: 0.26,
        dmg: Math.round(60 * pwrMult), chip: 6, guardDmg: 38, meterGain: 14,
        range: 176 + reachBonus, hitYOff: -120, hitH: 145,
        pushHit: 130, pushBlock: 160, launchVy: -910, airPopVy: -620,
        isLauncher: true,
        hitstun: 0.58, blockstun: 0.22, hitstop: 0.085,
        lungeVx: 220,
        poses: ['guard', 'pierce', 'skill2'], vfx: 'pierce', spark: 'launcher',
        cancels: ['sp1', 'sp2', 'rage']
      },

      // [슬롯 3] 캐릭터 고유 기술 1 (장풍 · 7색 레이저 · 과구리포 · 초고속 돌진기)
      sp1: {
        id: 'sp1', slotNum: 3, name: s2Name, quote: db.skills[1] ? db.skills[1].quote : '',
        height: 'mid',
        cooldown: SLOT_COOLDOWNS[3],
        startup: (isRangedSp1 ? 0.19 : 0.14) * spdTrim,
        active: 0.12,
        recovery: isRangedSp1 ? 0.27 : 0.24,
        dmg: Math.round((isRangedSp1 ? 62 : 74) * pwrMult),
        chip: 5, guardDmg: 18, meterGain: 15,
        range: (prof.sp1 === 'beam_rainbow' ? 520 : (prof.sp1.startsWith('proj_') ? 195 : 230 + reachBonus)),
        hitYOff: -105, hitH: 118,
        pushHit: 320, pushBlock: 180, launchVy: isRangedSp1 ? -280 : -390, airPopVy: -520,
        specialKind: prof.sp1,
        wallSplats: true,
        hitstun: 0.42, blockstun: 0.18, hitstop: 0.075,
        lungeVx: isRangedSp1 ? -40 : 450,
        poses: ['skill1', 'skill2', 'idle'], vfx: 'pierce', spark: 'special',
        cancels: ['sp2', 'rage']
      },

      // [슬롯 4] 캐릭터 고유 강습기 2 (슈퍼아머 돌파 & 토네이도 바운드 — 무자원 초저쿨!)
      sp2: {
        id: 'sp2', slotNum: 4, name: s3Name, quote: db.skills[2] ? db.skills[2].quote : '',
        height: 'mid',
        cooldown: SLOT_COOLDOWNS[4],
        powerCrush: true,
        startup: 0.16 * spdTrim, active: 0.13, recovery: 0.28,
        dmg: Math.round(86 * pwrMult), chip: 8, guardDmg: 28, meterGain: 16,
        range: (prof.sp2 === 'sky_wings' ? 420 : 240 + reachBonus),
        hitYOff: -115, hitH: 132,
        pushHit: 520, pushBlock: 230, launchVy: -560, airPopVy: -580,
        specialKind: prof.sp2,
        causesKnockdown: true, causesBoundInAir: true, wallSplats: true,
        hitstun: 0.50, blockstun: 0.22, hitstop: 0.09,
        lungeVx: prof.sp2 === 'sky_wings' ? 0 : 540,
        poses: ['action', 'skill3', 'guard'], vfx: 'blunt', spark: 'special',
        cancels: ['rage']
      },

      // [5번 키 전용] 초필살기 (숫자 5 눌렀을 때만 즉시 발동!)
      rage: {
        id: 'rage', slotNum: 5, name: rageName, quote: egoSk.quote || '이걸로 끝이다!!',
        height: 'mid', isRageArt: true,
        powerCrush: true,
        startup: 0.13, active: 0.18, recovery: 0.38,
        dmg: Math.round(205 * pwrMult), chip: 22, guardDmg: 50, meterGain: 0,
        range: 330 + reachBonus, hitYOff: -125, hitH: 155,
        pushHit: 650, pushBlock: 300, launchVy: -700, airPopVy: -700,
        hitstun: 0.80, blockstun: 0.28, hitstop: 0.13,
        lungeVx: 720,
        poses: ['ego', 'skill3', 'ego'], vfx: 'ego', spark: 'rage',
        cancels: []
      }
    };
  }

  // ==========================================================================
  // 2. 파이터 엔티티 생성 (슬롯 상태 & 초저쿨 타이머 포함)
  // ==========================================================================
  function getSpawnX(team, idx, count) {
    if (count <= 1) return team === 1 ? 470 : 1130;
    if (team === 1) return clamp(560 - idx * 96, WALL_LEFT + 35, 620);
    return clamp(1040 + idx * 96, 980, WALL_RIGHT - 35);
  }

  function getDepthOffset(idx, count) {
    if (!isBrawlMode() || count <= 1) return 0;
    const offsets = [0, -20, 20, -34, 34];
    return offsets[idx % offsets.length];
  }

  function createFighter(team, idx, count, oppCount, charId, isCpu = true) {
    const db = getCharData(charId);
    const prof = getProfile(charId);
    CharacterSprites.preloadCharSprites(charId);

    const isRaidBoss = isBrawlMode() && count === 1 && oppCount >= 3;
    const hpMult = isRaidBoss ? Math.min(2.7, 1 + (oppCount - 1) * 0.42) : 1.0;
    const maxHp = Math.round((prof.hp || 1000) * hpMult);
    const maxGuard = prof.guard || 100;

    return {
      uid: `t${team}_${idx}_${charId}`,
      team,
      teamIdx: idx,
      slot: team,
      charId,
      name: db.name.split(' (')[0],
      fullName: db.name,
      title: db.title,
      isCpu,
      isRaidBoss,
      prof,
      moves: buildMoveSet(charId),

      x: getSpawnX(team, idx, count),
      y: GROUND_Y,
      depthY: getDepthOffset(idx, count),
      vx: 0,
      vy: 0,
      facing: team === 1 ? 1 : -1,

      maxHp,
      hp: maxHp,
      trailHp: maxHp,
      meter: matchConfig.mode === 'training' ? 100 : 0, // 밸런스 패치: 0%에서 교전으로 충전!
      maxGuard,
      guardHp: maxGuard,
      inRage: false,
      rageArtUsed: false,

      // 숫자 슬롯 선택 유지 상태 (기본 1번 슬롯 장착!)
      selectedSlot: 1, // 1 | 2 | 3 | 4
      slotCooldowns: { 1: 0, 2: 0, 3: 0, 4: 0 },

      state: 'idle',
      stateTime: 0,
      crouching: false,
      guarding: false,
      justGuardWindow: 0,
      invulnTimer: 0,
      armorFlashTimer: 0,
      hitFlashTimer: 0,

      curMove: null,
      moveTime: 0,
      hitTargets: new Set(),
      moveProjectileSpawned: false,

      stunTimer: 0,
      juggleCount: 0,
      continuousTakenDmg: 0,
      boundUsedInCombo: false,
      wallSplatUsedInCombo: false,
      rageTarget: null,

      comboCount: 0,
      comboDamage: 0,
      comboDisplayTimer: 0,
      calloutText: '',
      calloutTimer: 0,

      totalDamageDealt: 0,
      kosScored: 0,

      bufferedMoveId: null,
      bufferTimer: 0,

      aiThinkTimer: Math.random() * 0.25,
      aiTargetUid: null,
      aiMoveX: 0,
      aiJumpReq: false,
      aiCrouchReq: false,
      aiGuardBtn: false,
      aiComboQueue: []
    };
  }

  function resetFighterForRound(f, count) {
    f.x = getSpawnX(f.team, f.teamIdx, count);
    f.y = GROUND_Y;
    f.vx = 0;
    f.vy = 0;
    f.facing = f.team === 1 ? 1 : -1;
    f.hp = f.maxHp;
    f.trailHp = f.maxHp;
    // 이전 라운드 잔여 게이지 일부 이월 (트레이닝은 100%)
    f.meter = matchConfig.mode === 'training' ? 100 : Math.min(100, Math.round(f.meter * 0.35));
    f.guardHp = f.maxGuard;
    f.inRage = false;
    f.rageArtUsed = false;
    f.slotCooldowns = { 1: 0, 2: 0, 3: 0, 4: 0 };
    f.state = 'idle';
    f.stateTime = 0;
    f.crouching = false;
    f.guarding = false;
    f.justGuardWindow = 0;
    f.invulnTimer = 0;
    f.armorFlashTimer = 0;
    f.hitFlashTimer = 0;
    f.curMove = null;
    f.moveTime = 0;
    f.hitTargets.clear();
    f.moveProjectileSpawned = false;
    f.stunTimer = 0;
    f.juggleCount = 0;
    f.continuousTakenDmg = 0;
    f.boundUsedInCombo = false;
    f.wallSplatUsedInCombo = false;
    f.rageTarget = null;
    f.comboCount = 0;
    f.comboDamage = 0;
    f.comboDisplayTimer = 0;
    f.calloutText = '';
    f.calloutTimer = 0;
    f.bufferedMoveId = null;
    f.bufferTimer = 0;
    f.aiComboQueue = [];
  }

  function findNearestEnemy(f) {
    const oppTeam = f.team === 1 ? team2 : team1;
    const living = oppTeam.filter(e => e.hp > 0 && e.state !== 'ko');
    if (living.length === 0) return oppTeam[0] || null;

    if (f.isCpu && f.aiTargetUid) {
      const locked = living.find(e => e.uid === f.aiTargetUid);
      if (locked && Math.random() < 0.90) return locked;
    }

    let best = living[0];
    let bestDist = Math.abs(best.x - f.x);
    for (let i = 1; i < living.length; i++) {
      const d = Math.abs(living[i].x - f.x);
      if (d < bestDist) {
        bestDist = d;
        best = living[i];
      }
    }
    return best;
  }

  // ==========================================================================
  // 3. 매치 시작 · 슬롯 선택 · 아군 태그 · 라운드 진행
  // ==========================================================================
  function startMatch(opts = {}) {
    matchConfig.mode = opts.mode || 'vs_cpu';
    matchConfig.difficulty = opts.difficulty || 'normal';
    matchConfig.stageId = opts.stageId || 'bg-corridor';
    matchConfig.brawlControl = opts.brawlControl || 'player';
    brawlSpeed = 1.0;

    let t1Ids = [opts.p1CharId || 'changjin'];
    let t2Ids = [opts.p2CharId || 'yangwoo'];

    if (matchConfig.mode === 'arcade') {
      matchConfig.arcadeStageIdx = 0;
      const p1Id = t1Ids[0];
      const pool = CHARACTER_DB.map(c => c.id).filter(id => id !== p1Id && id !== 'yangwoo' && id !== 'mingi');
      pool.sort(() => Math.random() - 0.5);
      const bossId = p1Id === 'yangwoo' ? 'mingi' : 'yangwoo';
      const subBossId = p1Id === 'samchongsa' ? 'jerok' : 'samchongsa';
      matchConfig.arcadeLadder = [pool[0], pool[1], pool[2], subBossId, bossId];
      t2Ids = [matchConfig.arcadeLadder[0]];
      matchConfig.stageId = FIGHT_STAGES[0].id;
    } else if (matchConfig.mode === 'brawl') {
      t1Ids = (opts.team1Ids && opts.team1Ids.length > 0) ? [...opts.team1Ids] : ['changjin', 'hyunmin', 'jiwon'];
      t2Ids = (opts.team2Ids && opts.team2Ids.length > 0) ? [...opts.team2Ids] : ['yangwoo', 'jerok', 'yonghae'];
    }

    matchConfig.team1Ids = t1Ids;
    matchConfig.team2Ids = t2Ids;

    buildTeamsFromConfig();
    team1RoundsWon = 0;
    team2RoundsWon = 0;

    bindKeyboardEvents();
    setupArenaDOM();
    beginRound(1);

    running = true;
    paused = false;
    if (!rafId) {
      lastTs = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }

  function buildTeamsFromConfig() {
    const t1Ids = matchConfig.team1Ids;
    const t2Ids = matchConfig.team2Ids;
    const spectate = isBrawlMode() && matchConfig.brawlControl === 'spectate';

    team1 = t1Ids.map((cid, idx) => createFighter(1, idx, t1Ids.length, t2Ids.length, cid, spectate ? true : idx !== 0));
    team2 = t2Ids.map((cid, idx) => createFighter(2, idx, t2Ids.length, t1Ids.length, cid, matchConfig.mode !== 'vs_2p'));
    allFighters = [...team1, ...team2];

    team1.forEach((f, idx) => {
      if (team2.length > 0) f.aiTargetUid = team2[idx % team2.length].uid;
    });
    team2.forEach((f, idx) => {
      if (team1.length > 0) f.aiTargetUid = team1[idx % team1.length].uid;
    });

    controlledFighter = spectate ? null : team1[0];
    p2Fighter = matchConfig.mode === 'vs_2p' ? team2[0] : null;
  }

  // [핵심] 숫자 1~4 슬롯 선택 (발동은 하지 않고 장착 슬롯만 변경!)
  function selectSlot(slotNum, targetFighter = null) {
    const f = targetFighter || controlledFighter;
    if (!f || slotNum < 1 || slotNum > 4) return;
    if (f.selectedSlot !== slotNum) {
      f.selectedSlot = slotNum;
      SoundFX.uiClick();
    }
    renderSkillDockDOM();
  }

  function swapControlledAlly(targetIdx = null) {
    if (!isBrawlMode() || roundPhase !== 'fight') return;
    const livingAllies = team1.filter(f => f.hp > 0 && f.state !== 'ko');
    if (livingAllies.length === 0) return;

    let nextF = null;
    if (targetIdx !== null && team1[targetIdx] && team1[targetIdx].hp > 0) {
      nextF = team1[targetIdx];
    } else if (!controlledFighter) {
      nextF = livingAllies[0];
    } else {
      const curPos = livingAllies.indexOf(controlledFighter);
      nextF = livingAllies[(curPos + 1) % livingAllies.length];
    }

    if (!nextF || nextF === controlledFighter) return;

    team1.forEach(f => { f.isCpu = true; });
    nextF.isCpu = false;
    controlledFighter = nextF;
    matchConfig.brawlControl = 'player';

    SoundFX.chainLink();
    FightVFX.spawnGroundSlam(nextF.x, '#00e5ff', 95);
    showCallout(nextF, `🎮 ${nextF.name} 직접 조작!`);
    renderSkillDockDOM();
    updateHudDOM();
  }

  function cycleBrawlSpeed() {
    SoundFX.uiClick();
    if (brawlSpeed === 1.0) brawlSpeed = 1.5;
    else if (brawlSpeed === 1.5) brawlSpeed = 2.0;
    else brawlSpeed = 1.0;
    const btn = document.getElementById('btn-brawl-speed');
    if (btn) btn.textContent = `${brawlSpeed.toFixed(1)}x`;
  }

  function nextArcadeOpponent() {
    if (matchConfig.mode !== 'arcade') return rematch();
    matchConfig.arcadeStageIdx++;
    if (matchConfig.arcadeStageIdx >= matchConfig.arcadeLadder.length) {
      if (typeof AppController !== 'undefined') AppController.backToSelect();
      return;
    }
    const nextId = matchConfig.arcadeLadder[matchConfig.arcadeStageIdx];
    const stg = FIGHT_STAGES[matchConfig.arcadeStageIdx % FIGHT_STAGES.length];
    matchConfig.stageId = stg.id;
    matchConfig.team2Ids = [nextId];

    team1RoundsWon = 0;
    team2RoundsWon = 0;
    buildTeamsFromConfig();
    paused = false;
    hideResultModal();
    setupArenaDOM();
    beginRound(1);
  }

  function rematch() {
    if (allFighters.length === 0) return;
    team1RoundsWon = 0;
    team2RoundsWon = 0;
    buildTeamsFromConfig();
    paused = false;
    hideResultModal();
    setupArenaDOM();
    beginRound(1);
  }

  function stopEngine() {
    running = false;
    paused = false;
    keysDown.clear();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function togglePause() {
    if (!running || roundPhase === 'match_over') return;
    paused = !paused;
    const pm = document.getElementById('pause-modal');
    if (pm) pm.classList.toggle('active', paused);
  }

  function toggleHitboxDebug() {
    showHitboxes = !showHitboxes;
    SoundFX.uiClick();
    const btn = document.getElementById('btn-hitbox-toggle');
    if (btn) btn.classList.toggle('active', showHitboxes);
  }

  function beginRound(rNum) {
    roundNum = rNum;
    roundTimer = (matchConfig.mode === 'training' || isBrawlMode()) ? 99 : 60;
    projectiles = [];
    slowMoFactor = 1.0;
    hitstopTimer = 0;
    rageFreezeTimer = 0;

    team1.forEach(f => resetFighterForRound(f, team1.length));
    team2.forEach(f => resetFighterForRound(f, team2.length));

    if (isBrawlMode() && matchConfig.brawlControl !== 'spectate') {
      team1.forEach((f, idx) => { f.isCpu = idx !== 0; });
      controlledFighter = team1[0];
    }

    FightVFX.clearAll();
    const kfBox = document.getElementById('killfeed-box');
    if (kfBox) kfBox.innerHTML = '';
    const dpLayer = document.getElementById('damage-pop-layer');
    if (dpLayer) dpLayer.innerHTML = '';

    const stg = FIGHT_STAGES.find(s => s.id === matchConfig.stageId) || FIGHT_STAGES[0];
    const isBossBgm = isBrawlMode() || (matchConfig.mode === 'arcade' && matchConfig.arcadeStageIdx === matchConfig.arcadeLadder.length - 1);
    SoundFX.playBgm(isBossBgm ? 'boss' : stg.bgm);

    if (matchConfig.mode === 'training') {
      roundPhase = 'fight';
      phaseTimer = 0;
      showCenterBanner('TRAINING START!', '[1~4] 슬롯 선택 ➔ [Enter] 기술 발동 · [5] 초필살기 · [Space] 가드', 1.2);
    } else if (isBrawlMode()) {
      roundPhase = 'intro';
      phaseTimer = 1.45;
      showCenterBanner(
        `${team1.length} VS ${team2.length} BRAWL!`,
        matchConfig.brawlControl === 'spectate' ? 'AI 올스타 전면 난전 관전!' : '[1~4] 기술선택 + [Enter] 발동 · [5] 필살기 · [Tab] 아군교대',
        1.35
      );
      SoundFX.roundBell();
      SoundFX.announce('Get Ready! All Out Brawl!');
    } else {
      roundPhase = 'intro';
      phaseTimer = 1.45;
      const stagePrefix = matchConfig.mode === 'arcade'
        ? `STAGE ${matchConfig.arcadeStageIdx + 1}/${matchConfig.arcadeLadder.length} · `
        : '';
      const rTitle = (team1RoundsWon === 1 && team2RoundsWon === 1) ? 'FINAL ROUND' : `ROUND ${roundNum}`;
      showCenterBanner(rTitle, `${stagePrefix}${team1[0].name} VS ${team2[0].name}`, 1.35);
      SoundFX.roundBell();
      SoundFX.announce(rTitle === 'FINAL ROUND' ? 'Final Round! Get Ready!' : `Round ${roundNum}!`);
    }

    renderSkillDockDOM();
    syncStageDOM(0);
    updateHudDOM();
  }

  // ==========================================================================
  // 4. 아레나 DOM & 5슬롯 스킬 독(Skill Dock) 렌더링
  // ==========================================================================
  function setupArenaDOM() {
    const hud1v1 = document.getElementById('hud-1v1-wrap');
    const hudBrawl = document.getElementById('hud-brawl-wrap');
    if (hud1v1 && hudBrawl) {
      hud1v1.style.display = isBrawlMode() ? 'none' : 'grid';
      hudBrawl.style.display = isBrawlMode() ? 'grid' : 'none';
    }

    const bgEl = document.getElementById('fight-stage-bg');
    if (bgEl) bgEl.className = `arena-bg ${matchConfig.stageId}`;
    renderStageBackdropSVG(matchConfig.stageId);
    FightVFX.bindCanvas(matchConfig.stageId);

    const stageLayer = document.getElementById('fighters-stage-layer');
    if (stageLayer) {
      stageLayer.innerHTML = allFighters.map(f => `
        <div id="f-dom-${f.uid}" class="stage-fighter team-${f.team} ${isBrawlMode() ? 'brawl-scale' : ''}">
          ${isBrawlMode() ? `
            <div class="fighter-overhead-tag" id="f-tag-${f.uid}">
              <div class="oh-name-line" id="f-oh-name-${f.uid}">${f.name}</div>
              <div class="oh-hp-track">
                <div class="oh-hp-fill t${f.team}" id="f-oh-hp-${f.uid}"></div>
              </div>
            </div>
          ` : ''}
          <div class="fighter-ground-shadow" id="f-shadow-${f.uid}"></div>
          <div class="fighter-aura-ring ${f.team === 2 ? 'enemy' : ''}" id="f-ring-${f.uid}"></div>
          <div class="fighter-body-wrap" id="f-body-${f.uid}">
            ${CharacterSprites.render(f.charId, f.team === 1 ? 'right' : 'left', 'idle')}
          </div>
        </div>
      `).join('');
    }

    const stg = FIGHT_STAGES.find(s => s.id === matchConfig.stageId) || FIGHT_STAGES[0];

    if (!isBrawlMode() && team1[0] && team2[0]) {
      const f1 = team1[0];
      const f2 = team2[0];
      const p1Port = document.getElementById('hud-p1-portrait');
      const p2Port = document.getElementById('hud-p2-portrait');
      if (p1Port) p1Port.src = CharacterSprites.getPoseFileSrc(f1.charId, 'idle');
      if (p2Port) p2Port.src = CharacterSprites.getPoseFileSrc(f2.charId, 'idle');

      const p1Name = document.getElementById('hud-p1-name');
      const p2Name = document.getElementById('hud-p2-name');
      if (p1Name) p1Name.textContent = f1.name;
      if (p2Name) p2Name.textContent = `${f2.name}${f2.isCpu ? ' [CPU]' : ' [2P]'}`;

      const stgTag = document.getElementById('hud-stage-label');
      if (stgTag) {
        stgTag.textContent = matchConfig.mode === 'arcade'
          ? `STAGE ${matchConfig.arcadeStageIdx + 1}/${matchConfig.arcadeLadder.length} · ${stg.name}`
          : stg.name;
      }
    } else {
      const bStg = document.getElementById('brawl-stage-label');
      if (bStg) bStg.textContent = `${team1.length}v${team2.length} 난전 · ${stg.name}`;
      const spdBtn = document.getElementById('btn-brawl-speed');
      if (spdBtn) spdBtn.textContent = `${brawlSpeed.toFixed(1)}x`;
      renderBrawlRosterChips();
    }

    renderSkillDockDOM();
  }

  function renderBrawlRosterChips() {
    const c1 = document.getElementById('brawl-t1-chips');
    const c2 = document.getElementById('brawl-t2-chips');
    if (c1) {
      c1.innerHTML = team1.map((f, idx) => `
        <div id="bchip-${f.uid}" class="brawl-chip blue ${controlledFighter === f ? 'controlled' : ''}"
             onclick="FightEngine.swapControlledAlly(${idx})"
             title="클릭하여 ${f.name} 직접 조작 (단축키: Tab / Q)">
          <img src="${CharacterSprites.getPoseFileSrc(f.charId, 'idle')}" alt="${f.name}" />
          <div class="bchip-info">
            <span class="bchip-name">${controlledFighter === f ? '★ ' : ''}${f.name}</span>
            <div class="bchip-hp"><div id="bchip-hp-${f.uid}" style="width:100%;"></div></div>
          </div>
        </div>
      `).join('');
    }
    if (c2) {
      c2.innerHTML = team2.map(f => `
        <div id="bchip-${f.uid}" class="brawl-chip red">
          <img src="${CharacterSprites.getPoseFileSrc(f.charId, 'idle')}" class="flip-x" alt="${f.name}" />
          <div class="bchip-info">
            <span class="bchip-name">${f.isRaidBoss ? '👑 ' : ''}${f.name}</span>
            <div class="bchip-hp"><div id="bchip-hp-${f.uid}" style="width:100%;"></div></div>
          </div>
        </div>
      `).join('');
    }
  }

  // 하단 5슬롯 스킬 바 렌더링 ([1~4] 슬롯 선택 + Enter 발동 | [5] 숫자 직접 발동 필살기)
  function renderSkillDockDOM() {
    const dock = document.getElementById('hud-skill-dock');
    if (!dock) return;

    if (isBrawlMode() && !controlledFighter) {
      dock.innerHTML = `
        <div class="spectate-dock-notice">
          🍿 <strong>AI 자동 난전 관전 중</strong> — 상단 BLUE 팀 초상화를 클릭하거나 <kbd class="k-cyan">Tab</kbd> 키를 누르면 즉시 직접 난입할 수 있습니다!
        </div>
      `;
      return;
    }

    const cf = controlledFighter || team1[0];
    if (!cf) return;

    const shortTxt = (s, n = 11) => (s && s.length > n ? s.slice(0, n) + '…' : s);
    const slotDefs = [
      { num: 1, title: '속공 3연타', sub: '무쿨 · 숙이면 하단', move: cf.moves.jab3 },
      { num: 2, title: '라이징 어퍼', sub: '띄우기 · 가드파쇄', move: cf.moves.launcher },
      { num: 3, title: shortTxt(cf.moves.sp1.name), sub: '고유기 · 0.4s', move: cf.moves.sp1 },
      { num: 4, title: shortTxt(cf.moves.sp2.name), sub: '슈퍼아머 · 0.55s', move: cf.moves.sp2 }
    ];

    const slotsHtml = slotDefs.map(sd => {
      const isSel = cf.selectedSlot === sd.num;
      return `
        <div id="skill-slot-card-${sd.num}"
             class="skill-slot-card ${isSel ? 'selected' : ''}"
             onclick="FightEngine.selectSlot(${sd.num})"
             title="[${sd.num}]번 키로 슬롯 선택 후 [Enter] 키로 발동!">
          <div class="slot-cd-fill" id="slot-cd-${sd.num}" style="height:0%;"></div>
          <div class="slot-card-top">
            <kbd class="slot-key">${sd.num}</kbd>
            <span class="slot-enter-tag">${isSel ? 'ENTER 발동' : '선택'}</span>
          </div>
          <div class="slot-card-title">${sd.title}</div>
          <div class="slot-card-sub">${sd.sub}</div>
        </div>
      `;
    }).join('');

    const ultReady = canUseRageArt(cf);
    const ultHtml = `
      <div id="skill-slot-card-5"
           class="skill-slot-card ult-slot ${ultReady ? 'ult-ready' : ''}"
           onclick="FightEngine.pressVirtualAction('ult')"
           title="초필살기는 [5]번 숫자키를 눌렀을 때만 즉시 발동됩니다!">
        <div class="slot-card-top">
          <kbd class="slot-key ult-key">5</kbd>
          <span class="slot-enter-tag ult-tag">${ultReady ? '🔥 숫자 5 즉시발동!' : '게이지 100% / RAGE'}</span>
        </div>
        <div class="slot-card-title">🔥 ${shortTxt(cf.moves.rage.name, 12)}</div>
        <div class="slot-card-sub">숫자 [5] 전용 초필살기</div>
      </div>
    `;

    dock.innerHTML = `
      <div class="dock-Quick-hint">
        <span><kbd>WASD</kbd><kbd>방향키</kbd> 이동·점프·숙이기</span>
        <span><kbd class="k-cyan">Space</kbd> 가드</span>
        ${isBrawlMode() ? `<span><kbd class="k-cyan">Tab</kbd> 교대</span>` : ''}
      </div>
      <div class="dock-slots-row">
        ${slotsHtml}
        <div class="dock-divider"></div>
        ${ultHtml}
      </div>
    `;
  }

  function renderStageBackdropSVG(bgClass) {
    const svg = document.getElementById('fight-decor-svg');
    if (!svg) return;
    const gridColor = bgClass === 'bg-studyroom' ? 'rgba(0,229,255,0.22)'
      : (bgClass === 'bg-biolab' ? 'rgba(46,204,113,0.22)'
      : (bgClass === 'bg-auditorium' || bgClass === 'bg-udon' ? 'rgba(245,215,110,0.24)' : 'rgba(255,42,54,0.26)'));

    let arch = '';
    if (bgClass === 'bg-auditorium') {
      arch = `
        <polygon points="800,0 520,565 1080,565" fill="rgba(245,215,110,0.06)"/>
        <rect x="460" y="95" width="680" height="290" fill="rgba(14,18,30,0.65)" stroke="rgba(212,175,55,0.4)" stroke-width="2"/>
        <text x="800" y="245" text-anchor="middle" fill="rgba(245,215,110,0.18)" font-size="54" font-weight="900" letter-spacing="8">JEONGWAK ARENA</text>
      `;
    } else if (bgClass === 'bg-studyroom') {
      arch = `
        <g stroke="rgba(0,229,255,0.25)" fill="rgba(8,16,30,0.55)" stroke-width="2">
          <rect x="160" y="110" width="260" height="260"/><rect x="480" y="110" width="260" height="260"/>
          <rect x="860" y="110" width="260" height="260"/><rect x="1180" y="110" width="260" height="260"/>
        </g>
        <circle cx="800" cy="88" r="14" fill="rgba(0,229,255,0.65)"/>
        <circle cx="800" cy="88" r="42" fill="none" stroke="rgba(0,229,255,0.28)" stroke-dasharray="6,5"/>
      `;
    } else if (bgClass === 'bg-biolab') {
      arch = `
        <g stroke="rgba(46,204,113,0.4)" fill="rgba(14,48,38,0.4)" stroke-width="2.5">
          <rect x="200" y="95" width="130" height="350" rx="16"/><rect x="430" y="95" width="130" height="350" rx="16"/>
          <rect x="1040" y="95" width="130" height="350" rx="16"/><rect x="1270" y="95" width="130" height="350" rx="16"/>
        </g>
      `;
    } else if (bgClass === 'bg-udon') {
      arch = `
        <circle cx="800" cy="240" r="145" fill="none" stroke="rgba(245,215,110,0.28)" stroke-width="3" stroke-dasharray="12,8"/>
        <circle cx="800" cy="240" r="98" fill="none" stroke="rgba(255,42,54,0.28)" stroke-width="2"/>
        <line x1="800" y1="240" x2="800" y2="128" stroke="rgba(245,215,110,0.45)" stroke-width="4"/>
        <line x1="800" y1="240" x2="875" y2="275" stroke="rgba(255,42,54,0.45)" stroke-width="3"/>
      `;
    } else {
      arch = `
        <g stroke="rgba(212,175,55,0.28)" fill="rgba(22,10,16,0.52)" stroke-width="2">
          <rect x="150" y="95" width="190" height="320"/><rect x="430" y="95" width="190" height="320"/>
          <rect x="980" y="95" width="190" height="320"/><rect x="1260" y="95" width="190" height="320"/>
        </g>
        <text x="800" y="255" text-anchor="middle" fill="rgba(255,42,54,0.16)" font-size="52" font-weight="900" letter-spacing="6">THE BEST · 1013.7hPa</text>
      `;
    }

    svg.innerHTML = `
      ${arch}
      <rect x="0" y="565" width="1600" height="155" fill="rgba(6, 8, 14, 0.82)"/>
      <line x1="0" y1="565" x2="1600" y2="565" stroke="${gridColor}" stroke-width="3"/>
      <line x1="0" y1="605" x2="1600" y2="605" stroke="${gridColor}" stroke-width="1.5"/>
      <line x1="0" y1="655" x2="1600" y2="655" stroke="${gridColor}" stroke-width="1.2"/>
      ${[-6, -4, -2, -1, 0, 1, 2, 4, 6].map(k =>
        `<line x1="${800 + k * 110}" y1="565" x2="${800 + k * 230}" y2="720" stroke="${gridColor}" stroke-width="1.2"/>`
      ).join('')}
      <rect x="46" y="80" width="10" height="535" fill="${gridColor}"/>
      <rect x="1544" y="80" width="10" height="535" fill="${gridColor}"/>
    `;
  }

  // ==========================================================================
  // 5. 키보드 입력 바인딩
  // · 이동/점프/숙이기: WASD + 화살표키
  // · 가드: Space
  // · 슬롯 선택: 1, 2, 3, 4 (선택된 슬롯 유지)
  // · 선택 기술 발동: Enter
  // · 필살기 즉시 발동: 5 (숫자 5를 눌렀을 때만 발동!)
  // ==========================================================================
  function bindKeyboardEvents() {
    if (inputsBound) return;
    inputsBound = true;

    window.addEventListener('keydown', (e) => {
      if (!running) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (paused) return;

      const isRepeat = e.repeat;
      const now = performance.now();
      const twoPlayer = matchConfig.mode === 'vs_2p';

      // [팀 난전] Tab 또는 Q 키로 아군 조작 캐릭터 태그 교대!
      if (isBrawlMode() && !isRepeat && roundPhase === 'fight') {
        if (e.code === 'Tab' || e.code === 'KeyQ') {
          e.preventDefault();
          swapControlledAlly();
          return;
        }
      }

      const gameKeys = [
        'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
        'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad0',
        'Enter', 'NumpadEnter', 'KeyF'
      ];
      if (gameKeys.includes(e.code)) e.preventDefault();
      keysDown.add(e.code);

      if (isRepeat) return;

      // 라운드 시작 전에도 1~4번 슬롯 미리 선택 가능!
      const p1 = controlledFighter;
      if (p1) {
        if (e.code === 'Digit1' || (!twoPlayer && e.code === 'Numpad1')) return selectSlot(1, p1);
        if (e.code === 'Digit2' || (!twoPlayer && e.code === 'Numpad2')) return selectSlot(2, p1);
        if (e.code === 'Digit3' || (!twoPlayer && e.code === 'Numpad3')) return selectSlot(3, p1);
        if (e.code === 'Digit4' || (!twoPlayer && e.code === 'Numpad4')) return selectSlot(4, p1);
      }
      if (twoPlayer && p2Fighter) {
        if (e.code === 'Numpad1') return selectSlot(1, p2Fighter);
        if (e.code === 'Numpad2') return selectSlot(2, p2Fighter);
        if (e.code === 'Numpad3') return selectSlot(3, p2Fighter);
        if (e.code === 'Numpad4') return selectSlot(4, p2Fighter);
      }

      if (roundPhase !== 'fight') return;

      // --- 1P 대시 / Enter 선택 슬롯 발동 / 5번 필살기 즉시 발동 ---
      if (p1 && p1.hp > 0) {
        if (e.code === 'KeyD' || (!twoPlayer && e.code === 'ArrowRight')) {
          if (now - tapTracker.p1Right < 240) triggerDash(p1, 1);
          tapTracker.p1Right = now;
        } else if (e.code === 'KeyA' || (!twoPlayer && e.code === 'ArrowLeft')) {
          if (now - tapTracker.p1Left < 240) triggerDash(p1, -1);
          tapTracker.p1Left = now;
        } else if (e.code === 'ShiftLeft' || (!twoPlayer && e.code === 'ShiftRight')) {
          const moveDir = isHoldingLeft(1) ? -1 : (isHoldingRight(1) ? 1 : p1.facing);
          triggerDash(p1, moveDir);
        }

        // [Enter] 현재 선택된 슬롯(1~4) 기술만 발동!
        if (e.code === 'Enter' || (!twoPlayer && e.code === 'NumpadEnter') || (twoPlayer && e.code === 'KeyF')) {
          executeSelectedSlotSkill(p1, 1);
        }
        // [5] 초필살기 전용 즉시 발동! (선택된 1~4 슬롯은 변경하지 않음!)
        else if (e.code === 'Digit5' || (!twoPlayer && e.code === 'Numpad5')) {
          executeDirectUltimate(p1);
        }
      }

      // --- 2P 조작 (2인 로컬 대전 모드) ---
      if (twoPlayer && p2Fighter && p2Fighter.hp > 0) {
        if (e.code === 'ArrowRight') {
          if (now - tapTracker.p2Right < 240) triggerDash(p2Fighter, 1);
          tapTracker.p2Right = now;
        } else if (e.code === 'ArrowLeft') {
          if (now - tapTracker.p2Left < 240) triggerDash(p2Fighter, -1);
          tapTracker.p2Left = now;
        }
        if (e.code === 'NumpadEnter') {
          executeSelectedSlotSkill(p2Fighter, 2);
        } else if (e.code === 'Numpad5') {
          executeDirectUltimate(p2Fighter);
        }
      }
    });

    window.addEventListener('keyup', (e) => keysDown.delete(e.code));
    window.addEventListener('blur', () => keysDown.clear());
  }

  function isHoldingLeft(inputSlot) {
    if (inputSlot === 1) return keysDown.has('KeyA') || (matchConfig.mode !== 'vs_2p' && keysDown.has('ArrowLeft'));
    return matchConfig.mode === 'vs_2p' && keysDown.has('ArrowLeft');
  }
  function isHoldingRight(inputSlot) {
    if (inputSlot === 1) return keysDown.has('KeyD') || (matchConfig.mode !== 'vs_2p' && keysDown.has('ArrowRight'));
    return matchConfig.mode === 'vs_2p' && keysDown.has('ArrowRight');
  }
  function isHoldingUp(inputSlot) {
    if (inputSlot === 1) return keysDown.has('KeyW') || (matchConfig.mode !== 'vs_2p' && keysDown.has('ArrowUp'));
    return matchConfig.mode === 'vs_2p' && keysDown.has('ArrowUp');
  }
  function isHoldingDown(inputSlot) {
    if (inputSlot === 1) return keysDown.has('KeyS') || (matchConfig.mode !== 'vs_2p' && keysDown.has('ArrowDown'));
    return matchConfig.mode === 'vs_2p' && keysDown.has('ArrowDown');
  }
  function isHoldingGuardBtn(inputSlot) {
    if (inputSlot === 1) return keysDown.has('Space');
    return matchConfig.mode === 'vs_2p' && (keysDown.has('ShiftRight') || keysDown.has('Numpad0'));
  }

  function pressVirtualAction(kind) {
    if (!running || paused || roundPhase !== 'fight') return;
    if (!controlledFighter && isBrawlMode()) swapControlledAlly();
    const p1 = controlledFighter;
    if (!p1 || p1.hp <= 0) return;

    if (kind === 'dash') triggerDash(p1, p1.facing);
    else if (kind === 'enter') executeSelectedSlotSkill(p1, 1);
    else if (kind === 'ult') executeDirectUltimate(p1);
  }

  // [핵심] Enter 키 입력 시 현재 선택된 슬롯(1~4)의 기술만 실행!
  function executeSelectedSlotSkill(f, inputSlot = 1) {
    if (!f || f.hp <= 0 || roundPhase !== 'fight') return;

    const slotNum = f.selectedSlot || 1;
    const airborne = f.y < GROUND_Y - 4;
    const down = f.isCpu ? false : isHoldingDown(inputSlot);

    if (airborne) {
      queueOrExecuteMove(f, 'air_atk');
      return;
    }

    if (slotNum === 1) {
      if (down) {
        queueOrExecuteMove(f, 'low');
      } else if (f.state === 'dash_f') {
        queueOrExecuteMove(f, 'dash_atk');
      } else if (f.state === 'attack' && f.curMove && f.curMove.id === 'jab1') {
        queueOrExecuteMove(f, 'jab2');
      } else if (f.state === 'attack' && f.curMove && f.curMove.id === 'jab2') {
        queueOrExecuteMove(f, 'jab3');
      } else {
        queueOrExecuteMove(f, 'jab1');
      }
    } else if (slotNum === 2) {
      queueOrExecuteMove(f, 'launcher');
    } else if (slotNum === 3) {
      queueOrExecuteMove(f, 'sp1');
    } else if (slotNum === 4) {
      queueOrExecuteMove(f, 'sp2');
    }
  }

  // [핵심] 숫자 5 키 입력 시에만 초필살기 즉시 발동! (선택 슬롯 1~4 유지)
  function executeDirectUltimate(f) {
    if (!f || f.hp <= 0 || roundPhase !== 'fight') return;
    if (!canUseRageArt(f)) {
      if (!f.isCpu) showCallout(f, `필살 게이지 ${Math.floor(f.meter)}%`);
      return;
    }
    queueOrExecuteMove(f, 'rage');
  }

  function triggerDash(f, worldDir) {
    if (!f || f.hp <= 0 || f.y < GROUND_Y - 4) return;
    if (!['idle', 'walk_f', 'walk_b', 'crouch'].includes(f.state)) return;

    const isForward = (worldDir === f.facing);
    if (isForward) {
      f.state = 'dash_f';
      f.stateTime = 0.23;
      f.vx = f.facing * (560 + f.prof.stats[1] * 40);
      if (canPlaySfxFor(f, null)) SoundFX.evadeWhoosh();
      FightVFX.spawnDust(f.x, GROUND_Y + f.depthY, f.facing, 6);
    } else {
      f.state = 'dash_b';
      f.stateTime = 0.20;
      f.invulnTimer = 0.10;
      f.vx = -f.facing * (520 + f.prof.stats[1] * 32);
      if (canPlaySfxFor(f, null)) SoundFX.evadeWhoosh();
      FightVFX.spawnDust(f.x, GROUND_Y + f.depthY, -f.facing, 5, 'rgba(0, 229, 255, 0.48)');
    }
  }

  function canUseRageArt(f) {
    if (!f || f.hp <= 0) return false;
    if (f.inRage && !f.rageArtUsed) return true;
    if (f.meter >= 100) return true;
    return false;
  }

  function isMoveOffCooldown(f, move) {
    if (!move || !move.slotNum || move.slotNum > 4) return true;
    return (f.slotCooldowns[move.slotNum] || 0) <= 0.01;
  }

  function queueOrExecuteMove(f, moveId) {
    const move = f.moves[moveId];
    if (!move || f.hp <= 0) return;

    if (moveId === 'rage' && !canUseRageArt(f)) return;
    if (!isMoveOffCooldown(f, move)) {
      // 남은 쿨타임이 0.14초 이내면 선입력 버퍼에 넣어 모션 직후 부드럽게 발동!
      if ((f.slotCooldowns[move.slotNum] || 0) <= 0.14) {
        f.bufferedMoveId = moveId;
        f.bufferTimer = 0.16;
      }
      return;
    }

    const neutralReady = ['idle', 'walk_f', 'walk_b', 'crouch', 'dash_f', 'jump'].includes(f.state);
    if (neutralReady) {
      startMove(f, move);
      return;
    }

    if (f.state === 'attack' && f.curMove && f.curMove.cancels && f.curMove.cancels.includes(moveId)) {
      const cancelReady = f.hitTargets.size > 0 || f.moveTime >= (f.curMove.startup + f.curMove.active * 0.65);
      if (cancelReady) {
        startMove(f, move);
        return;
      }
    }

    f.bufferedMoveId = moveId;
    f.bufferTimer = 0.16;
  }

  function startMove(f, move) {
    const opp = findNearestEnemy(f);
    if (f.y >= GROUND_Y - 2 && opp) {
      f.facing = opp.x >= f.x ? 1 : -1;
    }

    if (move.isRageArt) {
      if (f.inRage && !f.rageArtUsed) f.rageArtUsed = true;
      else f.meter = 0;
      triggerRageCutIn(f, move);
    } else if (move.cooldown && move.slotNum) {
      f.slotCooldowns[move.slotNum] = move.cooldown;
    }

    f.state = 'attack';
    f.curMove = move;
    f.moveTime = 0;
    f.hitTargets.clear();
    f.moveProjectileSpawned = false;
    f.guarding = false;
    f.crouching = Boolean(move.crouchAnim);
    f.bufferedMoveId = null;
    f.bufferTimer = 0;

    if (f.y >= GROUND_Y - 2) {
      f.vx = f.facing * (move.lungeVx || 0);
    }

    if (canPlaySfxFor(f, null)) SoundFX.whiff();
    if (move.powerCrush) {
      f.armorFlashTimer = move.startup + move.active * 0.85;
    }
    if (move.lungeVx > 250) {
      FightVFX.spawnDust(f.x, GROUND_Y + f.depthY, f.facing, 5);
    }
  }

  function triggerRageCutIn(f, move) {
    rageFreezeTimer = isBrawlMode() ? 0.34 : 0.48;
    SoundFX.egoAwaken();
    SoundFX.announce('Rage Art!');

    const overlay = document.getElementById('rage-cutin-overlay');
    const img = document.getElementById('rage-cutin-img');
    const charLbl = document.getElementById('rage-cutin-char');
    const moveLbl = document.getElementById('rage-cutin-move');
    const quoteLbl = document.getElementById('rage-cutin-quote');

    if (overlay && img && charLbl && moveLbl && quoteLbl) {
      img.src = CharacterSprites.getPoseFileSrc(f.charId, 'ego');
      img.classList.toggle('flip-x', f.facing === -1);
      charLbl.textContent = `${f.fullName} · ULTIMATE [5]`;
      moveLbl.textContent = move.name;
      quoteLbl.textContent = `“${move.quote}”`;
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.remove('active'), isBrawlMode() ? 440 : 600);
    }
  }

  // ==========================================================================
  // 6. 메인 60fps 게임 루프
  // ==========================================================================
  function loop(ts) {
    if (!running) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(loop);

    const rawDt = Math.min(0.033, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;
    if (paused) return;

    if (rageFreezeTimer > 0) {
      rageFreezeTimer = Math.max(0, rageFreezeTimer - rawDt);
      FightVFX.updateAndDraw(rawDt * 0.25, projectiles, null);
      syncStageDOM(ts);
      return;
    }

    if (hitstopTimer > 0) {
      hitstopTimer = Math.max(0, hitstopTimer - rawDt);
      updateCamera(rawDt);
      FightVFX.updateAndDraw(rawDt * 0.35, projectiles, null);
      syncStageDOM(ts);
      updateHudDOM();
      return;
    }

    updateTekkenSlowMotion(rawDt);
    const speedScale = isBrawlMode() ? brawlSpeed : 1.0;
    const dt = rawDt * slowMoFactor * speedScale;

    updateRoundFlow(rawDt, dt);

    if (roundPhase === 'intro' || roundPhase === 'fight' || roundPhase === 'ko_freeze' || roundPhase === 'round_over') {
      if (roundPhase === 'fight') {
        if (matchConfig.mode === 'training' && team2[0]) {
          updateTrainingDummy(team2[0], dt);
        } else {
          for (const f of allFighters) {
            if (f.isCpu && f.hp > 0 && f.state !== 'ko') {
              const target = findNearestEnemy(f);
              if (target) updateCpuAI(f, target, dt);
            }
          }
        }
      }

      for (const f of allFighters) {
        updateFighter(f, dt);
      }

      resolveAllPushboxes(dt);

      if (roundPhase === 'fight') {
        for (const atk of allFighters) {
          if (atk.hp > 0 && atk.state === 'attack') {
            checkFighterMeleeAgainstEnemies(atk);
          }
        }
        updateProjectiles(dt);
      }
    }

    updateCamera(rawDt);
    const debugBoxes = showHitboxes ? collectDebugBoxes() : null;
    FightVFX.updateAndDraw(dt, projectiles, debugBoxes);
    syncStageDOM(ts);
    updateHudDOM();
  }

  function updateTekkenSlowMotion(rawDt) {
    if (roundPhase === 'ko_freeze') {
      slowMoFactor = 0.24;
      return;
    }
    if (roundPhase !== 'fight') {
      slowMoFactor = 1.0;
      return;
    }
    const alive1 = team1.filter(f => f.hp > 0);
    const alive2 = team2.filter(f => f.hp > 0);
    if (alive1.length === 1 && alive2.length === 1) {
      const a = alive1[0];
      const b = alive2[0];
      const bothLow = a.hp <= a.maxHp * 0.20 && b.hp <= b.maxHp * 0.20;
      const closeDist = Math.abs(a.x - b.x) < 300;
      const bothSwinging = a.state === 'attack' && b.state === 'attack';
      const targetSlow = (bothLow && closeDist && bothSwinging) ? 0.28 : 1.0;
      slowMoFactor += (targetSlow - slowMoFactor) * Math.min(1, 14 * rawDt);
    } else {
      slowMoFactor = 1.0;
    }

    const arena = document.getElementById('fight-stage-viewport');
    if (arena) arena.classList.toggle('climax-slowmo', slowMoFactor < 0.6);
  }

  function updateRoundFlow(rawDt, dt) {
    if (roundPhase === 'intro') {
      phaseTimer -= rawDt;
      if (phaseTimer <= 0) {
        roundPhase = 'fight';
        showCenterBanner('FIGHT!', '', 0.65);
        SoundFX.clashClang(2);
        SoundFX.announce('Fight!');
      }
    } else if (roundPhase === 'fight') {
      if (matchConfig.mode !== 'training') {
        roundTimer = Math.max(0, roundTimer - dt);
        if (roundTimer <= 0) triggerRoundEndByTime();
      }
    } else if (roundPhase === 'ko_freeze') {
      phaseTimer -= rawDt;
      if (phaseTimer <= 0) finalizeRoundWinner();
    } else if (roundPhase === 'round_over') {
      phaseTimer -= rawDt;
      if (phaseTimer <= 0) beginRound(roundNum + 1);
    }
  }

  // ==========================================================================
  // 7. 파이터 물리 · 가드(Space) · 이동(WASD/방향키) 업데이트
  // ==========================================================================
  function updateFighter(f, dt) {
    const opp = findNearestEnemy(f);
    f.stateTime += dt;
    if (f.justGuardWindow > 0) f.justGuardWindow = Math.max(0, f.justGuardWindow - dt);
    if (f.invulnTimer > 0) f.invulnTimer = Math.max(0, f.invulnTimer - dt);
    if (f.armorFlashTimer > 0) f.armorFlashTimer = Math.max(0, f.armorFlashTimer - dt);
    if (f.hitFlashTimer > 0) f.hitFlashTimer = Math.max(0, f.hitFlashTimer - dt);

    // 슬롯 쿨타임 감소
    for (let s = 1; s <= 4; s++) {
      if (f.slotCooldowns[s] > 0) {
        f.slotCooldowns[s] = Math.max(0, f.slotCooldowns[s] - dt);
      }
    }

    if (f.comboDisplayTimer > 0) {
      f.comboDisplayTimer = Math.max(0, f.comboDisplayTimer - dt);
      if (f.comboDisplayTimer <= 0) {
        f.comboCount = 0;
        f.comboDamage = 0;
      }
    }
    if (f.calloutTimer > 0) f.calloutTimer = Math.max(0, f.calloutTimer - dt);
    if (f.bufferTimer > 0) {
      f.bufferTimer = Math.max(0, f.bufferTimer - dt);
      if (f.bufferTimer <= 0) f.bufferedMoveId = null;
    }

    if (f.state !== 'hitstun' && f.state !== 'air_hit' && f.state !== 'wall_splat') {
      f.trailHp += (f.hp - f.trailHp) * Math.min(1, 5.5 * dt);
      f.continuousTakenDmg = Math.max(0, f.continuousTakenDmg - 240 * dt);
    }
    if (!f.guarding && f.state !== 'blockstun') {
      f.guardHp = Math.min(f.maxGuard, f.guardHp + 16 * dt);
    }
    if (f.isRaidBoss && f.hp > 0 && roundPhase === 'fight') {
      f.meter = Math.min(100, f.meter + 4 * dt);
    }

    // 체력 30% 이하 RAGE 위기 각성! (공격력 +12% & 5번 초필살기 1회 해방!)
    if (!f.inRage && f.hp > 0 && f.hp <= f.maxHp * 0.30) {
      f.inRage = true;
      showCallout(f, '🔥 RAGE 각성! [5] 필살기 해방');
      if (canPlaySfxFor(f, null)) SoundFX.resonanceChime(true);
      FightVFX.spawnGroundSlam(f.x, '#ff2a36', 85);
    }

    // 선입력 버퍼 실행
    if (f.bufferedMoveId && roundPhase === 'fight' && f.hp > 0) {
      const bId = f.bufferedMoveId;
      const bMove = f.moves[bId];
      if (isMoveOffCooldown(f, bMove)) {
        if (['idle', 'walk_f', 'walk_b', 'crouch'].includes(f.state)) {
          queueOrExecuteMove(f, bId);
        } else if (f.state === 'attack' && f.curMove && f.curMove.cancels && f.curMove.cancels.includes(bId)) {
          if (f.hitTargets.size > 0 || f.moveTime >= f.curMove.startup + f.curMove.active * 0.65) {
            queueOrExecuteMove(f, bId);
          }
        }
      }
    }

    if (f.state === 'ko') {
      if (f.y < GROUND_Y) {
        f.vy += GRAVITY * dt;
        f.y += f.vy * dt;
        if (f.y >= GROUND_Y) {
          f.y = GROUND_Y;
          f.vy = 0;
          f.vx *= 0.4;
          FightVFX.spawnGroundSlam(f.x, '#ff4757', 75);
        }
      } else {
        f.vx *= Math.pow(0.002, dt);
      }
      f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
      return;
    }

    if (f.state === 'rage_cinematic') {
      updateRageCinematicBarrage(f, f.rageTarget || opp, dt);
      return;
    }

    if (f.state === 'hitstun' || f.state === 'blockstun' || f.state === 'wall_splat') {
      f.stunTimer -= dt;
      f.vx *= Math.pow(0.0008, dt);
      f.x += f.vx * dt;

      if (f.state === 'hitstun' && Math.abs(f.vx) > 250 && !f.wallSplatUsedInCombo) {
        if (f.x <= WALL_LEFT + 6 || f.x >= WALL_RIGHT - 6) {
          f.x = clamp(f.x, WALL_LEFT, WALL_RIGHT);
          f.vx = 0;
          f.state = 'wall_splat';
          f.stunTimer = 0.56;
          f.wallSplatUsedInCombo = true;
          cam.shake = Math.max(cam.shake, 13);
          if (canPlaySfxFor(null, f)) SoundFX.wallSplat();
          FightVFX.spawnWallSplat(f.x <= WALL_LEFT + 10 ? 52 : STAGE_W - 52, f.y - 95);
          if (opp) showCallout(opp, '💥 WALL SPLAT!');
          return;
        }
      }

      f.x = clamp(f.x, WALL_LEFT, WALL_RIGHT);
      if (f.stunTimer <= 0) {
        f.state = 'idle';
        f.stateTime = 0;
        f.juggleCount = 0;
        f.boundUsedInCombo = false;
        f.wallSplatUsedInCombo = false;
      }
      return;
    }

    if (f.state === 'air_hit') {
      const gravScale = 1 + Math.min(0.95, f.juggleCount * 0.14);
      f.vy += GRAVITY * gravScale * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      if ((f.x <= WALL_LEFT || f.x >= WALL_RIGHT) && Math.abs(f.vx) > 160 && !f.wallSplatUsedInCombo) {
        f.x = clamp(f.x, WALL_LEFT, WALL_RIGHT);
        f.vx = -f.vx * 0.25;
        f.vy = -320;
        f.wallSplatUsedInCombo = true;
        cam.shake = Math.max(cam.shake, 11);
        if (canPlaySfxFor(null, f)) SoundFX.wallSplat();
        FightVFX.spawnWallSplat(f.x <= WALL_LEFT + 10 ? 52 : STAGE_W - 52, f.y - 75);
      }

      f.x = clamp(f.x, WALL_LEFT, WALL_RIGHT);

      if (f.y >= GROUND_Y) {
        f.y = GROUND_Y;
        if (f.boundPending) {
          f.boundPending = false;
          f.boundUsedInCombo = true;
          f.vy = -640;
          f.vx *= 0.35;
          cam.shake = Math.max(cam.shake, 12);
          if (canPlaySfxFor(null, f)) SoundFX.heavyHit();
          FightVFX.spawnGroundSlam(f.x, '#00e5ff', 120);
          if (opp) showCallout(opp, '🌪️ TORNADO!');
        } else {
          f.vy = 0;
          f.vx *= 0.35;
          f.state = 'knockdown';
          f.stateTime = 0;
          FightVFX.spawnGroundSlam(f.x, '#f5d76e', 75);
        }
      }
      return;
    }

    if (f.state === 'knockdown') {
      f.vx *= Math.pow(0.002, dt);
      f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
      if (f.stateTime >= 0.42) {
        f.state = 'idle';
        f.stateTime = 0;
        f.invulnTimer = 0.28; // 기상 무적 보호
        f.juggleCount = 0;
        f.continuousTakenDmg = 0;
        f.boundUsedInCombo = false;
        f.wallSplatUsedInCombo = false;
      }
      return;
    }

    if (f.state === 'dash_f' || f.state === 'dash_b') {
      f.stateTime -= dt;
      f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
      f.vx *= Math.pow(0.04, dt);
      if (f.stateTime <= 0) {
        f.state = 'idle';
        f.vx = 0;
      }
      return;
    }

    if (f.state === 'attack') {
      const m = f.curMove;
      f.moveTime += dt;

      if (!f.moveProjectileSpawned && f.moveTime >= m.startup && m.specialKind) {
        f.moveProjectileSpawned = true;
        fireSpecialEffectOrProjectile(f, opp, m);
      }

      if (f.y < GROUND_Y) {
        f.vy += GRAVITY * dt;
        f.y += f.vy * dt;
        f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
        if (f.y >= GROUND_Y) {
          f.y = GROUND_Y;
          f.vy = 0;
          f.vx = 0;
          f.state = 'idle';
          f.curMove = null;
          return;
        }
      } else {
        f.vx *= Math.pow(0.0015, dt);
        f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
      }

      if (f.moveTime >= m.startup + m.active + m.recovery) {
        f.state = f.y < GROUND_Y ? 'jump' : 'idle';
        f.curMove = null;
        f.crouching = false;
      }
      return;
    }

    // 자유 이동 상태
    if (f.y >= GROUND_Y - 2 && opp) {
      f.facing = opp.x >= f.x ? 1 : -1;
    }

    if (f.y < GROUND_Y) {
      f.vy += GRAVITY * dt;
      f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
      f.y += f.vy * dt;
      if (f.y >= GROUND_Y) {
        f.y = GROUND_Y;
        f.vy = 0;
        f.vx = 0;
        f.state = 'idle';
        FightVFX.spawnDust(f.x, GROUND_Y + f.depthY, f.facing, 4);
      }
      return;
    }

    if (roundPhase !== 'fight') {
      f.vx = 0;
      f.state = 'idle';
      f.guarding = false;
      f.crouching = false;
      return;
    }

    let moveX = 0;
    let jumpReq = false;
    let crouchReq = false;
    let guardBtn = false;

    if (!f.isCpu) {
      const inputSlot = (matchConfig.mode === 'vs_2p' && f.team === 2) ? 2 : 1;
      if (isHoldingLeft(inputSlot)) moveX -= 1;
      if (isHoldingRight(inputSlot)) moveX += 1;
      jumpReq = isHoldingUp(inputSlot);
      crouchReq = isHoldingDown(inputSlot);
      guardBtn = isHoldingGuardBtn(inputSlot); // 스페이스바 가드!
    } else {
      moveX = f.aiMoveX || 0;
      jumpReq = Boolean(f.aiJumpReq);
      crouchReq = Boolean(f.aiCrouchReq);
      guardBtn = Boolean(f.aiGuardBtn);
      f.aiJumpReq = false;
    }

    const walkSpeed = 295 + f.prof.stats[1] * 28;
    const prevGuarding = f.guarding;
    f.crouching = crouchReq;
    f.guarding = guardBtn;
    if (f.guarding && !prevGuarding) {
      f.justGuardWindow = 0.11; // 스페이스바 저스트 가드 타이밍!
    }

    if (guardBtn) {
      f.state = crouchReq ? 'crouch' : 'idle';
      f.vx = 0;
      return;
    }

    if (jumpReq) {
      f.state = 'jump';
      f.y = GROUND_Y - 3;
      f.vy = -1020;
      f.vx = moveX * (walkSpeed * 1.05);
      f.crouching = false;
      FightVFX.spawnDust(f.x, GROUND_Y + f.depthY, f.facing, 4);
      return;
    }

    if (crouchReq) {
      f.state = 'crouch';
      f.vx = 0;
    } else if (moveX !== 0) {
      const forward = Math.sign(moveX) === f.facing;
      f.state = forward ? 'walk_f' : 'walk_b';
      f.vx = moveX * (forward ? walkSpeed : walkSpeed * 0.88);
      f.x = clamp(f.x + f.vx * dt, WALL_LEFT, WALL_RIGHT);
    } else {
      f.state = 'idle';
      f.vx = 0;
    }
  }

  function resolveAllPushboxes(dt) {
    if (!isBrawlMode()) {
      const a = team1[0];
      const b = team2[0];
      if (!a || !b || a.state === 'ko' || b.state === 'ko') return;
      if (Math.abs(a.y - b.y) > 125) return;
      const minGap = 92;
      const dx = b.x - a.x;
      if (Math.abs(dx) < minGap) {
        const push = (minGap - Math.abs(dx)) * 0.5;
        const dir = dx >= 0 ? 1 : -1;
        a.x = clamp(a.x - dir * push, WALL_LEFT, WALL_RIGHT);
        b.x = clamp(b.x + dir * push, WALL_LEFT, WALL_RIGHT);
      }
      return;
    }

    const living = allFighters.filter(f => f.hp > 0 && f.state !== 'ko' && f.y >= GROUND_Y - 20);
    for (let i = 0; i < living.length; i++) {
      for (let j = i + 1; j < living.length; j++) {
        const a = living[i];
        const b = living[j];
        if (a.state === 'dash_f' || b.state === 'dash_f') continue;
        const sameTeam = a.team === b.team;
        const minGap = sameTeam ? 54 : 74;
        const dx = b.x - a.x;
        const absDx = Math.abs(dx);
        if (absDx < minGap) {
          const force = (minGap - absDx) * (sameTeam ? 4.5 : 8.5) * dt;
          const dir = dx >= 0 ? 1 : -1;
          a.x = clamp(a.x - dir * force, WALL_LEFT, WALL_RIGHT);
          b.x = clamp(b.x + dir * force, WALL_LEFT, WALL_RIGHT);
        }
      }
    }
  }

  // ==========================================================================
  // 8. 투사체 · 히트박스 충돌 · 밸런스 패치된 피격/낙법 판정
  // ==========================================================================
  function fireSpecialEffectOrProjectile(attacker, primaryDef, move) {
    const sk = move.specialKind;
    const startX = attacker.x + attacker.facing * 75;
    const startY = attacker.y - 95;
    const enemies = (attacker.team === 1 ? team2 : team1).filter(e => e.hp > 0 && e.state !== 'ko');

    if (sk === 'beam_rainbow') {
      if (canPlaySfxFor(attacker, null)) SoundFX.laserBeam();
      const endX = clamp(attacker.x + attacker.facing * move.range, 0, STAGE_W);
      FightVFX.spawnSignatureBeam(startX, startY - 12, endX, startY - 12, 'rainbow');
    } else if (sk === 'sky_wings') {
      // 밸런스 패치: 무조건 상대 머리 위 자동추적 대신 전방 고정 구역(285px) 낙하로 회피/대응 가능!
      if (canPlaySfxFor(attacker, null)) SoundFX.laserBeam();
      const strikeX = clamp(attacker.x + attacker.facing * 285, WALL_LEFT, WALL_RIGHT);
      FightVFX.spawnSignatureBeam(strikeX, 0, strikeX, GROUND_Y, 'sky_wings');
      enemies.forEach(en => {
        if (Math.abs(en.x - strikeX) < 110 && en.invulnTimer <= 0 && en.state !== 'knockdown') {
          attacker.hitTargets.add(en.uid);
          applyHitOrBlock(attacker, en, move, true);
        }
      });
    } else if (sk === 'proj_cannon' || sk === 'proj_wing' || sk === 'proj_wither' || sk === 'proj_wave') {
      if (canPlaySfxFor(attacker, null)) {
        sk === 'proj_cannon' ? SoundFX.cannonBlast() : SoundFX.hitPierce();
      }
      const visualMap = { proj_cannon: 'cannon_ball', proj_wing: 'wing_spear', proj_wither: 'wither', proj_wave: 'wave' };
      projectiles.push({
        team: attacker.team,
        attacker,
        move,
        x: startX,
        y: startY,
        vx: attacker.facing * (sk === 'proj_cannon' ? 820 : 730),
        visual: visualMap[sk],
        color: attacker.prof.accent,
        pierceLeft: isBrawlMode() && (sk === 'proj_cannon' || sk === 'proj_wing') ? 2 : 1,
        hitSet: new Set()
      });
    } else if (sk === 'cannon_rush') {
      if (canPlaySfxFor(attacker, null)) SoundFX.cannonBlast();
      FightVFX.spawnSignatureBeam(startX, startY, startX + attacker.facing * 220, startY, 'cannon');
    } else if (sk === 'rush_claws') {
      FightVFX.spawnSignatureBeam(startX, startY, startX + attacker.facing * 180, startY, 'claws');
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.vx * dt;

      if (pr.x < -60 || pr.x > STAGE_W + 60) {
        projectiles.splice(i, 1);
        continue;
      }

      let clashed = false;
      for (let j = i - 1; j >= 0; j--) {
        const other = projectiles[j];
        if (other.team !== pr.team && Math.abs(other.x - pr.x) < 55) {
          FightVFX.spawnHitSpark((pr.x + other.x) * 0.5, pr.y, 1, 'heavy', '#f5d76e');
          if (canPlaySfxFor(pr.attacker, other.attacker)) SoundFX.clashClang(2);
          projectiles.splice(i, 1);
          projectiles.splice(j, 1);
          i--;
          clashed = true;
          break;
        }
      }
      if (clashed) continue;

      const enemies = pr.team === 1 ? team2 : team1;
      for (const target of enemies) {
        if (target.hp <= 0 || target.state === 'ko' || target.state === 'knockdown' || target.invulnTimer > 0) continue;
        if (pr.hitSet.has(target.uid)) continue;

        const hurtTop = target.y - (target.crouching ? 115 : 175);
        if (Math.abs(pr.x - target.x) < 60 && pr.y >= hurtTop && pr.y <= target.y) {
          pr.hitSet.add(target.uid);
          pr.pierceLeft--;
          applyHitOrBlock(pr.attacker, target, pr.move, true);
          if (pr.pierceLeft <= 0) {
            projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  function getActiveHitbox(f) {
    if (f.state !== 'attack' || !f.curMove) return null;
    const m = f.curMove;
    if (m.specialKind && m.specialKind.startsWith('proj_') && f.moveTime > m.startup + 0.04) return null;
    if (m.specialKind === 'sky_wings') return null;
    if (f.moveTime < m.startup || f.moveTime > m.startup + m.active) return null;

    const w = m.range;
    const x = f.facing === 1 ? f.x + 10 : f.x - 10 - w;
    const y = f.y + (m.hitYOff || -100) - (m.hitH || 100) * 0.5;
    return { x, y, w, h: m.hitH || 100 };
  }

  function getHurtbox(f) {
    const h = f.crouching ? 118 : 178;
    const w = 88;
    return { x: f.x - w * 0.5, y: f.y - h, w, h };
  }

  function boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function checkFighterMeleeAgainstEnemies(attacker) {
    const hb = getActiveHitbox(attacker);
    if (!hb) return;
    const m = attacker.curMove;

    if (m.isRageArt && attacker.hitTargets.size > 0) return;

    const enemies = attacker.team === 1 ? team2 : team1;
    for (const defender of enemies) {
      if (defender.hp <= 0 || defender.state === 'ko' || defender.state === 'knockdown') continue;
      if (defender.invulnTimer > 0) continue;
      if (attacker.hitTargets.has(defender.uid)) continue;

      const db = getHurtbox(defender);
      if (boxesOverlap(hb, db)) {
        attacker.hitTargets.add(defender.uid);
        applyHitOrBlock(attacker, defender, m, false);
        if (m.isRageArt || roundPhase !== 'fight') break;
      }
    }
  }

  function canDefenderBlockMove(defender, attacker, move) {
    if (defender.y < GROUND_Y - 4) return false;
    if (['attack', 'hitstun', 'air_hit', 'wall_splat', 'knockdown', 'rage_cinematic'].includes(defender.state)) {
      return false;
    }
    if (!defender.guarding) return false;

    // 스페이스바 가드는 전후방 커버하되, 상·중·하단 심리전 적용!
    if (move.height === 'low') return defender.crouching;
    if (move.height === 'overhead') return !defender.crouching;
    return true;
  }

  function applyHitstopIfRelevant(attacker, defender, dur) {
    if (!isBrawlMode()) {
      hitstopTimer = Math.max(hitstopTimer, dur);
      return;
    }
    if ((attacker && !attacker.isCpu) || (defender && !defender.isCpu)) {
      hitstopTimer = Math.max(hitstopTimer, Math.min(0.045, dur * 0.55));
    }
  }

  function applyHitOrBlock(attacker, defender, move, isProjectile = false) {
    const atkDir = defender.x >= attacker.x ? 1 : -1;
    const contactX = (attacker.x + defender.x) * 0.5 + atkDir * 18;
    const contactY = defender.y - (move.height === 'low' ? 42 : 98);

    // 1. 스페이스바 가드 성공 판정
    if (canDefenderBlockMove(defender, attacker, move)) {
      const isParry = defender.justGuardWindow > 0 && !move.isRageArt;
      if (isParry) {
        defender.meter = Math.min(100, defender.meter + 20);
        defender.stunTimer = 0.04;
        defender.state = 'blockstun';
        defender.vx = -atkDir * 85;
        if (!isProjectile) attacker.vx = -atkDir * 240;
        applyHitstopIfRelevant(attacker, defender, 0.08);
        if (canPlaySfxFor(attacker, defender)) SoundFX.clashClang(4);
        FightVFX.spawnBlockSpark(contactX, contactY, true, false);
        showCallout(defender, '⚡ JUST GUARD!');
        return;
      }

      defender.guardHp -= (move.guardDmg || 14);
      const chip = matchConfig.mode === 'training' ? 0 : (move.chip || 3);
      defender.hp = Math.max(1, defender.hp - chip);
      attacker.meter = Math.min(100, attacker.meter + Math.round((move.meterGain || 10) * 0.45));
      defender.meter = Math.min(100, defender.meter + 8); // 가드 성공 시 방어자도 필살기 게이지 충전!

      if (defender.guardHp <= 0) {
        defender.guardHp = defender.maxGuard;
        defender.state = 'hitstun';
        defender.stunTimer = 0.72;
        defender.vx = atkDir * 250;
        applyHitstopIfRelevant(attacker, defender, 0.11);
        cam.shake = Math.max(cam.shake, 14);
        if (canPlaySfxFor(attacker, defender)) SoundFX.staggerBreak();
        FightVFX.spawnBlockSpark(contactX, contactY, false, true);
        showCallout(attacker, '🔨 GUARD CRUSH!');
        return;
      }

      defender.state = 'blockstun';
      defender.stunTimer = move.blockstun || 0.16;
      defender.vx = atkDir * (move.pushBlock || 145);
      applyHitstopIfRelevant(attacker, defender, 0.04);
      if (canPlaySfxFor(attacker, defender)) SoundFX.guardBlock();
      FightVFX.spawnBlockSpark(contactX, contactY, false, false);
      return;
    }

    // 2. 피격자 파워 크러시 슈퍼아머 버티기 (단, 2번 슬롯 라이징 어퍼는 아머를 파훼!)
    const defMove = defender.state === 'attack' ? defender.curMove : null;
    if ((defMove && defMove.powerCrush) && !move.isRageArt && !move.isLauncher && defender.hp > move.dmg) {
      const reducedDmg = Math.round(move.dmg * 0.45);
      applyDamageToFighter(attacker, defender, reducedDmg, false);
      defender.armorFlashTimer = 0.18;
      applyHitstopIfRelevant(attacker, defender, 0.05);
      if (canPlaySfxFor(attacker, defender)) SoundFX.guardBlock();
      FightVFX.spawnHitSpark(contactX, contactY, atkDir, 'light', '#00e5ff');
      showCallout(defender, '🛡️ SUPER ARMOR!');
      return;
    }

    // 3. 5번 초필살기 적중
    if (move.isRageArt) {
      startRageCinematicCombo(attacker, defender, move);
      return;
    }

    // 4. 일반 / 카운터 적중 및 밸런스 보정
    const isCounter = defender.state === 'attack' && defender.moveTime < (defender.curMove ? defender.curMove.startup + defender.curMove.active : 0.18);
    const rageBoost = attacker.inRage ? 1.12 : 1.0;
    const counterBoost = isCounter ? 1.20 : 1.0;
    const comboScale = Math.max(0.38, 1.0 - attacker.comboCount * 0.10);
    const finalDmg = Math.max(8, Math.round(move.dmg * rageBoost * counterBoost * comboScale));

    applyDamageToFighter(attacker, defender, finalDmg, true);
    attacker.meter = Math.min(100, attacker.meter + (move.meterGain || 11));
    defender.meter = Math.min(100, defender.meter + 10);

    // 피격 시 AI 예약 콤보 즉시 초기화 (유령 후속타 방지!)
    defender.curMove = null;
    defender.aiComboQueue.length = 0;
    defender.hitFlashTimer = 0.14;
    defender.continuousTakenDmg += finalDmg;

    applyHitstopIfRelevant(attacker, defender, isCounter ? 0.095 : (move.hitstop || 0.055));
    cam.shake = Math.max(cam.shake, isCounter || move.spark !== 'light' ? 11 : 5);

    if (canPlaySfxFor(attacker, defender)) {
      if (move.isLauncher) SoundFX.launcherHit();
      else if (isCounter) SoundFX.critHit();
      else if (move.spark === 'heavy' || move.spark === 'special') SoundFX.heavyHit();
      else SoundFX.lightHit();
    }

    if (move.isLauncher) {
      FightVFX.spawnHitSpark(contactX, contactY, atkDir, 'launcher', attacker.prof.accent);
      showCallout(attacker, isCounter ? '⚡ COUNTER LAUNCH!' : '🚀 LAUNCH!');
    } else if (isCounter) {
      FightVFX.spawnHitSpark(contactX, contactY, atkDir, 'counter', '#ff1e38');
      showCallout(attacker, '⚡ COUNTER!');
    } else {
      FightVFX.spawnHitSpark(contactX, contactY, atkDir, move.spark || 'light', attacker.prof.accent);
    }

    if (defender.hp <= 0) {
      handleFighterDefeated(attacker, defender);
      return;
    }

    // [밸런스 패치] 공중 4히트 초과 또는 다대다 일점사 누적 시 자동 공중 낙법(Tech Recovery) 발동!
    const alreadyAir = defender.y < GROUND_Y - 4 || defender.state === 'air_hit';
    if ((alreadyAir && defender.juggleCount >= MAX_JUGGLE_HITS) || (isBrawlMode() && defender.continuousTakenDmg >= 250)) {
      defender.state = 'jump';
      defender.invulnTimer = 0.42;
      defender.juggleCount = 0;
      defender.continuousTakenDmg = 0;
      defender.boundPending = false;
      defender.vy = -420;
      defender.vx = atkDir * 360;
      FightVFX.spawnBlockSpark(defender.x, defender.y - 80, true, false);
      showCallout(defender, '💫 긴급 낙법!');
      return;
    }

    if (move.isLauncher || alreadyAir || (move.launchVy && move.launchVy < -200)) {
      defender.state = 'air_hit';
      defender.juggleCount++;
      if (!alreadyAir) {
        defender.y = GROUND_Y - 6;
        defender.vy = move.isLauncher ? move.launchVy : move.launchVy;
        defender.vx = atkDir * (move.pushHit * 0.45);
      } else if (move.causesBoundInAir && !defender.boundUsedInCombo) {
        defender.vy = 760;
        defender.vx = atkDir * 210;
        defender.boundPending = true;
      } else {
        const popScale = Math.max(0.55, 1 - defender.juggleCount * 0.08);
        defender.vy = (move.airPopVy || -500) * popScale;
        defender.vx = atkDir * (185 + defender.juggleCount * 30);
      }
    } else {
      defender.state = 'hitstun';
      defender.stunTimer = (move.hitstun || 0.32) + (isCounter ? 0.10 : 0);
      defender.vx = atkDir * (move.pushHit || 175);
    }
  }

  function spawnDamagePopup(defender, dmg, isBig = false) {
    const layer = document.getElementById('damage-pop-layer');
    if (!layer || dmg < 35) return;
    const pop = document.createElement('div');
    pop.className = `dmg-float-num ${isBig ? 'big' : ''} t${defender.team}`;
    pop.textContent = `-${dmg}`;
    pop.style.left = `${(defender.x + (Math.random() - 0.5) * 44).toFixed(0)}px`;
    pop.style.top = `${(defender.y - 145 + (Math.random() - 0.5) * 24).toFixed(0)}px`;
    if (layer.appendChild) {
      layer.appendChild(pop);
      setTimeout(() => { if (pop.remove) pop.remove(); }, 680);
    }
  }

  function pushKillFeed(attacker, loser) {
    const box = document.getElementById('killfeed-box');
    if (!box || !box.appendChild) return;
    const item = document.createElement('div');
    item.className = 'killfeed-item';
    const atkName = attacker ? attacker.name : 'TIME';
    const atkClass = attacker && attacker.team === 1 ? 'blue' : 'red';
    const losClass = loser.team === 1 ? 'blue' : 'red';
    const mvLabel = (attacker && attacker.curMove && attacker.curMove.name) || (attacker && attacker.rageMove && attacker.rageMove.name) || 'K.O.';
    item.innerHTML = `
      <span class="kf-name ${atkClass}">${atkName}</span>
      <span class="kf-weapon">⚡ ${mvLabel}</span>
      <span class="kf-name ${losClass}">${loser.name} 💀</span>
    `;
    box.appendChild(item);
    setTimeout(() => { if (item.remove) item.remove(); }, 3400);
  }

  function applyDamageToFighter(attacker, defender, dmg, countCombo = true) {
    if (countCombo) {
      attacker.comboCount++;
      attacker.comboDamage += dmg;
      attacker.comboDisplayTimer = 1.65;
    }
    attacker.totalDamageDealt += dmg;
    spawnDamagePopup(defender, dmg, dmg >= 75);

    if (matchConfig.mode === 'training') {
      defender.hp = Math.max(1, defender.hp - dmg);
      return;
    }
    defender.hp = Math.max(0, defender.hp - dmg);
  }

  function startRageCinematicCombo(attacker, defender, move) {
    attacker.state = 'rage_cinematic';
    attacker.stateTime = 0;
    attacker.rageStep = 0;
    attacker.rageMove = move;
    attacker.rageTarget = defender;
    attacker.invulnTimer = 1.1;
    attacker.vx = 0;

    defender.state = 'hitstun';
    defender.stunTimer = 2.5;
    defender.invulnTimer = 1.1;
    defender.aiComboQueue.length = 0;
    defender.vx = 0;
    defender.y = GROUND_Y;
    defender.x = clamp(attacker.x + attacker.facing * 135, WALL_LEFT + 40, WALL_RIGHT - 40);

    SoundFX.heavyHit();
    FightVFX.spawnHitSpark(defender.x, defender.y - 95, attacker.facing, 'rage', attacker.prof.accent);
    showCallout(attacker, `🔥 ${move.name}!`);
  }

  function updateRageCinematicBarrage(attacker, defender, dt) {
    if (!defender) {
      attacker.state = 'idle';
      attacker.curMove = null;
      return;
    }
    const totalHits = 6;
    const stepInterval = 0.13;
    const expectedStep = Math.floor(attacker.stateTime / stepInterval);

    if (expectedStep > attacker.rageStep && attacker.rageStep < totalHits) {
      attacker.rageStep++;
      const isFinal = attacker.rageStep === totalHits;
      const totalDmg = Math.round(attacker.rageMove.dmg * (attacker.inRage ? 1.12 : 1.0));
      const sliceDmg = isFinal ? totalDmg - Math.floor(totalDmg / totalHits) * (totalHits - 1) : Math.floor(totalDmg / totalHits);

      applyDamageToFighter(attacker, defender, sliceDmg, true);
      defender.hitFlashTimer = 0.12;
      cam.shake = Math.max(cam.shake, isFinal ? 22 : 9);

      if (isFinal) {
        if (attacker.charId === 'changjin' || attacker.charId === 'hyunmin' || attacker.charId === 'hyunwoo') {
          SoundFX.cannonBlast();
          FightVFX.spawnSignatureBeam(attacker.x, attacker.y - 95, defender.x, defender.y - 95, 'nuclear');
        } else if (attacker.charId === 'jerok') {
          SoundFX.laserBeam();
          FightVFX.spawnSignatureBeam(attacker.x, attacker.y - 105, attacker.facing === 1 ? STAGE_W : 0, defender.y - 105, 'rainbow');
        } else if (attacker.charId === 'jongsam') {
          SoundFX.laserBeam();
          FightVFX.spawnSignatureBeam(defender.x, 0, defender.x, GROUND_Y, 'sky_wings');
        } else {
          SoundFX.koBoom();
        }
        FightVFX.spawnHitSpark(defender.x, defender.y - 95, attacker.facing, 'rage', '#f5d76e');
        applyHitstopIfRelevant(attacker, defender, 0.14);

        attacker.state = 'idle';
        attacker.curMove = null;
        attacker.rageTarget = null;
        if (defender.hp <= 0) {
          handleFighterDefeated(attacker, defender);
          return;
        }
        defender.state = 'air_hit';
        defender.y = GROUND_Y - 10;
        defender.vy = -720;
        defender.vx = attacker.facing * 620;
        return;
      } else {
        if (canPlaySfxFor(attacker, defender)) SoundFX.heavyHit();
        FightVFX.spawnHitSpark(
          defender.x + (Math.random() - 0.5) * 40,
          defender.y - 70 - Math.random() * 60,
          attacker.facing,
          'heavy',
          attacker.prof.accent
        );
      }
    }

    if (attacker.stateTime >= totalHits * stepInterval + 0.22) {
      attacker.state = 'idle';
      attacker.curMove = null;
      attacker.rageTarget = null;
      attacker.stateTime = 0;
    }
  }

  // ==========================================================================
  // 9. K.O. · 자동 태그 · 결과 집계
  // ==========================================================================
  function handleFighterDefeated(attacker, loser) {
    if (!loser || loser.state === 'ko') return;
    loser.hp = 0;
    loser.state = 'ko';
    loser.y = Math.min(loser.y, GROUND_Y - 8);
    loser.vy = -620;
    const dir = attacker ? (loser.x >= attacker.x ? 1 : -1) : -loser.facing;
    loser.vx = dir * 520;
    if (attacker) attacker.kosScored++;
    pushKillFeed(attacker, loser);

    const oppTeam = loser.team === 1 ? team1 : team2;
    const survivors = oppTeam.filter(f => f.hp > 0 && f.state !== 'ko');

    if (survivors.length > 0) {
      SoundFX.heavyHit();
      cam.shake = Math.max(cam.shake, 18);
      FightVFX.spawnKoExplosion(loser.x, loser.y - 90);
      if (attacker) showCallout(attacker, `💀 ${loser.name} K.O.!`);

      if (loser === controlledFighter) {
        const nextAlly = survivors[0];
        nextAlly.isCpu = false;
        controlledFighter = nextAlly;
        FightVFX.spawnGroundSlam(nextAlly.x, '#00e5ff', 105);
        showCenterBanner(`${loser.name} DOWN!`, `🔄 ${nextAlly.name} 자동 태그 참전!`, 0.95);
        renderSkillDockDOM();
      }
      return;
    }

    roundPhase = 'ko_freeze';
    phaseTimer = 1.60;
    projectiles = [];
    cam.shake = 26;
    hitstopTimer = 0.20;
    SoundFX.koBoom();
    FightVFX.spawnKoExplosion(loser.x, loser.y - 90);

    if (isBrawlMode()) {
      const winLabel = loser.team === 2 ? 'BLUE TEAM WIPED RED!' : 'RED TEAM WIPED BLUE!';
      showCenterBanner('TEAM K.O.!', winLabel, 1.5);
      SoundFX.announce('Team K O!');
    } else {
      const isPerfect = attacker && attacker.hp >= attacker.maxHp;
      showCenterBanner(isPerfect ? 'PERFECT K.O.!' : 'K.O.!', `${attacker ? attacker.name : ''} 라운드 제압!`, 1.5);
      SoundFX.announce(isPerfect ? 'Perfect! K O!' : 'K O!');
    }
  }

  function triggerRoundEndByTime() {
    roundPhase = 'ko_freeze';
    phaseTimer = 1.35;
    projectiles = [];
    SoundFX.roundBell();
    const t1Pct = getTeamHpRatio(team1);
    const t2Pct = getTeamHpRatio(team2);
    showCenterBanner('TIME UP!', t1Pct >= t2Pct ? 'BLUE 진영 체력 우세!' : 'RED 진영 체력 우세!', 1.3);
    SoundFX.announce('Time Up!');
  }

  function getTeamHpRatio(teamArr) {
    const cur = teamArr.reduce((s, f) => s + Math.max(0, f.hp), 0);
    const max = Math.max(1, teamArr.reduce((s, f) => s + f.maxHp, 0));
    return cur / max;
  }

  function finalizeRoundWinner() {
    const t1WonRound = getTeamHpRatio(team1) >= getTeamHpRatio(team2);
    if (t1WonRound) team1RoundsWon++;
    else team2RoundsWon++;

    const targetWins = isBrawlMode() ? 1 : 2;

    if (team1RoundsWon >= targetWins || team2RoundsWon >= targetWins) {
      roundPhase = 'match_over';
      const blueWon = team1RoundsWon >= targetWins;
      blueWon ? SoundFX.victoryFanfare() : SoundFX.defeatDirge();
      SoundFX.announce(blueWon ? 'Victory!' : 'Defeat!');
      showMatchResultModal(blueWon);
    } else {
      const roundWinnerName = t1WonRound ? team1[0].name : team2[0].name;
      roundPhase = 'round_over';
      phaseTimer = 1.45;
      showCenterBanner(`${roundWinnerName} WINS!`, `스코어 ${team1RoundsWon} : ${team2RoundsWon}`, 1.3);
    }
    updateHudDOM();
  }

  function showMatchResultModal(blueWon) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    if (!modal || !content) return;

    const winTeam = blueWon ? team1 : team2;
    const mvp = [...allFighters].sort((a, b) => (b.totalDamageDealt + b.kosScored * 250) - (a.totalDamageDealt + a.kosScored * 250))[0] || winTeam[0];

    if (isBrawlMode()) {
      const survivors = winTeam.filter(f => f.hp > 0).length;
      const topStatsHtml = [...allFighters]
        .sort((a, b) => b.totalDamageDealt - a.totalDamageDealt)
        .slice(0, 6)
        .map(f => `
          <div class="brawl-stat-row">
            <span style="color:${f.team === 1 ? '#00d2ff' : '#ff5e6c'};font-weight:900;">[${f.team === 1 ? 'BLUE' : 'RED'}] ${f.name}</span>
            <span>딜량 <strong>${f.totalDamageDealt}</strong> · 격파 <strong>${f.kosScored}</strong></span>
          </div>
        `).join('');

      content.innerHTML = `
        <div class="result-badge">TEAM BRAWL (${team1.length} VS ${team2.length}) RESULT</div>
        <h2 class="result-headline ${blueWon ? 'win' : 'lose'}">
          ${blueWon ? '🏆 BLUE TEAM VICTORY!' : '🔥 RED TEAM VICTORY!'}
        </h2>
        <div style="font-size:12.5px;color:#cbd5e6;margin-top:2px;">생존 인원: ${survivors} / ${winTeam.length}명</div>
        <div class="result-portrait-box" style="width:145px;height:150px;">
          <img src="${CharacterSprites.getPoseFileSrc(mvp.charId, 'ego')}" alt="${mvp.name}" />
        </div>
        <div class="result-winner-name">⭐ 난전 MVP: ${mvp.fullName} (${mvp.totalDamageDealt} DMG · ${mvp.kosScored} K.O.)</div>
        <div class="brawl-stats-box">${topStatsHtml}</div>
        <div class="result-actions">
          <button class="arcade-btn primary" onclick="FightEngine.rematch()">그대로 재난전 [REMATCH]</button>
          <button class="arcade-btn" onclick="AppController.backToSelect()">팀 다시 짜기 [TEAM SELECT]</button>
        </div>
      `;
      modal.classList.add('active');
      return;
    }

    const winner = winTeam[0];
    const isArcade = matchConfig.mode === 'arcade';
    const hasNextArcade = isArcade && blueWon && (matchConfig.arcadeStageIdx < matchConfig.arcadeLadder.length - 1);
    const clearedArcade = isArcade && blueWon && (matchConfig.arcadeStageIdx >= matchConfig.arcadeLadder.length - 1);

    const headline = clearedArcade
      ? '🏆 전곽 IRON FIST 챔피언 등극!'
      : (matchConfig.mode === 'vs_2p' ? `${blueWon ? '1P' : '2P'} (${winner.name}) 승리!` : (blueWon ? 'VICTORY!' : 'DEFEAT...'));

    const db = getCharData(winner.charId);
    const winQuote = (db.skills[2] && db.skills[2].quote) || (db.skills[0] && db.skills[0].quote) || '이게 바로 전곽의 실력이다.';

    content.innerHTML = `
      <div class="result-badge">${isArcade ? `ARCADE STAGE ${matchConfig.arcadeStageIdx + 1}/${matchConfig.arcadeLadder.length}` : matchConfig.mode.toUpperCase()}</div>
      <h2 class="result-headline ${blueWon || matchConfig.mode === 'vs_2p' ? 'win' : 'lose'}">${headline}</h2>
      <div class="result-portrait-box">
        <img src="${CharacterSprites.getPoseFileSrc(winner.charId, 'ego')}" alt="${winner.name}" />
      </div>
      <div class="result-winner-name">${winner.fullName}</div>
      <div class="result-quote">“${winQuote}”</div>
      <div class="result-actions">
        ${hasNextArcade ? `
          <button class="arcade-btn primary" onclick="FightEngine.nextArcadeOpponent()">
            다음 도전자 격파하러 가기 ➔
          </button>
        ` : ''}
        <button class="arcade-btn ${hasNextArcade ? '' : 'primary'}" onclick="FightEngine.rematch()">
          재대전 [REMATCH]
        </button>
        <button class="arcade-btn" onclick="AppController.backToSelect()">
          캐릭터 선택 [SELECT]
        </button>
      </div>
    `;
    modal.classList.add('active');
  }

  function hideResultModal() {
    const modal = document.getElementById('result-modal');
    if (modal) modal.classList.remove('active');
  }

  // ==========================================================================
  // 10. 밸런스 패치된 공정한 상태 기반 CPU AI (유령 setTimeout 공격 완전 제거!)
  // ==========================================================================
  function updateTrainingDummy(dummy, dt) {
    dummy.aiMoveX = 0;
    dummy.aiCrouchReq = false;
    dummy.aiGuardBtn = false;
    dummy.meter = 100;
    if (team1[0]) team1[0].meter = 100;
    if (dummy.state === 'idle' && (!team1[0] || team1[0].comboCount === 0) && dummy.hp < dummy.maxHp) {
      dummy.hp = Math.min(dummy.maxHp, dummy.hp + Math.round(900 * dt));
      dummy.trailHp = dummy.hp;
    }
  }

  function updateCpuAI(ai, target, dt) {
    ai.aiTargetUid = target.uid;
    const diff = matchConfig.difficulty;
    const reactInterval = diff === 'hard' ? 0.16 : (diff === 'normal' ? 0.28 : 0.44);
    const dist = Math.abs(target.x - ai.x);

    // 예약된 연계기 큐 처리 (피격 시 자동 취소되므로 100% 공정함)
    if (ai.aiComboQueue.length > 0 && dist < 245) {
      ai.aiThinkTimer -= dt;
      if (ai.aiThinkTimer <= 0) {
        const nextMv = ai.aiComboQueue.shift();
        queueOrExecuteMove(ai, nextMv);
        ai.aiThinkTimer = 0.19;
      }
      ai.aiMoveX = Math.sign(target.x - ai.x);
      return;
    } else if (ai.aiComboQueue.length > 0 && dist >= 280) {
      ai.aiComboQueue.length = 0;
    }

    ai.aiThinkTimer -= dt;
    if (ai.aiThinkTimer > 0) return;
    ai.aiThinkTimer = reactInterval * (0.8 + Math.random() * 0.5);

    ai.aiMoveX = 0;
    ai.aiCrouchReq = false;
    ai.aiGuardBtn = false;

    const incomingProj = projectiles.some(p => p.team !== ai.team && Math.abs(p.x - ai.x) < 320);
    const targetSwinging = target.state === 'attack' && dist < 250;

    if (incomingProj || targetSwinging) {
      const guardChance = isBrawlMode()
        ? (diff === 'hard' ? 0.50 : (diff === 'normal' ? 0.32 : 0.15))
        : (diff === 'hard' ? 0.68 : (diff === 'normal' ? 0.45 : 0.20));
      if (Math.random() < guardChance) {
        ai.aiGuardBtn = true;
        if (target.curMove && target.curMove.height === 'low' && Math.random() < 0.50) {
          ai.aiCrouchReq = true;
        }
        return;
      }
    }

    if (canUseRageArt(ai) && dist < 290 && Math.random() < (diff === 'hard' ? 0.35 : 0.18)) {
      queueOrExecuteMove(ai, 'rage');
      return;
    }

    if (dist > 430) {
      if ((ai.prof.sp1.startsWith('proj_') || ai.prof.sp1.startsWith('beam_')) && Math.random() < 0.42) {
        queueOrExecuteMove(ai, 'sp1');
      } else if (Math.random() < 0.50) {
        triggerDash(ai, ai.facing);
      } else {
        ai.aiMoveX = Math.sign(target.x - ai.x);
      }
    } else if (dist > 205) {
      const roll = Math.random();
      if (roll < 0.38) ai.aiMoveX = Math.sign(target.x - ai.x);
      else if (roll < 0.60) queueOrExecuteMove(ai, 'sp1');
      else if (roll < 0.78) queueOrExecuteMove(ai, 'sp2');
      else triggerDash(ai, ai.facing);
    } else {
      const roll = Math.random();
      if (target.guarding && roll < (diff === 'hard' ? 0.42 : 0.22)) {
        queueOrExecuteMove(ai, Math.random() < 0.55 ? 'low' : 'launcher');
      } else if (roll < 0.42) {
        queueOrExecuteMove(ai, 'jab1');
        ai.aiComboQueue = Math.random() < 0.6 ? ['jab2', 'jab3'] : ['jab2'];
        ai.aiThinkTimer = 0.16;
      } else if (roll < 0.65) {
        queueOrExecuteMove(ai, 'launcher');
        if (diff !== 'easy') {
          ai.aiComboQueue = diff === 'hard' ? ['jab1', 'jab2', 'sp2'] : ['jab1', 'jab3'];
          ai.aiThinkTimer = 0.26;
        }
      } else if (roll < 0.82) {
        queueOrExecuteMove(ai, 'sp2');
      } else if (roll < 0.92) {
        queueOrExecuteMove(ai, 'low');
      } else {
        triggerDash(ai, -ai.facing);
      }
    }
  }

  // ==========================================================================
  // 11. 다이내믹 카메라 & 스테이지/스킬슬롯 실시간 동기화
  // ==========================================================================
  function updateCamera(rawDt) {
    const living = allFighters.filter(f => f.hp > 0);
    const focusPool = living.length > 0 ? living : allFighters;
    if (focusPool.length === 0) return;

    let minX = focusPool[0].x;
    let maxX = focusPool[0].x;
    let minY = focusPool[0].y;
    for (const f of focusPool) {
      if (f.x < minX) minX = f.x;
      if (f.x > maxX) maxX = f.x;
      if (f.y < minY) minY = f.y;
    }

    let midX = (minX + maxX) * 0.5;
    if (isBrawlMode() && controlledFighter && controlledFighter.hp > 0) {
      midX = midX * 0.55 + controlledFighter.x * 0.45;
    }

    const spanX = maxX - minX;
    let targetZoom = isBrawlMode()
      ? clamp(1.16 - (spanX / 1350) * 0.24, 0.96, 1.16)
      : clamp(1.22 - (spanX / 1500) * 0.28, 1.0, 1.20);

    if (allFighters.some(f => f.state === 'rage_cinematic')) {
      targetZoom = 1.28;
    } else if (slowMoFactor < 0.6) {
      targetZoom = 1.26;
    }

    cam.zoom += (targetZoom - cam.zoom) * Math.min(1, 7.5 * rawDt);

    const maxPanX = Math.max(0, (STAGE_W * Math.max(0, cam.zoom - 0.96)) * 0.5);
    const desiredX = clamp((STAGE_W * 0.5 - midX) * Math.max(0.1, cam.zoom - 0.15), -maxPanX, maxPanX);
    const desiredY = clamp((GROUND_Y - minY) * 0.18, -20, 80);

    cam.x += (desiredX - cam.x) * Math.min(1, 8.5 * rawDt);
    cam.y += (desiredY - cam.y) * Math.min(1, 8.5 * rawDt);

    let sx = 0;
    let sy = 0;
    if (cam.shake > 0.4) {
      sx = (Math.random() - 0.5) * 2 * cam.shake;
      sy = (Math.random() - 0.5) * 1.6 * cam.shake;
      cam.shake *= Math.pow(0.0002, rawDt);
    } else {
      cam.shake = 0;
    }

    const viewport = document.getElementById('fight-stage-viewport');
    const rig = document.getElementById('fight-camera-rig');
    if (viewport && rig) {
      const vw = viewport.clientWidth || 1280;
      const vh = viewport.clientHeight || 580;
      const fitScale = Math.min(vw / STAGE_W, vh / STAGE_H);
      const totalScale = fitScale * cam.zoom;
      rig.style.transform = `translate(-50%, -50%) translate3d(${((cam.x + sx) * fitScale).toFixed(1)}px, ${((cam.y + sy) * fitScale).toFixed(1)}px, 0) scale(${totalScale.toFixed(4)})`;
    }
  }

  function resolveFighterVisualPose(f, ts) {
    if (f.state === 'ko' || f.state === 'knockdown') {
      return { pose: 'hit', vfx: 'none', rot: -f.facing * 78, sx: 1.08, sy: 0.86, dy: 22 };
    }
    if (f.state === 'wall_splat') {
      return { pose: 'stagger', vfx: 'stagger', rot: -f.facing * 16, sx: 0.92, sy: 1.06, dy: -6 };
    }
    if (f.state === 'air_hit') {
      const spin = -f.facing * clamp(f.vy * -0.035, -38, 45);
      return { pose: 'hit', vfx: 'hit', rot: spin, sx: 0.96, sy: 1.04, dy: 0 };
    }
    if (f.state === 'hitstun') {
      return { pose: 'hit', vfx: 'hit', rot: -f.facing * 12, sx: 0.94, sy: 1.05, dy: 0 };
    }
    if (f.state === 'blockstun' || f.guarding) {
      return {
        pose: 'guard', vfx: 'guard', rot: -f.facing * 4,
        sx: f.crouching ? 1.08 : 1.0, sy: f.crouching ? 0.80 : 0.98, dy: f.crouching ? 18 : 0
      };
    }
    if (f.state === 'rage_cinematic') {
      const cycle = ['ego', 'skill1', 'skill2', 'action', 'skill3', 'ego'];
      return { pose: cycle[(f.rageStep || 0) % cycle.length], vfx: 'ego', rot: f.facing * 6, sx: 1.12, sy: 1.12, dy: -8 };
    }
    if (f.state === 'attack' && f.curMove) {
      const m = f.curMove;
      let phaseIdx = 0;
      if (f.moveTime >= m.startup + m.active) phaseIdx = 2;
      else if (f.moveTime >= m.startup) phaseIdx = 1;
      const pose = (m.poses && m.poses[phaseIdx]) || 'slash';
      const vfx = phaseIdx === 1 ? (m.vfx || 'slash') : 'none';
      const lean = phaseIdx === 1 ? f.facing * 8 : (phaseIdx === 0 ? -f.facing * 4 : 0);
      const isLow = Boolean(m.crouchAnim);
      return {
        pose, vfx, rot: lean,
        sx: phaseIdx === 1 ? 1.09 : 1.0, sy: isLow ? 0.78 : (phaseIdx === 1 ? 1.05 : 1.0), dy: isLow ? 20 : 0
      };
    }
    if (f.state === 'dash_f') return { pose: 'dash2', vfx: 'none', rot: f.facing * 11, sx: 1.06, sy: 0.95, dy: 2 };
    if (f.state === 'dash_b') return { pose: 'dash', vfx: 'none', rot: -f.facing * 10, sx: 1.04, sy: 0.96, dy: 0 };
    if (f.state === 'jump' || f.y < GROUND_Y - 2) {
      return { pose: f.vy < 0 ? 'dash2' : 'action', vfx: 'none', rot: f.facing * 5, sx: 0.97, sy: 1.05, dy: 0 };
    }
    if (f.crouching) return { pose: 'guard', vfx: 'none', rot: 0, sx: 1.08, sy: 0.79, dy: 20 };
    if (f.state === 'walk_f') {
      return { pose: Math.floor(ts / 130) % 2 === 0 ? 'dash' : 'idle', vfx: 'none', rot: f.facing * 5, sx: 1.0, sy: 1.0, dy: 0 };
    }
    if (f.state === 'walk_b') {
      return { pose: Math.floor(ts / 150) % 2 === 0 ? 'guard' : 'idle', vfx: 'none', rot: -f.facing * 3, sx: 1.0, sy: 1.0, dy: 0 };
    }
    return { pose: 'idle', vfx: 'idle', rot: 0, sx: 1.0, sy: 1.0, dy: 0 };
  }

  function syncStageDOM(ts) {
    for (const f of allFighters) {
      const slotEl = document.getElementById(`f-dom-${f.uid}`);
      const bodyEl = document.getElementById(`f-body-${f.uid}`);
      const shadowEl = document.getElementById(`f-shadow-${f.uid}`);
      const ringEl = document.getElementById(`f-ring-${f.uid}`);
      if (!slotEl || !bodyEl) continue;

      const isControlled = (f === controlledFighter);
      slotEl.style.left = `${f.x.toFixed(1)}px`;
      slotEl.style.top = `${(GROUND_Y + f.depthY).toFixed(1)}px`;
      const baseZ = 20 + Math.round(f.depthY) + (isControlled ? 6 : 0) + (f.state === 'attack' || f.state === 'rage_cinematic' ? 12 : 0);
      slotEl.style.zIndex = `${f.state === 'ko' ? 8 : baseZ}`;

      slotEl.classList.toggle('rage-active', f.inRage && f.hp > 0);
      slotEl.classList.toggle('armor-flash', f.armorFlashTimer > 0);
      slotEl.classList.toggle('hit-flash', f.hitFlashTimer > 0);
      slotEl.classList.toggle('ko-down', f.state === 'ko');
      slotEl.classList.toggle('player-controlled', isControlled);

      const vis = resolveFighterVisualPose(f, ts);
      const airOffset = f.y - GROUND_Y;
      const bossScale = f.isRaidBoss ? 1.18 : 1.0;
      bodyEl.style.transform = `translate3d(0, ${(airOffset + vis.dy).toFixed(1)}px, 0) rotate(${vis.rot.toFixed(1)}deg) scale(${(vis.sx * bossScale).toFixed(2)}, ${(vis.sy * bossScale).toFixed(2)})`;

      if (shadowEl) {
        const shScale = clamp(1 + airOffset / 450, 0.35, 1.05);
        shadowEl.style.transform = `translateX(-50%) scale(${shScale.toFixed(2)})`;
        shadowEl.style.opacity = `${(0.8 * shScale).toFixed(2)}`;
      }
      if (ringEl) {
        ringEl.classList.toggle('rage', f.inRage && f.hp > 0);
        ringEl.classList.toggle('player-focus', isControlled);
      }

      if (isBrawlMode()) {
        const ohHp = document.getElementById(`f-oh-hp-${f.uid}`);
        const ohName = document.getElementById(`f-oh-name-${f.uid}`);
        const ohTag = document.getElementById(`f-tag-${f.uid}`);
        if (ohHp) ohHp.style.width = `${clamp((f.hp / f.maxHp) * 100, 0, 100)}%`;
        if (ohName) {
          ohName.textContent = `${isControlled ? '▼ 1P ' : (f.isRaidBoss ? '👑 ' : '')}${f.name}${f.inRage && f.hp > 0 ? ' 🔥' : ''}`;
        }
        if (ohTag) {
          ohTag.style.transform = `translate(-50%, ${airOffset.toFixed(1)}px)`;
          ohTag.classList.toggle('is-p1', isControlled);
        }
      }

      const rig = bodyEl.querySelector('.pm-spine-rig');
      if (rig) {
        const wantLeft = f.facing === -1;
        rig.classList.toggle('facing-left', wantLeft);
        rig.classList.toggle('facing-right', !wantLeft);
        CharacterSprites.setExactPose(rig, f.charId, vis.pose, vis.vfx, 0, 0, 1);
      }
    }
  }

  function updateHudDOM() {
    const el = (id) => document.getElementById(id);

    // 슬롯 쿨타임 게이지 & 5번 초필살기 점등 실시간 갱신
    const cf = controlledFighter || team1[0];
    if (cf) {
      for (let s = 2; s <= 4; s++) {
        const cdEl = el(`slot-cd-${s}`);
        if (cdEl) {
          const maxCd = SLOT_COOLDOWNS[s] || 0.4;
          const pct = clamp(((cf.slotCooldowns[s] || 0) / maxCd) * 100, 0, 100);
          cdEl.style.height = `${pct.toFixed(0)}%`;
        }
      }
      const ultCard = el('skill-slot-card-5');
      if (ultCard) {
        const ready = canUseRageArt(cf);
        ultCard.classList.toggle('ult-ready', ready);
        const tag = ultCard.querySelector('.ult-tag');
        if (tag) tag.textContent = ready ? '🔥 숫자 5 즉시발동!' : `게이지 ${Math.floor(cf.meter)}%`;
      }
    }

    if (!isBrawlMode()) {
      const f1 = team1[0];
      const f2 = team2[0];
      if (!f1 || !f2) return;

      if (el('hud-p1-hp')) el('hud-p1-hp').style.width = `${clamp((f1.hp / f1.maxHp) * 100, 0, 100)}%`;
      if (el('hud-p1-trail')) el('hud-p1-trail').style.width = `${clamp((f1.trailHp / f1.maxHp) * 100, 0, 100)}%`;
      if (el('hud-p2-hp')) el('hud-p2-hp').style.width = `${clamp((f2.hp / f2.maxHp) * 100, 0, 100)}%`;
      if (el('hud-p2-trail')) el('hud-p2-trail').style.width = `${clamp((f2.trailHp / f2.maxHp) * 100, 0, 100)}%`;
      if (el('hud-p1-hp-num')) el('hud-p1-hp-num').textContent = `${Math.ceil(f1.hp)} / ${f1.maxHp}`;
      if (el('hud-p2-hp-num')) el('hud-p2-hp-num').textContent = `${Math.ceil(f2.hp)} / ${f2.maxHp}`;

      if (el('hud-p1-hp')) el('hud-p1-hp').classList.toggle('rage-bar', f1.inRage);
      if (el('hud-p2-hp')) el('hud-p2-hp').classList.toggle('rage-bar', f2.inRage);
      if (el('hud-p1-guard')) el('hud-p1-guard').style.width = `${clamp((f1.guardHp / f1.maxGuard) * 100, 0, 100)}%`;
      if (el('hud-p2-guard')) el('hud-p2-guard').style.width = `${clamp((f2.guardHp / f2.maxGuard) * 100, 0, 100)}%`;

      if (el('hud-p1-rounds')) {
        el('hud-p1-rounds').innerHTML = [0, 1].map(i => `<span class="round-orb ${team1RoundsWon > i ? 'won' : ''}"></span>`).join('');
      }
      if (el('hud-p2-rounds')) {
        el('hud-p2-rounds').innerHTML = [0, 1].map(i => `<span class="round-orb ${team2RoundsWon > i ? 'won' : ''}"></span>`).join('');
      }
      if (el('hud-timer')) {
        el('hud-timer').textContent = matchConfig.mode === 'training' ? '∞' : `${Math.ceil(roundTimer)}`;
        el('hud-timer').classList.toggle('danger', roundTimer <= 10 && matchConfig.mode !== 'training');
      }

      updateBottomMeters(f1, f2);
      renderComboOverlay(1, f1);
      renderComboOverlay(2, f2);
    } else {
      if (el('brawl-t1-hp')) el('brawl-t1-hp').style.width = `${clamp(getTeamHpRatio(team1) * 100, 0, 100)}%`;
      if (el('brawl-t2-hp')) el('brawl-t2-hp').style.width = `${clamp(getTeamHpRatio(team2) * 100, 0, 100)}%`;

      const alive1 = team1.filter(f => f.hp > 0).length;
      const alive2 = team2.filter(f => f.hp > 0).length;
      if (el('brawl-t1-alive')) el('brawl-t1-alive').textContent = `${alive1}/${team1.length} 생존`;
      if (el('brawl-t2-alive')) el('brawl-t2-alive').textContent = `${alive2}/${team2.length} 생존`;
      if (el('brawl-timer')) {
        el('brawl-timer').textContent = `${Math.ceil(roundTimer)}`;
        el('brawl-timer').classList.toggle('danger', roundTimer <= 10);
      }

      allFighters.forEach(f => {
        const chip = el(`bchip-${f.uid}`);
        const bar = el(`bchip-hp-${f.uid}`);
        if (bar) bar.style.width = `${clamp((f.hp / f.maxHp) * 100, 0, 100)}%`;
        if (chip) {
          chip.classList.toggle('ko', f.hp <= 0);
          chip.classList.toggle('controlled', f === controlledFighter);
        }
      });

      const leftFocus = controlledFighter || team1.find(f => f.hp > 0) || team1[0];
      const rightFocus = team2.slice().sort((a, b) => b.comboCount - a.comboCount || b.hp - a.hp)[0] || team2[0];
      updateBottomMeters(leftFocus, rightFocus);

      const bestCombo1 = team1.slice().sort((a, b) => b.comboCount - a.comboCount || b.calloutTimer - a.calloutTimer)[0];
      const bestCombo2 = team2.slice().sort((a, b) => b.comboCount - a.comboCount || b.calloutTimer - a.calloutTimer)[0];
      if (bestCombo1) renderComboOverlay(1, bestCombo1, true);
      if (bestCombo2) renderComboOverlay(2, bestCombo2, true);
    }
  }

  function updateBottomMeters(leftF, rightF) {
    const el = (id) => document.getElementById(id);
    if (leftF && el('hud-p1-meter') && el('hud-p1-meter-txt')) {
      el('hud-p1-meter').style.width = `${clamp(leftF.meter, 0, 100)}%`;
      el('hud-p1-meter-txt').textContent = canUseRageArt(leftF)
        ? `🔥 [5]번 키 필살기 발동 가능!`
        : `${leftF.name} 필살 게이지 ${Math.floor(leftF.meter)}%`;
      el('hud-p1-meter-txt').classList.toggle('ready', canUseRageArt(leftF));
    }
    if (rightF && el('hud-p2-meter') && el('hud-p2-meter-txt')) {
      el('hud-p2-meter').style.width = `${clamp(rightF.meter, 0, 100)}%`;
      el('hud-p2-meter-txt').textContent = canUseRageArt(rightF)
        ? `🔥 ${rightF.name} 필살기 준비!`
        : `${rightF.name} 필살 게이지 ${Math.floor(rightF.meter)}%`;
      el('hud-p2-meter-txt').classList.toggle('ready', canUseRageArt(rightF));
    }
  }

  function renderComboOverlay(slot, f, showActorName = false) {
    const box = document.getElementById(`combo-box-${slot}`);
    if (!box || !f) return;
    const prefix = showActorName ? `<div style="font-size:12px;font-weight:900;color:#00e5ff;">${f.name}</div>` : '';
    if (f.comboCount >= 2 && f.comboDisplayTimer > 0) {
      box.innerHTML = `
        ${prefix}
        <div class="combo-hits">${f.comboCount} <span>HITS!</span></div>
        <div class="combo-dmg">${f.comboDamage} DAMAGE</div>
        ${f.calloutTimer > 0 && f.calloutText ? `<div class="combo-callout">${f.calloutText}</div>` : ''}
      `;
      box.classList.add('visible');
    } else if (f.calloutTimer > 0 && f.calloutText) {
      box.innerHTML = `${prefix}<div class="combo-callout solo">${f.calloutText}</div>`;
      box.classList.add('visible');
    } else {
      box.classList.remove('visible');
    }
  }

  function showCallout(f, text) {
    if (!f) return;
    f.calloutText = text;
    f.calloutTimer = 1.15;
  }

  let bannerTimeoutId = null;
  function showCenterBanner(mainTxt, subTxt = '', durSec = 1.2) {
    const banner = document.getElementById('center-announce-banner');
    const mEl = document.getElementById('announce-main');
    const sEl = document.getElementById('announce-sub');
    if (!banner || !mEl || !sEl) return;
    mEl.textContent = mainTxt;
    sEl.textContent = subTxt;
    banner.classList.add('visible');
    if (bannerTimeoutId) clearTimeout(bannerTimeoutId);
    bannerTimeoutId = setTimeout(() => banner.classList.remove('visible'), durSec * 1000);
  }

  function collectDebugBoxes() {
    const list = [];
    allFighters.forEach(f => {
      if (!f || f.hp <= 0) return;
      const db = getHurtbox(f);
      list.push({ ...db, color: '#2ecc71', fill: 'rgba(46, 204, 113, 0.14)' });
      const hb = getActiveHitbox(f);
      if (hb) list.push({ ...hb, color: '#ff2a36', fill: 'rgba(255, 42, 54, 0.26)' });
    });
    return list;
  }

  return {
    startMatch,
    rematch,
    nextArcadeOpponent,
    stopEngine,
    togglePause,
    toggleHitboxDebug,
    pressVirtualAction,
    selectSlot,
    swapControlledAlly,
    cycleBrawlSpeed,
    getMatchState: () => ({ team1, team2, controlledFighter, roundNum, roundPhase, matchConfig })
  };
})();
