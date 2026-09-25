/**
 * ui.js — DOM 제어와 진입점. 단일 state에서 렌더로 흐르는 단방향 구조다 (DESIGN §6.1).
 * MU.i18n · MU.units · MU.convert · MU.format · MU.storage 에 의존한다.
 */
(function (global) {
  'use strict';

  var i18n = global.MU.i18n;
  var units = global.MU.units;
  var convert = global.MU.convert;
  var format = global.MU.format;
  var storage = global.MU.storage;

  var DECIMAL_OPTIONS = [2, 4, 6, 8];

  /* 상태 — 출력 단위는 여기 없다. dimension과 system에서 유도되는 파생값이다 (DESIGN §7.3) */
  var state = {
    lang: i18n.DEFAULT_LANG,
    dimension: 'length',
    fromUnit: 'm',
    system: units.DEFAULT_SYSTEM,
    input: '1',
    decimals: format.DEFAULT_DECIMALS
  };

  var el = {};
  var toastTimer = null;

  /* ── 상태 헬퍼 ─────────────────────────────────────────────────────── */

  function currentDimension() {
    return units.getDimension(state.dimension);
  }

  function currentUnit() {
    return units.getUnit(state.dimension, state.fromUnit);
  }

  /** 지금 차원·단위계로 정해지는 출력 단위 */
  function currentTarget() {
    return units.getTarget(currentDimension(), state.system);
  }

  /** 저장된 상태가 현재 데이터와 어긋나면 기본값으로 되돌린다 */
  function normalizeState() {
    var dim = units.getDimension(state.dimension);
    if (!dim) {
      state.dimension = units.DIMENSIONS[0].id;
      dim = units.DIMENSIONS[0];
    }
    if (!units.getUnit(dim.id, state.fromUnit)) {
      state.fromUnit = dim.defaultFrom;
    }
    if (!dim.targets[state.system]) {
      state.system = units.DEFAULT_SYSTEM;
    }
    if (DECIMAL_OPTIONS.indexOf(state.decimals) === -1) {
      state.decimals = format.DEFAULT_DECIMALS;
    }
    state.lang = i18n.setLang(state.lang);   // 모르는 언어면 기본 언어로 되돌아온다
  }

  /* ── 문구 적용 ─────────────────────────────────────────────────────── */

  /** data-i18n* 이 달린 정적 문구를 현재 언어로 채운다 */
  function applyStaticText() {
    document.documentElement.lang = state.lang;
    document.title = i18n.t('title');

    var appliers = [
      ['data-i18n',             function (node, s) { node.textContent = s; }],
      ['data-i18n-html',        function (node, s) { node.innerHTML = s; }],
      ['data-i18n-aria',        function (node, s) { node.setAttribute('aria-label', s); }],
      ['data-i18n-title',       function (node, s) { node.setAttribute('title', s); }],
      ['data-i18n-placeholder', function (node, s) { node.setAttribute('placeholder', s); }],
      // 페이지 언어와 다른 언어로 적힌 문구 — 없으면 스크린 리더가 엉뚱한 음성으로 읽는다
      ['data-i18n-lang',        function (node, s) { node.lang = s; }]
    ];

    appliers.forEach(function (pair) {
      var attr = pair[0], apply = pair[1];
      [].slice.call(document.querySelectorAll('[' + attr + ']')).forEach(function (node) {
        apply(node, i18n.t(node.getAttribute(attr)));
      });
    });
  }

  function renderLangToggle() {
    el.langToggle.innerHTML = '';
    i18n.LANGS.forEach(function (entry) {
      var isActive = entry.id === state.lang;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn' + (isActive ? ' is-active' : '');
      btn.setAttribute('aria-pressed', String(isActive));
      btn.setAttribute('aria-label', entry.label);
      btn.textContent = entry.short;
      btn.addEventListener('click', function () { selectLang(entry.id); });
      el.langToggle.appendChild(btn);
    });
  }

  /* ── 렌더링 ────────────────────────────────────────────────────────── */

  function renderTabs() {
    el.tabs.innerHTML = '';
    units.DIMENSIONS.forEach(function (dim) {
      // 탭 아래 기호는 그 차원을 골랐을 때 나올 출력 단위다 — 단위계를 바꾸면 같이 바뀐다
      var target = units.getTarget(dim, state.system);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab' + (dim.id === state.dimension ? ' is-active' : '');
      // role="tab"은 화살표 키와 연결된 패널을 약속하는데 둘 다 없어, 눌림 버튼으로 알린다
      btn.setAttribute('aria-pressed', String(dim.id === state.dimension));
      // 탭 내용이 span 두 개라 접근성 이름이 비어 보이는 것을 막는다
      btn.setAttribute('aria-label',
        i18n.pick(dim.label) + ' — ' + i18n.pick(target.symbol) + ' (' + i18n.pick(target.name) + ')');
      btn.dataset.dimension = dim.id;
      btn.innerHTML =
        '<span class="tab-label">' + i18n.pick(dim.label) + '</span>' +
        '<span class="tab-unit">' + i18n.pick(target.symbol) + '</span>';
      btn.addEventListener('click', function () { selectDimension(dim.id); });
      el.tabs.appendChild(btn);
    });
  }

  function renderSystemToggle() {
    el.systemToggle.innerHTML = '';
    units.SYSTEMS.forEach(function (system) {
      var isActive = system.id === state.system;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'system-btn' + (isActive ? ' is-active' : '');
      btn.setAttribute('aria-pressed', String(isActive));
      btn.textContent = i18n.pick(system.label);
      btn.addEventListener('click', function () { selectSystem(system.id); });
      el.systemToggle.appendChild(btn);
    });
  }

  function renderUnitSelect() {
    var dim = currentDimension();
    el.fromUnit.innerHTML = '';
    dim.allUnits.forEach(function (unit) {
      var opt = document.createElement('option');
      opt.value = unit.id;
      opt.textContent = i18n.pick(unit.name) + ' (' + i18n.pick(unit.symbol) + ')';
      if (unit.id === state.fromUnit) opt.selected = true;
      el.fromUnit.appendChild(opt);
    });
  }

  function renderDecimals() {
    el.decimals.innerHTML = '';
    DECIMAL_OPTIONS.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = String(d);
      opt.textContent = i18n.t('decimalsOption', d);
      if (d === state.decimals) opt.selected = true;
      el.decimals.appendChild(opt);
    });
  }

  /* 안내 패널은 이 앱의 주제라 단위계 선택과 무관하게 메르헨으로 고정이다 */
  function renderGuide() {
    el.guideBody.innerHTML = '';
    units.DIMENSIONS.forEach(function (dim) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="guide-symbol">' + i18n.pick(dim.marchen.symbol) + '</td>' +
        '<td class="guide-reading">' + i18n.pick(dim.marchen.name) + '</td>' +
        '<td class="guide-note">' + dim.marchen.note + '</td>';
      el.guideBody.appendChild(tr);
    });
  }

  /** 결과를 비운다. message가 있으면 오류로 표시한다 */
  function clearResult(message) {
    el.inputError.textContent = message || '';
    el.inputField.classList.toggle('has-error', !!message);
    el.resultValue.textContent = '—';
    el.resultValue.classList.add('is-empty');
    el.equation.textContent = '';
    el.copyBtn.disabled = true;
    el.glanceHeading.textContent = i18n.t('glanceHeading');
    el.glanceCaption.textContent = i18n.t('glanceEmpty');
    el.glanceBody.innerHTML = '';
  }

  /** 결과 · 변환식 · 한눈에 보기 — 입력이 바뀔 때마다 호출된다 */
  function renderResult() {
    var dim = currentDimension();
    var unit = currentUnit();
    var target = currentTarget();
    var parsed = format.parseInput(state.input);

    el.resultSymbol.textContent = i18n.pick(target.symbol);
    el.resultReading.textContent = i18n.pick(target.name);

    if (parsed.status !== 'ok') {
      clearResult(parsed.status === 'error' ? i18n.t(parsed.code) : '');
      return;
    }

    var result = convert.toTarget(parsed.value, unit, dim, target);

    // 입력이 유한해도 배율을 곱하다 넘칠 수 있다 — 파싱 때의 검사만으로는 부족하다 (DESIGN §10)
    if (!isFinite(result)) {
      clearResult(i18n.t('errNotFinite'));
      return;
    }

    el.inputError.textContent = '';
    el.inputField.classList.remove('has-error');
    el.copyBtn.disabled = false;

    var resultText = format.formatNumber(result, state.decimals);

    el.resultValue.textContent = resultText;
    el.resultValue.classList.remove('is-empty');
    // 좌변은 사용자가 친 값을 그대로 보여준다 — 반올림해서 되비추면 입력을 왜곡한다
    el.equation.textContent =
      state.input.trim() + ' ' + i18n.pick(unit.symbol) + ' = ' + resultText + ' ' + i18n.pick(target.symbol);

    renderGlance(parsed.value, unit, dim);
  }

  /** 행 값은 더 작은 factor로 나눠 주 결과보다 크다 — 주 결과가 멀쩡해도 넘칠 수 있어
      '—'만 남는 칸에 이유를 붙인다 (1e300 t → mg 행) */
  function overflowAttr(value) {
    if (isFinite(value)) return '';
    var why = i18n.t('errNotFinite');
    return ' title="' + why + '" aria-label="' + why + '"';
  }

  /** 입력 수량을 차원 안의 모든 단위로 환산해 보여준다 (F-05) */
  function renderGlance(value, fromUnit, dim) {
    el.glanceHeading.textContent =
      i18n.t('glanceHeadingWith', state.input.trim() + ' ' + i18n.pick(fromUnit.symbol));
    el.glanceCaption.textContent = '';

    el.glanceBody.innerHTML = '';
    convert.toAllUnits(value, fromUnit, dim).forEach(function (row) {
      var isCurrent = row.unit === fromUnit;
      var unitName = i18n.pick(row.unit.name);
      var unitSymbol = i18n.pick(row.unit.symbol);
      var tr = document.createElement('tr');
      tr.className = 'glance-row' + (isCurrent ? ' is-current' : '');
      tr.title = i18n.t('pickUnit', unitName);

      /* 행에 role을 씌우면 표의 '단위명 ↔ 값' 대응이 사라진다. 셀 안 버튼이 초점·키보드를 맡고,
         버튼 클릭은 행까지 올라오므로 클릭 처리는 행 하나면 된다 */
      tr.innerHTML =
        '<td class="glance-name">' +
          '<span class="glance-marker">' + (isCurrent ? '▸' : '') + '</span>' +
          '<button type="button" class="glance-pick"' +
            ' aria-label="' + i18n.t('pickUnit', unitName) + '"' +
            (isCurrent ? ' aria-current="true"' : '') + '>' +
            unitName + ' <span class="glance-symbol">(' + unitSymbol + ')</span>' +
          '</button>' +
        '</td>' +
        '<td class="glance-value"' + overflowAttr(row.value) + '>' +
          format.formatNumber(row.value, state.decimals) +
          ' <span class="glance-target">' + unitSymbol + '</span>' +
        '</td>';

      tr.addEventListener('click', function () { selectUnit(row.unit.id); });
      el.glanceBody.appendChild(tr);
    });
  }

  /** 문구가 든 곳은 전부 다시 그린다 — 언어를 바꾸면 남김없이 바뀌어야 한다 */
  function renderAll() {
    renderLangToggle();
    renderTabs();
    renderSystemToggle();
    renderUnitSelect();
    renderDecimals();
    renderGuide();
    renderResult();
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

  function selectLang(langId) {
    if (state.lang === langId) return;
    state.lang = i18n.setLang(langId);
    storage.save(state);
    applyStaticText();
    renderAll();
  }

  function selectSystem(systemId) {
    if (state.system === systemId) return;
    state.system = systemId;
    storage.save(state);
    renderSystemToggle();
    renderTabs();          // 탭 아래 기호가 출력 단위를 따라간다
    renderResult();
  }

  function copyResult() {
    var text = el.resultValue.textContent + ' ' + el.resultSymbol.textContent;

    function done() { showToast(i18n.t('copied', text)); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();

      // execCommand는 거부돼도 예외가 아니라 false를 돌려준다 — 반환값을 봐야 한다
      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (e) {
        copied = false;
      }
      document.body.removeChild(ta);

      if (copied) done();
      else showToast(i18n.t('copyFailed'));
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
    el.langToggle = document.getElementById('lang-toggle');
    el.tabs = document.getElementById('tabs');
    el.systemToggle = document.getElementById('system-toggle');
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
    el.glanceHeading = document.getElementById('glance-heading');
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
      if (saved.lang) state.lang = saved.lang;
      if (saved.dimension) state.dimension = saved.dimension;
      if (saved.fromUnit) state.fromUnit = saved.fromUnit;
      if (saved.system) state.system = saved.system;
      if (saved.decimals) state.decimals = Number(saved.decimals);
    }
    normalizeState();

    cacheElements();
    applyStaticText();
    el.valueInput.value = state.input;

    renderAll();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
