// ==========================================================================
// 전곽: THE BEST — 20인 전 캐릭터 인격 & 스킬 & E.G.O 데이터베이스 (원작 PDF 완벽 반영)
// ==========================================================================

const SIN_INFO = {
  wrath:    { name: '분노(물리)', color: '#d63031' },
  lust:     { name: '색욕(생명)', color: '#e84393' },
  sloth:    { name: '나태(지구)', color: '#f39c12' },
  gluttony: { name: '탐식(식객)', color: '#2ecc71' },
  gloom:    { name: '우울(언어)', color: '#0984e3' },
  pride:    { name: '오만(규격)', color: '#3c6382' },
  envy:     { name: '질투(카피)', color: '#8e44ad' }
};

const ATK_TYPE_INFO = {
  slash:  { name: '참격', code: 'SLASH' },
  pierce: { name: '관통', code: 'PIERCE' },
  blunt:  { name: '타격', code: 'BLUNT' }
};

const CHARACTER_DB = [
  // ========================================================================
  // [1] 양우쌤 진영 (창의관 지배 체제)
  // ========================================================================
  {
    id: 'yangwoo',
    name: '김양우 (양우쌤)',
    title: '창의관의 절대 지배자 · 역사상 최강의 교사',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 (지배자)',
    appearance: '남성, 하얀 가운, 중년, 네모 안경, 강사용 마이크. 평소엔 양 손을 가운 주머니에 넣고 있음.',
    lore: '현재 학교의 지배자. 대체 왜 학교를 지배하는지는 모르겠지만 아무튼 학교를 지배한다. 절대 권력을 휘두르며 자신에게 대항하는 선생들과 학생들을 탄압한다. 상대의 전투력을 수치로 환산해 예비보고서와 결과보고서를 제작하며, 성제록의 머릿속에 자신의 구글 독스 사본을 업로드해 두었다.',
    hp: 340,
    speed: [5, 9],
    res: { slash: 0.8, pierce: 0.8, blunt: 1.0 },
    passive: {
      name: '『규격』 예비·결과보고서 & 사본 만들기',
      desc: '매 턴 현지기압(1013.7hPa)을 확인해 합 위력 +2. 체력이 50% 이하가 되면 주머니에서 손을 꺼내 공격력이 폭증하며, 사망 시 아군에 제록쌤이 있다면 구글 독스 『사본 만들기』로 부활한다.'
    },
    skills: [
      {
        id: 'yw_s1',
        name: '『규격』이 있잖아',
        sin: 'pride',
        type: 'pierce',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '기한 안에 제출 안하면 감점된다고 했제?',
        desc: '[적중 시] 상대의 전투력을 수치로 환산해 예비보고서 작성 (대상 방어력 약화 2, 자신의 정신력 +10)',
        effects: { debuffVuln: 2, spSelf: 10 }
      },
      {
        id: 'yw_s2',
        name: '『시작인사』',
        sin: 'wrath',
        type: 'blunt',
        base: 6,
        coinBonus: 4,
        coins: 3,
        quote: '자, 그럼 『시작인사』',
        desc: '양 손을 주머니에서 꺼내 보이지 않는 속도로 타격한다. 양우쌤이 주머니에서 손을 꺼냈다는 것은 적수로 인정한다는 뜻이다.',
        effects: { bleed: 4, staggerBonus: 12 }
      },
      {
        id: 'yw_s3',
        name: '『다들 손 떼!』',
        sin: 'pride',
        type: 'blunt',
        base: 8,
        coinBonus: 5,
        coins: 2,
        quote: '자자, 다들 손 떼!',
        desc: '[광역 권능] 범위 내 모두를 정지시킨다. 양우쌤의 지배 하에 있다면 거역할 수 없으며 마비 및 흐트러짐 피해를 입힌다.',
        effects: { paralyze: 2, spDrain: 15, staggerBonus: 20, cutscene: 'stop_hands' }
      },
      {
        id: 'yw_ego',
        name: '[E.G.O] 『끝인사』',
        sin: 'pride',
        type: 'slash',
        base: 12,
        coinBonus: 6,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '이제, 끝인사—',
        desc: '[처형 오의] 상대를 마무리하는 기술. 이 기술에 당하고 살아남은 자는 없다. (대상 체력이 35% 이하일 때 피해량 +100%)',
        effects: { executeBonus: true, staggerBonus: 35 }
      }
    ]
  },

  {
    id: 'jerok',
    name: '제록쌤 (성제록)',
    title: '1번대장 · 후계자 (양우쌤의 숙주)',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 (1번대장)',
    appearance: '여성, 장발, 별 특징 없음. 그냥 옷. (전투 시 7색 안광 레이저 & 허동균에게서 강탈한 1000km 신축 팔)',
    lore: '양우쌤의 후계자이자 부활을 위해 마련해둔 숙주. 주숙쌤의 뒤를 이을 운명이었으나 농간에 빠져 양우쌤의 부하가 되었다. 진실을 깨닫고 양우쌤을 막으려 달려오나 머릿속에 저장된 양우쌤 파일(사본 만들기)이 열리며 육체를 강탈당한다.',
    hp: 260,
    speed: [4, 8],
    res: { slash: 1.0, pierce: 0.7, blunt: 1.2 },
    passive: {
      name: '이식된 허동균의 양 팔 & 숙주 파일',
      desc: '원거리/근거리 제한 없이 타격하며, 『레이저』 발사 시 7가지 색 중 하나로 무작위 폭격한다.'
    },
    skills: [
      {
        id: 'jr_s1',
        name: '『팔』 (1,000km 신축)',
        sin: 'envy',
        type: 'blunt',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '이만 물러가보도록 하지.',
        desc: '허동균의 양 팔을 이식한 후 자유자재로 구부러지는 팔을 최대 1,000km까지 늘려 타격한다.',
        effects: { staggerBonus: 8 }
      },
      {
        id: 'jr_s2',
        name: '『레이저』 (7색 안광)',
        sin: 'wrath',
        type: 'pierce',
        base: 5,
        coinBonus: 4,
        coins: 3,
        quote: '양 눈에서 7가지 색 레이저 발사! (사실 위력 차이는 없다)',
        desc: '일격에 동백관과 창의관의 절반에 달하는 면적을 소멸시킬 수 있는 위력의 안광 레이저.',
        effects: { burn: 5, sfx: 'laser' }
      },
      {
        id: 'jr_s3',
        name: '창의관 반파 극광선',
        sin: 'pride',
        type: 'pierce',
        base: 7,
        coinBonus: 5,
        coins: 2,
        quote: '켐벨로 막아도 켐벨째로 관통한다!',
        desc: '방어 태세를 무시하고 관통 피해를 입히며 대상의 정신력을 12 감소시킨다.',
        effects: { spDrain: 12, debuffVuln: 2, sfx: 'laser' }
      },
      {
        id: 'jr_ego',
        name: '[E.G.O] 『사본 만들기: 양우쌤 업로드』',
        sin: 'pride',
        type: 'pierce',
        base: 11,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '기한 안에 제출 안하면 감점된다고 했제?',
        desc: '성제록의 머릿속에 저장되어 있던 양우쌤 구글 독스 사본 파일이 열리며 황현민의 켐벨 11판째로 꿰뚫는다!',
        effects: { cutscene: 'gdocs_copy', debuffVuln: 3, staggerBonus: 28, sfx: 'laser' }
      }
    ]
  },

  {
    id: 'yonghae',
    name: '용해쌤 (양용해)',
    title: '2번대장 · 음험한 미소의 행동대장',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 (2번대장)',
    appearance: '남성, 바가지머리, 카라티 + 고어텍스 조끼. 온화한 미소 뒤에 숨겨진 음험한 속내.',
    lore: '양우쌤의 행동대장으로 제1선에 나선다. 자의로 세뇌를 푼 지원쌤을 숙청하기 위해 "수학은 물리의 도구"라는 말과 함께 등장했으며, R&E실에서 삼총사 박정화를 리빙박스에 봉인하고 박스테이프를 감았다.',
    hp: 270,
    speed: [5, 8],
    res: { slash: 0.8, pierce: 1.0, blunt: 1.1 },
    passive: {
      name: '수학은 물리의 도구',
      desc: '정신력(SP)이 낮은 대상을 공격할 때 피해량 +30%. 적중 시 대상의 정신력을 갉아먹는다.'
    },
    skills: [
      {
        id: 'yh_s1',
        name: '『해 봤어요?』',
        sin: 'gloom',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '싸워 봤어요? 해 봤어요?',
        desc: '[정신지배] 상대의 심리적 약점을 파고들어 내면을 갉아먹고 정신력을 18 깎는다.',
        effects: { spDrain: 18, paralyze: 1 }
      },
      {
        id: 'yh_s2',
        name: '리빙박스 & 박스테이프 봉인',
        sin: 'pride',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '어느새 순간이동해 리빙박스 위에 박스테이프를 감는다.',
        desc: '순간이동으로 접근해 대상을 리빙박스에 구속한다. (속박 및 흐트러짐 손상 15)',
        effects: { paralyze: 1, staggerBonus: 15 }
      },
      {
        id: 'yh_s3',
        name: '『???』 (신체붕괴 손날)',
        sin: 'lust',
        type: 'slash',
        base: 6,
        coinBonus: 5,
        coins: 3,
        quote: '수학은 물리의 도구.',
        desc: '정체를 알 수 없는 기술. 공격이 적중한 상대의 신체가 붕괴되는 것이 확인되었다. 지원쌤의 숙청 때 사용되었다.',
        effects: { bleed: 6, debuffVuln: 2 }
      },
      {
        id: 'yh_ego',
        name: '[E.G.O] 『숙청의 손날: 심장 관통』',
        sin: 'gloom',
        type: 'pierce',
        base: 10,
        coinBonus: 6,
        coins: 2,
        isEgo: true,
        egoCost: 3,
        quote: '오, 벌써 오셨군요. 수학은 과학의 도구입니다.',
        desc: '대상의 방어를 씹고 심장을 관통하여 막대한 출혈과 신체 소멸 피해를 가한다.',
        effects: { bleed: 10, spDrain: 25, staggerBonus: 25 }
      }
    ]
  },

  {
    id: 'jiwon',
    name: '지원쌤',
    title: '3번대장 · 세뇌를 푼 S펜의 검객',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 / 각성 저항군',
    appearance: '여성, 장발, 포근한 스웨터, 안경, 손에 쥔 애플펜슬과 S펜.',
    lore: '한때 용해쌤의 세뇌에 당해 양우쌤 진영 3번대장으로 있었으나 도혁쌤과의 우정의 힘으로 세뇌를 푼다. 애플펜슬 혹은 S펜을 손에 잡으면 엄청난 속도로 상대를 난도질한다.',
    hp: 230,
    speed: [6, 9],
    res: { slash: 0.7, pierce: 1.2, blunt: 1.0 },
    passive: {
      name: '우정의 세뇌 해제',
      desc: '턴 시작 시 정신력 +8 회복. 고속 상태에서 코인 위력 +1.'
    },
    skills: [
      {
        id: 'jw_s1',
        name: 'S펜 초고속 필기 참격',
        sin: 'lust',
        type: 'slash',
        base: 4,
        coinBonus: 3,
        coins: 3,
        quote: '필기 속도를 따라올 수 있겠어?',
        desc: 'S펜을 손에 쥐고 날렵하게 3연속 베어낸다.',
        effects: { bleed: 3 }
      },
      {
        id: 'jw_s2',
        name: '『이정도는 할 수 있는 거 아니야?』',
        sin: 'pride',
        type: 'slash',
        base: 5,
        coinBonus: 3,
        coins: 4,
        quote: '이정도는 할 수 있는 거 아니야?',
        desc: '빠르고 위협적인 무기술. 애플펜슬 혹은 S펜을 잡으면 엄청난 속도로 상대를 4연속 난도질한다!',
        effects: { bleed: 6, spSelf: 8 }
      },
      {
        id: 'jw_s3',
        name: '결사의 반격 (급식실의 투혼)',
        sin: 'wrath',
        type: 'pierce',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '도혁아, 이 정도는 도망갈 수 있는 거 아니야?',
        desc: '치명상 속에서도 굴하지 않고 적의 급소를 꿰뚫으며 아군 전체의 정신력을 10 회복시킨다.',
        effects: { teamSpHeal: 10, staggerBonus: 14 }
      },
      {
        id: 'jw_ego',
        name: '[E.G.O] 『애플펜슬 프로: 초음속 난무』',
        sin: 'lust',
        type: 'slash',
        base: 8,
        coinBonus: 4,
        coins: 4,
        isEgo: true,
        egoCost: 3,
        quote: '내 의지는 누구도 지배할 수 없어!',
        desc: '눈에 보이지 않는 4연속 참격 폭풍으로 적을 갈기갈기 베어 넘긴다.',
        effects: { bleed: 9, staggerBonus: 22 }
      }
    ]
  },

  {
    id: 'park_clones',
    name: '복제 박형도 군단',
    title: '하이브 마인드 · 지수적 증식 군단',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 (군단)',
    appearance: '여러 명 몰려다님, 남성, 조끼, 박보검 헤어스타일. 하이브 마인드 통신 공유.',
    lore: '강력한 신체능력과 머릿수로 적을 밀어붙이는 복제인간 군단. 지수적으로 급격하게 증가하며 하이브 마인드로 기억과 의식을 공유한다. 단, 와이파이가 끊어지면 단말들이 정지하기 때문에 4층 면학실에서 패배한 적이 있다. 본체 박형도는 주숙쌤을 미분했다.',
    hp: 250,
    speed: [4, 7],
    res: { slash: 1.0, pierce: 1.0, blunt: 0.8 },
    passive: {
      name: '하이브 마인드 & 4층 면학실 와이파이 약점',
      desc: '매 턴 개체 수가 지수적으로 증식해 체력을 10 회복하지만, 마비/침묵(와이파이 차단) 부여 시 즉시 흐트러짐 피해를 크게 입는다.'
    },
    skills: [
      {
        id: 'pk_s1',
        name: '군단 물량 밀어붙이기',
        sin: 'gluttony',
        type: 'blunt',
        base: 3,
        coinBonus: 3,
        coins: 3,
        quote: '기억과 의식을 동기화한다.',
        desc: '수십 명의 복제 박형도가 층층이 쌓여 대상을 짓누른다.',
        effects: { staggerBonus: 9 }
      },
      {
        id: 'pk_s2',
        name: '지수적 증식 (2ⁿ 하이브 학습)',
        sin: 'envy',
        type: 'blunt',
        base: 4,
        coinBonus: 3,
        coins: 4,
        quote: '한 개체가 학습한 것은 모든 개체가 사용한다!',
        desc: '4연속 군단 타격을 가하며 자신의 체력을 18 회복한다.',
        effects: { selfHeal: 18 }
      },
      {
        id: 'pk_s3',
        name: '본체 박형도: 『미분하기 (d/dx)』',
        sin: 'gloom',
        type: 'slash',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '존재 함수를 미분하여 차원을 깎아낸다.',
        desc: '주숙쌤에게 치명상을 입힌 본체 박형도의 미분 참격. 대상에게 출혈 6과 취약 2를 부여한다.',
        effects: { bleed: 6, debuffVuln: 2 }
      },
      {
        id: 'pk_ego',
        name: '[E.G.O] 『무한 증식: 풀 와이파이 동기화』',
        sin: 'gluttony',
        type: 'blunt',
        base: 9,
        coinBonus: 4,
        coins: 4,
        isEgo: true,
        egoCost: 3,
        quote: '진로실과 하늘까지 박형도로 가득 채운다!',
        desc: '진로실에서 김종삼과 이대석을 덮쳤던 끝없는 박형도 군단 웨이브.',
        effects: { selfHeal: 30, staggerBonus: 24 }
      }
    ]
  },

  {
    id: 'seojangwon',
    name: '서장원(들)',
    title: '베르(학교 고양이)의 인격이 주입된 야수',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 (1시면학 스폰)',
    appearance: '남성, 안경, 키 큰 편. 베르(학교 고양이)의 인격을 따라 네 발로 기어다닌다.',
    lore: '베르(학교 고양이)의 인격이 주입된 복제 서장원 무리. 베르의 집에서 1시 면학이 끝날 때마다 스폰된다. 언어능력이 없는 대신 반사신경과 공격력을 극대화했다.',
    hp: 215,
    speed: [6, 10],
    res: { slash: 0.8, pierce: 1.1, blunt: 1.1 },
    passive: {
      name: '1시 면학 종료 스폰 (베르의 집)',
      desc: '언어능력이 없는 대신 속도가 극대화되어 항상 높은 속도 주사위를 굴린다.'
    },
    skills: [
      {
        id: 'sj_s1',
        name: '네 발 기어 도약 할퀴기',
        sin: 'lust',
        type: 'slash',
        base: 4,
        coinBonus: 3,
        coins: 3,
        quote: '렛서... 냐아앙!',
        desc: '네 발로 빠르게 기어 접근해 날카롭게 3회 할퀸다.',
        effects: { bleed: 4 }
      },
      {
        id: 'sj_s2',
        name: '『렛서~ 렛서렛서~』',
        sin: 'wrath',
        type: 'slash',
        base: 5,
        coinBonus: 3,
        coins: 4,
        quote: '렛서~ 렛서렛서~!!',
        desc: '언어능력이 없는 대신 반사신경과 공격력을 극대화한 야성적인 파이팅으로 적을 찢어발긴다!',
        effects: { bleed: 7, staggerBonus: 12 }
      },
      {
        id: 'sj_s3',
        name: '베르의 야성 본능 폭주',
        sin: 'gluttony',
        type: 'pierce',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '캬아아아앙—!! (렛서!)',
        desc: '급소를 물어뜯어 출혈을 터뜨리고 자신의 체력을 15 회복한다.',
        effects: { bleed: 5, selfHeal: 15 }
      },
      {
        id: 'sj_ego',
        name: '[E.G.O] 『심야 1시 면학: 무한 베르 스폰』',
        sin: 'lust',
        type: 'slash',
        base: 9,
        coinBonus: 4,
        coins: 4,
        isEgo: true,
        egoCost: 2,
        quote: '렛서~ 렛서렛서~ 렛서렛서~!!!',
        desc: '베르의 집에서 쏟아져 나온 서장원 무리가 초고속 난무를 퍼붓는다.',
        effects: { bleed: 10, staggerBonus: 20 }
      }
    ]
  },

  {
    id: 'einstein',
    name: '아인슈타인',
    title: '전대 사감 실종사건의 암살자',
    faction: 'yangwoo',
    factionLabel: '양우쌤 진영 (기숙사 암살자)',
    appearance: '살찜, 덩치 큼, 남성, 새하얀 폭탄머리. 무기인 사시미 칼 소지.',
    lore: '전대 사감의 전대미문의 실종사건과 함께 등장한 의문의 인물. 당당한 풍채와 새하얀 머리카락이 특징이며 그 정체는 양우쌤이 보낸 암살자. 단, 기숙사에 소속되어 있어 상대가 『야!』를 쓰면 자기 자신도 멈추는 치명적 역설을 지녔다.',
    hp: 295,
    speed: [3, 7],
    res: { slash: 0.9, pierce: 0.9, blunt: 0.8 },
    passive: {
      name: '기숙사의 법칙 (『야!』 역설)',
      desc: '묵직한 풍채로 받는 피해 -15%. 단, 적(노현우 등)이 『야!』 스킬을 사용하면 기숙사에 소속된 아인슈타인 역시 즉시 정지(흐트러짐)한다!'
    },
    skills: [
      {
        id: 'ein_s1',
        name: '『민들레 홀씨』',
        sin: 'sloth',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '졸립냐? 적응이 안되네 진짜.',
        desc: '자신의 새하얀 머리카락을 분해해 날려 보낸다. 각각의 씨앗에서 분신이 생성되어 공격 및 자가 보호막을 형성한다.',
        effects: { selfHeal: 16, staggerBonus: 8 }
      },
      {
        id: 'ein_s2',
        name: '『야!』 (기숙사 포효)',
        sin: 'wrath',
        type: 'blunt',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '야!! 적응이 안되네 진짜!',
        desc: '포효를 내지른다. 기숙사에 한 번이라도 출입했다면 잠시 동안 몸을 움직일 수 없다! (마비 2 & 정신력 피해)',
        effects: { paralyze: 2, spDrain: 14, staggerBonus: 18 }
      },
      {
        id: 'ein_s3',
        name: '『조용히 하면 금방 끝나』',
        sin: 'lust',
        type: 'slash',
        base: 6,
        coinBonus: 5,
        coins: 3,
        quote: '조용히 하면 금방 끝나...',
        desc: '무기인 사시미 칼로 상대의 급소를 공격한다. 기술에 당한 자는 비명도 지르지 못했다고 한다.',
        effects: { bleed: 8, debuffVuln: 2 }
      },
      {
        id: 'ein_ego',
        name: '[E.G.O] 『심야 점호: 사시미 극살』',
        sin: 'lust',
        type: 'slash',
        base: 11,
        coinBonus: 6,
        coins: 2,
        isEgo: true,
        egoCost: 3,
        quote: '졸립냐? 영원히 재워주마.',
        desc: '민들레 홀씨 분신들이 대상을 포위한 뒤 사시미 칼로 치명적인 일격을 가한다.',
        effects: { bleed: 12, staggerBonus: 30 }
      }
    ]
  },

  // ========================================================================
  // [2] 창진쌤 진영 (저항군 & 학생 & 조력자)
  // ========================================================================
  {
    id: 'changjin',
    name: '창진쌤 (김창진)',
    title: '저항군 총사령관 · 과구리 대포의 정점',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (저항군 리더)',
    appearance: '중년 남성, 정장, 안경, 약간 파마한 머리. 양 손으로 날리는 정권지르기 『대포』.',
    lore: '양우쌤의 후계자였으나 양우쌤의 독재에 반발해 반기를 들고 저항군을 조직했다. 양우쌤의 『다들 손 떼!』 속에서도 아랑곳하지 않고 걸어 나가며, 1부터 999까지 합산 499,500발을 날리는 『리미터 해제-대포 999』로 창의관에 핵폭발을 일으킨다.',
    hp: 310,
    speed: [5, 8],
    res: { slash: 1.0, pierce: 0.9, blunt: 0.7 },
    passive: {
      name: '저항군의 기둥 & 대포 예열',
      desc: '『다들 손 떼!』의 정지 효과를 저항하며, 대포 계열 스킬 사용 시 과구리 카운트가 상승해 위력이 증가한다.'
    },
    skills: [
      {
        id: 'cj_s1',
        name: '『대포』',
        sin: 'wrath',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '대포, 뽑겠습니다. 대포, 쏘겠습니다!',
        desc: '양 손으로 날리는 정권지르기. 묵직한 충격파로 적을 날려버린다.',
        effects: { staggerBonus: 10, sfx: 'cannon' }
      },
      {
        id: 'cj_s2',
        name: '『윌렘 대포』',
        sin: 'gloom',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '윌렘 대포는 미국의 배우, 성우이다. 본명은 윌리엄 제임스 대포이다.',
        desc: '《플래툰》,《스파이더맨》에 출연한 윌렘 대포 지식으로 아군 정신력을 +12 회복하고 적을 혼란에 빠뜨린다.',
        effects: { teamSpHeal: 12, spDrain: 10 }
      },
      {
        id: 'cj_s3',
        name: '『최고출력 - 대포 21』',
        sin: 'wrath',
        type: 'blunt',
        base: 6,
        coinBonus: 4,
        coins: 4,
        quote: '지난 시간에 몇 명까지 했지? 최대 출력—『대포: 21』!!!',
        desc: '과구리 숫자 [1 ~ 21] 입력! 한 번에 쏠 수 있는 최대 횟수로 난사하여 벽과 유리창을 전부 박살낸다!',
        effects: { cutscene: 'cannon21', staggerBonus: 22, debuffVuln: 2, sfx: 'cannon' }
      },
      {
        id: 'cj_ego',
        name: '[E.G.O] 『리미터 해제 - 대포 999』',
        sin: 'wrath',
        type: 'blunt',
        base: 14,
        coinBonus: 6,
        coins: 3,
        isEgo: true,
        egoCost: 4,
        quote: '...『리미터 해제-대포 999』. 대포, 쏘겠습니다!!',
        desc: '과구리 최대 횟수 [1 ~ 999] 발사! 499,500발의 대포가 적중하며 핵폭발을 일으킨다. (반동으로 자신의 체력 15% 소모)',
        effects: { cutscene: 'cannon999', staggerBonus: 55, burn: 10, selfRecoilPct: 0.15, sfx: 'cannon' }
      }
    ]
  },

  {
    id: 'jongsam',
    name: '김종삼',
    title: '선대 지배자 · 외고 근본의 4글자 대마법사',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (송죽관 1층 구 지배자)',
    appearance: '안경, 사각턱, 노년의 남성. 양우쌤에게 한쪽 팔을 잃었으며 거대한 빛의 날개를 펼침.',
    lore: '양우쌤 이전에 학교를 지배(종삼 1년)했으나 양우쌤과 성제록의 반란으로 한쪽 팔이 잘리고 송죽관 1층에서 복수를 고대한다. 과학고의 [이론]이 아닌 외고의 [언어(알파벳 네 글자)]를 기반으로 한 마법 『WING』과 『BEST』를 구사한다.',
    hp: 285,
    speed: [4, 7],
    res: { slash: 1.0, pierce: 0.8, blunt: 1.0 },
    passive: {
      name: '언어(4글자 알파벳)의 마법 & 대석과의 라이벌리',
      desc: '매년 알파벳 네 글자 마법이 하나씩 늘어난다. 과학과 무관한 [언어] 속성 공격으로 적의 물리 내성을 무시한다.'
    },
    skills: [
      {
        id: 'js_s1',
        name: '송죽관 1층의 감시안',
        sin: 'gloom',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '다시 권력을 잡게 될 날을 고대하고 있다...',
        desc: '창의관을 노려보며 마력을 응집해 투사한다. 자신의 정신력 +10.',
        effects: { spSelf: 10 }
      },
      {
        id: 'js_s2',
        name: '제1마법: 『WING』 (300m 날개)',
        sin: 'pride',
        type: 'slash',
        base: 6,
        coinBonus: 4,
        coins: 3,
        quote: '34기를 통제하기 위해 『WING』을 만들었다!',
        desc: '길이 300m의 큰 날개로 날갯짓을 한다. 반경 5km의 모든 것이 파괴되는 충격파.',
        effects: { staggerBonus: 18, debuffVuln: 1 }
      },
      {
        id: 'js_s3',
        name: '전남외고식 4글자 영창',
        sin: 'gloom',
        type: 'pierce',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '알파벳 네 글자에는 모두 뜻이 담겨 있어야 한다.',
        desc: '과학 이론으로는 해석할 수 없는 언어 마법으로 대상의 정신력을 16 파괴한다.',
        effects: { spDrain: 16, paralyze: 1 }
      },
      {
        id: 'js_ego',
        name: '[E.G.O] 제2마법 완성: 『B E S T (정점)』',
        sin: 'pride',
        type: 'pierce',
        base: 13,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '영원히 전남과학고 학생들을 통제할 시스템— B E S T [정 점]!!',
        desc: '금빛의 날개—빛으로 된 날개—가 생겨나며 눈이 멀 듯 눈부신 빛이 사방에 쏟아진다!',
        effects: { cutscene: 'best_wing', paralyze: 2, spDrain: 20, staggerBonus: 35, sfx: 'laser' }
      }
    ]
  },

  {
    id: 'minji',
    name: '조민지',
    title: '20시 이후 실종된 그림자 · 『산혼철조』',
    faction: 'changjin',
    factionLabel: '미스터리 실종자 (사물함의 BEST)',
    appearance: '실루엣 처리된 여성, 휘날리는 장발, 어둠 속에서 번뜩이는 붉은 손톱.',
    lore: '『BEST』에 대해 조사하다가 20시가 지나도 돌아오지 않고 사물함에 『BEST』라는 단어 하나만 남긴 채 실종된 인물. 김종삼은 전남외고 스파이라 퇴학당했다고 둘러댔다. 기술로는 『산혼철조』가 있다.',
    hp: 220,
    speed: [6, 9],
    res: { slash: 0.7, pierce: 0.9, blunt: 1.2 },
    passive: {
      name: '사물함에 남겨진 단어 『BEST』',
      desc: '실루엣 은신으로 첫 합에서 코인 위력 +1. 참격 적중 시 깊은 출혈을 남긴다.'
    },
    skills: [
      {
        id: 'mj_s1',
        name: '20시의 그림자 기습',
        sin: 'envy',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '사물함에 남겨진 단 하나의 진실...',
        desc: '어둠 속에서 소리 없이 다가가 적의 배후를 찌른다.',
        effects: { bleed: 4, debuffVuln: 1 }
      },
      {
        id: 'mj_s2',
        name: '『산혼철조 (散魂鐵爪)』',
        sin: 'lust',
        type: 'slash',
        base: 5,
        coinBonus: 4,
        coins: 3,
        quote: '산혼— 철조(散魂鐵爪)!!',
        desc: '영혼까지 흩어놓는 날카로운 손톱으로 대상을 3연속 베어 가른다!',
        effects: { bleed: 8, staggerBonus: 14 }
      },
      {
        id: 'mj_s3',
        name: '기밀 폭로: 종삼과 양우의 내막',
        sin: 'gloom',
        type: 'slash',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '그 시스템의 진짜 목적을 알고 있어.',
        desc: '적의 치부를 폭로하여 취약 3을 부여하고 정신력을 15 깎는다.',
        effects: { debuffVuln: 3, spDrain: 15 }
      },
      {
        id: 'mj_ego',
        name: '[E.G.O] 『진·산혼철조: 심연의 실루엣』',
        sin: 'lust',
        type: 'slash',
        base: 10,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '사라진 자의 손톱이 어둠 속에서 작렬한다!',
        desc: '칠흑의 장발 실루엣이 화면을 가르며 치명적인 출혈 참격을 퍼붓는다.',
        effects: { bleed: 12, staggerBonus: 26 }
      }
    ]
  },

  {
    id: 'hyunmin',
    name: '황현민',
    title: '추가대포 사수 · 시간 대칭성을 깨부순 자',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (주인공 / 저항군 핵심)',
    appearance: '키 큼, 마름, 남성, 청소년, 약간 파마한 머리. 손에 든 하이탑과 켐벨 생명과학 11판.',
    lore: '창진쌤의 곁을 지키며 양우쌤의 등 뒤에서 『추가대포 10』을 날려 엘레베이터에 처박고, 박정화가 봉인된 리빙박스를 투척해 케르베로스를 해방시킨 주역. 사망 후 우동집 무한 루프에서 [특급 식객] 신현승의 말씀을 재배열해 『보존돼지』의 진리를 깨닫고 탈출한다.',
    hp: 255,
    speed: [5, 9],
    res: { slash: 1.0, pierce: 1.0, blunt: 0.8 },
    passive: {
      name: '켐벨 11판 가드 & 시간 대칭성 각성',
      desc: '위기 상황에서 정신력이 떨어지지 않으며, 죽음에 이르는 피해를 1회 버텨내고(우동집 루프 각성) 체력을 회복한다!'
    },
    skills: [
      {
        id: 'hm_s1',
        name: '하이탑 & 켐벨 11판 강타',
        sin: 'sloth',
        type: 'blunt',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '벌써 코앞까지 왔습니다! 켐벨로 막아!',
        desc: '두꺼운 하이탑과 켐벨 생명과학 11판으로 적의 공격을 쳐내고 강타한다.',
        effects: { selfHeal: 12, staggerBonus: 8 }
      },
      {
        id: 'hm_s2',
        name: '『추가대포 - 대포 10』',
        sin: 'wrath',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 3,
        quote: '저 추가 대포 하겠습니다!!',
        desc: '창진쌤의 대포를 최대 10발까지 쏠 수 있다. 양우쌤의 등 뒤에 기습 등장해 엘레베이터로 날려버린다!',
        effects: { staggerBonus: 18, debuffVuln: 2, sfx: 'cannon' }
      },
      {
        id: 'hm_s3',
        name: '리빙박스 투척 (삼총사 해방)',
        sin: 'envy',
        type: 'blunt',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '창진쌤!!!! 리빙박스를 받으세요!',
        desc: '박정화가 봉인된 리빙박스를 던져 상대의 상태창에 오류를 일으키고 아군 전체 정신력을 +15 회복한다!',
        effects: { teamSpHeal: 15, paralyze: 1 }
      },
      {
        id: 'hm_ego',
        name: '[E.G.O] 『대칭성 파괴: 보 존 돼 지』',
        sin: 'gluttony',
        type: 'blunt',
        base: 11,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '잠깐... 어째서 한번이 아닌거야? ...보 존 돼 지!! 그거였군..!',
        desc: '우동집의 무한 반복(Repetition mocks symmetrically)을 깨부수고 시간 대칭성을 역전시켜 자신의 체력을 45 회복하며 일격을 날린다!',
        effects: { cutscene: 'udon_pig', selfHeal: 45, spSelf: 25, staggerBonus: 30 }
      }
    ]
  },

  {
    id: 'shelly',
    name: '셜리 (용병)',
    title: '영어 필중 영역의 전개자',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (특급 용병)',
    appearance: '흑인, 레게머리, 덩치 큼, 여성. 강렬한 포스와 영역 전개 오라.',
    lore: '저항군 진영의 거구 용병. 급식실에서 지원쌤이 소멸할 때 "Nooooooooooo"를 외치며 난입했다. 영어를 사용해 구체적인 사항은 불명인 『Domain Expansion』을 전개하며, 상대가 영어를 쓰지 않으면 필중의 공격이 작렬한다.',
    hp: 280,
    speed: [4, 8],
    res: { slash: 0.9, pierce: 0.9, blunt: 0.8 },
    passive: {
      name: 'Nooooooooo! & Jpop 동아리 발작 유도',
      desc: '영어를 사용하지 않는 적을 상대로 합 위력 +2. 아군이 피해를 입으면 분노하여 공격력이 상승한다.'
    },
    skills: [
      {
        id: 'sh_s1',
        name: '헤비 레게 임팩트',
        sin: 'wrath',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: 'Get out of my way!',
        desc: '거대한 체구에서 뿜어져 나오는 묵직한 타격.',
        effects: { staggerBonus: 12 }
      },
      {
        id: 'sh_s2',
        name: '『Nooooooooooooooo!!』',
        sin: 'gloom',
        type: 'blunt',
        base: 5,
        coinBonus: 5,
        coins: 2,
        quote: 'Nooooooooooooooooooooooooooooooooooo!!',
        desc: '급식실을 뒤흔든 비통한 포효. 아군 전체의 정신력을 +10 회복하고 적에게 취약 2를 부여한다.',
        effects: { teamSpHeal: 10, debuffVuln: 2 }
      },
      {
        id: 'sh_s3',
        name: 'English Only Strike',
        sin: 'pride',
        type: 'slash',
        base: 6,
        coinBonus: 4,
        coins: 3,
        quote: 'Speak English, or perish right here!',
        desc: '상대가 영어를 쓰지 않으면 피할 수 없는 3연속 필중 참격을 꽂아 넣는다.',
        effects: { bleed: 5, staggerBonus: 16 }
      },
      {
        id: 'sh_ego',
        name: '[E.G.O] 『Domain Expansion (영역 전개)』',
        sin: 'pride',
        type: 'slash',
        base: 12,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: 'Domain Expansion. (상대가 영어를 쓰지 않으면 필중의 공격이 작렬!)',
        desc: '영어를 사용해 영역을 전개한다! Jpop 나무 동아리 부원들은 발작하며, 모든 코인이 확정 앞면(필중)으로 작렬한다!',
        effects: { cutscene: 'domain_exp', guaranteedHeads: true, staggerBonus: 32, debuffVuln: 3 }
      }
    ]
  },

  {
    id: 'yongsun',
    name: '용선쌤',
    title: '지구과학의 철벽 · 모스 경도계의 스승',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (무투파 원로)',
    appearance: '나이듬, 풍성한 폭탄머리. 광물처럼 단단해지는 육체.',
    lore: '신체를 모스 경도계 굳기로 환산해 강화하는 강자. 현재는 최대 3까지, 전성기 때는 8.5(강옥/토파즈급)까지 가능했다. 단순하지만 막강하며 자신의 기술을 신현승에게 모두 전수했다. 급식실에서 도혁쌤을 구출해 텔레포트로 탈출시켰다.',
    hp: 300,
    speed: [3, 6],
    res: { slash: 0.7, pierce: 0.7, blunt: 0.7 },
    passive: {
      name: '모스 경도계 (단순하지만 막강하다)',
      desc: '지구과학의 이치로 육체를 경화시켜 모든 받는 피해 -20%. 방어 및 타격 합에서 압도적 유지력을 발휘한다.'
    },
    skills: [
      {
        id: 'ys_s1',
        name: '『모스 경도계: 경도 3 (방해석)』',
        sin: 'sloth',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '단순하지만 막강하다.',
        desc: '신체를 모스 경도 3으로 환산해 강화하며 타격하고 체력을 15 회복한다.',
        effects: { selfHeal: 15, staggerBonus: 10 }
      },
      {
        id: 'ys_s2',
        name: '도혁 구출 & 전술 텔레포트',
        sin: 'pride',
        type: 'blunt',
        base: 5,
        coinBonus: 5,
        coins: 2,
        quote: '도혁아, 네가 감당할 수 있는 적이 아니다! 돌아가자!',
        desc: '아군 전체의 정신력을 +12 회복하고 자신의 체력을 18 회복하며 적을 밀쳐낸다.',
        effects: { teamSpHeal: 12, selfHeal: 18 }
      },
      {
        id: 'ys_s3',
        name: '전성기 비기: 『모스 경도 8.5 (토파즈·강옥)』',
        sin: 'sloth',
        type: 'blunt',
        base: 7,
        coinBonus: 5,
        coins: 2,
        quote: '내 전성기 때의 경도 8.5를 보여주마!',
        desc: '전성기 시절의 경도 8.5 금강 불괴 주먹으로 적의 흐트러짐 선을 박살낸다.',
        effects: { staggerBonus: 25, debuffVuln: 2 }
      },
      {
        id: 'ys_ego',
        name: '[E.G.O] 『지구과학 오의: 지각 변동 경도 8.5』',
        sin: 'sloth',
        type: 'blunt',
        base: 11,
        coinBonus: 6,
        coins: 2,
        isEgo: true,
        egoCost: 3,
        quote: '모스 경도계는 두말할 것도 없이 지구과학의 정점이다!',
        desc: '대지를 융기시키는 금강석 직전의 경도 타격으로 적을 분쇄하고 아군을 수호한다.',
        effects: { selfHeal: 35, teamSpHeal: 15, staggerBonus: 32 }
      }
    ]
  },

  {
    id: 'samchongsa',
    name: '삼총사 (박정화)',
    title: '봉인된 진명 Κέρβερος · 지옥의 3두 파수견',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (R&E실 봉인 병기)',
    appearance: '중년 여성, 약간 끝 말린 헤어스타일. 해방 시 마인크래프트 위더(The Cerberus, Κέρβερος) 현현!',
    lore: '일명 삼총사 박정화(카톡명: 삼총사! 박정화 / 3 초ㅇ사 Eb ru! 바ㄱ정-). R&E실에서 용해쌤에게 삼체문제로 저항하다 리빙박스에 봉인되었으나, 최종 결전에서 황현민과 창진쌤의 주문(一二三四五六七八九十、布留部 由良由良止 布留部)으로 해방되어 양우쌤의 상태창을 깨뜨리고 덮친다!',
    hp: 290,
    speed: [4, 8],
    res: { slash: 0.9, pierce: 0.8, blunt: 0.9 },
    passive: {
      name: '진명 Κέρβερος & 위더 베리어',
      desc: '체력이 50% 이하가 되면 푸른 위더 베리어를 형성해 체력을 35 회복하고 공격 위력이 +2 증가한다!'
    },
    skills: [
      {
        id: 'sc_s1',
        name: '『삼체문제 (Three-Body Problem)』',
        sin: 'gloom',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 3,
        quote: '내가, 삼총사 박정화가... 삼체문제로 상대해주마!',
        desc: '양용해마저 고전시킨 예측 불허의 3궤도 공격.',
        effects: { spDrain: 10, staggerBonus: 10 }
      },
      {
        id: 'sc_s2',
        name: '『위더 스컬 발사 (Wither Skull)』',
        sin: 'wrath',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 3,
        quote: '검은 해골 탄환 3연사!',
        desc: '위더 스컬을 발사해 폭발 및 부식(화상/출혈) 피해를 입힌다.',
        effects: { burn: 5, bleed: 4, sfx: 'cannon' }
      },
      {
        id: 'sc_s3',
        name: '위더 베리어 전개 & 반격',
        sin: 'pride',
        type: 'blunt',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '체력이 반 이상 깎이면 베리어를 형성한다!',
        desc: '푸른 오라 베리어를 둘러 자신의 체력을 25 회복하고 적을 튕겨낸다.',
        effects: { selfHeal: 25, staggerBonus: 14 }
      },
      {
        id: 'sc_ego',
        name: '[E.G.O] 『해방: 더 케르베로스 (The Cerberus)』',
        sin: 'wrath',
        type: 'blunt',
        base: 12,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '一二三四五六七八九十、布留部 由良由良止 布留部 — 더 케르베로스 [The Cerberus]!!',
        desc: '양우쌤의 상태창이 오류를 내며 깨지고, 카톡 프사 [삼총사! 박정화]와 함께 머리가 셋 달린 지옥의 파수견(위더)이 덮친다!',
        effects: { cutscene: 'cerberus', burn: 8, paralyze: 2, staggerBonus: 36, sfx: 'cannon' }
      }
    ]
  },

  {
    id: 'donggyun',
    name: '허동균',
    title: '원조 1,000km 신축 거인',
    faction: 'changjin',
    factionLabel: '학생 진영 (원조 장팔 능력자)',
    appearance: '키가 매우 큼. 양 팔을 자유자재로 구부리고 늘리는 학생.',
    lore: '양 팔을 자유자재로 늘리는 고유 능력을 가지고 있었으나 성제록에게 패배하고 팔을 강탈당했다. 전투에서는 빼앗긴 팔의 원조 주인으로서 초장거리 타격을 선보인다.',
    hp: 235,
    speed: [4, 8],
    res: { slash: 1.1, pierce: 0.9, blunt: 0.8 },
    passive: {
      name: '원조 신축의 달인',
      desc: '타격 스킬의 기본 위력 +1. 제록쌤을 상대로 분노하여 추가 피해를 입힌다.'
    },
    skills: [
      {
        id: 'dg_s1',
        name: '장신 선제 롱리치 잽',
        sin: 'sloth',
        type: 'blunt',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '내 팔의 진짜 사용법을 보여주지!',
        desc: '큰 키와 늘어나는 팔을 이용해 멀리서 타격한다.',
        effects: { staggerBonus: 10 }
      },
      {
        id: 'dg_s2',
        name: '자유자재 굴절 스매시',
        sin: 'wrath',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 3,
        quote: '사각지대 따윈 없다!',
        desc: '팔을 자유자재로 구부려 상대의 방어 뒤통수를 3연속 가격한다.',
        effects: { debuffVuln: 2, staggerBonus: 14 }
      },
      {
        id: 'dg_s3',
        name: '원조 『팔』: 1,000km 풀스윙',
        sin: 'pride',
        type: 'blunt',
        base: 7,
        coinBonus: 5,
        coins: 2,
        quote: '그 팔은 원래 내 것이었다!!',
        desc: '원조의 숙련도로 팔을 극한까지 늘려 회전 타격을 가한다.',
        effects: { staggerBonus: 22 }
      },
      {
        id: 'dg_ego',
        name: '[E.G.O] 『초장거리 1,000km 기간트 휩』',
        sin: 'wrath',
        type: 'blunt',
        base: 10,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 2,
        quote: '지평선 너머까지 뻗어라!!',
        desc: '운동장을 일주할 만큼 늘어난 양 팔로 적을 난타한다.',
        effects: { staggerBonus: 28, debuffVuln: 2 }
      }
    ]
  },

  {
    id: 'hyunseung',
    name: '신현승',
    title: '[특급 식객] "고독한 대식가" · 모스 경도 23의 신격',
    faction: 'changjin',
    factionLabel: '초월 신격 / 우동집의 지배자',
    appearance: '뚱뚱, 안경, 바가지머리. 우동 두 개와 새우튀김 30개, 그리고 본모습인 붉은 털실 뭉치.',
    lore: '용선쌤과의 수련으로 『모스 경도계 23』에 도달한 초월자(10을 넘어가면 해제 후 돌이 되는 부작용이 있음). 동시에 우동집에서 면발 1부터 면발 2026, 그리고 황현민까지 위장에 투입하며 시간 대칭성과 『에너지는보존돼지(E=보존 pig)』의 섭리를 주관하는 신격 존재.',
    hp: 360,
    speed: [4, 7],
    res: { slash: 0.6, pierce: 0.6, blunt: 0.6 },
    passive: {
      name: '[특급 식객] 존재의 부정 & 모스 경도 23',
      desc: '신격의 경도 23으로 받는 피해 -30%. 매 턴 우동과 새우튀김을 섭취하며 체력을 15 회복한다.'
    },
    skills: [
      {
        id: 'hs_s1',
        name: '『모스 경도계 23』 (초월 경화)',
        sin: 'sloth',
        type: 'blunt',
        base: 6,
        coinBonus: 4,
        coins: 2,
        quote: '너 내가 운동 많이 했을 때 모르지?',
        desc: '용선쌤과의 수련으로 도달한 경도 23의 육탄 타격! (해제 후 돌이 되는 부작용 대신 압도적 위력 발휘)',
        effects: { staggerBonus: 18, selfHeal: 12 }
      },
      {
        id: 'hs_s2',
        name: '우동 두 개와 새우튀김 30개 추가',
        sin: 'gluttony',
        type: 'blunt',
        base: 5,
        coinBonus: 5,
        coins: 2,
        quote: '이모 여기 우동 하나, 아니 두 개로 하지.... 이모, 여기 새우튀김 30개 추가!',
        desc: '눈앞의 우동이 더 이상 존재하기를 허가받지 않았다는 듯이 사라진다. 자신의 체력 35 회복 및 정신력 +15!',
        effects: { selfHeal: 35, spSelf: 15 }
      },
      {
        id: 'hs_s3',
        name: '면발 2026의 위장 투입 (존재 거부)',
        sin: 'gluttony',
        type: 'pierce',
        base: 7,
        coinBonus: 4,
        coins: 3,
        quote: '후루룩! 면발 2026의 죽음에 슬퍼할 겨를도 없이 위장에 투입된 건—',
        desc: '부정과 거부. 신현승은 대상의 존재를 허용하지 않는다. 대상의 정신력을 20 소멸시킨다.',
        effects: { spDrain: 20, debuffVuln: 2, staggerBonus: 20 }
      },
      {
        id: 'hs_ego',
        name: '[E.G.O] 『신의 말씀: 에너지는보존돼지 (E=보존 pig)』',
        sin: 'gluttony',
        type: 'blunt',
        base: 13,
        coinBonus: 6,
        coins: 3,
        isEgo: true,
        egoCost: 4,
        quote: '에너지는보존돼지(E=보존 pig),,, 에너지의 보존은 시간 대칭성 원리로 아름답게 설명된다네.',
        desc: '우동집 신현승의 본모습(붉은 털실)과 시간 대칭성의 조롱이 현현하여 적을 무한 루프에 가두고 파멸시킨다!',
        effects: { cutscene: 'udon_pig', paralyze: 3, spDrain: 25, staggerBonus: 45 }
      }
    ]
  },

  {
    id: 'hyunwoo',
    name: '노현우',
    title: '성대모사 카피의 천재 · 최종결전의 조커',
    faction: 'changjin',
    factionLabel: '창진쌤 진영 (성대모사 카피 능력자)',
    appearance: '살짝 각진 체형, 뿔테안경. 성대모사 마이크 파동과 오카피 백과사전.',
    lore: '선생님들의 능력을 성대모사로 완벽하게 카피하는 학생. 아인슈타인의 『야!』, 창진쌤의 『대포』, 도혁쌤의 『야이씨』를 전부 구사한다. 최종 결전에서 쓰러진 채로 눈을 떠 아인슈타인 성대모사 『야!』로 양우쌤의 텔레포트를 저지하고 『대포 999』 적중을 만들어냈다!',
    hp: 245,
    speed: [5, 8],
    res: { slash: 0.9, pierce: 0.9, blunt: 1.0 },
    passive: {
      name: '완벽한 성대모사 카피 & 생전의 이해도',
      desc: '기숙사에 출입한 적(양우쌤, 아인슈타인 등)에게 『카피: 야!』 적중 시 즉시 큰 흐트러짐 피해를 입힌다.'
    },
    skills: [
      {
        id: 'hw_s1',
        name: '『오카피 (Okapi)』',
        sin: 'sloth',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '오카피는 기린과에 속하는 포유류이다. 긴 혀로 나뭇잎을 먹는다.',
        desc: '갑작스러운 오카피 생태 설명으로 적의 정신력을 10 깎고 자신의 정신력을 +12 회복한다.',
        effects: { spSelf: 12, spDrain: 10 }
      },
      {
        id: 'hw_s2',
        name: '『카피: 대포』 (창진쌤 성대모사)',
        sin: 'envy',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 3,
        quote: '(창진쌤 목소리로) "대포, 쏘겠습니다!"',
        desc: '생전(생명과학 전공)이라 창진쌤의 대포를 완벽하게 카피할 수 있었다!',
        effects: { staggerBonus: 16, sfx: 'cannon' }
      },
      {
        id: 'hw_s3',
        name: '『카피: 야!』 (아인슈타인 성대모사)',
        sin: 'envy',
        type: 'blunt',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '(아인슈타인 목소리로) "『야!』"',
        desc: '기숙사에 소속된 아인슈타인과 양우쌤의 텔레포트를 정지시킨 결정적 한 방! (마비 2 & 흐트러짐 25)',
        effects: { paralyze: 2, staggerBonus: 25 }
      },
      {
        id: 'hw_ego',
        name: '[E.G.O] 『전력 카피: 야이씨 (도혁쌤 해방)』',
        sin: 'envy',
        type: 'blunt',
        base: 11,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '(도혁쌤 목소리로) "야이씨, 이거 놓으란 말입니다!!"',
        desc: '가장 오래, 가장 많이 해온 카피! 전력을 발동해 도혁쌤의 모스 경도 10과 민기쌤에게 단련받은 모든 무투를 쏟아낸다!',
        effects: { staggerBonus: 32, debuffVuln: 2, selfHeal: 20 }
      }
    ]
  },

  // ========================================================================
  // [3] 기타 / 비밀병기 / 은둔 강자 진영
  // ========================================================================
  {
    id: 'seungdae',
    name: '승대쌤 (비밀병기)',
    title: '학교의 최종 비밀병기 · 불가항력의 수면가',
    faction: 'special',
    factionLabel: '비밀병기 / 중립 강자',
    appearance: '중년 남성. 온화하고 나른한 아우라와 함께 전장을 재우는 파동.',
    lore: '학교의 비밀병기. 기술 『자아, (중략)』은 일정 범위 내 지정한 모든 대상을 잠들게 한다. 딴짓을 하면 저항이 가능하나 전투에 집중하지 못해 패배하게 된다. 원래 기술명은 더 길지만 다들 잠들어서 아무도 모른다.',
    hp: 265,
    speed: [3, 7],
    res: { slash: 0.9, pierce: 0.9, blunt: 0.9 },
    passive: {
      name: '다들 잠들어서 모르는 진명',
      desc: '적중 시 대상에게 수면/집중력 저하(마비 및 정신력 감소)를 부여하여 합 위력을 무력화한다.'
    },
    skills: [
      {
        id: 'sd_s1',
        name: '나른한 도입부 강의',
        sin: 'sloth',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '자아, 오늘 진도는 여기부터인데...',
        desc: '나른한 목소리로 대상의 정신력을 12 낮추고 마비 1을 부여한다.',
        effects: { spDrain: 12, paralyze: 1 }
      },
      {
        id: 'sd_s2',
        name: '딴짓 유발 (전투 집중력 해체)',
        sin: 'gloom',
        type: 'blunt',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '잠들지 않으려고 딴짓을 하면 전투에 집중할 수 없지.',
        desc: '상대가 수면에 저항하느라 딴짓을 하게 만들어 취약 3과 흐트러짐 손상 16을 입힌다.',
        effects: { debuffVuln: 3, staggerBonus: 16 }
      },
      {
        id: 'sd_s3',
        name: '『자아, (중략)』',
        sin: 'sloth',
        type: 'blunt',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '자아, 여러분... (이하 다들 잠들어서 생략)',
        desc: '일정 범위 내 대상을 깊은 잠(마비 2 & 흐트러짐 손상 24)에 빠뜨린다!',
        effects: { paralyze: 2, spDrain: 18, staggerBonus: 24 }
      },
      {
        id: 'sd_ego',
        name: '[E.G.O] 『비밀병기 개방: 자아, (전원 숙면)』',
        sin: 'sloth',
        type: 'blunt',
        base: 11,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '자아......................... Zzzzz...',
        desc: '아무도 끝까지 들어본 적 없는 전설의 풀네임 기술. 대상을 즉시 수면 및 흐트러짐 상태로 몰아넣는다!',
        effects: { paralyze: 3, spDrain: 25, staggerBonus: 40 }
      }
    ]
  },

  {
    id: 'jusook',
    name: '주숙쌤',
    title: '진실을 전하는 선대의 실루엣',
    faction: 'special',
    factionLabel: '선대 계승자 (화실의 진실)',
    appearance: '신비로운 실루엣 처리. 생명유지 파동과 미분된 육체를 역전하는 빛.',
    lore: '제록쌤이 원래 뒤를 이을 운명이었던 인물. 아인슈타인의 기습에 당해 빈사 상태에 빠졌으며, 제록쌤에게 양우쌤의 숙주 음모를 알리려 했으나 본체 박형도에게 미분당하고 화실 붕괴 때 동백관 뒤 주차장으로 떨어졌다.',
    hp: 240,
    speed: [4, 8],
    res: { slash: 0.8, pierce: 0.8, blunt: 1.1 },
    passive: {
      name: '제록에게 전하는 진실 & 적분 수호',
      desc: '매 턴 아군 전체의 정신력을 +5 회복시키며, 아군의 손실된 체력을 복구한다.'
    },
    skills: [
      {
        id: 'jsk_s1',
        name: '화실 병상의 경종',
        sin: 'gloom',
        type: 'pierce',
        base: 4,
        coinBonus: 4,
        coins: 2,
        quote: '제록아... 양우의 농간에 속지 마라...',
        desc: '진실의 파동으로 적의 정신력을 12 깎고 아군 정신력을 +10 회복한다.',
        effects: { teamSpHeal: 10, spDrain: 12 }
      },
      {
        id: 'jsk_s2',
        name: '역미분: 『부정적분 복원 (∫f(x)dx)』',
        sin: 'gluttony',
        type: 'slash',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '박형도에게 미분당한 존재를 다시 적분한다!',
        desc: '자신과 아군의 체력을 회복(+22)하며 적을 베어낸다.',
        effects: { selfHeal: 22, teamSpHeal: 8 }
      },
      {
        id: 'jsk_s3',
        name: '선대 후계자의 심판',
        sin: 'pride',
        type: 'pierce',
        base: 6,
        coinBonus: 5,
        coins: 2,
        quote: '학교의 진정한 계보는 조작될 수 없다!',
        desc: '강력한 빛의 관통격으로 대상에게 취약 2와 흐트러짐 손상 18을 입힌다.',
        effects: { debuffVuln: 2, staggerBonus: 18 }
      },
      {
        id: 'jsk_ego',
        name: '[E.G.O] 『화실의 유언: 숙주 해방의 빛』',
        sin: 'gloom',
        type: 'pierce',
        base: 10,
        coinBonus: 5,
        coins: 3,
        isEgo: true,
        egoCost: 3,
        quote: '진실을 깨닫고 사슬을 끊어라!',
        desc: '적의 세뇌와 거짓 규격을 분쇄하며 아군 전체의 정신력을 +25 회복시킨다!',
        effects: { teamSpHeal: 25, selfHeal: 30, staggerBonus: 26 }
      }
    ]
  },

  {
    id: 'mingi',
    name: '민기쌤',
    title: '일선에 나서지 않는 초월 강자 · [규칙]의 해석자',
    faction: 'special',
    factionLabel: '초월 은둔 강자 (도혁의 스승)',
    appearance: '남성, 젊음, 검은 바람막이. 눈으로 쫓을 수 없는 초고속 움직임.',
    lore: '일선에 나서지 않는 정체를 알 수 없는 강자. 도혁쌤을 단련시켜 모스 경도계 10에 도달하게 했으며 수많은 대련으로 전투 기술을 완성시켰다. 과학고의 [이론]과 외고의 [언어]라는 힘의 원천 [규칙]을 완벽히 통찰하고 있다.',
    hp: 330,
    speed: [7, 11],
    res: { slash: 0.7, pierce: 0.7, blunt: 0.8 },
    passive: {
      name: '모든 힘의 원천은 [규칙] & 도움핑!',
      desc: '세계관 최고 수준의 속도(7~11)를 지니며, 모든 공격이 적의 내성을 최소 약점(1.2x) 이상으로 관통한다.'
    },
    skills: [
      {
        id: 'mg_s1',
        name: '『도움핑!』',
        sin: 'pride',
        type: 'pierce',
        base: 5,
        coinBonus: 4,
        coins: 2,
        quote: '도움핑!',
        desc: '경쾌한 외침과 함께 초고속 카운터를 날리고 아군 전체의 정신력을 +15 끌어올린다!',
        effects: { teamSpHeal: 15, spSelf: 10 }
      },
      {
        id: 'mg_s2',
        name: '[규칙]과 [이론]의 본질 분석',
        sin: 'gloom',
        type: 'slash',
        base: 6,
        coinBonus: 4,
        coins: 3,
        quote: '모든 힘의 원천은 [규칙]이라고 할 수 있겠죠. 그렇게 볼 수 있겠죠?',
        desc: '과학고의 [이론]과 외고의 [언어]를 완벽히 파훼하여 적에게 취약 3을 부여한다.',
        effects: { debuffVuln: 3, staggerBonus: 16 }
      },
      {
        id: 'mg_s3',
        name: '『???』 (불가시의 초고속 난사)',
        sin: 'wrath',
        type: 'slash',
        base: 6,
        coinBonus: 3,
        coins: 4,
        quote: '눈으로는 쫓을 수 없는 속도의 공격을 난사한다!',
        desc: '김도혁을 모스 경도계 10까지 단련시킬 때 사용했던 초고속 4연속 난타!',
        effects: { bleed: 6, staggerBonus: 22 }
      },
      {
        id: 'mg_ego',
        name: '[E.G.O] 『여기까지만 하도록 하겠습니다』',
        sin: 'pride',
        type: 'slash',
        base: 13,
        coinBonus: 5,
        coins: 4,
        isEgo: true,
        egoCost: 4,
        quote: '여기서 더 공격하면 죽을 것 같으니까, 여기까지만 하도록 하겠습니다.',
        desc: '순식간에 수십 번의 불가시 참격을 꽂아 넣어 대상을 완전 흐트러짐 및 빈사 직전까지 몰아넣고 여유롭게 멈춘다!',
        effects: { bleed: 10, debuffVuln: 3, staggerBonus: 50 }
      }
    ]
  }
];

