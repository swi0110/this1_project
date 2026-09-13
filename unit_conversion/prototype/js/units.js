/**
 * units.js — 메르헨 단위계 정의 데이터 (단일 진실원)
 *
 * 이 파일은 어떤 모듈에도 의존하지 않는다.
 * 새 입력 단위를 추가하려면 해당 차원의 sources 배열에 객체 하나만 넣으면 된다.
 */
(function (global) {
  'use strict';

  /* ── 메르헨 단위계 기본 상수 ───────────────────────────────────────────
   * mt만 리터럴로 두고 dt·dtt는 mt에서 유도한다.
   * mt 정의가 바뀌어도 유도 단위가 자동으로 따라오게 하기 위함. (DESIGN §2.4)
   */
  var MT_IN_CM  = 14;                              // 1 mt  = 14 cm
  var DT_IN_CM2 = Math.pow(MT_IN_CM, 2);           // 1 dt  = 196 cm²
  var DTT_IN_L  = Math.pow(MT_IN_CM, 3) / 1000;    // 1 dtt = 2.744 L
  var THT_IN_KG = 5;                               // 1 tht = 5 kg

  /* ── 차원 정의 ──────────────────────────────────────────────────────
   * base   : 기준 단위 기호 (변환 경유 단위)
   * target : 이 차원의 메르헨 출력 단위 — 차원당 정확히 1개
   * sources: 입력 가능한 기존 단위 목록
   */
  var DIMENSIONS = [
    {
      id: 'length',
      label: '길이',
      base: 'cm',
      defaultFrom: 'm',   // 기본 변환: 미터 → 메따
      target: {
        id: 'mt',
        reading: '메따',
        factor: MT_IN_CM,
        note: '1 mt = 14 cm'
      },
      sources: [
        { id: 'mm', name: '밀리미터',   symbol: 'mm', factor: 0.1 },
        { id: 'cm', name: '센티미터',   symbol: 'cm', factor: 1 },
        { id: 'm',  name: '미터',       symbol: 'm',  factor: 100 },
        { id: 'km', name: '킬로미터',   symbol: 'km', factor: 100000 },
        { id: 'in', name: '인치',       symbol: 'in', factor: 2.54 },
        { id: 'ft', name: '피트',       symbol: 'ft', factor: 30.48 },
        { id: 'yd', name: '야드',       symbol: 'yd', factor: 91.44 },
        { id: 'mi', name: '마일',       symbol: 'mi', factor: 160934.4 },
        { id: 'ja', name: '자(尺)',     symbol: '尺', factor: 30.303 }
      ]
    },
    {
      id: 'area',
      label: '넓이',
      base: 'cm²',
      defaultFrom: 'm2',
      target: {
        id: 'dt',
        reading: '듀따',
        factor: DT_IN_CM2,
        note: '1 dt = 1 mt² = 196 cm²'
      },
      sources: [
        { id: 'cm2',    name: '제곱센티미터',   symbol: 'cm²', factor: 1 },
        { id: 'm2',     name: '제곱미터',       symbol: 'm²',  factor: 10000 },
        { id: 'km2',    name: '제곱킬로미터',   symbol: 'km²', factor: 1e10 },
        { id: 'ft2',    name: '제곱피트',       symbol: 'ft²', factor: 929.0304 },
        { id: 'pyeong', name: '평',             symbol: '평',  factor: 33057.851239669 },
        { id: 'ha',     name: '헥타르',         symbol: 'ha',  factor: 1e8 },
        { id: 'ac',     name: '에이커',         symbol: 'ac',  factor: 40468564.224 }
      ]
    },
    {
      id: 'volume',
      label: '부피',
      base: 'L',
      defaultFrom: 'L',
      target: {
        id: 'dtt',
        reading: '뜌따따',
        factor: DTT_IN_L,
        note: '1 dtt = 1 mt³ = 2.744 L'
      },
      sources: [
        { id: 'mL',    name: '밀리리터',         symbol: 'mL',  factor: 0.001 },
        { id: 'L',     name: '리터',             symbol: 'L',   factor: 1 },
        { id: 'cm3',   name: '세제곱센티미터',   symbol: 'cm³', factor: 0.001 },
        { id: 'm3',    name: '세제곱미터',       symbol: 'm³',  factor: 1000 },
        { id: 'cup',   name: '컵(200 mL)',       symbol: '컵',  factor: 0.2 },
        { id: 'doe',   name: '되',               symbol: '되',  factor: 1.80391 },
        { id: 'mal',   name: '말',               symbol: '말',  factor: 18.0391 },
        { id: 'galUS', name: '갤런(미)',         symbol: 'gal', factor: 3.785411784 }
      ]
    },
    {
      id: 'mass',
      label: '무게',
      base: 'kg',
      defaultFrom: 'kg',
      target: {
        id: 'tht',
        reading: '댕따',
        factor: THT_IN_KG,
        note: '1 tht = 5 kg'
      },
      sources: [
        { id: 'mg',   name: '밀리그램',      symbol: 'mg', factor: 1e-6 },
        { id: 'g',    name: '그램',          symbol: 'g',  factor: 0.001 },
        { id: 'kg',   name: '킬로그램',      symbol: 'kg', factor: 1 },
        { id: 't',    name: '톤',            symbol: 't',  factor: 1000 },
        { id: 'geun', name: '근(600 g)',     symbol: '근', factor: 0.6 },
        { id: 'gwan', name: '관(3.75 kg)',   symbol: '관', factor: 3.75 },
        { id: 'lb',   name: '파운드',        symbol: 'lb', factor: 0.45359237 },
        { id: 'oz',   name: '온스',          symbol: 'oz', factor: 0.028349523125 }
      ]
    }
  ];

  /* ── 후처리: 소속 차원 주입 + 동결 ─────────────────────────────────── */
  DIMENSIONS.forEach(function (dim) {
    dim.target.dimension = dim.id;
    dim.target.symbol = dim.target.id;
    dim.target.name = dim.target.reading;
    Object.freeze(dim.target);

    dim.sources.forEach(function (unit) {
      unit.dimension = dim.id;
      Object.freeze(unit);
    });
    Object.freeze(dim.sources);
    Object.freeze(dim);
  });
  Object.freeze(DIMENSIONS);

  /* ── 조회 헬퍼 ─────────────────────────────────────────────────────── */

  /** 차원 id로 Dimension 조회 (없으면 undefined) */
  function getDimension(dimensionId) {
    return DIMENSIONS.filter(function (d) { return d.id === dimensionId; })[0];
  }

  /** 차원 안에서 입력 단위 id로 Unit 조회 (없으면 undefined) */
  function getSourceUnit(dimensionId, unitId) {
    var dim = getDimension(dimensionId);
    if (!dim) return undefined;
    return dim.sources.filter(function (u) { return u.id === unitId; })[0];
  }

  global.MU = global.MU || {};
  global.MU.units = {
    MT_IN_CM: MT_IN_CM,
    DT_IN_CM2: DT_IN_CM2,
    DTT_IN_L: DTT_IN_L,
    THT_IN_KG: THT_IN_KG,
    DIMENSIONS: DIMENSIONS,
    getDimension: getDimension,
    getSourceUnit: getSourceUnit
  };
})(typeof window !== 'undefined' ? window : this);
