/**
 * ui.js — DOM 제어 / 진입점
 *
 * 단일 state 객체 → render() 단방향 흐름. (DESIGN §6.1)
 * 의존: MU.units, MU.convert, MU.format, MU.storage
 */
(function (global) {
  'use strict';

  var units = global.MU.units;
  var convert = global.MU.convert;
  var format = global.MU.format;
  var storage = global.MU.storage;

  var DECIMAL_OPTIONS = [2, 4, 6, 8];

  /* ── 상태 ───────────────────────────────────────────────────────────
   * 출력 단위는 상태가 아니라 dimension에서 유도되는 파생값이다. (DESIGN §7.3)
   * 기본값: 미터(m) → 메따(mt), 소수점 2자리.
   */
  var state = {
    dimension: 'length',
    fromUnit: 'm',
    input: '1',
    decimals: 2
  };

  var el = {};
  var toastTimer = null;

  /* ── 상태 헬퍼 ─────────────────────────────────────────────────────── */

  function currentDimension() {
    return units.getDimension(state.dimension);
  }

  function currentUnit() {
    return units.getSourceUnit(state.dimension, state.fromUnit);
  }

  /** 저장된 상태가 현재 데이터와 맞는지 확인하고 어긋나면 기본값으로 되돌린다 */
  function normalizeState() {
    var dim = units.getDimension(state.dimension);
    if (!dim) {
      state.dimension = units.DIMENSIONS[0].id;
      dim = units.DIMENSIONS[0];
    }
    if (!units.getSourceUnit(dim.id, state.fromUnit)) {
      state.fromUnit = dim.defaultFrom;
    }
    if (DECIMAL_OPTIONS.indexOf(state.decimals) === -1) {
      state.decimals = 2;
    }
  }

  /* ── 렌더링 ────────────────────────────────────────────────────────── */

  function renderTabs() {
    el.tabs.innerHTML = '';
    units.DIMENSIONS.forEach(function (dim) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab' + (dim.id === state.dimension ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(dim.id === state.dimension));
      // 탭 내용이 span 두 개라 접근성 이름이 비어 보이는 것을 막는다
      btn.setAttribute('aria-label', dim.label + ' — ' + dim.target.id + ' (' + dim.target.reading + ')');
      btn.dataset.dimension = dim.id;
      btn.innerHTML =
        '<span class="tab-label">' + dim.label + '</span>' +
        '<span class="tab-unit">' + dim.target.id + '</span>';
      btn.addEventListener('click', function () { selectDimension(dim.id); });
      el.tabs.appendChild(btn);
    });
  }

  function renderUnitSelect() {
    var dim = currentDimension();
    el.fromUnit.innerHTML = '';
    dim.sources.forEach(function (unit) {
      var opt = document.createElement('option');
      opt.value = unit.id;
      opt.textContent = unit.name + ' (' + unit.symbol + ')';
      if (unit.id === state.fromUnit) opt.selected = true;
      el.fromUnit.appendChild(opt);
    });
  }

  function renderDecimals() {
    el.decimals.innerHTML = '';
    DECIMAL_OPTIONS.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = String(d);
      opt.textContent = d + '자리';
      if (d === state.decimals) opt.selected = true;
      el.decimals.appendChild(opt);
    });
  }

  function renderGuide() {
    el.guideBody.innerHTML = '';
    units.DIMENSIONS.forEach(function (dim) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="guide-symbol">' + dim.target.id + '</td>' +
        '<td class="guide-reading">' + dim.target.reading + '</td>' +
        '<td class="guide-note">' + dim.target.note + '</td>';
      el.guideBody.appendChild(tr);
    });
  }

  /** 결과 · 변환식 · 한눈에 보기 — 입력이 바뀔 때마다 호출된다 */
  function renderResult() {
    var dim = currentDimension();
    var unit = currentUnit();
    var parsed = format.parseInput(state.input);

    el.resultSymbol.textContent = dim.target.id;
    el.resultReading.textContent = dim.target.reading;
    el.glanceUnit.textContent = dim.target.id;

    if (parsed.status !== 'ok') {
      el.inputError.textContent = parsed.status === 'error' ? parsed.message : '';
      el.inputField.classList.toggle('has-error', parsed.status === 'error');
      el.resultValue.textContent = '—';
      el.resultValue.classList.add('is-empty');
      el.equation.textContent = '';
      el.copyBtn.disabled = true;
      el.glanceCaption.textContent = '값을 입력하면 단위별 환산 결과가 표시됩니다.';
      el.glanceBody.innerHTML = '';
      return;
    }

    el.inputError.textContent = '';
    el.inputField.classList.remove('has-error');
    el.copyBtn.disabled = false;

    var result = convert.toMarchen(parsed.value, unit, dim);
    var resultText = format.formatNumber(result, state.decimals);

    el.resultValue.textContent = resultText;
    el.resultValue.classList.remove('is-empty');
    // 좌변은 사용자가 친 값을 그대로 보여준다 — 반올림해서 되비추면 입력을 왜곡한다
    el.equation.textContent =
      state.input.trim() + ' ' + unit.symbol + ' = ' + resultText + ' ' + dim.target.id;

    renderGlance(parsed.value, dim);
  }

  /** 같은 숫자를 다른 기존 단위로 해석했을 때의 메르헨 값 (F-05) */
  function renderGlance(value, dim) {
    el.glanceCaption.textContent =
      '"' + state.input.trim() + '"을(를) 다른 단위로 본다면';

    el.glanceBody.innerHTML = '';
    convert.toMarchenAll(value, dim).forEach(function (row) {
      var isCurrent = row.unit.id === state.fromUnit;
      var tr = document.createElement('tr');
      tr.className = 'glance-row' + (isCurrent ? ' is-current' : '');
      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.title = row.unit.name + '(으)로 입력 단위 바꾸기';
      tr.innerHTML =
        '<td class="glance-name">' +
          '<span class="glance-marker">' + (isCurrent ? '▸' : '') + '</span>' +
          row.unit.name + ' <span class="glance-symbol">(' + row.unit.symbol + ')</span>' +
        '</td>' +
        '<td class="glance-value">' +
          format.formatNumber(row.value, state.decimals) +
          ' <span class="glance-target">' + dim.target.id + '</span>' +
        '</td>';

      tr.addEventListener('click', function () { selectUnit(row.unit.id); });
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectUnit(row.unit.id);
        }
      });
      el.glanceBody.appendChild(tr);
    });
  }

  /* ── 액션 ──────────────────────────────────────────────────────────── */

  function selectDimension(dimensionId) {
    if (state.dimension === dimensionId) return;
    var dim = units.getDimension(dimensionId);
    state.dimension = dim.id;
    state.fromUnit = dim.defaultFrom;   // 입력 숫자는 유지한다 (DESIGN §9.3)
    storage.save(state);
    renderTabs();
    renderUnitSelect();
    renderResult();
  }

  function selectUnit(unitId) {
    if (state.fromUnit === unitId) return;
    state.fromUnit = unitId;
    storage.save(state);
    el.fromUnit.value = unitId;
    renderResult();
  }

  function copyResult() {
    var text = el.resultValue.textContent + ' ' + el.resultSymbol.textContent;

    function done() { showToast(text + ' 복사됨'); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } catch (e) {
        showToast('복사에 실패했습니다. 값을 직접 선택해 주세요.');
      }
      document.body.removeChild(ta);
    }

    if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
      global.navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.hidden = true; }, 1800);
  }

  /* ── 초기화 ────────────────────────────────────────────────────────── */

  function cacheElements() {
    el.tabs = document.getElementById('tabs');
    el.inputField = document.getElementById('input-field');
    el.valueInput = document.getElementById('value-input');
    el.fromUnit = document.getElementById('from-unit');
    el.inputError = document.getElementById('input-error');
    el.resultValue = document.getElementById('result-value');
    el.resultSymbol = document.getElementById('result-symbol');
    el.resultReading = document.getElementById('result-reading');
    el.copyBtn = document.getElementById('copy-btn');
    el.equation = document.getElementById('equation');
    el.glanceCaption = document.getElementById('glance-caption');
    el.glanceUnit = document.getElementById('glance-unit');
    el.glanceBody = document.getElementById('glance-body');
    el.guideBody = document.getElementById('guide-body');
    el.decimals = document.getElementById('decimals');
    el.toast = document.getElementById('toast');
  }

  function bindEvents() {
    el.valueInput.addEventListener('input', function () {
      state.input = el.valueInput.value;
      renderResult();
    });

    el.fromUnit.addEventListener('change', function () {
      state.fromUnit = el.fromUnit.value;
      storage.save(state);
      renderResult();
    });

    el.decimals.addEventListener('change', function () {
      state.decimals = Number(el.decimals.value);
      storage.save(state);
      renderResult();
    });

    el.copyBtn.addEventListener('click', copyResult);
  }

  function init() {
    var saved = storage.load();
    if (saved) {
      if (saved.dimension) state.dimension = saved.dimension;
      if (saved.fromUnit) state.fromUnit = saved.fromUnit;
      if (saved.decimals) state.decimals = Number(saved.decimals);
    }
    normalizeState();

    cacheElements();
    el.valueInput.value = state.input;

    renderTabs();
    renderUnitSelect();
    renderDecimals();
    renderGuide();
    renderResult();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
