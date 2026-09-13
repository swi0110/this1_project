/**
 * i18n.js — 화면 문구 표. 기본은 한국어이고 영어로 전환할 수 있다.
 * 단위 이름처럼 데이터에 딸린 문구는 units.js가 {ko, en} 형태로 갖고 있고 pick()으로 고른다.
 */
(function (global) {
  'use strict';

  var DEFAULT_LANG = 'ko';

  var LANGS = [
    { id: 'ko', short: 'KO', label: '한국어' },
    { id: 'en', short: 'EN', label: 'English' }
  ];

  /* {0}은 호출할 때 넘기는 값으로 바뀐다 */
  var STRINGS = {
    ko: {
      title:            '메르헨 단위계 변환기',
      wordmark:         '메르헨 단위계 변환기',
      wordmarkSub:      'Märchen Unit Converter',
      wordmarkSubLang:  'en',   // 부제는 일부러 반대 언어다 — 아래 lang 속성으로 알린다

      langGroup:        '언어',
      dimGroup:         '변환 차원',
      systemGroup:      '결과 단위계',
      linksGroup:       '메르헨 관련 링크',

      inputLabel:       '입력',
      inputPlaceholder: '값 입력',
      fromUnitAria:     '입력 단위',
      resultLabel:      '결과',
      decimalsLabel:    '소수점',
      decimalsAria:     '소수점 자리수',
      decimalsOption:   '{0}자리',

      copy:             '복사',
      copied:           '{0} 복사됨',
      copyFailed:       '복사에 실패했습니다. 값을 직접 선택해 주세요.',

      glanceHeading:    '입력 단위별 한눈에 보기',
      glanceCaption:    '"{0}"을(를) 다른 단위로 본다면',
      glanceEmpty:      '값을 입력하면 단위별 환산 결과가 표시됩니다.',
      pickUnit:         '{0}(으)로 입력 단위 바꾸기',

      guideHeading:     '메르헨 단위 안내',
      guideNote1:       '기호는 항상 소문자로 쓰고, 값과 기호 사이는 한 칸 띄웁니다 (예: <code>3 mt</code>).',
      guideNote2:       '<b>dt</b>와 <b>dtt</b>는 <b>mt</b>에서 유도된 단위이지만, 길이·넓이·부피는 서로 변환되지 않습니다.',

      errNegative:      '음수는 입력할 수 없습니다.',
      errNotNumber:     '유효한 숫자를 입력하세요.',
      errNotFinite:     '표현할 수 없는 값입니다.',

      footerNote:       '메르헨 단위계 변환기 · v1.0 — 기존 단위 → 메르헨 · 야드파운드 단방향 변환',

      linkX:            'X',
      linkXAria:        'X (트위터) 바로가기',
      linkYoutube:      'YouTube',
      linkYoutubeAria:  '유튜브 채널 바로가기',
      linkChzzk:        '치지직',
      linkChzzkAria:    '치지직 방송국 바로가기',
      linkGoods:        '굿즈',
      linkGoodsAria:    '공식 굿즈샵 바로가기',
      linkCafe:         '네이버 카페',
      linkCafeAria:     '네이버 카페 바로가기',
      linkHome:         '제국 공식 홈페이지',
      linkHomeAria:     '제국 공식 홈페이지 바로가기'
    },

    en: {
      title:            'Märchen Unit Converter',
      wordmark:         'Märchen Unit Converter',
      wordmarkSub:      '메르헨 단위계 변환기',
      wordmarkSubLang:  'ko',

      langGroup:        'Language',
      dimGroup:         'Conversion dimension',
      systemGroup:      'Result unit system',
      linksGroup:       'Märchen links',

      inputLabel:       'Input',
      inputPlaceholder: 'Enter a value',
      fromUnitAria:     'Input unit',
      resultLabel:      'Result',
      decimalsLabel:    'Decimals',
      decimalsAria:     'Decimal places',
      decimalsOption:   '{0} places',

      copy:             'Copy',
      copied:           'Copied {0}',
      copyFailed:       'Copy failed. Please select the value and copy it manually.',

      glanceHeading:    'At a glance, by input unit',
      glanceCaption:    'If "{0}" were given in another unit',
      glanceEmpty:      'Enter a value to see the conversion for every unit.',
      pickUnit:         'Switch the input unit to {0}',

      guideHeading:     'Märchen unit guide',
      guideNote1:       'Symbols are always lowercase, with one space between value and symbol (e.g. <code>3 mt</code>).',
      guideNote2:       '<b>dt</b> and <b>dtt</b> derive from <b>mt</b>, but length, area and volume never convert into one another.',

      errNegative:      'Negative values are not allowed.',
      errNotNumber:     'Enter a valid number.',
      errNotFinite:     'This value cannot be represented.',

      footerNote:       'Märchen Unit Converter · v1.0 — one-way conversion from existing units to Märchen · Imperial',

      linkX:            'X',
      linkXAria:        'Open X (Twitter)',
      linkYoutube:      'YouTube',
      linkYoutubeAria:  'Open the YouTube channel',
      linkChzzk:        'CHZZK',
      linkChzzkAria:    'Open the CHZZK channel',
      linkGoods:        'Goods',
      linkGoodsAria:    'Open the official goods shop',
      linkCafe:         'Naver Cafe',
      linkCafeAria:     'Open the Naver Cafe',
      linkHome:         'Official site',
      linkHomeAria:     'Open the official empire website'
    }
  };

  var lang = DEFAULT_LANG;

  /** 언어를 바꾸고 실제로 적용된 id를 돌려준다 */
  function setLang(id) {
    lang = STRINGS[id] ? id : DEFAULT_LANG;
    return lang;
  }

  /** 문구를 찾는다. value를 넘기면 {0} 자리에 끼워 넣는다 */
  function t(key, value) {
    var s = STRINGS[lang][key];
    if (s === undefined) s = STRINGS[DEFAULT_LANG][key] || key;
    return value === undefined ? s : s.replace('{0}', value);
  }

  /**
   * {ko, en} 이름에서 현재 언어를 고른다.
   * 문자열은 그대로 통과시킨다 — 'mm'처럼 어느 언어에서나 같은 값을 두 번 적지 않기 위해서다.
   */
  function pick(value) {
    if (typeof value === 'string') return value;
    return value[lang] || value[DEFAULT_LANG];
  }

  global.MU = global.MU || {};
  global.MU.i18n = {
    DEFAULT_LANG: DEFAULT_LANG,
    LANGS: LANGS,
    STRINGS: STRINGS,   // 문구 키 대조 테스트(T-45)가 읽는다
    setLang: setLang,
    t: t,
    pick: pick
  };
})(typeof window !== 'undefined' ? window : this);
