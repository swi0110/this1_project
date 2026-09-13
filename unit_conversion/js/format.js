/**
 * format.js — 입력 파싱과 숫자 표기. 반올림은 이 파일에서만 일어나며,
 * 표기 기준은 소수점 자리수이고 기본 2자리다 (DESIGN §8.2 · §8.4).
 */
(function (global) {
  'use strict';

  var DEFAULT_DECIMALS = 2;
  var EXP_UPPER = 1e12;       // 이 값 이상이면 지수 표기
  var SMALL_SIG = 6;          // 지수 표기로 떨어질 때 쓰는 유효숫자

  // 부호 없는 십진수·지수 표기만 허용. 음수는 아래에서 따로 걸러 코드를 구분한다
  var NUMERIC_RE = /^\+?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

  /**
   * 입력 문자열을 파싱한다. status는 'empty' · 'ok'(value 동반) · 'error'(code 동반).
   * 문구가 아니라 code를 돌려주는 이유는 화면 언어가 둘이라서다 — 번역은 UI가 맡는다.
   */
  function parseInput(raw) {
    var s = String(raw == null ? '' : raw).trim();

    if (s === '') return { status: 'empty' };

    // 빈칸 판정을 먼저 끝내야 쉼표만 친 입력이 '빈 입력'으로 둔갑하지 않는다
    s = s.replace(/,/g, '');

    if (!NUMERIC_RE.test(s)) {
      // 숫자이되 음수인 경우를 갈라 안내한다 (DESIGN §8.3)
      if (/^-/.test(s) && isFinite(Number(s))) {
        return { status: 'error', code: 'errNegative' };
      }
      return { status: 'error', code: 'errNotNumber' };
    }

    var v = Number(s);
    if (!isFinite(v)) {
      return { status: 'error', code: 'errNotFinite' };
    }
    return { status: 'ok', value: v };
  }

  /** 지수 표기를 다듬는다: "2.00000e-7" → "2e-7", "1.23000e+15" → "1.23e15" */
  function trimExponential(str) {
    var parts = str.split('e');
    var mantissa = parts[0].replace(/\.?0+$/, '');
    var exponent = parts[1].replace('+', '');
    return mantissa + 'e' + exponent;
  }

  /**
   * 숫자를 표시용 문자열로 만든다. decimals는 최대 자리수라 끝자리 0은 떨어진다.
   * 그 자리수로 반올림하면 0이 되는 값은 "0.00"으로 뭉개지 않고 지수 표기로 보여준다
   * — 값이 있는데 없는 것처럼 보이는 것을 막기 위함이다.
   */
  function formatNumber(value, decimals) {
    var d = (decimals === undefined || decimals === null) ? DEFAULT_DECIMALS : decimals;

    if (typeof value !== 'number' || !isFinite(value)) return '—';
    if (value === 0) return '0';

    var abs = Math.abs(value);

    if (abs >= EXP_UPPER) {
      return trimExponential(value.toExponential(SMALL_SIG - 1));
    }
    if (abs < Math.pow(10, -d) / 2) {
      return trimExponential(value.toExponential(SMALL_SIG - 1));
    }

    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: d
    }).format(value);
  }

  global.MU = global.MU || {};
  global.MU.format = {
    DEFAULT_DECIMALS: DEFAULT_DECIMALS,
    parseInput: parseInput,
    formatNumber: formatNumber
  };
})(typeof window !== 'undefined' ? window : this);
