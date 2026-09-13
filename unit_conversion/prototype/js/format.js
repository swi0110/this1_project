/**
 * format.js — 입력 파싱 및 숫자 표기 포맷터
 *
 * 계산은 항상 double 원시값으로 하고, 반올림은 이 파일에서만 일어난다. (DESIGN §8.2)
 * 표기 기준은 소수점 자리수(decimals)이며 기본값은 2자리다. (DESIGN §8.4)
 */
(function (global) {
  'use strict';

  var DEFAULT_DECIMALS = 2;   // 기본 소수점 자리수
  var EXP_UPPER = 1e12;       // 이 값 이상이면 지수 표기
  var SMALL_SIG = 6;          // 지수 표기로 떨어질 때 쓰는 유효숫자

  // 부호 없는 십진수 / 지수 표기만 허용 (음수는 아래에서 따로 걸러 메시지를 구분한다)
  var NUMERIC_RE = /^\+?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

  /**
   * 입력 문자열을 숫자로 파싱한다.
   * @param {string} raw
   * @returns {{status:'empty'}|{status:'ok', value:number}|{status:'error', message:string}}
   */
  function parseInput(raw) {
    var s = String(raw == null ? '' : raw).trim().replace(/,/g, '');

    if (s === '') return { status: 'empty' };

    if (!NUMERIC_RE.test(s)) {
      // 형식은 숫자지만 음수인 경우를 구분해 안내한다 (DESIGN §8.3, 부록 B-7)
      if (/^-/.test(s) && isFinite(Number(s))) {
        return { status: 'error', message: '음수는 입력할 수 없습니다.' };
      }
      return { status: 'error', message: '유효한 숫자를 입력하세요.' };
    }

    var v = Number(s);
    if (!isFinite(v)) {
      return { status: 'error', message: '표현할 수 없는 값입니다.' };
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
   * 숫자를 표시용 문자열로 만든다.
   *
   * 소수점 d자리로 "반올림했을 때 0이 되는" 0이 아닌 값은 "0.00"으로 뭉개지 않고
   * 지수 표기로 보여준다 — 값이 있는데 없는 것처럼 보이는 것을 막기 위함이다.
   *
   * @param {number} value
   * @param {number} [decimals=2] 소수점 자리수 (최대 자리수 — 끝자리 0은 떨어진다)
   * @returns {string}
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

  /** "10 mt" 처럼 값과 기호를 한 칸 띄워 붙인다 (DESIGN §2.3) */
  function formatWithUnit(value, symbol, decimals) {
    return formatNumber(value, decimals) + ' ' + symbol;
  }

  global.MU = global.MU || {};
  global.MU.format = {
    DEFAULT_DECIMALS: DEFAULT_DECIMALS,
    parseInput: parseInput,
    formatNumber: formatNumber,
    formatWithUnit: formatWithUnit
  };
})(typeof window !== 'undefined' ? window : this);