// ==========================================================================
// 림버스 컴퍼니 정규 메커니즘 확장 스펙 매핑
// (수비 스킬[방어/회피/반격], 공격/방어 레벨, 3단계 흐트러짐선, 죄악 내성,
//  공명/보유 조건 패시브 & 서포트 패시브, 위력/횟수 상태이상 7종, E.G.O 침식 마이너스 코인)
// ==========================================================================
const LIMBUS_STAT_SPECS = {
  yangwoo: {
    offenseLevel: 48,
    defenseLevel: 47,
    staggerThresholds: [0.65, 0.35, 0.15],
    defenseSkill: {
      id: 'yw_def', name: '한 손 주머니 가드', defType: 'counter', sin: 'pride', type: 'blunt',
      base: 9, coinBonus: 5, coins: 2,
      quote: '한 손만 꺼내도 충분하제.',
      desc: '[반격] 피격 후 주머니에서 한 손만 꺼내 반격 타격 (적중 시 침잠 위력 4, 횟수 2 부여)',
      effects: { sinking: [4, 2], staggerBonus: 10 }
    },
    passiveReq: { sin: 'pride', count: 3, mode: 'res', bonusClash: 2, bonusDmgPct: 15 },
    supportPassive: {
      name: '예비보고서 채점 규격',
      sin: 'pride', count: 4, mode: 'owned',
      desc: '[오만 4 보유] 정신력이 가장 높은 아군 1명의 합 위력 +1, 오만 속성 피해량 +15%'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { sinking: [3, 2], fragile: 2 } },
      { offenseOffset: 4, effects: { bleed: [4, 2], poise: [3, 2], haste: 2 } },
      { offenseOffset: 5, effects: { tremor: [5, 3], tremorBurst: true, paralyze: 2, bind: 2 } },
      {
        offenseOffset: 6, egoRank: 'ALEPH', spCost: 25,
        sinCost: { pride: 3, wrath: 2, gloom: 1 },
        corrodedName: '[E.G.O 침식] 『미제출자 전원 0점 처리』',
        corrodedBase: 28, corrodedCoinBonus: -6, corrodedCoins: 3,
        effects: { bleed: [6, 3], sinking: [6, 3], tremorBurst: true }
      }
    ]
  },
  jerok: {
    offenseLevel: 46,
    defenseLevel: 44,
    staggerThresholds: [0.68, 0.38, 0.18],
    defenseSkill: {
      id: 'jr_def', name: '신축 팔 도약 회피', defType: 'evade', sin: 'envy', type: 'pierce',
      base: 4, coinBonus: 10, coins: 1,
      quote: '가로등을 잡고 물러나도록 하지.',
      desc: '[회피] 1,000km 신축 팔로 지형물을 잡고 고속 회피 (회피 성공 시 충전 횟수 +3, 정신력 +4)',
      effects: { charge: [1, 3] }
    },
    passiveReq: { sin: 'envy', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '7색 광학 조준 보조',
      sin: 'wrath', count: 3, mode: 'owned',
      desc: '[분노 3 보유] 속도가 가장 높은 아군 1명의 관통 스킬 피해량 +15%, 화상 부여량 +1'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { rupture: [3, 2], charge: [1, 4] } },
      { offenseOffset: 3, effects: { burn: [5, 3], charge: [1, 3] } },
      { offenseOffset: 4, effects: { burn: [4, 2], rupture: [4, 2], chargeSpend: 5, coinPowerCond: 2 } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { pride: 2, envy: 2, wrath: 2 },
        corrodedName: '[E.G.O 침식] 『사본 강제 덮어쓰기』',
        corrodedBase: 25, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { burn: [7, 3], rupture: [5, 3], fragile: 3 }
      }
    ]
  },
  yonghae: {
    offenseLevel: 47,
    defenseLevel: 45,
    staggerThresholds: [0.66, 0.36, 0.16],
    defenseSkill: {
      id: 'yh_def', name: '순간이동 흘리기', defType: 'evade', sin: 'gloom', type: 'slash',
      base: 5, coinBonus: 9, coins: 1,
      quote: '벌써 오셨군요.',
      desc: '[회피] 온화한 미소와 함께 순간이동으로 공격을 흘려낸다 (회피 성공 시 다음 턴 신속 2)',
      effects: { haste: 2 }
    },
    passiveReq: { sin: 'gloom', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 20 },
    supportPassive: {
      name: '심리적 빈틈 추궁',
      sin: 'gloom', count: 3, mode: 'owned',
      desc: '[우울 3 보유] 정신력이 가장 낮은 적을 공격하는 아군의 피해량 +15%, 침잠 부여 +1'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { sinking: [5, 3], paralyze: 1 } },
      { offenseOffset: 2, effects: { tremor: [4, 3], bind: 2, tremorBurst: true } },
      { offenseOffset: 4, effects: { bleed: [6, 3], rupture: [4, 2], fragile: 2 } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { gloom: 3, lust: 2, pride: 1 },
        corrodedName: '[E.G.O 침식] 『해 봤어요? 영구 봉인』',
        corrodedBase: 26, corrodedCoinBonus: -6, corrodedCoins: 2,
        effects: { bleed: [8, 3], sinking: [8, 3], bind: 3 }
      }
    ]
  },
  jiwon: {
    offenseLevel: 47,
    defenseLevel: 43,
    staggerThresholds: [0.70, 0.40, 0.20],
    defenseSkill: {
      id: 'jw_def', name: 'S펜 초고속 회피 기동', defType: 'evade', sin: 'lust', type: 'slash',
      base: 5, coinBonus: 10, coins: 1,
      quote: '이 정도는 피할 수 있는 거 아니야?',
      desc: '[회피] 날렵한 스텝으로 적의 공격을 회피하고 호흡 위력 3, 횟수 2 획득',
      effects: { poise: [3, 2], haste: 1 }
    },
    passiveReq: { sin: 'lust', count: 2, mode: 'res', bonusClash: 2, bonusDmgPct: 15 },
    supportPassive: {
      name: '초고속 필기 검술 지도',
      sin: 'lust', count: 3, mode: 'owned',
      desc: '[색욕 3 보유] 속도가 가장 빠른 아군 1명의 참격 위력 +1, 호흡 획득량 +1'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { bleed: [3, 2], poise: [3, 2], haste: 1 } },
      { offenseOffset: 3, effects: { bleed: [5, 3], poise: [4, 3], coinPowerCond: 1 } },
      { offenseOffset: 4, effects: { poise: [5, 3], rupture: [4, 2], protection: 2 } },
      {
        offenseOffset: 5, egoRank: 'HE', spCost: 18,
        sinCost: { lust: 3, pride: 2 },
        corrodedName: '[E.G.O 침식] 『세뇌 폭주: 무차별 필기 난도질』',
        corrodedBase: 24, corrodedCoinBonus: -4, corrodedCoins: 4,
        effects: { bleed: [8, 4], poise: [6, 3] }
      }
    ]
  },
  park_clones: {
    offenseLevel: 44,
    defenseLevel: 45,
    staggerThresholds: [0.65, 0.35],
    defenseSkill: {
      id: 'pk_def', name: '군단 육탄 바리케이드', defType: 'guard', sin: 'gluttony', type: 'blunt',
      base: 10, coinBonus: 6, coins: 1,
      quote: '개체수를 중첩해 방어벽을 형성한다.',
      desc: '[방어] 복제 박형도들이 겹겹이 쌓여 위력만큼 보호막 생성 및 충전 횟수 +3',
      effects: { charge: [1, 3], protection: 1 }
    },
    passiveReq: { sin: 'gluttony', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 12 },
    supportPassive: {
      name: '하이브 마인드 백업 통신',
      sin: 'envy', count: 3, mode: 'owned',
      desc: '[질투 3 보유] 체력이 가장 낮은 아군 1명이 매 턴 시작 시 체력 8 회복 및 보호 1 획득'
    },
    skillAddons: [
      { offenseOffset: 0, effects: { tremor: [3, 2], charge: [1, 3] } },
      { offenseOffset: 2, effects: { rupture: [3, 3], charge: [2, 3] } },
      { offenseOffset: 4, effects: { bleed: [6, 3], rupture: [5, 2], fragile: 2 } },
      {
        offenseOffset: 4, egoRank: 'HE', spCost: 18,
        sinCost: { gluttony: 3, envy: 2 },
        corrodedName: '[E.G.O 침식] 『와이파이 폭주: 차원 미분 군단』',
        corrodedBase: 24, corrodedCoinBonus: -4, corrodedCoins: 4,
        effects: { bleed: [7, 3], rupture: [6, 3] }
      }
    ]
  },
  seojangwon: {
    offenseLevel: 46,
    defenseLevel: 41,
    staggerThresholds: [0.72, 0.42, 0.20],
    defenseSkill: {
      id: 'sj_def', name: '베르의 야성 백스텝', defType: 'evade', sin: 'lust', type: 'slash',
      base: 6, coinBonus: 9, coins: 1,
      quote: '렛서—! (고양이 반사신경 회피)',
      desc: '[회피] 학교 고양이 베르의 반사신경으로 공격을 회피하고 신속 2, 호흡 3 획득',
      effects: { haste: 2, poise: [3, 2] }
    },
    passiveReq: { sin: 'lust', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '1시 면학의 야성 본능',
      sin: 'lust', count: 3, mode: 'owned',
      desc: '[색욕 3 보유] 속도가 가장 높은 아군 1명에게 매 턴 신속 1 및 출혈 부여량 +1'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { bleed: [4, 2], haste: 2 } },
      { offenseOffset: 3, effects: { bleed: [6, 3], rupture: [3, 2], poise: [3, 2] } },
      { offenseOffset: 4, effects: { bleed: [5, 3], poise: [4, 2] } },
      {
        offenseOffset: 5, egoRank: 'TETH', spCost: 15,
        sinCost: { lust: 3, wrath: 2 },
        corrodedName: '[E.G.O 침식] 『광란의 베르 군집 습격』',
        corrodedBase: 23, corrodedCoinBonus: -4, corrodedCoins: 4,
        effects: { bleed: [9, 4], rupture: [4, 3] }
      }
    ]
  },
  einstein: {
    offenseLevel: 46,
    defenseLevel: 48,
    staggerThresholds: [0.60, 0.30],
    defenseSkill: {
      id: 'ein_def', name: '민들레 홀씨 분신 방벽', defType: 'guard', sin: 'sloth', type: 'pierce',
      base: 11, coinBonus: 6, coins: 1,
      quote: '적응이 안되네 진짜.',
      desc: '[방어] 새하얀 머리카락 홀씨 분신으로 보호막을 두르고 보호 2 획득',
      effects: { protection: 2 }
    },
    passiveReq: { sin: 'sloth', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '사감실 암살자의 은밀한 칼날',
      sin: 'lust', count: 3, mode: 'owned',
      desc: '[색욕 3 보유] 마비 또는 속박 상태인 적을 공격할 때 아군의 피해량 +20%'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { rupture: [3, 2], protection: 2 } },
      { offenseOffset: 3, effects: { tremor: [5, 3], tremorBurst: true, paralyze: 2, bind: 2 } },
      { offenseOffset: 4, effects: { bleed: [7, 3], rupture: [4, 2], fragile: 2 } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { lust: 3, sloth: 2, wrath: 1 },
        corrodedName: '[E.G.O 침식] 『심야 점호: 전원 영구 수면』',
        corrodedBase: 26, corrodedCoinBonus: -6, corrodedCoins: 2,
        effects: { bleed: [10, 4], paralyze: 3, fragile: 3 }
      }
    ]
  },
  changjin: {
    offenseLevel: 48,
    defenseLevel: 47,
    staggerThresholds: [0.62, 0.32, 0.14],
    defenseSkill: {
      id: 'cj_def', name: '정권 맞받아치기 대포', defType: 'counter', sin: 'wrath', type: 'blunt',
      base: 9, coinBonus: 6, coins: 2,
      quote: '움직임이 멈춰도 대포는 나간다!',
      desc: '[반격] 적의 공격을 버텨낸 직후 양손 정권 대포로 강렬한 반격 (진동 폭발 및 화상 부여)',
      effects: { tremor: [5, 2], tremorBurst: true, burn: [4, 2], charge: [2, 3] }
    },
    passiveReq: { sin: 'wrath', count: 2, mode: 'res', bonusClash: 2, bonusDmgPct: 20 },
    supportPassive: {
      name: '과구리 대포 사격 통제',
      sin: 'wrath', count: 3, mode: 'owned',
      desc: '[분노 3 보유] 타격 스킬을 사용하는 아군 1명의 최종 위력 +1, 진동 및 화상 부여량 +1'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { tremor: [4, 2], charge: [1, 4], burn: [3, 2] } },
      { offenseOffset: 2, effects: { sinking: [3, 2], charge: [1, 3], protection: 2 } },
      { offenseOffset: 4, effects: { tremor: [6, 3], tremorBurst: true, burn: [5, 3], chargeSpend: 4, coinPowerCond: 2 } },
      {
        offenseOffset: 6, egoRank: 'ALEPH', spCost: 25,
        sinCost: { wrath: 4, pride: 2 },
        corrodedName: '[E.G.O 침식] 『과구리 오버플로우: 대포 499,500』',
        corrodedBase: 30, corrodedCoinBonus: -6, corrodedCoins: 3,
        effects: { burn: [10, 4], tremor: [10, 4], tremorBurst: true }
      }
    ]
  },
  jongsam: {
    offenseLevel: 47,
    defenseLevel: 45,
    staggerThresholds: [0.65, 0.35, 0.15],
    defenseSkill: {
      id: 'js_def', name: '『WING』 외날개 방벽', defType: 'guard', sin: 'pride', type: 'slash',
      base: 11, coinBonus: 6, coins: 1,
      quote: '언어의 장벽은 과학으로 뚫을 수 없다.',
      desc: '[방어] 300m 빛의 날개로 자신을 감싸 큰 보호막을 얻고 침잠 반사 태세 돌입',
      effects: { protection: 2, poise: [3, 2] }
    },
    passiveReq: { sin: 'gloom', count: 3, mode: 'owned', bonusClash: 2, bonusDmgPct: 18 },
    supportPassive: {
      name: '전남외고 4글자 마법 각인',
      sin: 'gloom', count: 4, mode: 'owned',
      desc: '[우울 4 보유] 아군 1명의 공격이 적의 물리 내성을 0.2만큼 약화시켜 적용'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { sinking: [4, 2], poise: [3, 2] } },
      { offenseOffset: 3, effects: { rupture: [5, 3], tremor: [4, 2], tremorBurst: true } },
      { offenseOffset: 4, effects: { sinking: [6, 3], paralyze: 1, fragile: 2 } },
      {
        offenseOffset: 6, egoRank: 'ALEPH', spCost: 25,
        sinCost: { pride: 3, gloom: 3 },
        corrodedName: '[E.G.O 침식] 『F A I L : 영구 통제 시스템』',
        corrodedBase: 28, corrodedCoinBonus: -6, corrodedCoins: 3,
        effects: { sinking: [10, 4], rupture: [6, 3], paralyze: 3 }
      }
    ]
  },
  minji: {
    offenseLevel: 47,
    defenseLevel: 42,
    staggerThresholds: [0.70, 0.40, 0.20],
    defenseSkill: {
      id: 'mj_def', name: '20시의 그림자 잠입 회피', defType: 'evade', sin: 'envy', type: 'slash',
      base: 5, coinBonus: 10, coins: 1,
      quote: '사물함 너머의 어둠 속으로...',
      desc: '[회피] 칠흑의 실루엣으로 공격을 완전 회피하고 호흡 위력 4, 횟수 2 획득',
      effects: { poise: [4, 2], haste: 2 }
    },
    passiveReq: { sin: 'lust', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 18 },
    supportPassive: {
      name: '사물함의 비밀 쪽지',
      sin: 'envy', count: 3, mode: 'owned',
      desc: '[질투 3 보유] 출혈이 있는 적을 공격하는 아군의 크리티컬 피해량 +20%'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { bleed: [4, 2], poise: [4, 2] } },
      { offenseOffset: 4, effects: { bleed: [7, 3], poise: [5, 3], coinPowerCond: 1 } },
      { offenseOffset: 3, effects: { sinking: [5, 3], fragile: 3 } },
      {
        offenseOffset: 5, egoRank: 'HE', spCost: 18,
        sinCost: { lust: 3, envy: 2 },
        corrodedName: '[E.G.O 침식] 『실종자의 원한: 혈조 난무』',
        corrodedBase: 25, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { bleed: [10, 4], poise: [6, 3] }
      }
    ]
  },
  hyunmin: {
    offenseLevel: 46,
    defenseLevel: 46,
    staggerThresholds: [0.65, 0.35, 0.15],
    defenseSkill: {
      id: 'hm_def', name: '켐벨 생명과학 11판 가드', defType: 'guard', sin: 'sloth', type: 'blunt',
      base: 11, coinBonus: 6, coins: 1,
      quote: '켐벨 11판의 두께로 막아낸다!',
      desc: '[방어] 하이탑과 켐벨 생명과학 11판으로 두터운 보호막 생성 및 충전 횟수 +3',
      effects: { protection: 2, charge: [1, 3] }
    },
    passiveReq: { sin: 'wrath', count: 3, mode: 'owned', bonusClash: 2, bonusDmgPct: 15 },
    supportPassive: {
      name: '추가대포 탄약 지원',
      sin: 'wrath', count: 3, mode: 'owned',
      desc: '[분노 3 보유] 체력이 가장 낮은 아군이 위기 시 보호 2 획득 및 합 위력 +1'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { tremor: [3, 2], protection: 1, charge: [1, 3] } },
      { offenseOffset: 3, effects: { tremor: [5, 3], tremorBurst: true, burn: [4, 2] } },
      { offenseOffset: 3, effects: { rupture: [4, 3], paralyze: 1 } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { gluttony: 3, wrath: 2, sloth: 1 },
        corrodedName: '[E.G.O 침식] 『무한 우동 루프: 어째서 한번이 아닌거야』',
        corrodedBase: 26, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { tremor: [8, 4], tremorBurst: true, rupture: [6, 3] }
      }
    ]
  },
  shelly: {
    offenseLevel: 47,
    defenseLevel: 46,
    staggerThresholds: [0.64, 0.34, 0.14],
    defenseSkill: {
      id: 'sh_def', name: '용병의 헤비 카운터', defType: 'counter', sin: 'wrath', type: 'blunt',
      base: 9, coinBonus: 5, coins: 2,
      quote: 'You cannot break through me!',
      desc: '[반격] 묵직한 체구로 공격을 받아낸 뒤 강력한 어퍼컷 반격 (출혈 및 진동 폭발)',
      effects: { bleed: [4, 2], tremorBurst: true }
    },
    passiveReq: { sin: 'pride', count: 3, mode: 'owned', bonusClash: 2, bonusDmgPct: 15 },
    supportPassive: {
      name: 'English Only 압박',
      sin: 'pride', count: 3, mode: 'owned',
      desc: '[오만 3 보유] 아군 1명의 앞면 코인 적중 시 피해량 +15%'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { tremor: [4, 2], poise: [3, 2] } },
      { offenseOffset: 2, effects: { sinking: [4, 2], fragile: 2 } },
      { offenseOffset: 4, effects: { bleed: [5, 3], poise: [5, 3], coinPowerCond: 1 } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { pride: 3, wrath: 2 },
        corrodedName: '[E.G.O 침식] 『Unforgiving Domain Expansion』',
        corrodedBase: 26, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { bleed: [8, 3], fragile: 3, guaranteedHeads: true }
      }
    ]
  },
  yongsun: {
    offenseLevel: 45,
    defenseLevel: 50,
    staggerThresholds: [0.55, 0.25],
    defenseSkill: {
      id: 'ys_def', name: '모스 경도 8.5 금강 방어', defType: 'guard', sin: 'sloth', type: 'blunt',
      base: 13, coinBonus: 7, coins: 1,
      quote: '단순하지만 절대 뚫리지 않는다.',
      desc: '[방어] 전성기 경도 8.5의 육체 경화로 거대한 보호막을 생성하고 보호 3 획득',
      effects: { protection: 3, tremor: [3, 2] }
    },
    passiveReq: { sin: 'sloth', count: 2, mode: 'res', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '모스 경도계 단련법 전수',
      sin: 'sloth', count: 3, mode: 'owned',
      desc: '[나태 3 보유] 아군 전체의 방어 레벨 +3, 수비 스킬 위력 +2'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { tremor: [4, 3], protection: 2 } },
      { offenseOffset: 1, effects: { protection: 2, haste: 2 } },
      { offenseOffset: 3, effects: { tremor: [7, 3], tremorBurst: true, fragile: 2 } },
      {
        offenseOffset: 4, egoRank: 'WAW', spCost: 20,
        sinCost: { sloth: 4, pride: 2 },
        corrodedName: '[E.G.O 침식] 『석화 부작용: 경도 한계 돌파』',
        corrodedBase: 27, corrodedCoinBonus: -6, corrodedCoins: 2,
        effects: { tremor: [10, 4], tremorBurst: true, protection: 4 }
      }
    ]
  },
  samchongsa: {
    offenseLevel: 47,
    defenseLevel: 47,
    staggerThresholds: [0.64, 0.34, 0.14],
    defenseSkill: {
      id: 'sc_def', name: '푸른 위더 베리어 가드', defType: 'guard', sin: 'pride', type: 'blunt',
      base: 11, coinBonus: 6, coins: 1,
      quote: '위더 베리어가 모든 투사체를 튕겨낸다!',
      desc: '[방어] 케르베로스의 푸른 위더 오라로 보호막을 전개하고 화상 반격 부여',
      effects: { protection: 2, burn: [3, 2] }
    },
    passiveReq: { sin: 'wrath', count: 3, mode: 'owned', bonusClash: 2, bonusDmgPct: 18 },
    supportPassive: {
      name: '삼체 궤도 연산 보조',
      sin: 'gloom', count: 3, mode: 'owned',
      desc: '[우울 3 보유] 코인 개수가 3개 이상인 스킬의 최종 위력 +1'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { rupture: [4, 2], sinking: [3, 2] } },
      { offenseOffset: 3, effects: { burn: [5, 3], bleed: [4, 2] } },
      { offenseOffset: 3, effects: { protection: 3, tremor: [4, 2], tremorBurst: true } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 22,
        sinCost: { wrath: 3, pride: 2, gloom: 1 },
        corrodedName: '[E.G.O 침식] 『폭주 위더: Κέρβερος 재앙』',
        corrodedBase: 27, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { burn: [8, 4], rupture: [6, 3], paralyze: 2 }
      }
    ]
  },
  donggyun: {
    offenseLevel: 46,
    defenseLevel: 44,
    staggerThresholds: [0.68, 0.38, 0.18],
    defenseSkill: {
      id: 'dg_def', name: '1,000km 리치 반격 휩', defType: 'counter', sin: 'sloth', type: 'blunt',
      base: 8, coinBonus: 6, coins: 2,
      quote: '멀리 떨어져 있어도 내 팔은 닿는다!',
      desc: '[반격] 피격 시 즉각 양 팔을 길게 늘려 원거리 반격 타격 (진동 및 속박 부여)',
      effects: { tremor: [4, 2], bind: 2 }
    },
    passiveReq: { sin: 'sloth', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '초장거리 견제 타격',
      sin: 'sloth', count: 3, mode: 'owned',
      desc: '[나태 3 보유] 타격 스킬 적중 시 대상에게 진동 위력 +2 추가 부여'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { tremor: [4, 2], haste: 1 } },
      { offenseOffset: 2, effects: { tremor: [4, 3], fragile: 2 } },
      { offenseOffset: 4, effects: { tremor: [6, 3], tremorBurst: true, bind: 2 } },
      {
        offenseOffset: 4, egoRank: 'TETH', spCost: 16,
        sinCost: { wrath: 2, sloth: 2 },
        corrodedName: '[E.G.O 침식] 『강탈당한 양 팔의 분노』',
        corrodedBase: 24, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { tremor: [8, 3], tremorBurst: true, fragile: 3 }
      }
    ]
  },
  hyunseung: {
    offenseLevel: 48,
    defenseLevel: 50,
    staggerThresholds: [0.55, 0.25],
    defenseSkill: {
      id: 'hs_def', name: '모스 경도 23 초월 경화', defType: 'guard', sin: 'sloth', type: 'blunt',
      base: 14, coinBonus: 7, coins: 1,
      quote: '경도 23 앞에서는 그 어떤 칼날도 부서진다.',
      desc: '[방어] 신격의 모스 경도 23으로 압도적인 보호막 생성 및 체력 10 회복',
      effects: { protection: 3, selfHeal: 10 }
    },
    passiveReq: { sin: 'gluttony', count: 3, mode: 'owned', bonusClash: 2, bonusDmgPct: 20 },
    supportPassive: {
      name: '[특급 식객] 우동 두 그릇의 가호',
      sin: 'gluttony', count: 3, mode: 'owned',
      desc: '[탐식 3 보유] 매 턴 체력이 가장 낮은 아군 1명의 체력 12 및 정신력 5 회복'
    },
    skillAddons: [
      { offenseOffset: 3, effects: { tremor: [6, 3], tremorBurst: true, protection: 2 } },
      { offenseOffset: 2, effects: { poise: [4, 3], protection: 2 } },
      { offenseOffset: 4, effects: { sinking: [6, 3], rupture: [5, 3], fragile: 2 } },
      {
        offenseOffset: 6, egoRank: 'ALEPH', spCost: 25,
        sinCost: { gluttony: 4, sloth: 2 },
        corrodedName: '[E.G.O 침식] 『붉은 털실의 본모습: 만물 위장 투입』',
        corrodedBase: 29, corrodedCoinBonus: -6, corrodedCoins: 3,
        effects: { sinking: [10, 4], rupture: [8, 4], paralyze: 3 }
      }
    ]
  },
  hyunwoo: {
    offenseLevel: 46,
    defenseLevel: 45,
    staggerThresholds: [0.66, 0.36, 0.16],
    defenseSkill: {
      id: 'hw_def', name: '성대모사 교란 회피', defType: 'evade', sin: 'envy', type: 'pierce',
      base: 5, coinBonus: 10, coins: 1,
      quote: '목소리 방향이 거기가 아닌데?',
      desc: '[회피] 성대모사로 적의 시선을 교란해 회피하고 충전 및 호흡 획득',
      effects: { charge: [2, 2], poise: [3, 2] }
    },
    passiveReq: { sin: 'envy', count: 2, mode: 'res', bonusClash: 2, bonusDmgPct: 16 },
    supportPassive: {
      name: '완벽한 성대모사 백업',
      sin: 'envy', count: 3, mode: 'owned',
      desc: '[질투 3 보유] 질투 공명 발동 시 아군 전체의 합 위력 +1'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { sinking: [3, 2], poise: [3, 2] } },
      { offenseOffset: 3, effects: { tremor: [5, 2], tremorBurst: true, burn: [3, 2] } },
      { offenseOffset: 4, effects: { paralyze: 2, bind: 2, tremor: [5, 3], tremorBurst: true } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { envy: 4, sloth: 2 },
        corrodedName: '[E.G.O 침식] 『자아 상실: 전 교원 동시 성대모사』',
        corrodedBase: 26, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { tremor: [8, 3], tremorBurst: true, paralyze: 3 }
      }
    ]
  },
  seungdae: {
    offenseLevel: 46,
    defenseLevel: 46,
    staggerThresholds: [0.65, 0.35, 0.15],
    defenseSkill: {
      id: 'sd_def', name: '나른한 수면 파동 방어', defType: 'guard', sin: 'sloth', type: 'blunt',
      base: 10, coinBonus: 6, coins: 1,
      quote: '자아... 진정하고 잠깐 쉬어라...',
      desc: '[방어] 수면 파동으로 보호막을 형성하고 공격자의 정신력을 6 감소시킨다',
      effects: { sinking: [4, 2], protection: 2 }
    },
    passiveReq: { sin: 'sloth', count: 3, mode: 'owned', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '자아, (중략)의 수면 유도',
      sin: 'sloth', count: 3, mode: 'owned',
      desc: '[나태 3 보유] 침잠이 부여된 적에게 아군이 가하는 흐트러짐 손상 +20%'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { sinking: [4, 3], paralyze: 1 } },
      { offenseOffset: 2, effects: { sinking: [5, 2], fragile: 3, bind: 2 } },
      { offenseOffset: 4, effects: { sinking: [7, 3], paralyze: 2, tremorBurst: true } },
      {
        offenseOffset: 5, egoRank: 'WAW', spCost: 20,
        sinCost: { sloth: 3, gloom: 3 },
        corrodedName: '[E.G.O 침식] 『자아, 영원히 깨어나지 않는 강의』',
        corrodedBase: 26, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { sinking: [10, 4], paralyze: 3, bind: 3 }
      }
    ]
  },
  jusook: {
    offenseLevel: 46,
    defenseLevel: 46,
    staggerThresholds: [0.66, 0.36, 0.16],
    defenseSkill: {
      id: 'jsk_def', name: '부정적분 수호 장막', defType: 'guard', sin: 'gluttony', type: 'slash',
      base: 11, coinBonus: 6, coins: 1,
      quote: '깎여나간 함수는 적분으로 되돌린다.',
      desc: '[방어] 적분 장막으로 보호막을 생성하고 자신의 정신력 +6 회복',
      effects: { protection: 2, spSelf: 6 }
    },
    passiveReq: { sin: 'gloom', count: 2, mode: 'res', bonusClash: 1, bonusDmgPct: 15 },
    supportPassive: {
      name: '화실의 마지막 전언',
      sin: 'gloom', count: 3, mode: 'owned',
      desc: '[우울 3 보유] 매 턴 정신력이 가장 낮은 아군 1명의 정신력 +8 회복'
    },
    skillAddons: [
      { offenseOffset: 1, effects: { sinking: [4, 2] } },
      { offenseOffset: 2, effects: { rupture: [4, 2], protection: 2 } },
      { offenseOffset: 3, effects: { rupture: [5, 3], fragile: 2 } },
      {
        offenseOffset: 5, egoRank: 'HE', spCost: 18,
        sinCost: { gloom: 3, gluttony: 2 },
        corrodedName: '[E.G.O 침식] 『미분된 실루엣의 절규』',
        corrodedBase: 25, corrodedCoinBonus: -5, corrodedCoins: 3,
        effects: { sinking: [8, 3], rupture: [6, 3] }
      }
    ]
  },
  mingi: {
    offenseLevel: 49,
    defenseLevel: 47,
    staggerThresholds: [0.65, 0.35, 0.15],
    defenseSkill: {
      id: 'mg_def', name: '주머니 손 초고속 흘리기', defType: 'evade', sin: 'pride', type: 'slash',
      base: 6, coinBonus: 11, coins: 1,
      quote: '눈으로 쫓을 수 없다고, 볼 수 있겠죠?',
      desc: '[회피] 검은 바람막이 주머니에 손을 넣은 채 잔상만 남기고 완전 회피 (호흡 4, 신속 2 획득)',
      effects: { poise: [4, 3], haste: 2 }
    },
    passiveReq: { sin: 'pride', count: 2, mode: 'res', bonusClash: 2, bonusDmgPct: 20 },
    supportPassive: {
      name: '[규칙]의 명쾌한 해석',
      sin: 'pride', count: 3, mode: 'owned',
      desc: '[오만 3 보유] 속도가 가장 높은 아군 1명의 합 위력 +1, 크리티컬 피해량 +20%'
    },
    skillAddons: [
      { offenseOffset: 2, effects: { poise: [4, 3], haste: 2 } },
      { offenseOffset: 4, effects: { rupture: [5, 3], poise: [4, 2], fragile: 3 } },
      { offenseOffset: 5, effects: { bleed: [6, 3], poise: [5, 3], rupture: [4, 2], coinPowerCond: 1 } },
      {
        offenseOffset: 6, egoRank: 'ALEPH', spCost: 25,
        sinCost: { pride: 4, wrath: 2, gloom: 1 },
        corrodedName: '[E.G.O 침식] 『끝까지 가보도록 하겠습니다』',
        corrodedBase: 29, corrodedCoinBonus: -5, corrodedCoins: 4,
        effects: { bleed: [10, 4], rupture: [8, 4], poise: [8, 4] }
      }
    ]
  }
};

