/**
 * storage.js — localStorage 래퍼 (F-09)
 *
 * 프라이빗 모드 등에서 접근이 막혀도 앱이 죽지 않도록 모든 호출을 try/catch로 감싼다.
 * 저장 대상은 차원 / 입력 단위 / 소수점 자리수뿐이며, 입력값은 저장하지 않는다.
 */
(function (global) {
  'use strict';

  // 저장 형식이 바뀌면 키를 올려 예전 상태가 되살아나지 않게 한다 (v1: precision → v2: decimals)
  var KEY = 'marchen-converter/v2';

  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function save(state) {
    try {
      global.localStorage.setItem(KEY, JSON.stringify({
        dimension: state.dimension,
        fromUnit: state.fromUnit,
        decimals: state.decimals
      }));
    } catch (e) {
      /* 저장 실패는 무시한다 — 기능 동작에 영향 없음 */
    }
  }

  global.MU = global.MU || {};
  global.MU.storage = { load: load, save: save };
})(typeof window !== 'undefined' ? window : this);
