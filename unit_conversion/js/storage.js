/**
 * storage.js — localStorage 래퍼 (F-09). 프라이빗 모드에서 접근이 막혀도
 * 앱이 죽지 않게 모두 try/catch로 감싼다. 입력값은 저장하지 않는다.
 */
(function (global) {
  'use strict';

  // 저장 형식이 바뀌면 키를 올린다 — 예전 상태가 되살아나지 않게
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
        system: state.system,
        lang: state.lang,
        decimals: state.decimals
      }));
    } catch (e) {
      /* 저장 실패는 무시한다 — 기능 동작에 영향 없음 */
    }
  }

  global.MU = global.MU || {};
  global.MU.storage = { load: load, save: save };
})(typeof window !== 'undefined' ? window : this);