// 광역 가중치(Attack Weight) 원작 고증 매핑 (1 = 단일, 2~5 = 다중 광역 타격)
const SKILL_WEIGHT_MAP = {
  yw_s3: 3,  yw_ego: 2,
  jr_s2: 2,  jr_ego: 3,
  yh_ego: 2,
  jw_ego: 2,
  pk_s1: 2,  pk_ego: 4,
  sj_ego: 3,
  ein_s1: 2, ein_s2: 2, ein_ego: 2,
  cj_s3: 2,  cj_ego: 5,
  js_s2: 3,  js_ego: 4,
  mj_ego: 2,
  hm_ego: 3,
  sh_s2: 2,  sh_ego: 3,
  ys_ego: 3,
  sc_s2: 2,  sc_ego: 3,
  dg_ego: 3,
  hs_ego: 4,
  hw_s3: 2,  hw_ego: 2,
  sd_s3: 3,  sd_ego: 4,
  jsk_ego: 3,
  mg_ego: 3
};

// 상태이상 & 고유 키워드 툴팁 사전
const STATUS_DICTIONARY = {
  burn:       { title: '화상 (Burn)', color: '#ff5252', desc: '턴 종료 시 [위력]만큼 고정 체력 피해를 입고 횟수가 1 감소합니다.' },
  bleed:      { title: '출혈 (Bleed)', color: '#e84393', desc: '공격 코인을 굴릴 때마다 [위력]만큼 체력 피해를 입고 횟수가 1 감소합니다.' },
  tremor:     { title: '진동 (Tremor)', color: '#f39c12', desc: '[진동 폭발] 적중 시 진동 위력에 비례해 흐트러짐선이 전진하여 즉시 흐트러짐을 유발합니다.' },
  rupture:    { title: '파열 (Rupture)', color: '#00cec9', desc: '피격될 때마다 코인마다 [위력]만큼 방어 무시 고정 추가 피해를 입고 횟수가 1 감소합니다.' },
  sinking:    { title: '침잠 (Sinking)', color: '#0984e3', desc: '피격될 때마다 [위력]만큼 정신력(SP) 피해를 입습니다. (정신력 -45일 때는 우울 체력 피해로 전환)' },
  poise:      { title: '호흡 (Poise)', color: '#ffeaa7', desc: '공격 적중 시 [위력 x 5%] 확률로 치명타(1.2배 피해)가 발동하며 횟수가 1 감소합니다.' },
  charge:     { title: '충전 (Charge)', color: '#00e5ff', desc: '특정 고출력 스킬이 충전 횟수를 소모하여 코인 위력 및 피해량을 대폭 증폭합니다.' },
  paralyze:   { title: '마비 (Paralyze)', color: '#f1c40f', desc: '이번 턴 코인을 굴릴 때 스택 수만큼 코인의 위력 보너스를 0으로 고정시킵니다.' },
  fragile:    { title: '취약 (Fragile)', color: '#ff7675', desc: '이번 턴에 받는 물리 피해량이 스택당 +10% 증가합니다.' },
  protection: { title: '보호 (Protection)', color: '#74b9ff', desc: '이번 턴에 받는 물리 피해량이 스택당 -10% 감소합니다.' },
  haste:      { title: '신속 (Haste)', color: '#55efc4', desc: '속도 주사위 최솟값과 최댓값이 스택만큼 증가하여 합 강탈이 유리해집니다.' },
  bind:       { title: '속박 (Bind)', color: '#fab1a0', desc: '속도 주사위 최솟값과 최댓값이 스택만큼 감소합니다.' },
  shield:     { title: '보호막 (Shield)', color: '#00e5ff', desc: '수비(방어) 또는 위더 베리어 등으로 생성된 임시 체력. 체력보다 먼저 차감됩니다.' },
  cannon_heat:{ title: '과구리 예열 (Cannon Overdrive)', color: '#ff4757', desc: '김창진 고유 버프. 대포 계열 스킬 사용 시 누적되어 최종 위력 +1 및 피해량 +8%가 증폭됩니다.' },
  hands_out:  { title: '주머니에서 꺼낸 양 손 (1013.7hPa)', color: '#f5d76e', desc: '김양우가 적수로 인정한 상태. 상시 공격 레벨 +4 및 신속 2 획득.' }
};

