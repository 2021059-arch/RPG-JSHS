// ==========================================================================
// 전곽: THE BEST — Project Moon Flipbook Multi-Pose Sprite Animation Engine
// (어색한 스파인 본 절단/리깅을 완전히 제거하고, 캐릭터별 13종 독립 동작 및 고유 스킬 포즈 스프라이트를
//  초고속 플립북(Flipbook) 방식으로 빠르게 넘겨가며 역동적인 전투 액션을 구현하는 순수 프레임 애니메이션 엔진)
// ==========================================================================

const CharacterSprites = (() => {

  // 등 뒤 고유 오라/날개/위더/혈귀/신격 이펙트 레이어가 활성화되는 인격 및 테마 컬러
  const AURA_CONFIG = {
    jongsam:    { color: '#f5d76e', sub: '#fff3c4', type: 'wings' },
    samchongsa: { color: '#00e5ff', sub: '#3498db', type: 'wither' },
    hyunseung:  { color: '#ff2a36', sub: '#f5d76e', type: 'udon_god' },
    minji:      { color: '#ff2a36', sub: '#ff7675', type: 'threads' },
    donggyun:   { color: '#a55eea', sub: '#00e5ff', type: 'void' },
    seojangwon: { color: '#a55eea', sub: '#74b9ff', type: 'beast' },
    shelly:     { color: '#ff2a36', sub: '#f5d76e', type: 'blood' },
    yangwoo:    { color: '#d4af37', sub: '#3c6382', type: 'ruler' },
    changjin:   { color: '#ff4757', sub: '#f5d76e', type: 'cannon' },
    mingi:      { color: '#00e5ff', sub: '#8e44ad', type: 'speed' }
  };

  // 캐릭터별 고유 스킬(1스킬/2스킬/3스킬)의 준비 동작 포즈 및 CHARACTER_DB 실제 타격 속성(vfx) 완벽 매핑
  const CHAR_SKILL_POSE_INFO = {
    changjin:    { skill1: { pose: 'pierce', vfx: 'blunt'  }, skill2: { pose: 'slash',  vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    yangwoo:     { skill1: { pose: 'slash',  vfx: 'pierce' }, skill2: { pose: 'pierce', vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    jerok:       { skill1: { pose: 'slash',  vfx: 'blunt'  }, skill2: { pose: 'pierce', vfx: 'pierce' }, skill3: { pose: 'blunt',  vfx: 'pierce' } },
    yonghae:     { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'blunt',  vfx: 'blunt'  }, skill3: { pose: 'slash',  vfx: 'slash'  } },
    jiwon:       { skill1: { pose: 'slash',  vfx: 'slash'  }, skill2: { pose: 'blunt',  vfx: 'slash'  }, skill3: { pose: 'pierce', vfx: 'pierce' } },
    park_clones: { skill1: { pose: 'pierce', vfx: 'blunt'  }, skill2: { pose: 'blunt',  vfx: 'blunt'  }, skill3: { pose: 'slash',  vfx: 'slash'  } },
    seojangwon:  { skill1: { pose: 'slash',  vfx: 'slash'  }, skill2: { pose: 'blunt',  vfx: 'slash'  }, skill3: { pose: 'pierce', vfx: 'pierce' } },
    einstein:    { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'blunt',  vfx: 'blunt'  }, skill3: { pose: 'slash',  vfx: 'slash'  } },
    jongsam:     { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'slash',  vfx: 'slash'  }, skill3: { pose: 'blunt',  vfx: 'pierce' } },
    minji:       { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'blunt',  vfx: 'slash'  }, skill3: { pose: 'slash',  vfx: 'slash'  } },
    hyunmin:     { skill1: { pose: 'slash',  vfx: 'blunt'  }, skill2: { pose: 'pierce', vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    shelly:      { skill1: { pose: 'pierce', vfx: 'blunt'  }, skill2: { pose: 'blunt',  vfx: 'blunt'  }, skill3: { pose: 'slash',  vfx: 'slash'  } },
    yongsun:     { skill1: { pose: 'slash',  vfx: 'blunt'  }, skill2: { pose: 'pierce', vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    samchongsa:  { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'blunt',  vfx: 'blunt'  }, skill3: { pose: 'slash',  vfx: 'blunt'  } },
    donggyun:    { skill1: { pose: 'pierce', vfx: 'blunt'  }, skill2: { pose: 'slash',  vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    hyunseung:   { skill1: { pose: 'slash',  vfx: 'blunt'  }, skill2: { pose: 'blunt',  vfx: 'blunt'  }, skill3: { pose: 'pierce', vfx: 'pierce' } },
    hyunwoo:     { skill1: { pose: 'slash',  vfx: 'pierce' }, skill2: { pose: 'pierce', vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    seungdae:    { skill1: { pose: 'slash',  vfx: 'pierce' }, skill2: { pose: 'pierce', vfx: 'blunt'  }, skill3: { pose: 'blunt',  vfx: 'blunt'  } },
    jusook:      { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'slash',  vfx: 'slash'  }, skill3: { pose: 'blunt',  vfx: 'pierce' } },
    mingi:       { skill1: { pose: 'pierce', vfx: 'pierce' }, skill2: { pose: 'slash',  vfx: 'slash'  }, skill3: { pose: 'blunt',  vfx: 'slash'  } }
  };

  // 포즈 스프라이트 브라우저 이미지 프리로드 캐시 (고속 프레임 스왑 시 깜빡임 원천 방지)
  const preloadedChars = new Set();
  const ALL_POSE_SUFFIXES = [
    '', '_dash', '_dash2', '_guard',
    '_slash', '_pierce', '_blunt',
    '_skill1', '_skill2', '_skill3', '_action',
    '_hit', '_stagger', '_ego'
  ];

  const SPRITE_VER = (typeof location !== 'undefined' && location.protocol === 'file:') ? '' : '?v=r6_clean280';

  function preloadCharSprites(charId) {
    if (!charId || preloadedChars.has(charId) || typeof Image === 'undefined') return;
    preloadedChars.add(charId);
    ALL_POSE_SUFFIXES.forEach(sfx => {
      const img = new Image();
      img.src = `assets/sd/${charId}${sfx}.png${SPRITE_VER}`;
    });
  }

  // 단일 포즈 키에 대응하는 실제 PNG 파일 경로 반환
  function getPoseFileSrc(charId, poseKey = 'idle') {
    if (!poseKey || poseKey === 'idle') return `assets/sd/${charId}.png${SPRITE_VER}`;
    const validPoses = new Set([
      'dash', 'dash2', 'guard',
      'slash', 'pierce', 'blunt',
      'skill1', 'skill2', 'skill3', 'action',
      'hit', 'stagger', 'ego'
    ]);
    if (poseKey === 'clash') return `assets/sd/${charId}_guard.png${SPRITE_VER}`;
    if (validPoses.has(poseKey)) {
      return `assets/sd/${charId}_${poseKey}.png${SPRITE_VER}`;
    }
    return `assets/sd/${charId}.png${SPRITE_VER}`;
  }

  // 모션 상태 및 서브프레임 인덱스에 따른 플립북 프레임 시퀀스 정의
  // 모든 상태가 각기 다른 고유 첫 자세로 즉시 진입하며, 다중 포즈가 겹치지 않고 자연스럽게 이어지도록 설계
  function getFlipbookSequence(charId, animState = 'idle') {
    const skInfo = CHAR_SKILL_POSE_INFO[charId] || CHAR_SKILL_POSE_INFO.changjin;
    switch (animState) {
      case 'dash':
        return {
          loop: true,
          vfx: 'dash',
          frames: [
            { pose: 'dash',  ms: 70, dx: 8,  dy: -3, scale: 1.02 },
            { pose: 'dash2', ms: 80, dx: 14, dy: -2, scale: 1.04 },
            { pose: 'guard', ms: 65, dx: 10, dy: -1, scale: 1.02 },
            { pose: 'idle',  ms: 55, dx: 3,  dy: 0,  scale: 1.00 }
          ]
        };

      case 'dash2':
        return {
          loop: true,
          vfx: 'dash',
          frames: [
            { pose: 'dash2',  ms: 75, dx: 14, dy: -3, scale: 1.04 },
            { pose: 'action', ms: 75, dx: 18, dy: -2, scale: 1.05 },
            { pose: 'dash',   ms: 70, dx: 10, dy: -2, scale: 1.02 },
            { pose: 'guard',  ms: 65, dx: 6,  dy: -1, scale: 1.01 }
          ]
        };

      case 'guard':
        return {
          loop: false,
          loopInterval: 720,
          vfx: 'guard',
          frames: [
            { pose: 'guard',  ms: 110, dx: 10, dy: -1, scale: 1.04 },
            { pose: 'dash2',  ms: 75,  dx: 14, dy: -2, scale: 1.05 },
            { pose: 'action', ms: 80,  dx: 16, dy: -2, scale: 1.06 },
            { pose: 'guard',  ms: 320, dx: 8,  dy: 0,  scale: 1.03 }
          ]
        };

      case 'clash':
        return {
          loop: true,
          vfx: 'guard',
          frames: [
            { pose: 'slash',  ms: 65, dx: 16, dy: -2, scale: 1.05 },
            { pose: 'guard',  ms: 60, dx: 10, dy: -1, scale: 1.03 },
            { pose: 'pierce', ms: 65, dx: 18, dy: -2, scale: 1.06 },
            { pose: 'action', ms: 65, dx: 20, dy: -3, scale: 1.07 },
            { pose: 'blunt',  ms: 65, dx: 16, dy: -1, scale: 1.05 },
            { pose: 'guard',  ms: 75, dx: 10, dy: 0,  scale: 1.03 }
          ]
        };

      case 'slash':
        return {
          loop: true,
          vfx: 'slash',
          frames: [
            { pose: 'slash',  ms: 75,  dx: 20, dy: -3, scale: 1.06 },
            { pose: 'action', ms: 75,  dx: 25, dy: -4, scale: 1.08 },
            { pose: 'skill1', ms: 105, dx: 22, dy: -2, scale: 1.07 },
            { pose: 'pierce', ms: 75,  dx: 16, dy: -2, scale: 1.05 },
            { pose: 'dash2',  ms: 60,  dx: 8,  dy: -1, scale: 1.02 }
          ]
        };

      case 'pierce':
        return {
          loop: true,
          vfx: 'pierce',
          frames: [
            { pose: 'pierce', ms: 75,  dx: 22, dy: -2, scale: 1.07 },
            { pose: 'slash',  ms: 75,  dx: 26, dy: -2, scale: 1.08 },
            { pose: 'skill2', ms: 105, dx: 24, dy: -1, scale: 1.07 },
            { pose: 'action', ms: 75,  dx: 18, dy: -2, scale: 1.05 },
            { pose: 'dash',   ms: 60,  dx: 8,  dy: -1, scale: 1.02 }
          ]
        };

      case 'blunt':
        return {
          loop: true,
          vfx: 'blunt',
          frames: [
            { pose: 'blunt',  ms: 75,  dx: 22, dy: 2,  scale: 1.08 },
            { pose: 'action', ms: 75,  dx: 26, dy: 3,  scale: 1.09 },
            { pose: 'skill3', ms: 110, dx: 22, dy: 2,  scale: 1.08 },
            { pose: 'slash',  ms: 75,  dx: 16, dy: 0,  scale: 1.05 },
            { pose: 'guard',  ms: 60,  dx: 8,  dy: 0,  scale: 1.02 }
          ]
        };

      case 'action':
        return {
          loop: true,
          vfx: 'slash',
          frames: [
            { pose: 'action', ms: 75,  dx: 22, dy: -3, scale: 1.07 },
            { pose: 'slash',  ms: 70,  dx: 24, dy: -2, scale: 1.08 },
            { pose: 'pierce', ms: 70,  dx: 26, dy: -2, scale: 1.08 },
            { pose: 'blunt',  ms: 80,  dx: 22, dy: 1,  scale: 1.07 },
            { pose: 'skill1', ms: 95,  dx: 18, dy: -1, scale: 1.06 }
          ]
        };

      case 'skill1':
        return {
          loop: true,
          vfx: skInfo.skill1.vfx,
          frames: [
            { pose: 'skill1', ms: 90,  dx: 20, dy: -2, scale: 1.07 },
            { pose: 'slash',  ms: 65,  dx: 24, dy: -3, scale: 1.08 },
            { pose: 'pierce', ms: 65,  dx: 26, dy: -2, scale: 1.08 },
            { pose: 'action', ms: 75,  dx: 24, dy: -3, scale: 1.09 },
            { pose: 'skill1', ms: 135, dx: 22, dy: -2, scale: 1.08 },
            { pose: 'dash',   ms: 60,  dx: 8,  dy: -1, scale: 1.02 }
          ]
        };

      case 'skill2':
        return {
          loop: true,
          vfx: skInfo.skill2.vfx,
          frames: [
            { pose: 'skill2', ms: 90,  dx: 22, dy: -2, scale: 1.08 },
            { pose: 'pierce', ms: 65,  dx: 24, dy: -2, scale: 1.08 },
            { pose: 'blunt',  ms: 65,  dx: 26, dy: -1, scale: 1.09 },
            { pose: 'action', ms: 75,  dx: 28, dy: -3, scale: 1.09 },
            { pose: 'skill2', ms: 140, dx: 24, dy: -2, scale: 1.09 },
            { pose: 'dash2',  ms: 60,  dx: 8,  dy: -1, scale: 1.02 }
          ]
        };

      case 'skill3':
        return {
          loop: true,
          vfx: skInfo.skill3.vfx,
          frames: [
            { pose: 'skill3', ms: 85,  dx: 24, dy: -2, scale: 1.09 },
            { pose: 'blunt',  ms: 60,  dx: 24, dy: -1, scale: 1.08 },
            { pose: 'skill1', ms: 65,  dx: 26, dy: -3, scale: 1.09 },
            { pose: 'skill2', ms: 65,  dx: 28, dy: -2, scale: 1.10 },
            { pose: 'action', ms: 70,  dx: 28, dy: -3, scale: 1.10 },
            { pose: 'skill3', ms: 155, dx: 26, dy: -1, scale: 1.11 }
          ]
        };

      case 'ego':
        return {
          loop: true,
          vfx: 'ego',
          frames: [
            { pose: 'ego',    ms: 95,  dx: 16, dy: -6, scale: 1.11 },
            { pose: 'action', ms: 60,  dx: 20, dy: -4, scale: 1.08 },
            { pose: 'skill1', ms: 60,  dx: 22, dy: -4, scale: 1.09 },
            { pose: 'skill2', ms: 65,  dx: 24, dy: -5, scale: 1.10 },
            { pose: 'skill3', ms: 70,  dx: 26, dy: -5, scale: 1.11 },
            { pose: 'ego',    ms: 190, dx: 14, dy: -7, scale: 1.13 }
          ]
        };

      case 'hit':
        return {
          loop: false,
          vfx: 'hit',
          frames: [
            { pose: 'hit',     ms: 90,  dx: -18, dy: -3, scale: 0.96 },
            { pose: 'stagger', ms: 75,  dx: -14, dy: 2,  scale: 0.95 },
            { pose: 'guard',   ms: 55,  dx: -8,  dy: -1, scale: 0.98 },
            { pose: 'hit',     ms: 180, dx: -12, dy: 0,  scale: 0.97 }
          ]
        };

      case 'stagger':
        return {
          loop: false,
          vfx: 'stagger',
          frames: [
            { pose: 'stagger', ms: 110, dx: -14, dy: 4, scale: 0.95 },
            { pose: 'hit',     ms: 70,  dx: -16, dy: 2, scale: 0.96 },
            { pose: 'stagger', ms: 380, dx: -12, dy: 6, scale: 0.94 }
          ]
        };

      default:
        return {
          loop: false,
          vfx: 'idle',
          frames: [
            { pose: 'idle', ms: 1000, dx: 0, dy: 0, scale: 1.0 }
          ]
        };
    }
  }

  // 호환용 단일 키프레임 조회 함수 (기존 호출부 완벽 호환)
  function getKeyframeSpriteSrc(charId, animState = 'idle', subFrame = 0) {
    const seq = getFlipbookSequence(charId, animState);
    const frame = seq.frames[subFrame % seq.frames.length] || seq.frames[0];
    return getPoseFileSrc(charId, frame.pose);
  }

  // 스킬 객체 또는 스킬 ID를 캐릭터 고유 스킬 애니메이션 상태('skill1', 'skill2', 'skill3', 'ego')로 변환
  function resolveSkillAnimState(charId, skillOrState) {
    if (!skillOrState) return 'slash';
    if (typeof skillOrState === 'string') {
      const s = skillOrState.trim();
      if (['idle', 'dash', 'dash2', 'guard', 'clash', 'slash', 'pierce', 'blunt', 'skill1', 'skill2', 'skill3', 'ego', 'hit', 'stagger', 'action'].includes(s)) {
        return s;
      }
      if (s.endsWith('_ego')) return 'ego';
      if (s.endsWith('_s1')) return 'skill1';
      if (s.endsWith('_s2')) return 'skill2';
      if (s.endsWith('_s3')) return 'skill3';
      return 'slash';
    }
    if (typeof skillOrState === 'object') {
      if (skillOrState.isEgo || (skillOrState.id && skillOrState.id.endsWith('_ego'))) return 'ego';
      if (skillOrState.id) {
        if (skillOrState.id.endsWith('_s1')) return 'skill1';
        if (skillOrState.id.endsWith('_s2')) return 'skill2';
        if (skillOrState.id.endsWith('_s3')) return 'skill3';
      }
      if (skillOrState.type && ['slash', 'pierce', 'blunt'].includes(skillOrState.type)) {
        return skillOrState.type;
      }
    }
    return 'slash';
  }

  // 림버스 컴퍼니 스타일 참격/관통/타격 SVG 엠블럼 렌더러
  function renderAtkIcon(type) {
    if (type === 'slash') {
      return `<svg width="14" height="14" viewBox="0 0 20 20" style="vertical-align:middle;margin-right:3px;">
        <path d="M3 17 L17 3 M12 3 L17 3 L17 8" fill="none" stroke="#ff5252" stroke-width="2.4"/>
        <path d="M4 13 Q10 10 15 4" fill="none" stroke="#f5d76e" stroke-width="1.4"/>
      </svg>`;
    }
    if (type === 'pierce') {
      return `<svg width="14" height="14" viewBox="0 0 20 20" style="vertical-align:middle;margin-right:3px;">
        <polygon points="18,2 8,9 11,12" fill="#00e5ff"/>
        <line x1="2" y1="18" x2="18" y2="2" stroke="#f5d76e" stroke-width="2.2"/>
      </svg>`;
    }
    return `<svg width="14" height="14" viewBox="0 0 20 20" style="vertical-align:middle;margin-right:3px;">
      <polygon points="6,4 15,4 17,10 10,16 4,10" fill="#f39c12" stroke="#fff" stroke-width="1.4"/>
    </svg>`;
  }

  // 등 뒤 오라/날개/E.G.O 후광 전용 캐릭터별 맞춤 벡터 레이어
  function renderBackAuraSVG(charId) {
    const cfg = AURA_CONFIG[charId] || { color: '#d4af37', sub: '#00e5ff', type: 'default' };
    let innerSvg = '';

    if (cfg.type === 'wings') {
      // 김종삼 300m 황금 6익 세라핌 빛의 날개
      innerSvg = `
        <path d="M 86 98 Q 22 44 6 22 Q 46 38 78 78 Z" fill="${cfg.color}" opacity="0.28" stroke="${cfg.sub}" stroke-width="0.9"/>
        <path d="M 84 106 Q 12 84 2 68 Q 42 74 78 96 Z" fill="${cfg.color}" opacity="0.22"/>
        <path d="M 88 116 Q 28 126 14 142 Q 52 126 82 112 Z" fill="${cfg.sub}" opacity="0.18"/>
        <path d="M 114 98 Q 178 44 194 22 Q 154 38 122 78 Z" fill="${cfg.color}" opacity="0.28" stroke="${cfg.sub}" stroke-width="0.9"/>
        <path d="M 116 106 Q 188 84 198 68 Q 158 74 122 96 Z" fill="${cfg.color}" opacity="0.22"/>
        <path d="M 112 116 Q 172 126 186 142 Q 148 126 118 112 Z" fill="${cfg.sub}" opacity="0.18"/>
        <circle cx="100" cy="68" r="24" fill="none" stroke="${cfg.sub}" stroke-width="1.4" stroke-dasharray="5,3" opacity="0.55"/>
      `;
    } else if (cfg.type === 'wither') {
      // 삼총사 박정화 진명 케르베로스(3두 위더) 푸른 갈비뼈 & 3해골 문양
      innerSvg = `
        <circle cx="100" cy="96" r="58" fill="none" stroke="${cfg.color}" stroke-width="1.6" stroke-dasharray="8,4" opacity="0.45"/>
        <rect x="52" y="42" width="16" height="16" rx="2" fill="rgba(12,20,30,0.75)" stroke="${cfg.color}" stroke-width="1.4" opacity="0.65"/>
        <rect x="91" y="28" width="18" height="18" rx="2" fill="rgba(12,20,30,0.8)" stroke="${cfg.color}" stroke-width="1.5" opacity="0.72"/>
        <rect x="132" y="42" width="16" height="16" rx="2" fill="rgba(12,20,30,0.75)" stroke="${cfg.color}" stroke-width="1.4" opacity="0.65"/>
        <path d="M 68 92 Q 100 104 132 92 M 72 106 Q 100 116 128 106" fill="none" stroke="${cfg.color}" stroke-width="1.8" opacity="0.45"/>
      `;
    } else if (cfg.type === 'udon_god') {
      // 신현승 붉은 털실 본모습 & 시간 대칭성 시계 윤회진
      innerSvg = `
        <circle cx="100" cy="96" r="56" fill="none" stroke="${cfg.sub}" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.52"/>
        <ellipse cx="100" cy="96" rx="64" ry="26" fill="none" stroke="${cfg.color}" stroke-width="1.5" transform="rotate(-24 100 96)" opacity="0.48"/>
        <ellipse cx="100" cy="96" rx="64" ry="26" fill="none" stroke="${cfg.color}" stroke-width="1.5" transform="rotate(24 100 96)" opacity="0.48"/>
        <line x1="100" y1="96" x2="100" y2="48" stroke="${cfg.sub}" stroke-width="1.8" opacity="0.55"/>
        <line x1="100" y1="96" x2="134" y2="110" stroke="${cfg.color}" stroke-width="1.8" opacity="0.55"/>
      `;
    } else if (cfg.type === 'threads') {
      // 조민지 20시 실루엣 & 산혼철조 붉은 실선
      innerSvg = `
        <line x1="34" y1="46" x2="166" y2="148" stroke="${cfg.color}" stroke-width="1.5" opacity="0.42"/>
        <line x1="28" y1="62" x2="160" y2="164" stroke="${cfg.color}" stroke-width="1.2" opacity="0.32"/>
        <line x1="166" y1="46" x2="34" y2="148" stroke="${cfg.sub}" stroke-width="1.2" opacity="0.32"/>
        <circle cx="100" cy="98" r="46" fill="none" stroke="${cfg.color}" stroke-width="1.2" stroke-dasharray="4,6" opacity="0.4"/>
      `;
    } else if (cfg.type === 'ruler') {
      // 김양우 규격 1013.7hPa 지배자의 황금 마름모 후광
      innerSvg = `
        <polygon points="100,32 162,96 100,160 38,96" fill="none" stroke="${cfg.color}" stroke-width="1.4" opacity="0.38"/>
        <circle cx="100" cy="96" r="48" fill="none" stroke="${cfg.sub}" stroke-width="1.2" stroke-dasharray="8,4" opacity="0.42"/>
      `;
    } else if (cfg.type === 'cannon') {
      // 김창진 과구리 대포 열기 링
      innerSvg = `
        <circle cx="100" cy="100" r="52" fill="none" stroke="${cfg.color}" stroke-width="1.6" stroke-dasharray="10,5" opacity="0.36"/>
        <circle cx="100" cy="100" r="38" fill="none" stroke="${cfg.sub}" stroke-width="1.1" opacity="0.28"/>
      `;
    } else if (cfg.type === 'speed') {
      // 민기쌤 불가시 초고속 규칙 궤도
      innerSvg = `
        <ellipse cx="100" cy="102" rx="64" ry="20" fill="none" stroke="${cfg.color}" stroke-width="1.4" transform="rotate(-14 100 102)" opacity="0.42"/>
        <circle cx="100" cy="96" r="44" fill="none" stroke="${cfg.sub}" stroke-width="1.2" stroke-dasharray="5,5" opacity="0.35"/>
      `;
    } else {
      innerSvg = `
        <circle cx="100" cy="98" r="54" fill="none" stroke="${cfg.color}" stroke-width="1.5" stroke-dasharray="7,5" opacity="0.48"/>
        <path d="M 42 115 Q 18 72 52 38 Q 74 72 68 112 Z" fill="${cfg.color}" opacity="0.16"/>
        <path d="M 158 115 Q 182 72 148 38 Q 126 72 132 112 Z" fill="${cfg.color}" opacity="0.16"/>
        <circle cx="100" cy="98" r="38" fill="none" stroke="${cfg.sub}" stroke-width="1.0" opacity="0.35"/>
      `;
    }

    return `
      <svg class="pm-aura-svg" viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet">
        <g class="aura-pulse-group">
          ${innerSvg}
        </g>
      </svg>
    `;
  }

  // 프문식 전투 이펙트 오버레이 SVG (전방 타격 궤적 중심)
  function renderVfxOverlaySVG() {
    return `
      <svg class="pm-vfx-svg" viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet">
        <!-- 1. 참격 (SLASH) 전방 초승달 검기 아크 -->
        <g class="vfx-group vfx-slash">
          <path d="M 96 20 Q 198 96 92 196 Q 172 98 96 20 Z" fill="rgba(255,42,54,0.72)"/>
          <path d="M 108 32 Q 188 96 104 184" fill="none" stroke="#fff3c4" stroke-width="3.8" stroke-linecap="round"/>
          <line x1="78" y1="68" x2="194" y2="124" stroke="#f5d76e" stroke-width="2.0" stroke-dasharray="10,6"/>
        </g>

        <!-- 2. 관통 (PIERCE) 전방 고속 스러스트 창 & 마하 링 -->
        <g class="vfx-group vfx-pierce">
          <ellipse cx="142" cy="106" rx="12" ry="36" fill="none" stroke="#00e5ff" stroke-width="2.6" opacity="0.82"/>
          <polygon points="82,106 198,95 178,106 198,117" fill="rgba(0,229,255,0.82)"/>
          <line x1="68" y1="106" x2="198" y2="106" stroke="#ffffff" stroke-width="3.2"/>
        </g>

        <!-- 3. 타격 (BLUNT) 전방 방사형 진동 파쇄 크레이터 -->
        <g class="vfx-group vfx-blunt">
          <circle cx="152" cy="112" r="34" fill="none" stroke="#f39c12" stroke-width="3.2" stroke-dasharray="10,6"/>
          <polygon points="152,68 162,98 194,95 168,115 184,146 152,130 122,148 134,117 108,96 140,98"
                   fill="rgba(243,156,18,0.38)" stroke="#fff3c4" stroke-width="2.2"/>
        </g>

        <!-- 4. 합 대치 / 수비 (GUARD / CLASH) 전방 육각 방벽 -->
        <g class="vfx-group vfx-guard">
          <polygon points="154,54 184,74 184,134 154,154 124,134 124,74"
                   fill="rgba(0,229,255,0.14)" stroke="#f5d76e" stroke-width="2.4"/>
          <line x1="138" y1="74" x2="170" y2="134" stroke="#fff3c4" stroke-width="2.2" opacity="0.8"/>
        </g>

        <!-- 5. 피격 (HIT) 피격 스파크 -->
        <g class="vfx-group vfx-hit">
          <line x1="56" y1="54" x2="148" y2="146" stroke="#ff2a36" stroke-width="3.6"/>
          <line x1="142" y1="62" x2="62" y2="142" stroke="#fff3c4" stroke-width="2.0"/>
          <circle cx="76" cy="82" r="4.5" fill="#ff2a36"/>
          <circle cx="132" cy="126" r="5.0" fill="#ff2a36"/>
        </g>

        <!-- 6. 흐트러짐 (STAGGER) 머리 위 깨진 황금 거울 파편 -->
        <g class="vfx-group vfx-stagger">
          <polygon points="62,22 78,14 72,34" fill="#f1c40f" stroke="#fff" stroke-width="1"/>
          <polygon points="102,10 118,20 104,30" fill="#f39c12" stroke="#fff" stroke-width="1"/>
          <polygon points="134,22 148,14 142,34" fill="#f1c40f" stroke="#fff" stroke-width="1"/>
        </g>

        <!-- 7. E.G.O 각성 마법진 -->
        <g class="vfx-group vfx-ego">
          <circle cx="100" cy="108" r="76" fill="none" stroke="#d4af37" stroke-width="2.2" stroke-dasharray="8,5" opacity="0.75"/>
          <circle cx="100" cy="108" r="62" fill="none" stroke="#00e5ff" stroke-width="1.4" opacity="0.65"/>
          <polygon points="100,34 164,146 36,146" fill="none" stroke="rgba(245,215,110,0.52)" stroke-width="1.8"/>
          <polygon points="100,182 164,70 36,70" fill="none" stroke="rgba(255,42,54,0.52)" stroke-width="1.8"/>
        </g>
      </svg>
    `;
  }

  // 순수 플립북(Flipbook) 다중 포즈 스프라이트 렌더러 (관절 분할/기즈모/왜곡 일체 없음)
  function render(charId, facing = 'right', state = 'idle') {
    preloadCharSprites(charId);

    const flipClass = facing === 'left' ? 'facing-left' : 'facing-right';
    const hasBackAura = Boolean(AURA_CONFIG[charId]);
    const resolvedState = resolveSkillAnimState(charId, state);
    const seq = getFlipbookSequence(charId, resolvedState);
    const initialPose = seq.frames[0].pose;
    const spriteSrc = getPoseFileSrc(charId, initialPose);
    const phaseDelay = ((charId.charCodeAt(0) * 17 + charId.length * 31) % 12) * -0.18;

    return `
      <div class="pm-spine-rig ${flipClass} state-${resolvedState} vfx-mode-${seq.vfx}"
           data-char-id="${charId}"
           data-anim-state="${resolvedState}"
           data-pose-frame="${initialPose}"
           style="--anim-delay:${phaseDelay.toFixed(2)}s;--frame-dx:0px;--frame-dy:0px;--frame-scale:1;">

        <!-- Layer 0: 등 뒤 고유 오라 / 날개 / 위더 벡터 후광 -->
        ${hasBackAura ? `
          <div class="pm-aura-layer">
            ${renderBackAuraSVG(charId)}
          </div>
        ` : ''}

        <!-- Layer 1: 프문식 플립북 직전 프레임 잔상(Afterimage) 트레일 -->
        <div class="pm-smear-ghost g1">
          <img src="${spriteSrc}" alt="" class="rig-ghost-img" draggable="false" />
        </div>
        <div class="pm-smear-ghost g2">
          <img src="${spriteSrc}" alt="" class="rig-ghost-img" draggable="false" />
        </div>

        <!-- Layer 2: 단일 전신 포즈 스프라이트 스테이지 (신체 절단/본 왜곡 없이 독립 작화 포즈들을 고속 전환) -->
        <div class="pm-sprite-stage">
          <img src="${spriteSrc}" alt="${charId}" class="pm-sprite-img" draggable="false" />
        </div>

        <!-- Layer 3: 프문식 타격/방어/E.G.O 이펙트 레이어 -->
        <div class="pm-vfx-layer">
          ${renderVfxOverlaySVG()}
        </div>
      </div>
    `;
  }

  // 런타임 다중 포즈 플립북 타이머 관리
  const activeTimers = new WeakMap();

  function clearRigTimer(rig) {
    const prev = activeTimers.get(rig);
    if (prev) {
      prev.cancelled = true;
      if (prev.timeoutId) clearTimeout(prev.timeoutId);
      activeTimers.delete(rig);
    }
  }

  // 메인 포즈 이미지와 이전 포즈 잔상(Afterimage) 트레일을 갱신하고 프레임 오프셋 적용
  function applyFlipbookFrame(rig, charId, frameObj) {
    const nextSrc = getPoseFileSrc(charId, frameObj.pose);
    const mainImg = rig.querySelector('.pm-sprite-img');
    const ghost1 = rig.querySelector('.pm-smear-ghost.g1 img');
    const ghost2 = rig.querySelector('.pm-smear-ghost.g2 img');

    const prevSrc = mainImg ? mainImg.getAttribute('src') : nextSrc;
    const prevGhost1Src = ghost1 ? ghost1.getAttribute('src') : prevSrc;

    // 포즈가 바뀔 때마다 직전 포즈 스프라이트를 잔상 레이어(g1 -> g2)로 밀어내어 자연스러운 연속 동작 잔상 형성
    if (ghost2 && prevGhost1Src && ghost2.getAttribute('src') !== prevGhost1Src) {
      ghost2.setAttribute('src', prevGhost1Src);
    }
    if (ghost1 && prevSrc && ghost1.getAttribute('src') !== prevSrc) {
      ghost1.setAttribute('src', prevSrc);
    }
    if (mainImg && mainImg.getAttribute('src') !== nextSrc) {
      mainImg.setAttribute('src', nextSrc);
    }

    rig.dataset.poseFrame = frameObj.pose;
    rig.style.setProperty('--frame-dx', `${frameObj.dx || 0}px`);
    rig.style.setProperty('--frame-dy', `${frameObj.dy || 0}px`);
    rig.style.setProperty('--frame-scale', `${frameObj.scale || 1}`);

    // 도감 스테이지 내 재생 중인 경우 14종 포즈 썸네일 스트립에 현재 활성 프레임 하이라이트 연동
    if (rig.closest('#codex-spine-stage') && typeof document !== 'undefined') {
      document.querySelectorAll('.codex-pose-thumb').forEach(el => {
        el.classList.toggle('active-frame', el.dataset.pose === frameObj.pose);
      });
    }
  }

  // 특정 DOM 컨테이너 안의 캐릭터 모션 상태 또는 고유 스킬 시퀀스를 즉시 플립북 재생하는 런타임 제어기
  function setRigState(containerEl, charId, newStateOrSkill = 'idle') {
    if (!containerEl) return;
    const rig = containerEl.querySelector('.pm-spine-rig') || (containerEl.classList.contains('pm-spine-rig') ? containerEl : null);
    if (!rig) return;

    const resolvedState = resolveSkillAnimState(charId, newStateOrSkill);
    preloadCharSprites(charId);
    clearRigTimer(rig);

    const prevState = rig.dataset.animState || 'idle';
    rig.classList.remove(`state-${prevState}`);
    rig.classList.forEach(cls => {
      if (cls.startsWith('vfx-mode-')) rig.classList.remove(cls);
    });

    const seq = getFlipbookSequence(charId, resolvedState);
    rig.classList.add(`state-${resolvedState}`);
    rig.classList.add(`vfx-mode-${seq.vfx}`);
    rig.dataset.animState = resolvedState;

    if (seq.frames.length <= 1) {
      applyFlipbookFrame(rig, charId, seq.frames[0]);
      return;
    }

    const timerRecord = { cancelled: false, timeoutId: null };
    activeTimers.set(rig, timerRecord);

    let frameIdx = 0;
    const stepFrame = () => {
      if (timerRecord.cancelled || !rig.isConnected || rig.dataset.animState !== resolvedState) {
        clearRigTimer(rig);
        return;
      }

      const currentFrame = seq.frames[frameIdx];
      applyFlipbookFrame(rig, charId, currentFrame);

      frameIdx++;
      if (frameIdx < seq.frames.length) {
        timerRecord.timeoutId = setTimeout(stepFrame, currentFrame.ms);
      } else if (seq.loop) {
        frameIdx = 0;
        timerRecord.timeoutId = setTimeout(stepFrame, currentFrame.ms);
      } else if (seq.loopInterval) {
        frameIdx = 0;
        timerRecord.timeoutId = setTimeout(stepFrame, seq.loopInterval);
      }
    };

    stepFrame();
  }

  // 60fps 실시간 격투 엔진용 프레임 즉시 제어기 (타이머 없이 정확한 포즈·잔상·VFX 즉시 반영)
  function setExactPose(containerEl, charId, poseKey = 'idle', vfxMode = 'idle', dx = 0, dy = 0, scale = 1) {
    if (!containerEl) return;
    const rig = containerEl.classList.contains('pm-spine-rig')
      ? containerEl
      : containerEl.querySelector('.pm-spine-rig');
    if (!rig) return;

    clearRigTimer(rig);

    const prevVfx = rig.dataset.vfxMode || '';
    if (prevVfx !== vfxMode) {
      rig.classList.forEach(cls => {
        if (cls.startsWith('vfx-mode-') || cls.startsWith('state-')) rig.classList.remove(cls);
      });
      rig.classList.add(`state-${poseKey}`);
      if (vfxMode && vfxMode !== 'none') {
        rig.classList.add(`vfx-mode-${vfxMode}`);
      }
      rig.dataset.vfxMode = vfxMode;
      rig.dataset.animState = poseKey;
    }

    if (rig.dataset.poseFrame !== poseKey) {
      applyFlipbookFrame(rig, charId, { pose: poseKey, dx, dy, scale });
    } else {
      rig.style.setProperty('--frame-dx', `${dx}px`);
      rig.style.setProperty('--frame-dy', `${dy}px`);
      rig.style.setProperty('--frame-scale', `${scale}`);
    }
  }

  return {
    render,
    renderAtkIcon,
    setRigState,
    setExactPose,
    preloadCharSprites,
    resolveSkillAnimState,
    getKeyframeSpriteSrc,
    getPoseFileSrc,
    getFlipbookSequence,
    CHAR_SKILL_POSE_INFO
  };
})();
