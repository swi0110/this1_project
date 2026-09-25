/**
 * units.js — 단위 정의 데이터. 단일 진실원이며 아무 모듈에도 의존하지 않는다.
 * 단위를 늘리려면 해당 차원의 sources 배열에 객체 하나만 넣으면 된다.
 * 사람이 읽는 이름은 {ko, en} 형태로 적고 i18n.pick()이 골라 쓴다.
 */
(function (global) {
  'use strict';

  /* mt만 리터럴로 두고 dt·dtt는 유도한다 — mt가 바뀌면 따라오게 (DESIGN §2.4) */
  var MT_IN_CM  = 14;
  var DT_IN_CM2 = Math.pow(MT_IN_CM, 2);           // 196 cm²
  var DTT_IN_L  = Math.pow(MT_IN_CM, 3) / 1000;    // 2.744 L
  var THT_IN_KG = 5;

  /* 결과를 어느 단위계로 낼지. 기본은 메르헨이다 */
  var SYSTEMS = [
    { id: 'marchen',  label: { ko: '메르헨 단위계', en: 'Märchen' } },
    { id: 'imperial', label: { ko: '야드파운드',    en: 'Imperial' } }
  ];
  var DEFAULT_SYSTEM = 'marchen';

  /* imperial은 sources에 이미 있는 단위를 id로 가리킨다 — 배율을 두 벌 두지 않기 위해서다.
     factor는 기준 단위 대비 배율 (길이 cm · 넓이 cm² · 부피 L · 무게 kg).
     symbol은 보통 언어가 같아 문자열 하나지만, 라틴 표기가 따로 필요한 척관법 단위만 {ko, en}이다 */
  var DIMENSIONS = [
    {
      id: 'length',
      label: { ko: '길이', en: 'Length' },
      defaultFrom: 'm',   // 기본 변환: 미터 → 메따
      marchen: {
        id: 'mt', symbol: 'mt', factor: MT_IN_CM, note: '1 mt = 14 cm',
        name: { ko: '메따', en: 'Metta' }
      },
      imperial: 'ft',
      sources: [
        { id: 'mm', symbol: 'mm', factor: 0.1,      name: { ko: '밀리미터', en: 'Millimeter' } },
        { id: 'cm', symbol: 'cm', factor: 1,        name: { ko: '센티미터', en: 'Centimeter' } },
        { id: 'm',  symbol: 'm',  factor: 100,      name: { ko: '미터',     en: 'Meter' } },
        { id: 'km', symbol: 'km', factor: 100000,   name: { ko: '킬로미터', en: 'Kilometer' } },
        { id: 'in', symbol: 'in', factor: 2.54,     name: { ko: '인치',     en: 'Inch' } },
        { id: 'ft', symbol: 'ft', factor: 30.48,    name: { ko: '피트',     en: 'Foot' } },
        { id: 'yd', symbol: 'yd', factor: 91.44,    name: { ko: '야드',     en: 'Yard' } },
        { id: 'mi', symbol: 'mi', factor: 160934.4, name: { ko: '마일',     en: 'Mile' } },
        { id: 'ja', symbol: { ko: '尺', en: 'ja' }, factor: 30.303, name: { ko: '자(尺)', en: 'Ja (尺)' } }
      ]
    },
    {
      id: 'area',
      label: { ko: '넓이', en: 'Area' },
      defaultFrom: 'm2',
      marchen: {
        id: 'dt', symbol: 'dt', factor: DT_IN_CM2, note: '1 dt = 1 mt² = 196 cm²',
        name: { ko: '듀따', en: 'Dyutta' }
      },
      imperial: 'ac',
      sources: [
        { id: 'cm2',    symbol: 'cm²', factor: 1,                 name: { ko: '제곱센티미터', en: 'Square centimeter' } },
        { id: 'm2',     symbol: 'm²',  factor: 10000,             name: { ko: '제곱미터',     en: 'Square meter' } },
        { id: 'km2',    symbol: 'km²', factor: 1e10,              name: { ko: '제곱킬로미터', en: 'Square kilometer' } },
        { id: 'ft2',    symbol: 'ft²', factor: 929.0304,          name: { ko: '제곱피트',     en: 'Square foot' } },
        { id: 'pyeong', symbol: { ko: '평', en: 'pyeong' }, factor: 33057.851239669, name: { ko: '평', en: 'Pyeong' } },
        { id: 'ha',     symbol: 'ha',  factor: 1e8,               name: { ko: '헥타르',       en: 'Hectare' } },
        { id: 'ac',     symbol: 'ac',  factor: 40468564.224,      name: { ko: '에이커',       en: 'Acre' } }
      ]
    },
    {
      id: 'volume',
      label: { ko: '부피', en: 'Volume' },
      defaultFrom: 'L',
      marchen: {
        id: 'dtt', symbol: 'dtt', factor: DTT_IN_L, note: '1 dtt = 1 mt³ = 2.744 L',
        name: { ko: '뜌따따', en: 'Ddyuttatta' }
      },
      imperial: 'galUS',
      sources: [
        { id: 'mL',    symbol: 'mL',  factor: 0.001,        name: { ko: '밀리리터',       en: 'Milliliter' } },
        { id: 'L',     symbol: 'L',   factor: 1,            name: { ko: '리터',           en: 'Liter' } },
        { id: 'cm3',   symbol: 'cm³', factor: 0.001,        name: { ko: '세제곱센티미터', en: 'Cubic centimeter' } },
        { id: 'm3',    symbol: 'm³',  factor: 1000,         name: { ko: '세제곱미터',     en: 'Cubic meter' } },
        { id: 'cup',   symbol: { ko: '컵', en: 'cup' }, factor: 0.2,     name: { ko: '컵(200 mL)', en: 'Cup (200 mL)' } },
        { id: 'doe',   symbol: { ko: '되', en: 'doe' }, factor: 1.80391, name: { ko: '되',        en: 'Doe' } },
        { id: 'mal',   symbol: { ko: '말', en: 'mal' }, factor: 18.0391, name: { ko: '말',        en: 'Mal' } },
        { id: 'galUS', symbol: 'gal', factor: 3.785411784,  name: { ko: '갤런(미)',       en: 'Gallon (US)' } }
      ]
    },
    {
      id: 'mass',
      label: { ko: '무게', en: 'Weight' },
      defaultFrom: 'kg',
      marchen: {
        id: 'tht', symbol: 'tht', factor: THT_IN_KG, note: '1 tht = 5 kg',
        name: { ko: '댕따', en: 'Daengtta' }
      },
      imperial: 'lb',
      sources: [
        { id: 'mg',   symbol: 'mg', factor: 1e-6,             name: { ko: '밀리그램',    en: 'Milligram' } },
        { id: 'g',    symbol: 'g',  factor: 0.001,            name: { ko: '그램',        en: 'Gram' } },
        { id: 'kg',   symbol: 'kg', factor: 1,                name: { ko: '킬로그램',    en: 'Kilogram' } },
        { id: 't',    symbol: 't',  factor: 1000,             name: { ko: '톤',          en: 'Tonne' } },
        { id: 'geun', symbol: { ko: '근', en: 'geun' }, factor: 0.6,  name: { ko: '근(600 g)',   en: 'Geun (600 g)' } },
        { id: 'gwan', symbol: { ko: '관', en: 'gwan' }, factor: 3.75, name: { ko: '관(3.75 kg)', en: 'Gwan (3.75 kg)' } },
        { id: 'lb',   symbol: 'lb', factor: 0.45359237,       name: { ko: '파운드',      en: 'Pound' } },
        { id: 'oz',   symbol: 'oz', factor: 0.028349523125,   name: { ko: '온스',        en: 'Ounce' } }
      ]
    }
  ];

  /* dimension은 입력 단위에만 붙인다 — 차원 격리 검사가 읽는 쪽이다.
     targets는 단위계 id로 출력 단위를 찾는 표다 */
  DIMENSIONS.forEach(function (dim) {
    dim.sources.forEach(function (unit) {
      unit.dimension = dim.id;
      Object.freeze(unit.name);
      if (typeof unit.symbol === 'object') Object.freeze(unit.symbol);
      Object.freeze(unit);
    });
    Object.freeze(dim.sources);

    var imperial = dim.sources.filter(function (u) { return u.id === dim.imperial; })[0];
    if (!imperial) {
      throw new Error(dim.id + ' 차원의 야드파운드 단위 "' + dim.imperial + '"가 sources에 없습니다.');
    }

    /* 메르헨 단위도 입력으로 고를 수 있으므로 차원 격리 검사가 읽을 dimension을 붙인다 */
    dim.marchen.dimension = dim.id;
    Object.freeze(dim.marchen.name);
    Object.freeze(dim.marchen);
    Object.freeze(dim.label);
    dim.targets = Object.freeze({ marchen: dim.marchen, imperial: imperial });
    /* 입력 드롭다운과 환산표가 쓰는 목록. 주인공이라 메르헨이 맨 앞이다 */
    dim.allUnits = Object.freeze([dim.marchen].concat(dim.sources));
    Object.freeze(dim);
  });
  Object.freeze(DIMENSIONS);
  SYSTEMS.forEach(function (s) { Object.freeze(s.label); Object.freeze(s); });
  Object.freeze(SYSTEMS);

  /** 차원을 찾는다. 없으면 undefined */
  function getDimension(dimensionId) {
    return DIMENSIONS.filter(function (d) { return d.id === dimensionId; })[0];
  }

  /** 차원 안에서 입력 단위를 찾는다. 메르헨 단위도 포함한다. 없으면 undefined */
  function getUnit(dimensionId, unitId) {
    var dim = getDimension(dimensionId);
    if (!dim) return undefined;
    return dim.allUnits.filter(function (u) { return u.id === unitId; })[0];
  }

  /** 차원과 단위계로 출력 단위를 정한다. 모르는 단위계면 기본 단위계로 되돌린다 */
  function getTarget(dimension, systemId) {
    return dimension.targets[systemId] || dimension.targets[DEFAULT_SYSTEM];
  }

  global.MU = global.MU || {};
  global.MU.units = {
    SYSTEMS: SYSTEMS,
    DEFAULT_SYSTEM: DEFAULT_SYSTEM,
    DIMENSIONS: DIMENSIONS,
    getDimension: getDimension,
    getUnit: getUnit,
    getTarget: getTarget
  };
})(typeof window !== 'undefined' ? window : this);