// CHARACTER_DB 자동 보강 (림버스 정규 메커니즘 데이터 병합)
CHARACTER_DB.forEach(c => {
  const spec = LIMBUS_STAT_SPECS[c.id];
  if (!spec) return;
  c.offenseLevel = spec.offenseLevel;
  c.defenseLevel = spec.defenseLevel;
  c.staggerThresholds = spec.staggerThresholds;
  c.defenseSkill = spec.defenseSkill;
  c.passive = {
    ...c.passive,
    sin: spec.passiveReq.sin,
    count: spec.passiveReq.count,
    mode: spec.passiveReq.mode,
    bonusClash: spec.passiveReq.bonusClash,
    bonusDmgPct: spec.passiveReq.bonusDmgPct
  };
  c.supportPassive = spec.supportPassive;

  // 죄악 속성 내성 (보유 스킬 속성에 기반해 자동 산출)
  const s1Sin = c.skills[0] ? c.skills[0].sin : 'wrath';
  const s2Sin = c.skills[1] ? c.skills[1].sin : 'lust';
  const s3Sin = c.skills[2] ? c.skills[2].sin : 'pride';
  c.sinRes = {
    wrath: 1.0, lust: 1.0, sloth: 1.0, gluttony: 1.0, gloom: 1.0, pride: 1.0, envy: 1.0
  };
  c.sinRes[s1Sin] = 0.75;
  c.sinRes[s2Sin] = 0.85;
  c.sinRes[s3Sin] = 0.65;

  c.skills.forEach((sk, idx) => {
    sk.atkWeight = SKILL_WEIGHT_MAP[sk.id] || 1;
    const addon = spec.skillAddons[idx];
    if (!addon) return;
    sk.offenseOffset = addon.offenseOffset || 0;
    sk.offenseLevel = c.offenseLevel + sk.offenseOffset;
    sk.tier = sk.isEgo ? 4 : (idx + 1);
    sk.effects = { ...(sk.effects || {}), ...(addon.effects || {}) };
    if (sk.isEgo) {
      sk.egoRank = addon.egoRank || 'HE';
      sk.spCost = addon.spCost || 20;
      sk.sinCost = addon.sinCost || { [sk.sin]: sk.egoCost || 3 };
      sk.corrodedName = addon.corrodedName || `[E.G.O 침식] ${sk.name}`;
      sk.corrodedBase = addon.corrodedBase || 25;
      sk.corrodedCoinBonus = addon.corrodedCoinBonus || -5;
      sk.corrodedCoins = addon.corrodedCoins || sk.coins;
      sk.corrodedWeight = Math.min(5, (sk.atkWeight || 1) + 1);
    }
  });
});

